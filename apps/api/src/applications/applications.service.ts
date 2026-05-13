import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import type { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(dto: SubmitApplicationDto) {
    if (!dto.agreesToTerms) {
      throw new BadRequestException('You must agree to the terms');
    }
    const { agreesToTerms: _drop, ...data } = dto;
    void _drop;
    const application = await this.prisma.allyApplication.create({ data });
    return { ok: true as const, reference: application.id };
  }

  list(status?: ApplicationStatus) {
    return this.prisma.allyApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { submittedAt: 'desc' },
    });
  }

  async review(id: string, reviewerId: string, dto: ReviewApplicationDto) {
    try {
      return await this.prisma.allyApplication.update({
        where: { id },
        data: {
          status: dto.status,
          reviewNotes: dto.notes,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });
    } catch {
      throw new NotFoundException('Application not found');
    }
  }
}
