import { IsString, MinLength } from "class-validator";

export class CreateModuleDto {
  @IsString()
  @MinLength(10)
  name: string;

  @IsString()
  course_id: string;
}