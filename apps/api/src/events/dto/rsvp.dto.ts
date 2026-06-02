import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class RsvpDto {
  @ApiProperty({ minimum: 1, maximum: 20 })
  @IsInt()
  @Min(1)
  @Max(20)
  attendees!: number;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    description: 'Required when the event has a non-zero ticket price',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Required for paid events paying via M-Pesa' })
  @IsOptional()
  @IsString()
  phone?: string;
}
