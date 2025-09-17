import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { CertificateKnexAdapter } from './adapters/certificate-knex.adapter';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CertificateController],
  providers: [
    CertificateService,
    {
      provide: 'CertificateRepository',
      useClass: CertificateKnexAdapter,
    },
  ],
  exports: [CertificateService],
})
export class CertificateModule {}