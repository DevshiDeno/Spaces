import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PayoutsService } from './payouts.service';
import { SettlePayoutDto } from './dto/settle-payout.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, type AuthenticatedUser } from '@/common/decorators/current-user.decorator';

@ApiTags('payouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payouts: PayoutsService) {}

  @Get('owner')
  @Roles(UserRole.SPACE_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Owner earnings summary + booking list' })
  ownerSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.payouts.ownerSummary(user.id);
  }

  @Get('admin/pending')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'All bookings awaiting payout settlement' })
  adminPending() {
    return this.payouts.adminPendingPayouts();
  }

  @Patch('admin/bookings/:id/settle')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark a booking payout as settled (manual disbursement)' })
  settle(@Param('id') id: string, @Body() dto: SettlePayoutDto) {
    return this.payouts.settlePayout(id, dto.payoutRef);
  }
}
