import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SettlePayoutDto {
  @ApiProperty({ description: 'M-Pesa transaction code or internal reference for the disbursement' })
  @IsString()
  @MinLength(3)
  payoutRef!: string;
}
