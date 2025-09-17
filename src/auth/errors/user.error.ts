export class UserError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'UserError';
  }
}
