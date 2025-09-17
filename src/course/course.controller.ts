import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {CourseService} from './course.service';
import {CreateCourseDto} from "./dto/create-course.dto";
import {UpdateCourseDto} from "./dto/update-course.dto";
import {AdminGuard} from "../auth/guard/admin.guard";
import {User} from "../decorators/user.decorator";

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(
    @User('id') userId: string,
    @Param('id') id: string) {
    return this.courseService.findOneWithProgress(id, userId);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }

  @Get('user/recent-lessons')
  findRecentLessons(
    @User('id') userId: string) {
    return this.courseService.findRecentLessons(userId, 3);
  }

  @Get('user/recommended')
  findRecommendedCourses(
    @User('id') userId: string) {
    return this.courseService.findRecommendedCourses(userId);
  }

  @Get('user/my-courses')
  findMyCourses(
    @User('id') userId: string) {
    return this.courseService.findMyCourses(userId);
  }
}
