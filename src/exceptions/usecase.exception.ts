import { HttpException, HttpStatus } from '@nestjs/common';

export class DefaultException extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'DefaultException';
    this.code = code || 'BAD_REQUEST';
  }
}

export class ApplicationException extends Error {
  code: string;
  constructor(
    message: string,
    public statusCode: number,
    code: string,
  ) {
    super(message);
    this.name = 'ApplicationException';
    this.statusCode = statusCode || 400;
    this.code = code || 'BAD_REQUEST';
  }
}

export class UseCaseException extends HttpException {
  constructor(
    public readonly message: string,
    private readonly httpStatus: number = HttpStatus.BAD_REQUEST,
    public readonly code: string = 'USE_CASE_ERROR',
    public readonly retryAt: Date | null = null,
  ) {
    super(
      {
        message,
        code,
        ...(retryAt ? { retryAt } : {}),
      },
      httpStatus,
    );
  }

  get statusCode() {
    return this.httpStatus;
  }
}
