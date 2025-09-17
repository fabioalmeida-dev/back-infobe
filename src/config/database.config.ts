import {registerAs} from '@nestjs/config';
import {IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString,} from 'class-validator';

export class DatabaseConfig {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsNumber()
  @IsOptional()
  port?: number;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  ssl?: boolean;
}

const parseDatabaseConfig = (): DatabaseConfig => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 3306,

  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  name: process.env.DATABASE_NAME || 'my_database',
  ssl: process.env.DATABASE_SSL === 'true',
});

export const databaseConfig = registerAs('database', () =>
  parseDatabaseConfig(),
);
