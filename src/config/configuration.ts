import {ConfigFactory} from '@nestjs/config';

export const configuration: ConfigFactory<Configuration> = async () => {
  return {
    application: {
      baseUrl: process.env.BASE_URL,
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
      nodeEnv: process.env.NODE_ENV || 'development',
      jwtSecret: process.env.JWT_SECRET || 'default',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    aws: {
      s3: {
        provider: process.env.AWS_S3_PROVIDER || 'aws',
        endpoint: process.env.AWS_S3_ENDPOINT || '',
        endpointPublic: process.env.AWS_S3_ENDPOINT_PUBLIC || '',
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_S3_REGION || '',
        bucket: process.env.AWS_S3_BUCKET_NAME || '',
      },
    },
  };
};

export type Configuration = {
  application: ApplicationConfig;
  aws: {
    s3: AwsS3Config;
  };
};

export type ApplicationConfig = {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
};

export type AwsS3Config = {
  provider: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
};