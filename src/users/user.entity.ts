import { Exclude, Transform } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserStatus } from './user-status.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({ unique: true })
  ftId: number;

  @Column({ unique: true })
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
}
