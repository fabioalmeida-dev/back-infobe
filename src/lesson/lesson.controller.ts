import {Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards} from '@nestjs/common';
import {LessonService} from './lesson.service';
import {CreateLessonDto} from './dto/create-lesson.dto';
import {UpdateLessonDto} from './dto/update-lesson.dto';
import {User} from '../decorators/user.decorator';
import {AdminGuard} from "../auth/guard/admin.guard";

@Controller('lesson')
export class LessonController {
  constructor(private readonly service: LessonService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateLessonDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }


  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/view')
  viewLesson(@User('id') userId: string, @Param('id', new ParseUUIDPipe()) lessonId: string) {
    return this.service.viewLesson(userId, { lesson_id: lessonId });
  }

  @Post(':id/complete')
  complete(@User('id') userId: string, @Param('id', new ParseUUIDPipe()) lessonId: string) {
    return this.service.completeLesson(userId, { lesson_id: lessonId });
  }
}