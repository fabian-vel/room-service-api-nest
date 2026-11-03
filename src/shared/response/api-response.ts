import { HttpStatus } from '@nestjs/common';

export class ApiResponse<T> {
  constructor(
    readonly timestamp: string,
    readonly status: number,
    readonly message: string,
    readonly data: T,
    readonly size: number,
  ) {}

  static ok<T>(message: string, data: T, size = 0): ApiResponse<T> {
    return new ApiResponse(
      new Date().toISOString(),
      HttpStatus.OK,
      message,
      data,
      size,
    );
  }
}
