import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FriendshipStatus } from './friendship-status.enum';

@Entity('user_friendship_user')
export class Friendship {
  @PrimaryColumn()
  requesterId: string;

  @PrimaryColumn()
  addresseeId: string;

  @ManyToOne(() => User)
  requester: User;

  @ManyToOne(() => User)
  addressee: User;

  @Column({
    type: 'enum',
    enum: FriendshipStatus,
    default: FriendshipStatus.REQUESTED,
  })
  status: FriendshipStatus;

  @UpdateDateColumn()
  updatedAt: Date;
}
