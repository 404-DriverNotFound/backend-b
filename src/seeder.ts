import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { configValidationSchema } from './config.schema';
import { AchievementsSeeder } from './seeders/achievements.seeder';
import { AchievementsRepository } from './users/repositories/achievement.repository';
import { UsersRepository } from './users/repositories/users.repository';
import { MembershipsRepository } from './channels/repositories/memberships.repository';
import { ChannelsRepository } from './channels/repositories/channels.repository';
import { ChatsRepository } from './channels/repositories/chats.repository';
import { DmsRepository } from './dms/dms.repository';
import { UserAchievementsRepository } from './users/repositories/user-achievement.repository';

seeder({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
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
      AchievementsRepository,
      UserAchievementsRepository,
      UsersRepository,
      MembershipsRepository,
      ChannelsRepository,
      ChatsRepository,
      DmsRepository,
    ]),
  ],
}).run([AchievementsSeeder]);
