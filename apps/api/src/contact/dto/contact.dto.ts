import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class ContactMessageDto {
  @ApiProperty() @IsString() @MinLength(2) name!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(2) subject!: string;
  @ApiProperty() @IsString() @MinLength(10) message!: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVenueInquiry?: boolean;
}
