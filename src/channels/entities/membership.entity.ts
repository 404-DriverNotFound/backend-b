import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, Index, ManyToOne } from 'typeorm';
import { MembershipRole } from '../membership-role.enum';
import { Channel } from './channel.entity';

@Entity('channel_membership_user')
export class Membership {
  @ManyToOne(() => User, (user) => user.memberships, {
    primary: true,
  })
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.memberships, {
    primary: true,
    onDelete: 'CASCADE',
  })
  channel: Channel;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: MembershipRole,
    default: MembershipRole.MEMBER,
  })
  role: MembershipRole;

  @Column({
    nullable: true,
    default: null,
  })
  unmutedAt: Date;
}
