import {Module} from '@nestjs/common';
import {ModuleController} from './module.controller';
import {ModuleService} from './module.service';
import {ModuleKnexAdapter} from './adapters/module-knex.adapter';
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [ModuleController],
  providers: [
    ModuleService,
    {
      provide: 'ModuleRepository',
      useClass: ModuleKnexAdapter,
    },
  ],
})
export class ModuleModule {}