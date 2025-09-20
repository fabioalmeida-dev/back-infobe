import {IsBoolean, IsNotEmpty, IsString} from 'class-validator';

export class AuthResponseDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsBoolean()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
