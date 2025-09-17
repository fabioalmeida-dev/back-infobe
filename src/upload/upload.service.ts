import {Inject, Injectable} from '@nestjs/common';
import {UploadType} from './dto/upload.dto';
import type {UploadGateway} from "./gateways/upload.gateway";
import type {UploadRepository} from "./gateways/upload.repository";

@Injectable()
export class UploadService {
  constructor(
    @Inject('UploadGateway')
    private readonly uploadGateway: UploadGateway,
    @Inject('UploadRepository')
    private readonly uploadRepository: UploadRepository,
  ) {}

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
}
