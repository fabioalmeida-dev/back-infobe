import {Injectable} from '@nestjs/common';
import {InjectConnection} from 'nest-knexjs';
import {Knex} from 'knex';
import {TableNames} from '../../enums/tables';
import {DatabaseException} from '../../exceptions/database.exception';
import type {LessonRepository} from '../repositories/lesson.repository';
import type {LessonEntity} from '../entities/lesson.entity';
import type {CreateLessonDto} from '../dto/create-lesson.dto';
import {readingTime} from 'reading-time-estimator'


const PER_MINUTES = 200;

@Injectable()
export class LessonKnexAdapter implements LessonRepository {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  findAll(): Promise<LessonEntity[]> {
    try {
      return this.knex(TableNames.lesson).select('*');
    } catch (error) {
      throw new DatabaseException('Error retrieving lessons');
    }
  }
  findById(id: string): Promise<LessonEntity | null> {
    try {
      return this.knex(TableNames.lesson).where('id', id).first();
    } catch (error) {
      throw new DatabaseException('Error finding lesson by ID');
    }
  }
  async create(dto: CreateLessonDto): Promise<LessonEntity | null> {

    const minutes = await readingTime(dto.content, PER_MINUTES, 'pt-br')?.minutes ?? 0;
    try {
      const id = crypto.randomUUID();
      await this.knex(TableNames.lesson).insert({
        id,
        name: dto.name,
        content: dto.content,
        module_id: dto.module_id,
        minutes
      });
      return this.findById(id);
    } catch (error) {
      console.log(error)
      throw new DatabaseException('Error creating lesson');
    }
  }
  async update(id: string, data: any): Promise<LessonEntity | null> {
    try {
      const minutes = await readingTime(data.content, PER_MINUTES, 'pt-br')?.minutes ?? 0;
      await this.knex(TableNames.lesson).where('id', id).update({...data, minutes});
      return this.findById(id);
    } catch (error) {
      console.log(error)
      throw new DatabaseException('Error updating lesson');
    }
  }
  delete(id: string): Promise<boolean> {
    try {
      return this.knex(TableNames.lesson).where('id', id).del();
    } catch (error) {
      throw new DatabaseException('Error deleting lesson');
    }
  }

  async getCourseAndModuleByLessonId(lessonId: string): Promise<{ course_id: string; module_id: string } | null> {
    try {
      const row = await this.knex(TableNames.lesson)
        .join(TableNames.module, `${TableNames.lesson}.module_id`, `${TableNames.module}.id`)
        .select(`${TableNames.module}.id as module_id`, `${TableNames.module}.course_id as course_id`)
        .where(`${TableNames.lesson}.id`, lessonId)
        .first();
      return row ?? null;
    } catch (error) {
      throw new DatabaseException('Error retrieving module/course by lesson');
    }
  }

  async countLessonsByCourse(courseId: string): Promise<number> {
    try {
      const result = await this.knex(TableNames.lesson)
        .join(TableNames.module, `${TableNames.lesson}.module_id`, `${TableNames.module}.id`)
        .where(`${TableNames.module}.course_id`, courseId)
        .count<{ count: number }>(`${TableNames.lesson}.id as count`)
        .first();
      const count = (result as any)?.count ?? 0;
      return typeof count === 'string' ? parseInt(count, 10) : count;
    } catch (error) {
      throw new DatabaseException('Error counting lessons by course');
    }
  }

  async viewLesson(
    userId: string,
    dto: { lesson_id: string },
  ): Promise<
    | { ok: false; message: string }
    | {
        ok: true;
        progress: { percent: number };
      }
  > {
    try {
      const mapping = await this.getCourseAndModuleByLessonId(dto.lesson_id);
      if (!mapping) return { ok: false, message: 'Lesson not found' };

      const { course_id, module_id } = mapping;

      const trx = await this.knex.transaction();
      try {
        const existing = await trx(TableNames.userProgress)
          .where({ user_id: userId, lesson_id: dto.lesson_id })
          .forUpdate()
          .first();

        if (existing) {
          // Se já existe e não está completo, atualiza para 50%
          if (!existing.completed && existing.percent < 50) {
            await trx(TableNames.userProgress)
              .where({ id: existing.id })
              .update({ percent: 50, course_id, module_id, updated_at: trx.fn.now() });
          }
        } else {
          // Cria novo registro com 50%
          await trx(TableNames.userProgress).insert({
            id: crypto.randomUUID(),
            user_id: userId,
            course_id,
            module_id,
            lesson_id: dto.lesson_id,
            completed: false,
            percent: 50,
          });
        }

        await trx.commit();

        return {
          ok: true,
          progress: { percent: 50 },
        };
      } catch (e) {
        await trx.rollback();
        throw e;
      }
    } catch (error) {
      throw new DatabaseException('Error viewing lesson');
    }
  }

  async completeLesson(
    userId: string,
    dto: { lesson_id: string },
  ): Promise<
    | { ok: false; message: string }
    | {
        ok: true;
        progress: { completedCount: number; totalLessons: number };
        certificate: { course_id: string; certificate_key: string } | null;
      }
  > {
    try {
      const mapping = await this.getCourseAndModuleByLessonId(dto.lesson_id);
      if (!mapping) return { ok: false, message: 'Lesson not found' };

      const { course_id, module_id } = mapping;

      const trx = await this.knex.transaction();
      try {
        const existing = await trx(TableNames.userProgress)
          .where({ user_id: userId, lesson_id: dto.lesson_id })
          .forUpdate()
          .first();

        if (existing) {
          await trx(TableNames.userProgress)
            .where({ id: existing.id })
            .update({ completed: true, percent: 100, course_id, module_id, updated_at: trx.fn.now() });
        } else {
          await trx(TableNames.userProgress).insert({
            id: crypto.randomUUID(),
            user_id: userId,
            course_id,
            module_id,
            lesson_id: dto.lesson_id,
            completed: true,
            percent: 100,
          });
        }

        const countRow = await trx(TableNames.userProgress)
          .where({ user_id: userId, course_id, completed: true })
          .countDistinct<{ count: number }>('lesson_id as count')
          .first();
        const completedCountRaw = (countRow as any)?.count ?? 0;
        const completedCount =
          typeof completedCountRaw === 'string' ? parseInt(completedCountRaw as any, 10) : completedCountRaw;

        const totalLessons = await this.countLessonsByCourse(course_id);

        await trx.commit();

        return {
          ok: true,
          progress: { completedCount, totalLessons },
          certificate: null, // Certificado não é mais emitido automaticamente
        };
      } catch (e) {
        await trx.rollback();
        throw e;
      }
    } catch (error) {
      throw new DatabaseException('Error completing lesson');
    }
  }
}