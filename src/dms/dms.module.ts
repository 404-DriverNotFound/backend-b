import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { UsersService } from 'src/users/users.service';
import { DmsController } from './dms.controller';
import { DmsRepository } from './dms.repository';
import { DmsService } from './dms.service';

@Module({
  imports: [TypeOrmModule.forFeature([DmsRepository, UsersRepository])],
  controllers: [DmsController],
  providers: [DmsService, UsersService],
})
export class DmsModule {}
