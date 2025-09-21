import {Inject, Injectable} from '@nestjs/common';
import {UploadType} from './dto/upload.dto';
import type {UploadedImageStream, UploadGateway} from "./gateways/upload.gateway";
import type {UploadRepository} from "./gateways/upload.repository";
import {FileNotFoundError} from "./errors/file-not-found.error";

@Injectable()
export class UploadService {
  constructor(
    @Inject('UploadGateway')
    private readonly uploadGateway: UploadGateway,
    @Inject('UploadRepository')
    private readonly uploadRepository: UploadRepository,
  ) {}

  async findFile(fileKey: string): Promise<boolean> {
    const find = await this.uploadRepository.findFile(fileKey);

    return !!find.fileKey;
  }


  async upload(
    file: any,
    type: UploadType,
  ): Promise<any> {
    const key = await this.uploadGateway.upload(file);

    const fileName = file.originalname || 'unknown';
    const fileSize = file.size;



    await this.uploadRepository.save(
      key,
      type,
      fileName,
      fileSize,
    );

    return {
      key,
      url: await this.uploadGateway.getPresignedUrl(key, 3600),
    };
  }

  async getImageByKeyAndId(fileKey: string): Promise<UploadedImageStream> {
    const findFileById = await this.findFile(fileKey);

    if (!findFileById) {
      throw new FileNotFoundError('File not found');
    }

    return await this.uploadGateway.getUploadedImageStream(fileKey);
  }
}
