import { User } from 'src/users/user.entity';
import { Column, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';
import { FriendshipStatus } from './friendship-status.enum';

@Entity('user_friendship_user')
export class Friendship {
  @ManyToOne(() => User, { primary: true })
  requester: User;

  @ManyToOne(() => User, { primary: true })
  addressee: User;

  @Column({
    type: 'enum',
    enum: FriendshipStatus,
  })
  status: FriendshipStatus;

  @UpdateDateColumn()
  updatedAt: Date;
}
