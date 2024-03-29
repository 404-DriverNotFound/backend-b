import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configValidationSchema } from './config.schema';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FriendshipsModule } from './friendships/friendships.module';
import { ChannelsModule } from './channels/channels.module';
import { DmsModule } from './dms/dms.module';
import { EventsModule } from './events/events.module';
import { FriendshipsRepository } from './friendships/friendships.repository';
import { UsersRepository } from './users/repositories/users.repository';
import { UsersService } from './users/users.service';
import { FriendshipsService } from './friendships/friendships.service';
import { MatchesModule } from './matches/matches.module';
import { AchievementsRepository } from './users/repositories/achievement.repository';
import { UserAchievementsRepository } from './users/repositories/user-achievement.repository';
import { MatchesRepository } from './matches/matches.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([
      FriendshipsRepository,
      UsersRepository,
      MatchesRepository,
      AchievementsRepository,
      UserAchievementsRepository,
    ]),
    AuthModule,
    UsersModule,
    FriendshipsModule,
    MatchesModule,
    ChannelsModule,
    DmsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService, UsersService, FriendshipsService],
})
export class AppModule {}
