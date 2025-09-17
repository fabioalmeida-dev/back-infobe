import {Body, Controller, HttpException, HttpStatus, Post, Res, UploadedFiles, UseInterceptors,} from '@nestjs/common';
import {UploadService} from './upload.service';


import {plainToClass} from 'class-transformer';
import {UploadResponseDTO} from './dto/upload-response.dto';
import {FileFieldsInterceptor} from '@nestjs/platform-express';
import {validate} from 'class-validator';
import {UploadDto, UploadType} from './dto/upload.dto';
import type {Response} from "express";

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 1 }]))
  async upload(
    @Res() response: Response,
    @UploadedFiles()
    files: { file: any[] },
    @Body('type') type: UploadType,
  ) {
    const file = files?.file?.[0];

    if (!file) {
      throw new HttpException(
        {
          message: 'Erro de validação',
          errors: [
            {
              field: 'file',
              messages: ['Arquivo obrigatório.'],
            },
          ],
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const uploadDto = plainToClass(UploadDto, {
      type,
      file,
    });

    const errors = await validate(uploadDto);
    if (errors.length > 0) {
      const formattedErrors = errors.map((err) => ({
        field: err.property,
        messages: Object.values(err.constraints || {}),
      }));

      throw new HttpException(
        {
          message: 'Erro de validação',
          errors: formattedErrors,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const res = await this.uploadService.upload(files.file[0], type);

    const responseDto = new UploadResponseDTO();
    responseDto.key = res.key;
    responseDto.url = res.url;

    return response.status(HttpStatus.OK).json(res);
  }
}
