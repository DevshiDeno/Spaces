import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export class CreatePresignedUploadDto {
  @ApiProperty()
  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
  contentType!: string;

  @ApiProperty({
    minimum: 1,
    maximum: MAX_UPLOAD_BYTES,
    description: 'Exact size in bytes of the file the client will upload',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_UPLOAD_BYTES)
  contentLength!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  folder?: string;
}
