import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class FtOauthUnauthorizedExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const status: number = exception.getStatus();
    if (status === 401) {
      response
        .setHeader('Access-Control-Allow-Credentials', 'true')
        .setHeader(
          'Access-Control-Allow-Origin',
          this.configService.get<string>('ORIGIN'), // NOTE 안되면 *
          //'*',
        )
        .cookie('ftId', exception.message)
        .redirect(this.configService.get<string>('ORIGIN') + '/register');
    }
  }
}
