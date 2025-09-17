import { IsString } from 'class-validator';

export class UploadResponseDTO {
  @IsString()
  key: string;

  @IsString()
  url: string;
}
