import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const RedisStore = connectRedis(session);
  const client = redis.createClient({ url: process.env.REDIS_URL });
  client.on('connect', () => console.log('connect to redis'));

  const config = new DocumentBuilder()
    .setTitle('ft_transcendence')
    .setDescription('ft_transcendence API description')
    .setVersion('1.0')
    .addOAuth2()
    .addCookieAuth('optional-session-id')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      secret: 'my-secret', // FIXME get env vars
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 }, // NOTE 3600초
      store: new RedisStore({ client }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(5000);
}
bootstrap();
