import {Module} from '@nestjs/common';
import {LessonController} from './lesson.controller';
import {LessonService} from './lesson.service';
import {LessonKnexAdapter} from './adapters/lesson-knex.adapter';
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [LessonController],
  providers: [
    LessonService,
    {
      provide: 'LessonRepository',
      useClass: LessonKnexAdapter,
    },
  ],
})
export class LessonModule {}