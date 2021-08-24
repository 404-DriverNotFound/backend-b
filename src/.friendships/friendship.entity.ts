import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
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

  @ManyToOne(() => User, { eager: true })
  requester: User;

  //@PrimaryColumn()
  //addresseeName: string;

  @ManyToOne(() => User, { eager: true })
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
