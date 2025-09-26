import type {Course} from "../entities/course.entity";

export interface CourseRepository {
  findAll(): Promise<Course[]>;
  findAllForAdmin(status?: 'DRAFT' | 'PUBLISHED'): Promise<Course[]>;
  findById(id: string): Promise<Course | null>;
  findByIdWithProgress(id: string, userId: string): Promise<{
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
    };
    recentLessons: Array<{
      id: string;
      name: string;
      percent: number;
      updated_at: Date;
    }>;
  } | null>;
  findRecentLessons(userId: string, limit?: number): Promise<Array<{
    lesson_id: string;
    lesson_name: string;
    course_id: string;
    course_name: string;
    cover_key: string;
    percent: number;
    updated_at: Date;
  }>>;
  findRecommendedCourses(userId: string): Promise<Array<{
    id: string;
    name: string;
    cover_key: string;
    totalLessons: number;
    minutes: number;
  }>>;
  findMyCourses(userId: string): Promise<Array<{
    id: string;
    name: string;
    totalLessons: number;
    minutes: number;
    cover_key: string;
    progress: number;
  }>>;
  create(courseData: any): Promise<Course | null>;
  update(id: string, courseData: any): Promise<Course | null>;
  publish(id: string): Promise<Course | null>;
  delete(id: string): Promise<boolean>;
}