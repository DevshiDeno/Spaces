import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { CreatePresignedUploadDto } from './dto/create-presigned-upload.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '@/common/decorators/current-user.decorator';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('presigned-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue a presigned URL for a direct browser-to-R2 upload' })
  async createPresignedUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePresignedUploadDto
  ) {
    if (!this.uploads.isMimeAllowed(dto.contentType)) {
      throw new BadRequestException('Unsupported image type.');
    }
    return this.uploads.createPresignedUpload({
      userId: user.id,
      contentType: dto.contentType,
      contentLength: dto.contentLength,
      folder: dto.folder,
    });
  }
}
