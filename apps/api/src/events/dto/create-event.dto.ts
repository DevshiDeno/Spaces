import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateEventDto {
  @ApiProperty() @IsString() title!: string;
  @ApiProperty() @IsString() category!: string;
  @ApiProperty() @IsString() description!: string;
  @ApiProperty() @Type(() => Date) @IsDate() startDate!: Date;
  @ApiProperty() @Type(() => Date) @IsDate() endDate!: Date;
  @ApiProperty() @IsString() city!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() venueId?: string;
  @ApiProperty() @IsInt() @Min(0) pricePerTicket!: number;
  @ApiProperty() @IsInt() @Min(1) ticketsAvailable!: number;
  @ApiProperty() @IsString() coverImage!: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiProperty() @IsString() organizer!: string;
}
