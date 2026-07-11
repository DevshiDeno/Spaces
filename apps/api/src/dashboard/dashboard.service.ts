import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);

    const paidRevenue = {
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
    };

    const [
      totalBookings,
      revenueAgg,
      totalUsers,
      newUsersThisMonth,
      pendingApplications,
      pendingSpaces,
      bookingsThisMonth,
      bookingsPrevMonth,
      revenueThisMonthAgg,
      revenuePrevMonthAgg,
    ] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: paidRevenue,
      }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      this.prisma.allyApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.venue.count({ where: { isPublished: false } }),
      this.prisma.booking.count({ where: { createdAt: { gte: monthAgo } } }),
      this.prisma.booking.count({
        where: { createdAt: { gte: twoMonthsAgo, lt: monthAgo } },
      }),
      this.prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { ...paidRevenue, createdAt: { gte: monthAgo } },
      }),
      this.prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { ...paidRevenue, createdAt: { gte: twoMonthsAgo, lt: monthAgo } },
      }),
    ]);

    return {
      totalBookings,
      totalRevenue: revenueAgg._sum.totalAmount ?? 0,
      totalUsers,
      newUsersThisMonth,
      totalFiles: 0, // wire to media library when implemented
      pendingApplications,
      pendingSpaces,
      bookingsTrend: percentChange(bookingsPrevMonth, bookingsThisMonth),
      revenueTrend: percentChange(
        revenuePrevMonthAgg._sum.totalAmount ?? 0,
        revenueThisMonthAgg._sum.totalAmount ?? 0,
      ),
    };
  }
}

/**
 * Month-over-month change as a rounded percentage.
 * Returns null when there's no prior-period baseline to compare against,
 * so the UI can omit the trend badge instead of showing a misleading figure.
 */
function percentChange(previous: number, current: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
