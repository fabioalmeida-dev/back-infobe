import {Injectable} from '@nestjs/common';
import type {FileOutput, UploadRepository,} from '../gateways/upload.repository';
import {TableNames} from '../../enums/tables';
import {DatabaseException} from '../../exceptions/database.exception';
import {InjectConnection} from 'nest-knexjs';
import {Knex} from 'knex';

@Injectable()
export class UploadRepositoryMysqlAdapter implements UploadRepository {
  constructor(@InjectConnection() private readonly knex: Knex) {}


  async save(
    fileKey: string,
    type: string,
    fileName: string,
    fileSize: number,
  ): Promise<void> {
    try {
      await this.knex(TableNames.upload).insert({
        id: crypto.randomUUID(),
        key: fileKey,
        type,
        file_name: fileName,
        file_size: fileSize,
      });
    } catch (error) {
      console.log(error);
      throw new DatabaseException('Error saving file to database');
    }
  }

  async findFile(fileKey: string): Promise<FileOutput | null> {
    const result = await this.knex(TableNames.upload)
      .where({ key: fileKey })
      .first();


    if (!result) {
      return null;
    }

    return {
      fileKey: result?.key,
      type: result?.type,
      userId: result?.user_id,
      fileName: result?.file_name,
      fileSize: result?.file_size,
    };
  }
}
