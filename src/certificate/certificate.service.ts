import {Inject, Injectable} from '@nestjs/common';
import type {CertificateRepository} from './repositories/certificate.repository';
import type {IssueCertificateDto} from './dto/issue-certificate.dto';
import type {CertificateDetailsDto} from './dto/certificate-details.dto';
import type {MyCertificateDto} from './dto/my-certificate.dto';

@Injectable()
export class CertificateService {
  constructor(
    @Inject('CertificateRepository')
    private readonly repo: CertificateRepository,
  ) {}

  findAll() {
    return this.repo.findAll();
  }

  async findOneWithDetails(id: string): Promise<CertificateDetailsDto | null> {
    return this.repo.findByIdWithDetails(id);
  }

  async findMyCertificates(userId: string): Promise<MyCertificateDto[]> {
    return this.repo.findByUserId(userId);
  }

  async issueCertificate(userId: string, dto: IssueCertificateDto) {
    return this.repo.issueCertificate(userId, dto.course_id);
  }

}