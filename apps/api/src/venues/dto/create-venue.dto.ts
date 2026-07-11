import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { NoiseLevel } from '@prisma/client';

export class CreateVenueDto {
  @ApiProperty() @IsString() @MinLength(2) name!: string;
  @ApiProperty() @IsString() @MinLength(2) tagline!: string;
  @ApiProperty() @IsString() @MinLength(20) description!: string;
  @ApiProperty() @IsString() type!: string;
  @ApiProperty() @IsString() city!: string;
  @ApiProperty() @IsString() address!: string;
  @ApiProperty() @IsInt() @Min(1) capacity!: number;
  @ApiProperty() @IsInt() @Min(0) pricePerHour!: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) bookingFee?: number;
  @ApiProperty() @IsString() coverImage!: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) amenities?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) moods?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) bestFor?: string[];
  @ApiPropertyOptional({ enum: NoiseLevel }) @IsOptional() @IsEnum(NoiseLevel) noiseLevel?: NoiseLevel;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) timeOfDay?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
  @ApiPropertyOptional({ description: 'M-Pesa phone number where the owner gets paid (any Kenyan format)' })
  @IsOptional() @IsString() payoutPhone?: string;
  @ApiPropertyOptional({ description: 'M-Pesa Till number (preferred over phone if set)' })
  @IsOptional() @IsString() payoutTill?: string;
  @ApiPropertyOptional({ description: 'M-Pesa Paybill (business) number' })
  @IsOptional() @IsString() payoutPaybill?: string;
  @ApiPropertyOptional({ description: 'Account number under the Paybill (required when payoutPaybill is set)' })
  @IsOptional() @IsString() payoutAccount?: string;
}
