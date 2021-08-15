import { HttpException, HttpStatus } from '@nestjs/common';

export class RedirectException extends HttpException {
  constructor(response: string | Record<string, any>) {
    super(response, HttpStatus.FOUND);
  }
}
