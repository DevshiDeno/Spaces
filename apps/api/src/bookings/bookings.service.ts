import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentsService } from '@/payments/payments.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { AuthenticatedUser } from '@/common/decorators/current-user.decorator';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
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

    const booking = await this.prisma.booking.create({
      data: {
        venueId: dto.venueId,
        userId,
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
        guestCount: dto.guestCount,
        totalAmount: dto.totalAmount,
        paymentMethod: dto.paymentMethod,
        specialRequests: dto.specialRequests,
        status: 'PENDING',
      },
    });

    const payment = await this.payments.initiate({
      bookingId: booking.id,
      amount: dto.totalAmount,
      method: dto.paymentMethod,
      phone: dto.phone,
    });

    return this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: payment.status,
        paymentRef: payment.reference,
        status: payment.status === 'SUCCEEDED' ? 'CONFIRMED' : 'PENDING',
      },
      include: { venue: { select: { name: true, slug: true, coverImage: true } } },
    });
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
