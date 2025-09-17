export class UserNotChangePasswordError extends Error {
  constructor() {
    super('User not change password, please send correct oldPassword');
    this.name = 'UserNotChangePasswordError';
  }
}
