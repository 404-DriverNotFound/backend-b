import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn({type: 'int', name: 'id'})
    id: number;

    @Column({default: null})
    email: string;

    @Column({default: null})
    login: string;

    @Column({default: null})
    img_url: string;
}
