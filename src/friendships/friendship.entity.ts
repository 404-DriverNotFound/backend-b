import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FriendshipStatus } from './friendship-status.enum';

@Entity('user_friendship_user')
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //@PrimaryColumn()
  //requesterName: string;

  @ManyToOne(() => User)
  requester: User;

  //@PrimaryColumn()
  //addresseeName: string;

  @ManyToOne(() => User)
  addressee: User;

  @Column({
    type: 'enum',
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;

  @UpdateDateColumn()
  updatedAt: Date;
}
