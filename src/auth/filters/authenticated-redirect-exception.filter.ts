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
      response
        .setHeader('Access-Control-Allow-Credentials', 'true')
        .setHeader(
          'Access-Control-Allow-Origin',
          this.configService.get<string>('ORIGIN'), // NOTE 안되면 *
          //'*',
        )
        .redirect(this.configService.get<string>('ORIGIN') + location);
    }
  }
}
