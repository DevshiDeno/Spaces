import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MpesaCallbackGuard } from './guards/mpesa-callback.guard';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, MpesaCallbackGuard],
  exports: [PaymentsService],
})
export class PaymentsModule {}
