import {BadRequestException, Injectable} from '@nestjs/common';
import {v4 as uuid} from 'uuid';
import {AuthRepository, type UserCreateInput, type UserCreateOutput,} from '../auth.interface';
import {InjectConnection} from 'nest-knexjs';
import {Knex} from 'knex';
import * as bcrypt from 'bcrypt';
import type {User} from '../entities/user.entity';
import {TableNames} from '../../enums/tables';
import {DatabaseException} from '../../exceptions/database.exception';

@Injectable()
export class AuthRepositoryMysqlAdapter implements AuthRepository {
  constructor(@InjectConnection() private readonly knex: Knex) {
  }


  async verifyUserEmailExists(
    email: string,
  ): Promise<{ email: boolean }> {
    const result = await this.knex(TableNames.users)
      .select(['email'])
      .where('email', email)
      .first();

    return {
      email: !!result,
    };
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.knex<User>(TableNames.users)
        .where('id', id)
        .first();
      return user || null;
    } catch (error) {
      throw new DatabaseException('Error finding user by ID');
    }
  }

  findByEmail(email: string): Promise<User | null> {
    try {
      return this.knex(TableNames.users).where('email', email).first();
    } catch (error) {
      throw new DatabaseException('Error finding user by email');
    }
  }

  async findUser(email: string): Promise<User> {
    return this.knex(TableNames.users)
      .select(
        'id',
        'name',
        'email',
        'tax_identifier',
        'password',
        'salt',
        'salt_rounds',
        'created_at',
        'updated_at',
        'role'
      )
      .where('email', email)
      .first();
  }

  async createUser(userInput: UserCreateInput): Promise<UserCreateOutput> {
    const checkEmail = await this.verifyUserEmailExists(userInput.email);


    if (checkEmail.email) {
      throw new BadRequestException({
        message: 'Email already exists',
      });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPass = await bcrypt.hash(userInput.password, salt);

    const generatedUUID = uuid();

    await this.knex(TableNames.users).insert({
      id: generatedUUID,
      name: userInput.name,
      email: userInput.email,
      tax_identifier: userInput.tax_identifier || null,
      password: hashedPass,
      salt,
      salt_rounds: saltRounds,
      role: 'USER',
    });

    return {
      id: generatedUUID,
      name: userInput.name,
      email: userInput.email,
    };
  }



  async adminExistsById(id: number): Promise<boolean> {
    const result = await this.knex(TableNames.users)
      .select('id')
      .where({ id, role: 'ADMIN' });

    return result.length > 0;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await this.knex(TableNames.users)
        .where('id', userId)
        .update({
          password: hashedPassword,
          salt,
          salt_rounds: saltRounds,
          updated_at: this.knex.fn.now(),
        });
    } catch (error) {
      throw new DatabaseException('Error updating password');
    }
  }
}
