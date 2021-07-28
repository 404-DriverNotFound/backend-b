import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
//import { UserStatus } from './user-status.enum';

@Entity()
export class User {
  // NOTE 내부적인 unique 값을 가입시 name으로 설정하는데 이런 값이 필요할까?
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // NOTE 직접 지정하지 않는 속성에 대해 unique 속성을 부여하는게 맞을지 논의가 필요함.
  //@Column({ unique: true })
  @Column()
  ftId: number;

  @Column({
    unique: true,
    nullable: true,
  })
  name: string;

  @Column()
  avatar: string;

  //@Column()
  //status: UserStatus;
}
