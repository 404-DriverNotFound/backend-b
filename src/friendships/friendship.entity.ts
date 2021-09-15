import { User } from 'src/users/user.entity';
import { Column, Entity, Index, ManyToOne, UpdateDateColumn } from 'typeorm';
import { FriendshipStatus } from './friendship-status.enum';

@Entity('user_friendship_user')
export class Friendship {
  @ManyToOne(() => User, { eager: true, primary: true })
  requester: User;

  @ManyToOne(() => User, { eager: true, primary: true })
  addressee: User;

  @Column({
    type: 'enum',
    enum: FriendshipStatus,
    default: FriendshipStatus.REQUESTED,
  })
  status: FriendshipStatus;

  @UpdateDateColumn()
  @Index()
  updatedAt: Date;
}
