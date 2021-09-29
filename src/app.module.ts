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
import { AchievementsModule } from './achievements/achievements.module';
import { MatchesModule } from './matches/matches.module';
import { AchievementsService } from './achievements/achievements.service';
import { AchievementsRepository } from './achievements/repositories/achievement.repository';
import { UserAchievementsRepository } from './achievements/repositories/user-achievement.repository';

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
      AchievementsRepository,
      UserAchievementsRepository,
    ]),
    AuthModule,
    UsersModule,
    AchievementsModule,
    FriendshipsModule,
    MatchesModule,
    ChannelsModule,
    DmsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UsersService,
    FriendshipsService,
    AchievementsService,
  ],
})
export class AppModule {}
