import {Inject, Injectable} from '@nestjs/common';
import {CreateCourseDto} from './dto/create-course.dto';
import {UpdateCourseDto} from './dto/update-course.dto';
import type {CourseRepository} from "./repositories/course.repository";
import type {UploadGateway} from "../upload/gateways/upload.gateway";

@Injectable()
export class CourseService {

  constructor(
    @Inject('CourseRepository')
    private readonly repo: CourseRepository,
    @Inject('UploadGateway')
    private readonly uploadGateway: UploadGateway,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    return await this.repo.create(createCourseDto);
  }

  async findAll() {
    const allCourse = await this.repo.findAll();
    return await Promise.all(allCourse.map(async (course) => {
      const presignedFileCover = await this.uploadGateway.getPresignedUrl(
        course.cover_key,
        3600,
      );

      return {
        ...course,
        cover_url: presignedFileCover
      }
    }));

  }

  async findAllForAdmin(status?: 'DRAFT' | 'PUBLISHED') {
    const allCourse = await this.repo.findAllForAdmin(status);
    return await Promise.all(allCourse.map(async (course) => {
      const presignedFileCover = await this.uploadGateway.getPresignedUrl(
        course.cover_key,
        3600,
      );

      return {
        id: course.id,
        name: course.name,
        totalLessons: parseInt(course.totalLessons as any, 10) || 0,
        minutes: (parseInt(course.minutes as any, 10) || 0).toString(),
        cover_key: course.cover_key,
        created_at: course.created_at,
        updated_at: course.updated_at,
        status: course.status,
        progress: 0, // Para admin, sempre 0 pois não há contexto de usuário
        cover_url: presignedFileCover
      }
    }));
  }
  update(id: string, updateCourseDto: UpdateCourseDto) {
    return this.repo.update(id, updateCourseDto);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  publish(id: string) {
    return this.repo.publish(id);
  }

  async findOneWithProgress(id: string, userId: string) {
    const course = await this.repo.findByIdWithProgress(id, userId);

    const presignedFileCover = await this.uploadGateway.getPresignedUrl(
      course.course.cover_key,
      3600,
    );

    return {
      ...course,
      course: {
        ...course.course,
        cover_url: presignedFileCover
      }
    }

  }

  findRecentLessons(userId: string, limit?: number) {
    return this.repo.findRecentLessons(userId, limit);
  }

  async findRecommendedCourses(userId: string) {
    const course= await this.repo.findRecommendedCourses(userId);

    return await Promise.all(course.map(async (course) => {
      const presignedFileCover = await this.uploadGateway.getPresignedUrl(
        course.cover_key,
        3600,
      );

      return {
        ...course,
        cover_url: presignedFileCover
      }
    }));

  }

  async findMyCourses(userId: string) {
    const courses = await this.repo.findMyCourses(userId);
    return await Promise.all(courses.map(async (course) => {
      const presignedFileCover = await this.uploadGateway.getPresignedUrl(
        course.cover_key,
        3600,
      );

      return {
        ...course,
        cover_url: presignedFileCover
      }
    }));

  }
}
