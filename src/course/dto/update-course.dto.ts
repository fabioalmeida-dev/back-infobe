import {IsString, MinLength} from "class-validator";

export class UpdateCourseDto {
  @IsString()
  @MinLength(10)
  name: string;

  @IsString()
  cover_key: string;
}
