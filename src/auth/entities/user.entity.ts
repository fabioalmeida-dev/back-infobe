export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}



export type User = {
  id: string;
  name: string;
  email: string;
  tax_identifier: string;


  role: UserRole;

  password: string;
  salt: string;
  salt_rounds: number;

  created_at: Date;
  updated_at: Date;
};
