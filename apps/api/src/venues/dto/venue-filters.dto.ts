import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { NoiseLevel } from '@prisma/client';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class VenueFiltersDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() query?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mood?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() timeOfDay?: string;
  @ApiPropertyOptional({ enum: NoiseLevel }) @IsOptional() @IsEnum(NoiseLevel) noiseLevel?: NoiseLevel;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) capacityMin?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) capacityMax?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) priceMin?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) priceMax?: number;
}
