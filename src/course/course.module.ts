import {Module} from '@nestjs/common';
import {CourseService} from './course.service';
import {CourseController} from './course.controller';
import {CourseKnexAdapter} from "./adapters/course-knex.adapter";
import {AuthModule} from "../auth/auth.module";
import {UploadModule} from "../upload/upload.module";

@Module({
  imports: [AuthModule, UploadModule],
  controllers: [CourseController],
  providers: [CourseService,  {
    provide: 'CourseRepository',
    useClass: CourseKnexAdapter,
  },],
})
export class CourseModule {}
