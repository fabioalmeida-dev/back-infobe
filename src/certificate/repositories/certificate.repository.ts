import type {CertificateEntity} from '../entities/certificate.entity';

export interface CertificateRepository {
  findAll(): Promise<CertificateEntity[]>;
  findById(id: string): Promise<CertificateEntity | null>;
  create(data: any): Promise<CertificateEntity | null>;

  findByIdWithDetails(id: string): Promise<{
    id: string;
    user_name: string;
    user_cpf: string;
    course_name: string;
    cover_key: string;
    total_duration_minutes: number;
    issued_at: Date;
    certificate_key: string;
  } | null>;
  
  findByUserId(userId: string): Promise<Array<{
    id: string;
    course_name: string;
    cover_key: string;
    total_duration_minutes: number;
    issued_at: Date;
    certificate_key: string;
  }>>;

  canIssueCertificate(userId: string, courseId: string): Promise<{
    canIssue: boolean;
    completedLessons: number;
    totalLessons: number;
    missingLessons?: string[];
  }>;

  issueCertificate(
    userId: string,
    courseId: string
  ): Promise<
    | { ok: false; message: string }
    | {
        ok: true;
        certificate: CertificateEntity;
      }
  >;
}