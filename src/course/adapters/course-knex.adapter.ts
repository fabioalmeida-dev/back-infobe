import {Injectable} from '@nestjs/common';
import * as crypto from 'crypto';
import type {CourseRepository,} from '../repositories/course.repository';
import {DatabaseException} from "../../exceptions/database.exception";
import {TableNames} from "../../enums/tables";
import type {CreateCourseDto} from "../dto/create-course.dto";
import type {Course} from "../entities/course.entity";
import {InjectConnection} from "nest-knexjs";
import {Knex} from "knex";


@Injectable()
export class CourseKnexAdapter implements CourseRepository {
  constructor(@InjectConnection() private readonly knex: Knex) {}

    findAll(): Promise<Course[]> {
      try {
        return this.knex(TableNames.course).select('*').where('status', 'PUBLISHED');
      } catch (error) {
        throw new DatabaseException('Error retrieving courses');
      }
    }

    findAllForAdmin(status?: 'DRAFT' | 'PUBLISHED'): Promise<Array<{
      id: string;
      name: string;
      cover_key: string;
      created_at: Date;
      updated_at: Date;
      status: string;
      totalLessons: number;
      minutes: number;
    }>> {
      try {
        const query = this.knex(TableNames.course)
          .select(
            `${TableNames.course}.id`,
            `${TableNames.course}.name`,
            `${TableNames.course}.cover_key`,
            `${TableNames.course}.created_at`,
            `${TableNames.course}.updated_at`,
            `${TableNames.course}.status`,
            this.knex.raw('COALESCE(COUNT(DISTINCT ??), 0) as totalLessons', [`${TableNames.lesson}.id`]),
            this.knex.raw('COALESCE(SUM(??), 0) as minutes', [`${TableNames.lesson}.minutes`])
          )
          .leftJoin(TableNames.module, `${TableNames.course}.id`, `${TableNames.module}.course_id`)
          .leftJoin(TableNames.lesson, `${TableNames.module}.id`, `${TableNames.lesson}.module_id`)
          .groupBy(
            `${TableNames.course}.id`,
            `${TableNames.course}.name`,
            `${TableNames.course}.cover_key`,
            `${TableNames.course}.created_at`,
            `${TableNames.course}.updated_at`,
            `${TableNames.course}.status`
          );
        
        if (status) {
          query.where(`${TableNames.course}.status`, status);
        }
        
        return query.orderBy(`${TableNames.course}.created_at`, 'desc');
      } catch (error) {
        throw new DatabaseException('Error retrieving courses for admin');
      }
    }
    findById(id: string): Promise<Course | null> {
      try {
        return this.knex(TableNames.course).where('id', id).first();
      } catch (error) {
        throw new DatabaseException('Error finding course by ID');
      }
    }
  async create(dto: CreateCourseDto): Promise<Course | null> {
    try {
      const id = crypto.randomUUID();
      await this.knex(TableNames.course).insert({
        id: id,
        name: dto.name,
        cover_key: dto.cover_key,
      });
      return this.findById(id);
    } catch (error) {
      console.log('Error creating course:', error);
      throw new DatabaseException('Error creating course');
    }
  }

  async update(id: string, courseData: any): Promise<any | null> {
      try {
        const updateData: any = {};
        
        if (courseData.name !== undefined) {
          updateData.name = courseData.name;
        }
        
        if (courseData.cover_key !== undefined) {
          updateData.cover_key = courseData.cover_key;
        }
        
        if (courseData.status !== undefined) {
          updateData.status = courseData.status;
        }

        await this.knex(TableNames.course)
          .where('id', id)
          .update(updateData);

        return this.findById(id);
      } catch (error) {
        throw new DatabaseException('Error updating course');
      }
    }
    delete(id: string): Promise<boolean> {
        try {
          return this.knex(TableNames.course)
            .where('id', id)
            .del()
        } catch (error) {
          throw new DatabaseException('Error deleting course');
        }
    }

    async publish(id: string): Promise<Course | null> {
      try {
        await this.knex(TableNames.course)
          .where('id', id)
          .update({ status: 'PUBLISHED' });

        return this.findById(id);
      } catch (error) {
        throw new DatabaseException('Error publishing course');
      }
    }

