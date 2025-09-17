import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateModuleDto {
  @IsString()
  @MinLength(10)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  course_id?: string;
}