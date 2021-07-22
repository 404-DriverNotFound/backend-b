import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // NOTE 직접 지정하지 않는 속성에 대해 unique 속성을 부여하는게 맞을지 논의가 필요함.
  //@Column({ unique: true })
  @Column()
  ftId: number;

  @Column({ unique: true })
  name: string;

  @Column()
  avatar: string;

  @Column()
  email: string;
}
