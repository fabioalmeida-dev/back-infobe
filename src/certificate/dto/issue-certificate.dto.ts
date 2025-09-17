import { IsUUID, IsNotEmpty } from 'class-validator';

export class IssueCertificateDto {
  @IsUUID()
  @IsNotEmpty()
  course_id: string;
}