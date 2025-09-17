import { Injectable } from '@nestjs/common';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { TableNames } from '../../enums/tables';
import { DatabaseException } from '../../exceptions/database.exception';
import type { ModuleRepository } from '../repositories/module.repository';
import type { ModuleEntity } from '../entities/module.entity';
import type { CreateModuleDto } from '../dto/create-module.dto';

@Injectable()
export class ModuleKnexAdapter implements ModuleRepository {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  findAll(): Promise<ModuleEntity[]> {
    try {
      return this.knex(TableNames.module).select('*');
    } catch (error) {
      throw new DatabaseException('Error retrieving modules');
    }
  }
  findById(id: string): Promise<ModuleEntity | null> {
    try {
      return this.knex(TableNames.module).where('id', id).first();
    } catch (error) {
      throw new DatabaseException('Error finding module by ID');
    }
  }
  async create(dto: CreateModuleDto): Promise<ModuleEntity | null> {
    try {
      const id = crypto.randomUUID();
      await this.knex(TableNames.module).insert({
        id,
        name: dto.name,
        course_id: dto.course_id,
      });
      return this.findById(id);
    } catch (error) {
      throw new DatabaseException('Error creating module');
    }
  }
  async update(id: string, data: any): Promise<ModuleEntity | null> {
    try {
      await this.knex(TableNames.module).where('id', id).update(data);
      return this.findById(id);
    } catch (error) {
      throw new DatabaseException('Error updating module');
    }
  }
  delete(id: string): Promise<boolean> {
    try {
      return this.knex(TableNames.module).where('id', id).del();
    } catch (error) {
      throw new DatabaseException('Error deleting module');
    }
  }
}