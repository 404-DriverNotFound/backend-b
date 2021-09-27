import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MatchStatus } from './constants/match-status.enum';
import { MatchType } from './constants/match-type.enum';
import { MatchGameMode } from './constants/match-gameMode.enum';

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

  @Column({ type: 'enum', enum: MatchType, default: MatchType.LADDER })
  type: MatchType;

  @Column({ type: 'enum', enum: MatchGameMode, default: MatchGameMode.CLASSIC })
  mode: MatchGameMode;
}
