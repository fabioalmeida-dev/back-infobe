import type { ModuleEntity } from "../entities/module.entity";

export interface ModuleRepository {
  findAll(): Promise<ModuleEntity[]>;
  findById(id: string): Promise<ModuleEntity | null>;
  create(data: any): Promise<ModuleEntity | null>;
  update(id: string, data: any): Promise<ModuleEntity | null>;
  delete(id: string): Promise<boolean>;
}