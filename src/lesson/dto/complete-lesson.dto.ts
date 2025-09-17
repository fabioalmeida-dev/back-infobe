import { IsUUID } from "class-validator";

export class CompleteLessonDto {
  @IsUUID()
  lesson_id: string;
}