import { IsString, MinLength } from "class-validator";

export class CreateLessonDto {
  @IsString()
  @MinLength(10)
  name: string;

  @IsString()
  content: string;

  @IsString()
  module_id: string;
}