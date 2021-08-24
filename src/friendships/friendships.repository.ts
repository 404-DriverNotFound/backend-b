//import {
//  ConflictException,
//  InternalServerErrorException,
//  NotFoundException,
//} from '@nestjs/common';
//import { User } from 'src/users/user.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { FriendshipStatus } from './friendship-status.enum';
//import { GetFriendshipsFilterDto } from './dto/get-friendships-filter.dto';
//import { FriendshipStatus } from './friendship-status.enum';
import { Friendship } from './friendship.entity';

@EntityRepository(Friendship)
export class FriendshipsRepository extends Repository<Friendship> {
  async createFriendship(
    requester: User,
    addressee: User,
    status: FriendshipStatus,
  ): Promise<Friendship> {
    // NOTE DECLINE을 제외한 friendship이 이미 존재한다면 추가 x
    // TODO 상대가 거절했을 때는 추가 가능 2회이상 거절하면 추가안되게?

    //if (status === FriendshipStatus.)

    //const friendship: Friendship = this.create({
    //  requester,
    //  addressee,
    //  status,
    //  specifier: requester,
    //});

    //try {
    //  await this.save(friendship);
    //} catch (error) {
    //  throw new InternalServerErrorException(
    //    'Someting wrong while saving a friendship data in createFriendship.',
    //  );
    //}

    //return friendship;
    return undefined;
  }

  //  async deleteFriendshipById(user: User, id: string): Promise<void> {
  //    const qb = this.createQueryBuilder('friendship');
  //    const result = await qb
  //      .delete()
  //      .where('id = :id AND requesterId = :userId', {
  //        id,
  //        userId: user.id,
  //      })
  //      .orWhere('id = :id AND addresseeId = :userId', {
  //        id,
  //        userId: user.id,
  //      })
  //      .execute();
  //    if (result.affected === 0) {
  //      throw new NotFoundException(`Friendship with id: ${id} not found.`);
  //    }
  //  }
}
