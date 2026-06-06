import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/mail/mail.service';

@Injectable()
export class PayoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService
  ) {}

  /** Owner earnings — paid bookings on venues they own. */
  async ownerSummary(ownerId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        venue: { ownerId },
        paymentStatus: 'SUCCEEDED',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        venue: { select: { name: true, slug: true, payoutPhone: true } },
        user: { select: { name: true } },
      },
    });

    let totalEarned = 0;
    let pendingSettlement = 0;
    let settledLifetime = 0;
    let settledThisMonth = 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const b of bookings) {
      totalEarned += b.payoutAmount;
      if (b.payoutStatus === 'PENDING') {
        pendingSettlement += b.payoutAmount;
      } else if (b.payoutStatus === 'SETTLED') {
        settledLifetime += b.payoutAmount;
        if (b.payoutAt && b.payoutAt >= monthStart) {
          settledThisMonth += b.payoutAmount;
        }
      }
    }

    return {
      summary: {
        totalEarned,
        pendingSettlement,
        settledLifetime,
        settledThisMonth,
        bookingCount: bookings.length,
      },
      bookings,
    };
  }

  /** Admin view: every booking owed a payout. */
  adminPendingPayouts() {
    return this.prisma.booking.findMany({
      where: { paymentStatus: 'SUCCEEDED', payoutStatus: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        venue: {
          select: {
            name: true,
            slug: true,
            payoutPhone: true,
            payoutTill: true,
            owner: { select: { id: true, name: true, email: true } },
          },
        },
        user: { select: { name: true, email: true } },
      },
    });
  }

  async settlePayout(bookingId: string, payoutRef: string) {
    const existing = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        venue: {
          select: {
            name: true,
            owner: { select: { name: true, email: true } },
          },
        },
      },
    });
    if (!existing) throw new NotFoundException('Booking not found');
    if (existing.paymentStatus !== 'SUCCEEDED') {
      throw new BadRequestException('Booking has not been paid yet');
    }
    if (existing.payoutStatus !== 'PENDING') {
      throw new BadRequestException(
        `Booking is not pending payout (current status: ${existing.payoutStatus ?? 'none'})`
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        payoutStatus: 'SETTLED',
        payoutAt: new Date(),
        payoutRef,
      },
      include: {
        venue: {
          select: {
            name: true,
            owner: { select: { name: true, email: true } },
          },
        },
        user: { select: { name: true } },
      },
    });

    void this.mail.sendPayoutSettled({
      to: updated.venue.owner.email,
      ownerName: updated.venue.owner.name,
      venueName: updated.venue.name,
      amountKES: updated.payoutAmount,
      payoutRef,
    });

    return updated;
  }
}
