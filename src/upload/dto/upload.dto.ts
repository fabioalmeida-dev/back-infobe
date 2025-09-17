import {
  IsEnum,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import type {Express} from 'express';

export enum UploadType {
  COVER = 'COVER',
}

@ValidatorConstraint({ name: 'uploadFileValidator', async: true })
export class UploadFileValidator implements ValidatorConstraintInterface {
  // @ts-ignore
  async validate(file: Express.Multer.File, args: ValidationArguments) {
    const { type } = args.object as any;

    if (!file) return false;


    const mime = file.mimetype;
    const sizeMb = file.size / (1024 * 1024);

    if(['image/jpeg', 'image/jpg', 'image/png'].includes(mime) &&
      sizeMb <= 20)
    {
      return true;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const type = args?.object?.['type'];
    return type ? `Arquivo inválido para o tipo ${type}.` : 'Arquivo inválido.';
  }
}

export class UploadDto {
  @IsEnum(UploadType)
  type: UploadType;

  @Validate(UploadFileValidator)
  // @ts-ignore
  file: Express.Multer.File;

}