    async findByIdWithProgress(id: string, userId: string): Promise<{
      course: Course;
      modules: Array<{
        id: string;
        name: string;
        order: number;
        finished: boolean;
        lessons: Array<{
          id: string;
          name: string;
          order: number;
          minutes: number;
          status: 'not_started' | 'view' | 'finished';
          percent: number;
        }>;
      }>;
      summary: {
        totalLessons: number;
        viewedLessons: number;
        completedLessons: number;
        hasCertificate: boolean;
        ceriticateId?: string;
      };
      recentLessons: Array<{
        id: string;
        name: string;
        percent: number;
        updated_at: Date;
      }>;
    } | null> {
      try {
        const course = await this.knex(TableNames.course).where('id', id).first();
        if (!course) return null;

        // Buscar módulos do curso
         const modules = await this.knex(TableNames.module)
           .where('course_id', id)
           .orderBy('created_at', 'asc');

        const modulesWithLessons: Array<{
           id: string;
           name: string;
           order: number;
           finished: boolean;
           lessons: Array<{
             id: string;
             name: string;
             order: number;
             minutes: number;
             status: 'not_started' | 'view' | 'finished';
             percent: number;
           }>;
         }> = [];
         let totalLessons = 0;
         let viewedLessons = 0;
         let completedLessons = 0;

         for (const module of modules) {
           // Buscar aulas do módulo
           const lessons = await this.knex(TableNames.lesson)
             .where('module_id', module.id)
             .orderBy('created_at', 'asc');

           const lessonsWithStatus: Array<{
             id: string;
             name: string;
             order: number;
             minutes: number;
             status: 'not_started' | 'view' | 'finished';
             percent: number;
           }> = [];
          let moduleFinished = true;

          for (const lesson of lessons) {
            totalLessons++;
            
            // Buscar progresso da aula
            const progress = await this.knex(TableNames.userProgress)
              .where({ user_id: userId, lesson_id: lesson.id })
              .first();

            let status: 'not_started' | 'view' | 'finished' = 'not_started';
            let percent = 0;

            if (progress) {
              percent = progress.percent;
              if (progress.completed && progress.percent === 100) {
                status = 'finished';
                completedLessons++;
                viewedLessons++;
              } else if (progress.percent >= 50) {
                status = 'view';
                viewedLessons++;
                moduleFinished = false;
              } else {
                moduleFinished = false;
              }
            } else {
              moduleFinished = false;
            }

            lessonsWithStatus.push({
              id: lesson.id,
              name: lesson.name,
              order: lesson.order,
              minutes: lesson.minutes,
              status,
              percent
            });
          }

          modulesWithLessons.push({
            id: module.id,
            name: module.name,
            order: module.order,
            finished: moduleFinished && lessons.length > 0,
            lessons: lessonsWithStatus
          });
        }

        // Buscar últimas aulas vistas do curso
        const recentLessons = await this.knex(TableNames.userProgress)
          .join(TableNames.lesson, `${TableNames.userProgress}.lesson_id`, `${TableNames.lesson}.id`)
          .where({ 
            [`${TableNames.userProgress}.user_id`]: userId,
            [`${TableNames.userProgress}.course_id`]: id
          })
          .select(
            `${TableNames.lesson}.id`,
            `${TableNames.lesson}.name`,
            `${TableNames.userProgress}.percent`,
            `${TableNames.userProgress}.updated_at`
          )
          .orderBy(`${TableNames.userProgress}.updated_at`, 'desc')
          .limit(5);

        // Verificar se o usuário tem certificado para este curso
        const certificate = await this.knex(TableNames.certificate)
          .where({ user_id: userId, course_id: id })
          .first();

        return {
          course,
          modules: modulesWithLessons,
          summary: {
            totalLessons,
            viewedLessons,
            completedLessons,
            hasCertificate: !!certificate,
            ceriticateId: certificate?.id || null
          },
          recentLessons
        };
      } catch (error) {
        throw new DatabaseException('Error finding course with progress');
      }
    }

    async findRecentLessons(userId: string, limit: number = 3): Promise<Array<{
      lesson_id: string;
      lesson_name: string;
      course_id: string;
      course_name: string;
      cover_key: string;
      percent: number;
      updated_at: Date;
    }>> {
      try {
        // Primeiro, buscar cursos que o usuário completou 100%
        const completedCourses = await this.knex.raw(`
          SELECT DISTINCT up.course_id
          FROM user_progress up
          JOIN (
            SELECT m.course_id, COUNT(DISTINCT l.id) as total_lessons
            FROM lesson l
            JOIN module m ON l.module_id = m.id
            GROUP BY m.course_id
          ) course_totals ON up.course_id = course_totals.course_id
          JOIN (
            SELECT course_id, COUNT(DISTINCT lesson_id) as completed_lessons
            FROM user_progress
            WHERE user_id = ? AND completed = 1
            GROUP BY course_id
          ) user_completed ON up.course_id = user_completed.course_id
          WHERE up.user_id = ? 
          AND course_totals.total_lessons = user_completed.completed_lessons
        `, [userId, userId]);

        const completedCourseIds = completedCourses[0]?.map((row: any) => row.course_id) || [];

        // Buscar recent lessons excluindo cursos 100% completos
        const query = this.knex(TableNames.userProgress)
          .join(TableNames.lesson, `${TableNames.userProgress}.lesson_id`, `${TableNames.lesson}.id`)
          .join(TableNames.course, `${TableNames.userProgress}.course_id`, `${TableNames.course}.id`)
          .where(`${TableNames.userProgress}.user_id`, userId)
          .select(
            `${TableNames.lesson}.id as lesson_id`,
            `${TableNames.lesson}.name as lesson_name`,
            `${TableNames.course}.id as course_id`,
            `${TableNames.course}.name as course_name`,
            `${TableNames.course}.cover_key`,
            `${TableNames.userProgress}.percent`,
            `${TableNames.userProgress}.updated_at`
          );

        // Excluir cursos 100% completos se houver algum
        if (completedCourseIds.length > 0) {
          query.whereNotIn(`${TableNames.course}.id`, completedCourseIds);
        }

        return await query
          .orderBy(`${TableNames.userProgress}.updated_at`, 'desc')
          .limit(limit);
      } catch (error) {
        throw new DatabaseException('Error finding recent lessons');
      }
    }

