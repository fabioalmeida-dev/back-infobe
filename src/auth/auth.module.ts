import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {PassportModule} from '@nestjs/passport';
import {JwtModule, JwtModuleOptions} from '@nestjs/jwt';
import {JwtStrategy} from './jwt.strategy';
import {AuthController} from './auth.controller';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {AUTH_REPOSITORY} from './auth.interface';
import {AuthRepositoryMysqlAdapter} from './adapters/auth-repository-mysql.adapter';
import {APP_GUARD} from '@nestjs/core';
import {AuthenticateGuard} from './guard/authenticate.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => ({
        secret: configService.get<string>('JWT_TOKEN'),
        signOptions: { expiresIn: '30d' },
      }),
    }),
    ConfigModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepositoryMysqlAdapter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticateGuard,
    },
  ],
  exports: [AuthService, AUTH_REPOSITORY],
  controllers: [AuthController],
})
export class AuthModule {}
