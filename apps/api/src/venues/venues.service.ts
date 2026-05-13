import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { slugify } from '@/common/utils/slug';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VenueFiltersDto } from './dto/venue-filters.dto';
import type { AuthenticatedUser } from '@/common/decorators/current-user.decorator';

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: VenueFiltersDto) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;

    const where: Prisma.VenueWhereInput = {
      isPublished: true,
      ...(filters.city && { city: filters.city }),
      ...(filters.type && { type: filters.type }),
      ...(filters.noiseLevel && { noiseLevel: filters.noiseLevel }),
      ...(filters.mood && { moods: { has: filters.mood } }),
      ...(filters.timeOfDay && { timeOfDay: { has: filters.timeOfDay } }),
      ...((filters.capacityMin || filters.capacityMax) && {
        capacity: {
          ...(filters.capacityMin && { gte: filters.capacityMin }),
          ...(filters.capacityMax && { lte: filters.capacityMax }),
        },
      }),
      ...((filters.priceMin || filters.priceMax) && {
        pricePerHour: {
          ...(filters.priceMin && { gte: filters.priceMin }),
          ...(filters.priceMax && { lte: filters.priceMax }),
        },
      }),
      ...(filters.query && {
        OR: [
          { name: { contains: filters.query, mode: 'insensitive' } },
          { city: { contains: filters.query, mode: 'insensitive' } },
          { type: { contains: filters.query, mode: 'insensitive' } },
          { tagline: { contains: filters.query, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ isVerified: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.venue.count({ where }),
    ]);
    return { data, total, page, pageSize };
  }

  featured() {
    return this.prisma.venue.findMany({
      where: { isVerified: true, isPublished: true },
      orderBy: { rating: 'desc' },
      take: 6,
    });
  }

  async findBySlug(slug: string) {
    const venue = await this.prisma.venue.findUnique({ where: { slug } });
    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  async listForOwner(ownerId: string) {
    return this.prisma.venue.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(ownerId: string, dto: CreateVenueDto) {
    const slug = await this.uniqueSlug(dto.name);
    return this.prisma.venue.create({
      data: {
        ...dto,
        slug,
        ownerId,
      },
    });
  }

  async update(id: string, user: AuthenticatedUser, dto: UpdateVenueDto) {
    const existing = await this.prisma.venue.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Venue not found');
    this.assertCanManage(existing.ownerId, user);

    const data: Prisma.VenueUpdateInput = { ...dto };
    if (dto.name && dto.name !== existing.name) {
      data.slug = await this.uniqueSlug(dto.name, id);
    }
    return this.prisma.venue.update({ where: { id }, data });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const existing = await this.prisma.venue.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Venue not found');
    this.assertCanManage(existing.ownerId, user);
    await this.prisma.venue.delete({ where: { id } });
    return { ok: true };
  }

  async addImages(id: string, user: AuthenticatedUser, urls: string[]) {
    const existing = await this.prisma.venue.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Venue not found');
    this.assertCanManage(existing.ownerId, user);
    return this.prisma.venue.update({
      where: { id },
      data: { images: { set: [...existing.images, ...urls] } },
    });
  }

  private assertCanManage(ownerId: string, user: AuthenticatedUser) {
    if (user.role !== 'ADMIN' && user.id !== ownerId) {
      throw new ForbiddenException('You do not own this venue');
    }
  }

  private async uniqueSlug(name: string, ignoreId?: string): Promise<string> {
    const base = slugify(name);
    let candidate = base;
    let n = 1;
    while (true) {
      const existing = await this.prisma.venue.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === ignoreId) return candidate;
      n += 1;
      candidate = `${base}-${n}`;
    }
  }
}
