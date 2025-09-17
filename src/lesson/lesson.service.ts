import { Inject, Injectable } from '@nestjs/common';
import type { LessonRepository } from './repositories/lesson.repository';
import type { CreateLessonDto } from './dto/create-lesson.dto';
import type { UpdateLessonDto } from './dto/update-lesson.dto';
import type { CompleteLessonDto } from './dto/complete-lesson.dto';

@Injectable()
export class LessonService {
  constructor(
    @Inject('LessonRepository')
    private readonly repo: LessonRepository,
  ) {}

  create(dto: CreateLessonDto) {
    return this.repo.create(dto);
  }

  findAll() {
    return this.repo.findAll();
  }

  findOne(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, dto: UpdateLessonDto) {
    return this.repo.update(id, dto);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  async viewLesson(userId: string, dto: CompleteLessonDto) {
    return this.repo.viewLesson(userId, { lesson_id: dto.lesson_id });
  }

  async completeLesson(userId: string, dto: CompleteLessonDto) {
    return this.repo.completeLesson(userId, { lesson_id: dto.lesson_id });
  }
}