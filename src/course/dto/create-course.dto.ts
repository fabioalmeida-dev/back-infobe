import {IsString, MinLength} from "class-validator";

export class CreateCourseDto {

  @IsString()
  @MinLength(10)
  name: string;

  @IsString()
  cover_key: string;

}