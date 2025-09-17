import { Inject, Injectable } from '@nestjs/common';
import type { ModuleRepository } from './repositories/module.repository';
import type { CreateModuleDto } from './dto/create-module.dto';
import type { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModuleService {
  constructor(
    @Inject('ModuleRepository')
    private readonly repo: ModuleRepository,
  ) {}

  create(dto: CreateModuleDto) {
    return this.repo.create(dto);
  }
  findAll() {
    return this.repo.findAll();
  }
  findOne(id: string) {
    return this.repo.findById(id);
  }
  update(id: string, dto: UpdateModuleDto) {
    return this.repo.update(id, dto);
  }
  remove(id: string) {
    return this.repo.delete(id);
  }
}