import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty() @IsString() venueId!: string;
  @ApiProperty({ example: '2026-06-14' }) @Type(() => Date) @IsDate() date!: Date;
  @ApiProperty({ example: '17:00' }) @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) startTime!: string;
  @ApiProperty({ example: '22:00' }) @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) endTime!: string;
  @ApiProperty() @IsInt() @Min(1) guestCount!: number;
  @ApiProperty() @IsInt() @Min(1) totalAmount!: number;
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) paymentMethod!: PaymentMethod;
  @ApiPropertyOptional() @IsOptional() @IsString() specialRequests?: string;
  @ApiPropertyOptional({ description: 'Required for M-Pesa STK push' })
  @IsOptional()
  @IsString()
  phone?: string;
}
