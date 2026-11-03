import { HttpStatus } from '@nestjs/common';

export abstract class AppException extends Error {
  protected constructor(
    readonly userMessage: string,
    readonly httpStatus: HttpStatus,
    options?: ErrorOptions,
  ) {
    super(userMessage, options);
    this.name = new.target.name;
  }
}
