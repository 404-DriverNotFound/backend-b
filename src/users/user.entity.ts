import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
//import { UserStatus } from './user-status.enum';

@Entity()
export class User {
  // NOTE 내부적인 unique 값을 가입시 name으로 설정하는데 이런 값이 필요할까?
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ftId: number;

  @Column({ unique: true })
  name: string;

  @Column()
  avatar: string;
}
