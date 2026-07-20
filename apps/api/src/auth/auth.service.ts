import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import {
  ConfirmPasswordResetDto,
  RequestPasswordResetDto,
} from './dto/password-reset.dto';
import type { JwtPayload } from './strategies/jwt.strategy';
import type { User } from '@prisma/client';

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      if (!existing.passwordHash) {
        throw new ConflictException(
          'This email has a pending invite. Please use the invite link sent to you.'
        );
      }
      throw new ConflictException('Email is already in use');
    }

    const rounds = this.config.get<number>('bcryptRounds') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, rounds);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: 'USER',
      },
    });
    await this.issueEmailVerification(user, { welcome: true });
    return this.session(user);
  }

  /**
   * Confirms an email from a verification link. Soft verification — the account
   * already works; this just flips the verified flag and clears the token.
   */
  async verifyEmail(token: string): Promise<{ ok: true; alreadyVerified: boolean }> {
    if (!token) throw new BadRequestException('Missing verification token');
    const user = await this.prisma.user.findUnique({ where: { emailVerifyToken: token } });
    if (!user) {
      // A used token is nulled out, so a not-found could mean "already verified".
      throw new NotFoundException('Verification link is invalid or already used');
    }
    if (user.emailVerifyExpiresAt && user.emailVerifyExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        'This verification link has expired. Request a fresh one from your dashboard.'
      );
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerifyToken: null,
        emailVerifyExpiresAt: null,
      },
    });
    return { ok: true, alreadyVerified: false };
  }

  /** Re-sends a verification link for the signed-in user. No-op if already verified. */
  async resendVerification(userId: string): Promise<{ ok: true }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (!user.emailVerifiedAt) {
      await this.issueEmailVerification(user, { welcome: false });
    }
    return { ok: true };
  }

  /** Issues a fresh verification token and emails the link (welcome copy on signup). */
  private async issueEmailVerification(user: User, opts: { welcome: boolean }) {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: token, emailVerifyExpiresAt: expiresAt },
    });
    const base = this.config.get<string>('webAppUrl') ?? 'http://localhost:5173';
    const verifyUrl = `${base.replace(/\/$/, '')}/verify-email/${token}`;
    if (opts.welcome) {
      void this.mail.sendWelcome({ to: user.email, name: user.name, verifyUrl, expiresAt });
    } else {
      void this.mail.sendVerifyEmail({ to: user.email, name: user.name, verifyUrl, expiresAt });
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Account not yet activated. Please open the invite link sent to you.'
      );
    }
    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) throw new UnauthorizedException('Invalid email or password');
    return this.session(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.userSelect,
    });
    if (!user) throw new UnauthorizedException();
    const { emailVerifiedAt, ...rest } = user;
    return { ...rest, emailVerified: emailVerifiedAt != null };
  }

  async getInvite(token: string) {
    const user = await this.findInvitedUser(token);
    return {
      email: user.email,
      name: user.name,
      expiresAt: user.inviteTokenExpiresAt,
    };
  }

  async acceptInvite(token: string, dto: AcceptInviteDto) {
    const user = await this.findInvitedUser(token);
    const rounds = this.config.get<number>('bcryptRounds') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, rounds);
    const activated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        inviteToken: null,
        inviteTokenExpiresAt: null,
      },
    });
    return this.session(activated);
  }

  /**
   * Always returns 200 — we do not leak whether an email is registered. If the
   * email belongs to a real user we silently issue a token and email the link.
   */
  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<{ ok: true }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (user && user.passwordHash) {
      const token = randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: token,
          passwordResetExpiresAt: expiresAt,
        },
      });
      const base = this.config.get<string>('webAppUrl') ?? 'http://localhost:5173';
      const resetUrl = `${base.replace(/\/$/, '')}/reset-password/${token}`;
      void this.mail.sendPasswordReset({
        to: user.email,
        name: user.name,
        resetUrl,
        expiresAt,
      });
    }
    return { ok: true };
  }

  async confirmPasswordReset(token: string, dto: ConfirmPasswordResetDto) {
    if (!token) throw new BadRequestException('Missing reset token');
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: token },
    });
    if (!user) throw new NotFoundException('Reset link is invalid or already used');
    if (
      user.passwordResetExpiresAt &&
      user.passwordResetExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('This reset link has expired. Please request a new one.');
    }
    const rounds = this.config.get<number>('bcryptRounds') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, rounds);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });
    return { ok: true as const };
  }

  private async findInvitedUser(token: string) {
    if (!token) throw new BadRequestException('Missing invite token');
    const user = await this.prisma.user.findUnique({ where: { inviteToken: token } });
    if (!user) throw new NotFoundException('Invite not found or already used');
    if (user.inviteTokenExpiresAt && user.inviteTokenExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('This invite has expired. Please ask an admin for a new one.');
    }
    return user;
  }

  private async session(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwt.signAsync(payload);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isSpaceOwner: user.isSpaceOwner,
        emailVerified: user.emailVerifiedAt != null,
        createdAt: user.createdAt,
      },
    };
  }

  private readonly userSelect = {
    id: true,
    email: true,
    name: true,
    avatarUrl: true,
    role: true,
    isSpaceOwner: true,
    emailVerifiedAt: true,
    createdAt: true,
  } as const;
}
