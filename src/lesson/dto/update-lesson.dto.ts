import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateLessonDto {
  @IsString()
  @MinLength(10)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  module_id?: string;
}