import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Public()
  @Post('mpesa/callback')
  @ApiOperation({ summary: 'M-Pesa Daraja STK Push callback webhook' })
  mpesaCallback(@Body() payload: unknown) {
    return this.payments.handleMpesaCallback(payload);
  }
}
