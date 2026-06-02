import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { AppConfig } from '@/config/configuration';

/**
 * Restricts the M-Pesa callback endpoint to Safaricom's egress IP allowlist.
 *
 * Without this, anyone with the callback URL can flip a booking to SUCCEEDED.
 * Daraja doesn't sign callbacks, so IP allowlisting is the strongest practical
 * defense alongside our PENDING-only state transition guard in the service.
 */
@Injectable()
export class MpesaCallbackGuard implements CanActivate {
  private readonly logger = new Logger(MpesaCallbackGuard.name);

  constructor(private readonly config: ConfigService<AppConfig>) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.config.get('mpesa.allowedIps', { infer: true }) ?? [];
    const isProd = this.config.get('nodeEnv', { infer: true }) === 'production';
    const req = context.switchToHttp().getRequest<Request>();
    const ip = normalizeIp(req.ip ?? '');

    if (allowed.length === 0) {
      if (isProd) {
        this.logger.error(
          'MPESA_ALLOWED_IPS is empty in production — rejecting callback to fail safely.'
        );
        throw new ForbiddenException('Callback rejected');
      }
      this.logger.warn(
        `MPESA_ALLOWED_IPS not configured — allowing callback from ${ip} (dev mode).`
      );
      return true;
    }

    if (allowed.includes(ip)) return true;

    this.logger.error(`Rejected M-Pesa callback from unauthorized IP: ${ip}`);
    throw new ForbiddenException('Callback rejected');
  }
}

function normalizeIp(ip: string): string {
  // Strip the IPv6 prefix Express adds to mapped IPv4 addresses ("::ffff:1.2.3.4").
  return ip.replace(/^::ffff:/, '');
}
