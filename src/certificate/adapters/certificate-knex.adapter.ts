import {Injectable} from '@nestjs/common';
import {InjectConnection} from 'nest-knexjs';
import {Knex} from 'knex';
import * as crypto from 'crypto';
import {TableNames} from '../../enums/tables';
import {DatabaseException} from '../../exceptions/database.exception';
import type {CertificateRepository} from '../repositories/certificate.repository';
import type {CertificateEntity} from '../entities/certificate.entity';

@Injectable()
export class CertificateKnexAdapter implements CertificateRepository {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  async findAll(): Promise<CertificateEntity[]> {
    try {
      return this.knex(TableNames.certificate).select('*');
    } catch (error) {
      throw new DatabaseException('Error retrieving certificates');
    }
  }

  async findById(id: string): Promise<CertificateEntity | null> {
    try {
      return this.knex(TableNames.certificate).where('id', id).first();
    } catch (error) {
      throw new DatabaseException('Error finding certificate by ID');
    }
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<CertificateEntity | null> {
    try {
      return this.knex(TableNames.certificate)
        .where({ user_id: userId, course_id: courseId })
        .first();
    } catch (error) {
      throw new DatabaseException('Error finding certificate by user and course');
    }
  }

  async findByIdWithDetails(id: string): Promise<{
    id: string;
    user_name: string;
    user_cpf: string;
    course_name: string;
    total_duration_minutes: number;
    issued_at: Date;
    certificate_key: string;
    cover_key: string;
  } | null> {
    try {
      const result = await this.knex(TableNames.certificate)
        .join(TableNames.users, `${TableNames.certificate}.user_id`, `${TableNames.users}.id`)
        .join(TableNames.course, `${TableNames.certificate}.course_id`, `${TableNames.course}.id`)
        .leftJoin(TableNames.module, `${TableNames.course}.id`, `${TableNames.module}.course_id`)
        .leftJoin(TableNames.lesson, `${TableNames.module}.id`, `${TableNames.lesson}.module_id`)
        .where(`${TableNames.certificate}.id`, id)
        .select(
          `${TableNames.certificate}.id`,
          `${TableNames.users}.name as user_name`,
          `${TableNames.users}.tax_identifier as user_cpf`,
          `${TableNames.course}.name as course_name`,
          `${TableNames.course}.cover_key as cover_key`,
          `${TableNames.certificate}.issued_at`,
          `${TableNames.certificate}.certificate_key`,
          this.knex.raw('SUM(COALESCE(??, 0)) as total_duration_minutes', [`${TableNames.lesson}.minutes`])
        )
        .groupBy(
          `${TableNames.certificate}.id`,
          `${TableNames.users}.name`,
          `${TableNames.users}.tax_identifier`,
          `${TableNames.course}.name`,
          `${TableNames.certificate}.issued_at`,
          `${TableNames.certificate}.certificate_key`
        )
        .first();

      return result || null;
    } catch (error) {
      throw new DatabaseException('Error finding certificate with details');
    }
  }

  async findByUserId(userId: string): Promise<Array<{
    id: string;
    course_name: string;
    total_duration_minutes: number;
    issued_at: Date;
    certificate_key: string;
    cover_key: string;
  }>> {
    try {
      const results = await this.knex(TableNames.certificate)
        .join(TableNames.course, `${TableNames.certificate}.course_id`, `${TableNames.course}.id`)
        .leftJoin(TableNames.module, `${TableNames.course}.id`, `${TableNames.module}.course_id`)
        .leftJoin(TableNames.lesson, `${TableNames.module}.id`, `${TableNames.lesson}.module_id`)
        .where(`${TableNames.certificate}.user_id`, userId)
        .select(
          `${TableNames.certificate}.id`,
          `${TableNames.course}.name as course_name`,
          `${TableNames.course}.cover_key as cover_key`,
          `${TableNames.certificate}.issued_at`,
          `${TableNames.certificate}.certificate_key`,
          this.knex.raw('SUM(COALESCE(??, 0)) as total_duration_minutes', [`${TableNames.lesson}.minutes`])
        )
        .groupBy(
          `${TableNames.certificate}.id`,
          `${TableNames.course}.name`,
          `${TableNames.certificate}.issued_at`,
          `${TableNames.certificate}.certificate_key`
        )
        .orderBy(`${TableNames.certificate}.issued_at`, 'desc');

      return results;
    } catch (error) {
      throw new DatabaseException('Error finding user certificates');
    }
  }


  async create(data: any): Promise<CertificateEntity | null> {
    try {
      const id = crypto.randomUUID();
      await this.knex(TableNames.certificate).insert({
        id,
        ...data,
      });
      return this.findById(id);
    } catch (error) {
      throw new DatabaseException('Error creating certificate');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.knex(TableNames.certificate).where('id', id).del();
      return result > 0;
    } catch (error) {
      throw new DatabaseException('Error deleting certificate');
    }
  }

  async canIssueCertificate(userId: string, courseId: string): Promise<{
    canIssue: boolean;
    completedLessons: number;
    totalLessons: number;
    missingLessons?: string[];
  }> {
    try {
      const totalLessonsResult = await this.knex(TableNames.lesson)
        .join(TableNames.module, `${TableNames.lesson}.module_id`, `${TableNames.module}.id`)
        .where(`${TableNames.module}.course_id`, courseId)
        .count<{ count: number }>(`${TableNames.lesson}.id as count`)
        .first();
      
      const totalLessons = typeof totalLessonsResult?.count === 'string' 
        ? parseInt(totalLessonsResult.count, 10) 
        : (totalLessonsResult?.count ?? 0);


      const completedLessonsResult = await this.knex(TableNames.userProgress)
        .where({ 
          user_id: userId, 
          course_id: courseId, 
          completed: true,
          percent: 100 
        })
        .countDistinct<{ count: number }>('lesson_id as count')
        .first();
      
      const completedLessons = typeof completedLessonsResult?.count === 'string' 
        ? parseInt(completedLessonsResult.count, 10) 
        : (completedLessonsResult?.count ?? 0);

      const canIssue = totalLessons > 0 && completedLessons >= totalLessons;

      let missingLessons: string[] | undefined;
      if (!canIssue) {
        const allLessons = await this.knex(TableNames.lesson)
          .join(TableNames.module, `${TableNames.lesson}.module_id`, `${TableNames.module}.id`)
          .where(`${TableNames.module}.course_id`, courseId)
          .select(`${TableNames.lesson}.id`, `${TableNames.lesson}.name`);

        const completedLessonIds = await this.knex(TableNames.userProgress)
          .where({ 
            user_id: userId, 
            course_id: courseId, 
            completed: true,
            percent: 100 
          })
          .select('lesson_id');

        const completedIds = completedLessonIds.map(row => row.lesson_id);
        missingLessons = allLessons
          .filter(lesson => !completedIds.includes(lesson.id))
          .map(lesson => lesson.name);
      }

      return {
        canIssue,
        completedLessons,
        totalLessons,
        missingLessons,
      };
    } catch (error) {
      throw new DatabaseException('Error checking certificate eligibility');
    }
  }

  async issueCertificate(
    userId: string,
    courseId: string
  ): Promise<
    | { ok: false; message: string }
    | {
        ok: true;
        certificate: CertificateEntity;
      }
  > {
    try {

      const existingCert = await this.findByUserAndCourse(userId, courseId);
      if (existingCert) {
        return { ok: false, message: 'Certificate already issued for this course' };
      }


      const eligibility = await this.canIssueCertificate(userId, courseId);
      if (!eligibility.canIssue) {
        return { 
          ok: false, 
          message: `Cannot issue certificate. Completed ${eligibility.completedLessons}/${eligibility.totalLessons} lessons. Missing: ${eligibility.missingLessons?.join(', ')}` 
        };
      }

      const certificateKey = crypto.randomUUID();
      const certificate = await this.create({
        user_id: userId,
        course_id: courseId,
        certificate_key: certificateKey,
        issued_at: this.knex.fn.now(),
      });

      if (!certificate) {
        return { ok: false, message: 'Failed to create certificate' };
      }

      return {
        ok: true,
        certificate,
      };
    } catch (error) {
      throw new DatabaseException('Error issuing certificate');
    }
  }
}