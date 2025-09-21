import {GetObjectCommand, HeadObjectCommand, S3Client,} from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import {Inject, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {type UploadedImageStream, UploadGateway,} from '../gateways/upload.gateway';
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

  async getUploadedImageStream(
    fileKey: string,
    rangeHeader?: string,
  ): Promise<UploadedImageStream & { statusCode: number; range?: string }> {
    const bucket = this.configService.get('aws.s3.bucket');

    const head = await this.s3Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: fileKey,
      }),
    );

    const totalSize = head.ContentLength ?? 0;

    let start = 0;
    let end = totalSize - 1;

    if (rangeHeader) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader);
      if (match) {
        start = parseInt(match[1], 10);
        if (match[2]) {
          end = parseInt(match[2], 10);
        }
      }
    }

    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        Range: `bytes=${start}-${end}`,
      }),
    );

    return {
      key: fileKey,
      // @ts-ignore
      mimetype: response.ContentType!,
      stream: response.Body.transformToWebStream(),
      size: end - start + 1,
      statusCode: rangeHeader ? 206 : 200,
      range: rangeHeader ? `bytes ${start}-${end}/${totalSize}` : undefined,
    };
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
