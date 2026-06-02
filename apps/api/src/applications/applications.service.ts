import { randomBytes } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/mail/mail.service';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import type { AllyApplication, ApplicationStatus } from '@prisma/client';

const INVITE_TTL_DAYS = 7;

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService
  ) {}

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
      include: { user: { select: { id: true, email: true } } },
    });
  }

  async review(id: string, reviewerId: string, dto: ReviewApplicationDto) {
    const existing = await this.prisma.allyApplication.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Application not found');

    if (dto.status === 'REJECTED') {
      const application = await this.prisma.allyApplication.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewNotes: dto.notes,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });
      return { application };
    }

    // APPROVED — create/promote owner account and issue an invite token
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

    const application = await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email: existing.email } });

      let userId: string;
      if (existingUser) {
        // Re-issue invite if the account was never activated; otherwise just link it.
        const updates: Record<string, unknown> = {
          role: 'SPACE_OWNER',
          isSpaceOwner: true,
        };
        if (!existingUser.passwordHash) {
          updates.inviteToken = token;
          updates.inviteTokenExpiresAt = expiresAt;
        }
        const updated = await tx.user.update({ where: { id: existingUser.id }, data: updates });
        userId = updated.id;
      } else {
        const created = await tx.user.create({
          data: {
            email: existing.email,
            name: existing.ownerName,
            passwordHash: null,
            role: 'SPACE_OWNER',
            isSpaceOwner: true,
            inviteToken: token,
            inviteTokenExpiresAt: expiresAt,
          },
        });
        userId = created.id;
      }

      return tx.allyApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewNotes: dto.notes,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          userId,
        },
      });
    });

    const inviteUrl = this.buildInviteUrl(application, token);

    // Fire-and-forget — mail.send swallows errors internally so an SMTP outage
    // doesn't break the approval flow. Admin still gets the URL in the response.
    void this.mail.sendAllyInvite({
      to: existing.email,
      applicantName: existing.ownerName,
      inviteUrl,
      expiresAt,
    });

    return {
      application,
      inviteUrl,
      inviteExpiresAt: expiresAt,
    };
  }

  private buildInviteUrl(_app: AllyApplication, token: string) {
    const base = this.config.get<string>('webAppUrl') ?? 'http://localhost:5173';
    return `${base.replace(/\/$/, '')}/accept-invite/${token}`;
  }
}
