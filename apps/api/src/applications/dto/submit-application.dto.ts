import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SubmitApplicationDto {
  @ApiProperty() @IsString() @MinLength(2) businessName!: string;
  @ApiProperty() @IsString() @MinLength(2) ownerName!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() phone!: string;
  @ApiProperty() @IsString() city!: string;
  @ApiProperty() @IsString() address!: string;
  @ApiProperty() @IsString() venueType!: string;
  @ApiProperty() @IsString() @MinLength(20) description!: string;
  @ApiProperty() @IsString() @MinLength(20) motivation!: string;
  @ApiProperty() @IsString() @MinLength(20) inclusivityPlan!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() experience?: string;
  @ApiProperty() @IsBoolean() agreesToTerms!: boolean;
}
