import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MatchStatus } from './match-status.enum';

@Entity('user_match_user')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user1: User;

  @ManyToOne(() => User)
  user2: User;

  @ManyToOne(() => User)
  winner: User;

  @ManyToOne(() => User)
  loser: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.IN_PROGRESS })
  status: MatchStatus;
}
