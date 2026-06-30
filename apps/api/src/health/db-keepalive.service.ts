import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

// ~Twice a day. Low enough that a serverless DB (Neon) auto-suspends between
// pings, high enough to surface connectivity problems and keep things warm.
const PING_INTERVAL_MS = 12 * 60 * 60 * 1000;

/**
 * Periodically issues a trivial `SELECT 1` so the database is exercised a
 * couple of times a day even when there's no real traffic — without the
 * old per-30s health-check ping that kept Neon's compute pinned awake.
 */
@Injectable()
export class DbKeepAliveService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DbKeepAliveService.name);
  private timer?: ReturnType<typeof setInterval>;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // No ping on boot — let the DB stay suspended until the first interval.
    this.timer = setInterval(() => void this.ping(), PING_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async ping() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.log('[db-keepalive] ping ok');
    } catch (err) {
      this.logger.warn(
        `[db-keepalive] ping failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
