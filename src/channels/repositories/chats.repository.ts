import { EntityRepository, Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';

@EntityRepository(Chat)
export class ChatsRepository extends Repository<Chat> {}
