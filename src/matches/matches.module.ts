import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { MatchesController } from './matches.controller';
import { MatchesRepository } from './matches.repository';
import { MatchesService } from './matches.service';

@Module({
  imports: [TypeOrmModule.forFeature([MatchesRepository]), UsersModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
