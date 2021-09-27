import { Exclude, Transform } from 'class-transformer';
import { UserAchievement } from 'src/achievements/entities/user-achievement.entity';
import { Chat } from 'src/channels/entities/chat.entity';
import { Membership } from 'src/channels/entities/membership.entity';
import { Dm } from 'src/dms/dm.entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserStatus } from '../constants/user-status.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({ unique: true })
  ftId: number;

  @Column({ unique: true })
  @Index()
  name: string;

  @Column({ default: 'files/avatar/default.png' })
  avatar: string;

  @Column()
  enable2FA: boolean;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
  status: UserStatus;

  @Transform(({ value }) => (value ? 'HIDDEN' : null))
  @Column({ nullable: true })
  authenticatorSecret: string;

  @Column({ default: false })
  isSecondFactorAuthenticated: boolean;

  @Column({ default: 0 })
  score: number;
  @OneToMany(() => Membership, (membership) => membership.user, {
    cascade: true,
  })
  memberships: Membership[];

  @OneToMany(() => Chat, (chat) => chat.user, { cascade: true })
  chats: Chat[];

  @OneToMany(() => Dm, (dm) => dm.sender, { cascade: true })
  senderDms: Dm[];

  @OneToMany(() => Dm, (dm) => dm.receiver, { cascade: true })
  receiverDms: Dm[];

  @OneToMany(
    () => UserAchievement,
    (userAchievement) => userAchievement.achievement,
  )
  userAchievements: UserAchievement[];
}
