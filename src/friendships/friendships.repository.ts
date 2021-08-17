import { User } from 'src/users/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Friendship } from './friendship.entity';

@EntityRepository(Friendship)
export class FriendshipsRepository extends Repository<Friendship> {
  async createFriendship(
    requester: User,
    addressee: User,
  ): Promise<Friendship> {
    // NOTE 둘 중 한 명이라도 차단, 수락, 대기 상태일 때 추가 x
    // NOTE 상대가 거절했을 때는 추가 가능

    //const friendships: Friendship[] = this.getFriendships(requester)

    const friendship: Friendship = this.create({
      requester,
      addressee,
      //  status: FriendshipStatus.PENDING,
    });

    //const duplicated: Friendship = await this.findOne(friendship);
    //if (duplicated) {
    //  throw new ConflictException(`${addressee.name} has not yet accepted!`);
    //}
    //try {
    await this.save(friendship);
    //} catch (error) {
    //  throw new InternalServerErrorException(
    //    'Someting wrong while saving friendship data in createFriendship',
    //  );
    //}
    return friendship;
  }
}