    async findRecommendedCourses(userId: string): Promise<Array<{
      id: string;
      name: string;
      cover_key: string;
      totalLessons: number;
      minutes: number;
    }>> {
      try {
        // Buscar cursos que o usuário nunca viu uma aula
        const viewedCourseIds = await this.knex(TableNames.userProgress)
          .where('user_id', userId)
          .distinct('course_id')
          .pluck('course_id');

        const coursesQuery = this.knex(TableNames.course)
          .select(
            `${TableNames.course}.id`,
            `${TableNames.course}.name`,
            `${TableNames.course}.cover_key`,
            this.knex.raw('COUNT(DISTINCT ??) as totalLessons', [`${TableNames.lesson}.id`]),
            this.knex.raw('SUM(??) as minutes', [`${TableNames.lesson}.minutes`])
          )
          .join(TableNames.module, `${TableNames.course}.id`, `${TableNames.module}.course_id`)
          .join(TableNames.lesson, `${TableNames.module}.id`, `${TableNames.lesson}.module_id`)
          .where(`${TableNames.course}.status`, 'PUBLISHED')
          .groupBy(`${TableNames.course}.id`, `${TableNames.course}.name`);

        if (viewedCourseIds.length > 0) {
          coursesQuery.whereNotIn(`${TableNames.course}.id`, viewedCourseIds);
        }

        return await coursesQuery;
      } catch (error) {
        throw new DatabaseException('Error finding recommended courses');
      }
    }

    async findMyCourses(userId: string): Promise<Array<{
      id: string;
      name: string;
      totalLessons: number;
      minutes: number;
      cover_key: string;
      progress: number;
    }>> {
      try {
        // Buscar cursos que o usuário viu pelo menos uma aula
        const viewedCourseIds = await this.knex(TableNames.userProgress)
          .where('user_id', userId)
          .distinct('course_id')
          .pluck('course_id');

        if (viewedCourseIds.length === 0) {
          return [];
        }

        const courses: Array<{
           id: string;
           name: string;
           totalLessons: number;
           minutes: number;
           cover_key: string;
           progress: number;
         }> = [];
         
         for (const courseId of viewedCourseIds) {
           const courseData = await this.knex(TableNames.course)
             .select(
               `${TableNames.course}.id`,
               `${TableNames.course}.name`,
               `${TableNames.course}.cover_key`,
               this.knex.raw('COUNT(DISTINCT ??) as totalLessons', [`${TableNames.lesson}.id`]),
               this.knex.raw('SUM(??) as minutes', [`${TableNames.lesson}.minutes`])
             )
             .join(TableNames.module, `${TableNames.course}.id`, `${TableNames.module}.course_id`)
             .join(TableNames.lesson, `${TableNames.module}.id`, `${TableNames.lesson}.module_id`)
             .where(`${TableNames.course}.id`, courseId)
             .where(`${TableNames.course}.status`, 'PUBLISHED')
             .groupBy(`${TableNames.course}.id`, `${TableNames.course}.name`, `${TableNames.course}.cover_key`)
             .first();

           if (courseData) {
             // Calcular progresso
             const completedLessons = await this.knex(TableNames.userProgress)
               .where({ user_id: userId, course_id: courseId, completed: true })
               .count('* as count')
               .first();

             const completedCount = completedLessons ? parseInt(completedLessons.count as string, 10) : 0;
             const totalLessons = parseInt(courseData.totalLessons as string, 10);
             const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

            courses.push({
              id: courseData.id,
              name: courseData.name,
              totalLessons,
              minutes: courseData.minutes || 0,
              cover_key: courseData.cover_key,
              progress
            });
          }
        }

        return courses;
      } catch (error) {
        throw new DatabaseException('Error finding my courses');
      }
    }

}