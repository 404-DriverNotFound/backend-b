import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { RedirectException } from '../redirect.exception';

@Catch(RedirectException)
export class AuthenticatedRedirectExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: RedirectException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const status: number = exception.getStatus();
    if (status === 302) {
      const { location } = exception.getResponse() as {
        location: string;
      };
      response.redirect(this.configService.get<string>('ORIGIN') + location);
    }
  }
}
