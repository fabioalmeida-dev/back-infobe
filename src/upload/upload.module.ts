import {Global, Module, Scope} from '@nestjs/common';
import {UploadService} from './upload.service';
import {UploadController} from './upload.controller';
import {ConfigService} from '@nestjs/config';
import {S3Client} from '@aws-sdk/client-s3';
import {AwsUploadAdapter} from './adapters/aws-upload.adapter';
import {UploadRepositoryMysqlAdapter} from './adapters/upload-repository-mysql.adapter';

@Global()
@Module({
  providers: [

    UploadService,
    {
      provide: 'UploadGateway',
      useClass: AwsUploadAdapter,
    },
    {
      provide: 'UploadRepository',
      useClass: UploadRepositoryMysqlAdapter,
    },
    {
      provide: 'S3Client',
      useFactory: (configService: ConfigService) => {
        const isMinio = configService.get('aws.s3.provider') === 'minio';

        return new S3Client(
          // @ts-ignore
          {
          region: configService.get('aws.s3.region'),
          ...(isMinio && {
            endpoint: configService.get('aws.s3.endpoint'),
            forcePathStyle: true,
          }),
          credentials: {
            accessKeyId: configService.get('aws.s3.accessKeyId'),
            secretAccessKey: configService.get('aws.s3.secretAccessKey'),
          },
        });
      },
      scope: Scope.DEFAULT,
      inject: [ConfigService],
    },
  ],
  controllers: [UploadController],
  exports: [UploadService, 'UploadGateway', 'UploadRepository', 'S3Client'],
})
export class UploadModule {}
