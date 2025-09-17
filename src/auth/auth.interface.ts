import type {User} from './entities/user.entity';


export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';

export type ClientIdCredentials = {
  id: string;
  clientId: string;
  clientSecret: string;
};

export type JwtPayload = {
  sub: string;
};

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  tax_identifier: string;
}

export interface UserCreateOutput {
  id: string;
  name: string;
  email: string;
}

export interface AuthRepository {
  findUser(email: string): Promise<any>;
  adminExistsById(id: number): Promise<boolean>;
  createUser(userInput: UserCreateInput): Promise<UserCreateOutput>;
  verifyUserEmailExists(
    email: string,
  ): Promise<{ email: boolean }>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
}
