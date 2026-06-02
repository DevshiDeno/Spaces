import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import type { AppConfig } from '@/config/configuration';

export interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService<AppConfig>) {
    const r2 = this.config.get('r2', { infer: true });
    if (!r2 || !r2.endpoint || !r2.accessKeyId || !r2.secretAccessKey || !r2.bucket) {
      this.logger.warn('R2 credentials are not configured — uploads will fail until R2_* env vars are set.');
    }
    this.bucket = r2?.bucket ?? '';
    this.publicBaseUrl = (r2?.publicBaseUrl ?? '').replace(/\/$/, '');
    this.client = new S3Client({
      region: 'auto',
      endpoint: r2?.endpoint,
      credentials: {
        accessKeyId: r2?.accessKeyId ?? '',
        secretAccessKey: r2?.secretAccessKey ?? '',
      },
    });
  }

  isMimeAllowed(mime: string): boolean {
    return ALLOWED_MIME_TYPES.has(mime);
  }

  async createPresignedUpload(params: {
    userId: string;
    contentType: string;
    contentLength: number;
    folder?: string;
  }): Promise<PresignedUploadResult> {
    if (!this.bucket || !this.publicBaseUrl) {
      throw new InternalServerErrorException('Object storage is not configured.');
    }

    const ext = MIME_EXTENSIONS[params.contentType] ?? 'bin';
    const folder = (params.folder ?? 'uploads').replace(/[^a-z0-9-_/]/gi, '').replace(/^\/+|\/+$/g, '');
    const key = `${folder}/${params.userId}/${Date.now()}-${randomUUID()}.${ext}`;

    // ContentLength becomes part of the signed request; if the client uploads
    // a different size, S3/R2 rejects with SignatureDoesNotMatch.
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: params.contentType,
      ContentLength: params.contentLength,
    });

    const expiresIn = 60;
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });

    return {
      uploadUrl,
      publicUrl: `${this.publicBaseUrl}/${key}`,
      key,
      expiresIn,
    };
  }
}
