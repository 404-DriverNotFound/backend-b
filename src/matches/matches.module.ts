import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { UsersService } from 'src/users/users.service';
import { MatchesController } from './matches.controller';
import { MatchesRepository } from './matches.repository';
import { MatchesService } from './matches.service';

@Module({
  imports: [TypeOrmModule.forFeature([MatchesRepository, UsersRepository])],
  controllers: [MatchesController],
  providers: [MatchesService, UsersService],
})
export class MatchesModule {}
