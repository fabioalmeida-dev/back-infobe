import type { LessonEntity } from "../entities/lesson.entity";

export interface LessonRepository {
  findAll(): Promise<LessonEntity[]>;
  findById(id: string): Promise<LessonEntity | null>;
  create(data: any): Promise<LessonEntity | null>;
  update(id: string, data: any): Promise<LessonEntity | null>;
  delete(id: string): Promise<boolean>;

  // extra queries to support completion flow
  getCourseAndModuleByLessonId(lessonId: string): Promise<{ course_id: string; module_id: string } | null>;
  countLessonsByCourse(courseId: string): Promise<number>;

  // move business logic into adapter: view a lesson (50% progress)
  viewLesson(
    userId: string,
    dto: { lesson_id: string }
  ): Promise<
    | { ok: false; message: string }
    | {
        ok: true;
        progress: { percent: number };
      }
  >;

  // move business logic into adapter: complete a lesson and issue certificate when applicable
  completeLesson(
    userId: string,
    dto: { lesson_id: string }
  ): Promise<
    | { ok: false; message: string }
    | {
        ok: true;
        progress: { completedCount: number; totalLessons: number };
        certificate: { course_id: string; certificate_key: string } | null;
      }
  >;
}