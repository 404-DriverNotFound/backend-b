import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { RedisIoAdapter } from './adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.enableCors({
    origin: configService.get<string>('ORIGIN'),
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // NOTE swagger
  const config = new DocumentBuilder()
    .setTitle('ft_transcendence')
    .setDescription('ft_transcendence API description')
    .setVersion('1.0')
    .addCookieAuth('connect.sid')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'ft_transcendence API Docs',
  };
  SwaggerModule.setup('api', app, document, customOptions);

  // NOTE session
  const RedisStore = connectRedis(session);
  const client = redis.createClient({
    url: configService.get<string>('REDIS_URL'),
  });
  client.on('connect', () => console.log('Connect to redis!'));
  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 60 },
      store: new RedisStore({ client }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // NOTE redis PUB/SUB
  app.useWebSocketAdapter(new RedisIoAdapter(app));

  await app.listen(5000);
}
bootstrap();
