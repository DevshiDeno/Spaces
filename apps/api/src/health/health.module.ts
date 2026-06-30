import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DbKeepAliveService } from './db-keepalive.service';

@Module({
  controllers: [HealthController],
  providers: [DbKeepAliveService],
})
export class HealthModule {}
