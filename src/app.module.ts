import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {configuration} from "./config/configuration";
import {databaseConfig} from "./config/database.config";
import {KnexModule} from "nest-knexjs";
import {JwtAuthGuard} from "./auth/JwtAuthGuard";
import {AuthModule} from "./auth/auth.module";
import {CourseModule} from './course/course.module';
import {ModuleModule} from './module/module.module';
import {LessonModule} from './lesson/lesson.module';
import {CertificateModule} from './certificate/certificate.module';
import {UploadModule} from "./upload/upload.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, databaseConfig],
    }),
    KnexModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          config: {
            client: 'mysql2',
            connection: {
              host: configService.get<string>('database.host'),
              port: configService.get<number>('database.port') || 3306,
              user: configService.get<string>('database.user'),
              password: configService.get<string>('database.password'),
              database: configService.get<string>('database.name'),
              timezone: '-03:00',
              ssl: configService.get<boolean>('database.ssl')
                ? { rejectUnauthorized: false }
                : undefined,
            },
            pool: {
              min: 5,
              max: 25,
            },
            migrations: {
              tableName: 'migrations',
              directory: './database/migrations',
            },
            compileSqlOnError: false,
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    CourseModule,
    ModuleModule,
    LessonModule,
    CertificateModule,
    UploadModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtAuthGuard],
})
export class AppModule {}
