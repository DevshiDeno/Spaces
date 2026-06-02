import axios from 'axios';
import { http } from './http';

export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_FILE_BYTES = 8 * 1024 * 1024;

export const uploadsService = {
  async createPresignedUpload(
    contentType: string,
    contentLength: number,
    folder?: string
  ): Promise<PresignedUpload> {
    const { data } = await http.post<PresignedUpload>('/uploads/presigned-url', {
      contentType,
      contentLength,
      folder,
    });
    return data;
  },

  async uploadImage(file: File, folder?: string): Promise<string> {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error('Only JPEG, PNG, WebP, GIF, or AVIF images are supported.');
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new Error(`Image must be under ${Math.floor(MAX_FILE_BYTES / (1024 * 1024))}MB.`);
    }

    const presigned = await uploadsService.createPresignedUpload(file.type, file.size, folder);

    await axios.put(presigned.uploadUrl, file, {
      headers: { 'Content-Type': file.type },
    });

    return presigned.publicUrl;
  },
};
