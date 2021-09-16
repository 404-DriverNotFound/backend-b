import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_dm_user')
export class Dm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.senderDms)
  sender: User;

  @ManyToOne(() => User, (user) => user.receiverDms)
  receiver: User;
}
