import type {Express} from 'express';


export type UploadedImageStream = {
  key: string;
  mimetype: 'jpg' | 'png' | 'pdf';
  stream: ReadableStream;
  size: number;
};

export interface UploadGateway {
  upload(file: Express.Multer.File): Promise<string>;
  existsByKey(fileKey: string): Promise<void>;
  getPresignedUrl(fileKey: string, expiresInSeconds?: number): Promise<string>;
  getUploadedImageStream(fileKey: string): Promise<UploadedImageStream>;
}
