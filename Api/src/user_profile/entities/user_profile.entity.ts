import { Auth } from 'src/auth/entities/auth.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Auth, (user_id) => user_id.profile)
  @JoinColumn({ name: 'user_id' })
  user!: Auth;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 64,
  })
  firstName!: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 64,
  })
  lastName!: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 10,
  })
  phone!: string;

  @UpdateDateColumn()
  updated_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;
}
