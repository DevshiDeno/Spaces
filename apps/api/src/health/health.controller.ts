import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '@/prisma/prisma.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness — intentionally does NOT touch the database. Fly's health check
   * hits this every minute; querying the DB here would keep a serverless
   * Postgres (Neon) awake 24/7 and burn its compute allowance. Use /health/ready
   * when you actually want to verify DB connectivity.
   */
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  /** Readiness — verifies DB connectivity. Wakes the DB, so use sparingly. */
  @Public()
  @Get('ready')
  async ready() {
    let database = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }
    return {
      status: database === 'up' ? 'ok' : 'degraded',
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
