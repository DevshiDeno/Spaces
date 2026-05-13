import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { search?: string; role?: UserRole; page?: number; pageSize?: number }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where = {
      ...(params.role && { role: params.role }),
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' as const } },
          { email: { contains: params.search, mode: 'insensitive' as const } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: this.userSelect,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, pageSize };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateRole(id: string, role: UserRole) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { role, isSpaceOwner: role === 'SPACE_OWNER' },
        select: this.userSelect,
      });
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }

  private readonly userSelect = {
    id: true,
    email: true,
    name: true,
    avatarUrl: true,
    role: true,
    isSpaceOwner: true,
    createdAt: true,
  } as const;
}
