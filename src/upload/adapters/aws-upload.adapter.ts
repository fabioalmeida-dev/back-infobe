import {GetObjectCommand, HeadObjectCommand, S3Client,} from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import {Inject, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {UploadGateway,} from '../gateways/upload.gateway';
import {Upload} from "@aws-sdk/lib-storage";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";


@Injectable()
export class AwsUploadAdapter implements UploadGateway {
  constructor(
    @Inject('S3Client') private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async upload(file: any) {
    const key = crypto.randomUUID();

    const buffer = file.buffer;
    const mimetype = file.mimetype;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.configService.get('aws.s3.bucket'),
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      },
      queueSize: 4,
    });

    await upload.done();

    return key;

  }

  async existsByKey(fileKey: string): Promise<void> {
    await this.s3Client.send(
      new HeadObjectCommand({
        Bucket: this.configService.get('aws.s3.bucket'),
        Key: fileKey,
      }),
    );
  }


  async getPresignedUrl(
    fileKey: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    if (!fileKey) {
      return '';
    }

    const bucket = this.configService.get('aws.s3.bucket');

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    return url;
  }
}
