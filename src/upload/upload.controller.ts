import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {UploadService} from './upload.service';


import {plainToClass} from 'class-transformer';
import {UploadResponseDTO} from './dto/upload-response.dto';
import {FileFieldsInterceptor} from '@nestjs/platform-express';
import {validate} from 'class-validator';
import {UploadDto, UploadType} from './dto/upload.dto';
import type {Response} from "express";
import {Readable} from "stream";
import {Public} from "../auth/public.decorator";
import {FileNotFoundError} from "./errors/file-not-found.error";
import {S3ServiceException} from "@aws-sdk/client-s3";

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

  @Public()
  @Get('/:key')
  async getUploadByKey(@Param('key') key: string, @Res() response: Response) {
    try {
      const file = await this.uploadService.getImageByKeyAndId(key);

      response.set({
        'Content-Type': file.mimetype,
        'Content-Length': file.size,
        'Content-Disposition': `inline; filename="${file.key}"`,
      });

      Readable.fromWeb(file.stream).pipe(response);
    } catch (error) {
      if (error instanceof FileNotFoundError) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: error?.message || 'Not found',
          },
          HttpStatus.NOT_FOUND,
          {
            cause: error,
          },
        );
      }

      if (error instanceof S3ServiceException) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            cause: error,
          },
        );
      }

      throw error;
    }
  }
}
