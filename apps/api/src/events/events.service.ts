import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentsService } from '@/payments/payments.service';
import { MailService } from '@/mail/mail.service';
import { slugify } from '@/common/utils/slug';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RsvpDto } from './dto/rsvp.dto';
import type { AuthenticatedUser } from '@/common/decorators/current-user.decorator';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService,
    private readonly mail: MailService
  ) {}

  list() {
    return this.prisma.event.findMany({
      where: { deletedAt: null },
      orderBy: { startDate: 'asc' },
    });
  }

  featured() {
    return this.prisma.event.findMany({
      where: { isFeatured: true, deletedAt: null },
      orderBy: { startDate: 'asc' },
      take: 6,
    });
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findFirst({ where: { slug, deletedAt: null } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  listForOwner(ownerId: string) {
    return this.prisma.event.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { startDate: 'asc' },
    });
  }

  async create(ownerId: string, dto: CreateEventDto) {
    const slug = await this.uniqueSlug(dto.title);
    return this.prisma.event.create({ data: { ...dto, slug, ownerId } });
  }

  async update(id: string, user: AuthenticatedUser, dto: UpdateEventDto) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundException('Event not found');
    this.assertCanManage(existing.ownerId, user);

    const data: Prisma.EventUpdateInput = { ...dto };
    if (dto.title && dto.title !== existing.title) {
      data.slug = await this.uniqueSlug(dto.title, id);
    }
    return this.prisma.event.update({ where: { id }, data });
  }

  /**
   * Soft delete: the row is retained (so RSVP history survives) but hidden from
   * every listing. We also free the slug — suffixing it with the id — so an owner
   * can recreate an event with the same title and keep the clean URL.
   */
  async remove(id: string, user: AuthenticatedUser) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundException('Event not found');
    this.assertCanManage(existing.ownerId, user);
    await this.prisma.event.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: user.id,
        slug: `${existing.slug}-deleted-${existing.id.slice(-8)}`,
      },
    });
    return { ok: true };
  }

  private assertCanManage(ownerId: string | null, user: AuthenticatedUser) {
    if (user.role !== 'ADMIN' && user.id !== ownerId) {
      throw new ForbiddenException('You do not own this event');
    }
  }

  async rsvp(eventId: string, userId: string, dto: RsvpDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.deletedAt) throw new NotFoundException('Event not found');

    const isPaid = event.pricePerTicket > 0;
    const totalAmount = isPaid ? event.pricePerTicket * dto.attendees : 0;

    if (isPaid) {
      if (!dto.paymentMethod) {
        throw new BadRequestException('Payment method is required for paid events');
      }
      if (dto.paymentMethod === 'MPESA' && !dto.phone) {
        throw new BadRequestException('Phone number is required for M-Pesa payments');
      }
    }

    // Re-RSVPing changes ticket count by a delta, not the full new count.
    // Atomically check + claim only that delta against the published cap.
    const existing = await this.prisma.rsvp.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    const previousAttendees = existing?.attendees ?? 0;
    const delta = dto.attendees - previousAttendees;

    if (delta > 0) {
      // Conditional update — succeeds only if there's room. updateMany returns
      // count=0 when the WHERE doesn't match, which is our oversell guard.
      const claim = await this.prisma.event.updateMany({
        where: {
          id: eventId,
          ticketsSold: { lte: event.ticketsAvailable - delta },
        },
        data: { ticketsSold: { increment: delta } },
      });
      if (claim.count === 0) {
        const remaining = event.ticketsAvailable - event.ticketsSold;
        throw new BadRequestException(
          remaining > 0
            ? `Only ${remaining} tickets remaining`
            : 'Sold out'
        );
      }
    } else if (delta < 0) {
      // Releasing tickets back. No payment refund is issued here.
      await this.prisma.event.update({
        where: { id: eventId },
        data: { ticketsSold: { increment: delta } },
      });
    }

    const reference = `RSVP-${event.id}-${Date.now()}`;
    const rsvp = await this.prisma.rsvp.upsert({
      where: { eventId_userId: { eventId, userId } },
      update: {
        attendees: dto.attendees,
        reference,
        totalAmount,
        paymentMethod: isPaid ? dto.paymentMethod ?? null : null,
        paymentStatus: isPaid ? 'PENDING' : null,
        paymentRef: null,
        phone: dto.phone ?? null,
      },
      create: {
        eventId,
        userId,
        attendees: dto.attendees,
        reference,
        totalAmount,
        paymentMethod: isPaid ? dto.paymentMethod ?? null : null,
        paymentStatus: isPaid ? 'PENDING' : null,
        phone: dto.phone ?? null,
      },
    });

    if (!isPaid) {
      void this.sendRsvpConfirmation(rsvp.id, event.title);
      return { ok: true as const, reference: rsvp.reference, rsvp };
    }

    const payment = await this.payments.initiate({
      accountReference: rsvp.id,
      description: 'Event RSVP',
      amount: totalAmount,
      method: dto.paymentMethod!,
      phone: dto.phone,
    });

    // Synchronous failure: release the tickets we just claimed, atomically.
    if (payment.status === 'FAILED') {
      const [, updated] = await this.prisma.$transaction([
        this.prisma.event.update({
          where: { id: eventId },
          data: { ticketsSold: { decrement: dto.attendees } },
        }),
        this.prisma.rsvp.update({
          where: { id: rsvp.id },
          data: { paymentStatus: 'FAILED', paymentRef: payment.reference },
        }),
      ]);
      return { ok: true as const, reference: updated.reference, rsvp: updated };
    }

    const updated = await this.prisma.rsvp.update({
      where: { id: rsvp.id },
      data: {
        paymentStatus: payment.status,
        paymentRef: payment.reference,
      },
    });

    if (payment.status === 'SUCCEEDED') {
      void this.sendRsvpConfirmation(updated.id, event.title);
    }

    return { ok: true as const, reference: updated.reference, rsvp: updated };
  }

  /** Fetches the user + rsvp + event together and fires a confirmation email. */
  private async sendRsvpConfirmation(rsvpId: string, eventTitle: string) {
    const full = await this.prisma.rsvp.findUnique({
      where: { id: rsvpId },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!full) return;
    await this.mail.sendRsvpConfirmation({
      to: full.user.email,
      name: full.user.name,
      eventTitle,
      attendees: full.attendees,
      totalAmountKES: full.totalAmount,
      reference: full.reference,
    });
  }

  async findRsvpForUser(rsvpId: string, userId: string) {
    const rsvp = await this.prisma.rsvp.findUnique({ where: { id: rsvpId } });
    if (!rsvp) throw new NotFoundException('RSVP not found');
    if (rsvp.userId !== userId) {
      throw new ForbiddenException('You cannot view this RSVP');
    }
    return rsvp;
  }

  private async uniqueSlug(title: string, ignoreId?: string): Promise<string> {
    const base = slugify(title);
    let candidate = base;
    let n = 1;
    while (true) {
      const existing = await this.prisma.event.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === ignoreId) return candidate;
      n += 1;
      candidate = `${base}-${n}`;
    }
  }
}
