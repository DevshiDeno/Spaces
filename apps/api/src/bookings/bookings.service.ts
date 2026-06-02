import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentsService } from '@/payments/payments.service';
import { MailService } from '@/mail/mail.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { AuthenticatedUser } from '@/common/decorators/current-user.decorator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService,
    private readonly mail: MailService
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    if (!TIME_REGEX.test(dto.startTime) || !TIME_REGEX.test(dto.endTime)) {
      throw new BadRequestException('Times must be in HH:MM 24-hour format');
    }
    if (dto.endTime <= dto.startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const venue = await this.prisma.venue.findUnique({ where: { id: dto.venueId } });
    if (!venue) throw new NotFoundException('Venue not found');
    if (!venue.isPublished) {
      throw new BadRequestException('This venue is not currently bookable');
    }
    if (dto.guestCount > venue.capacity) {
      throw new BadRequestException(`Guest count exceeds venue capacity (${venue.capacity})`);
    }
    if (dto.paymentMethod === 'MPESA' && !dto.phone) {
      throw new BadRequestException('Phone number is required for M-Pesa payments');
    }

    // Normalize the date to UTC midnight so equality matching is deterministic
    // regardless of what the caller sent in the DTO.
    const bookingDate = startOfDayUtc(dto.date);

    // Atomic overlap check + insert. Serializable isolation makes two concurrent
    // requests for the same slot one-of-them-wins instead of both succeeding.
    const booking = await this.prisma.$transaction(
      async (tx) => {
        const conflict = await tx.booking.findFirst({
          where: {
            venueId: dto.venueId,
            date: bookingDate,
            status: { in: ['PENDING', 'CONFIRMED'] },
            // Half-open interval overlap: [a, b) intersects [c, d) iff a < d AND c < b
            AND: [
              { startTime: { lt: dto.endTime } },
              { endTime: { gt: dto.startTime } },
            ],
          },
          select: { id: true, startTime: true, endTime: true },
        });
        if (conflict) {
          throw new ConflictException(
            `That slot is already booked (${conflict.startTime}–${conflict.endTime}). Please pick a different time.`
          );
        }

        return tx.booking.create({
          data: {
            venueId: dto.venueId,
            userId,
            date: bookingDate,
            startTime: dto.startTime,
            endTime: dto.endTime,
            guestCount: dto.guestCount,
            totalAmount: dto.totalAmount,
            paymentMethod: dto.paymentMethod,
            specialRequests: dto.specialRequests,
            status: 'PENDING',
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    // Payment is an external HTTP call — must run OUTSIDE the DB transaction.
    const payment = await this.payments.initiate({
      accountReference: booking.id,
      description: 'Venue booking',
      amount: dto.totalAmount,
      method: dto.paymentMethod,
      phone: dto.phone,
    });

    // Map payment outcome → booking lifecycle status.
    // - SUCCEEDED → CONFIRMED (slot held)
    // - PENDING   → PENDING   (slot held while we await the STK callback)
    // - FAILED    → CANCELLED (release the slot — overlap check excludes it)
    const bookingStatus =
      payment.status === 'SUCCEEDED'
        ? 'CONFIRMED'
        : payment.status === 'FAILED'
          ? 'CANCELLED'
          : 'PENDING';

    const finalized = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: payment.status,
        paymentRef: payment.reference,
        status: bookingStatus,
      },
      include: {
        venue: { select: { name: true, slug: true, coverImage: true } },
        user: { select: { name: true, email: true } },
      },
    });

    // Confirmation email only on synchronous success. The async (M-Pesa callback)
    // path sends its own email from PaymentsService.handleMpesaCallback().
    if (payment.status === 'SUCCEEDED') {
      void this.mail.sendBookingConfirmation({
        to: finalized.user.email,
        name: finalized.user.name,
        venueName: finalized.venue.name,
        date: finalized.date.toISOString().slice(0, 10),
        startTime: finalized.startTime,
        endTime: finalized.endTime,
        totalAmountKES: finalized.totalAmount,
        reference: finalized.paymentRef ?? finalized.id,
      });
    }

    return finalized;
  }

  listMine(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { venue: { select: { name: true, slug: true, coverImage: true } } },
    });
  }

  listForOwner(ownerId: string) {
    return this.prisma.booking.findMany({
      where: { venue: { ownerId } },
      orderBy: { createdAt: 'desc' },
      include: {
        venue: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    });
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { venue: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (
      user.role !== 'ADMIN' &&
      booking.userId !== user.id &&
      booking.venue.ownerId !== user.id
    ) {
      throw new ForbiddenException('You cannot view this booking');
    }
    return booking;
  }

  async cancel(id: string, user: AuthenticatedUser) {
    const booking = await this.findOne(id, user);
    if (booking.status === 'CANCELLED') return booking;
    return this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}

function startOfDayUtc(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}
