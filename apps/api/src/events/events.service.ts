import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { slugify } from '@/common/utils/slug';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.event.findMany({
      orderBy: { startDate: 'asc' },
    });
  }

  featured() {
    return this.prisma.event.findMany({
      where: { isFeatured: true },
      orderBy: { startDate: 'asc' },
      take: 6,
    });
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({ where: { slug } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(dto: CreateEventDto) {
    const slug = await this.uniqueSlug(dto.title);
    return this.prisma.event.create({ data: { ...dto, slug } });
  }

  async rsvp(eventId: string, userId: string, attendees: number) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    const remaining = event.ticketsAvailable - event.ticketsSold;
    if (attendees > remaining) {
      throw new BadRequestException(`Only ${remaining} tickets remaining`);
    }

    const reference = `RSVP-${event.id}-${Date.now()}`;
    const [, rsvp] = await this.prisma.$transaction([
      this.prisma.event.update({
        where: { id: eventId },
        data: { ticketsSold: { increment: attendees } },
      }),
      this.prisma.rsvp.upsert({
        where: { eventId_userId: { eventId, userId } },
        update: { attendees, reference },
        create: { eventId, userId, attendees, reference },
      }),
    ]);
    return { ok: true as const, reference: rsvp.reference };
  }

  private async uniqueSlug(title: string): Promise<string> {
    const base = slugify(title);
    let candidate = base;
    let n = 1;
    while (await this.prisma.event.findUnique({ where: { slug: candidate } })) {
      n += 1;
      candidate = `${base}-${n}`;
    }
    return candidate;
  }
}
