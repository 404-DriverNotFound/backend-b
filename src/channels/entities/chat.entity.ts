import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Channel } from './channel.entity';

@Entity('channel_chat_user')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.chats)
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.chats, { onDelete: 'CASCADE' })
  channel: Channel;
}
