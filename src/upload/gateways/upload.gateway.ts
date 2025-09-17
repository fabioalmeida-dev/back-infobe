import type {Express} from 'express';


export type UploadedImageStream = {
  key: string;
  mimetype: 'jpg' | 'png' | 'pdf';
  stream: ReadableStream;
  size: number;
};

export interface UploadGateway {
  // @ts-ignore
  upload(file: Express.Multer.File): Promise<string>;
  existsByKey(fileKey: string): Promise<void>;
  getPresignedUrl(fileKey: string, expiresInSeconds?: number): Promise<string>;
}
