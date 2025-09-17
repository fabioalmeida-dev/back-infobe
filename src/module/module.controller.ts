import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {ModuleService} from './module.service';
import {CreateModuleDto} from './dto/create-module.dto';
import {UpdateModuleDto} from './dto/update-module.dto';
import {AdminGuard} from "../auth/guard/admin.guard";

@Controller('module')
export class ModuleController {
  constructor(private readonly service: ModuleService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateModuleDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {


    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}