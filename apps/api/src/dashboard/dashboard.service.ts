import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [
      totalBookings,
      revenueAgg,
      totalUsers,
      newUsersThisMonth,
      pendingApplications,
      pendingSpaces,
    ] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      this.prisma.allyApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.venue.count({ where: { isPublished: false } }),
    ]);

    return {
      totalBookings,
      totalRevenue: revenueAgg._sum.totalAmount ?? 0,
      totalUsers,
      newUsersThisMonth,
      totalFiles: 0, // wire to media library when implemented
      pendingApplications,
      pendingSpaces,
    };
  }
}
