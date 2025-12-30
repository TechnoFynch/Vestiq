import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import UserTypeEnum from '../enums/user-type.enum';
import { UserProfile } from 'src/user_profile/entities/user_profile.entity';
import { Address } from 'src/address/entities/address.entity';
import { Order } from 'src/order/entities/order.entity';

@Entity('users')
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 125,
  })
  email!: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: '1024',
  })
  password_hash!: string;

  @Column({
    type: 'enum',
    enum: UserTypeEnum,
    default: UserTypeEnum.USER,
  })
  role!: UserTypeEnum;

  @Column({
    type: 'boolean',
    default: true,
  })
  is_active!: boolean;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  @JoinColumn()
  profile!: UserProfile;

  @OneToMany(() => Address, (address) => address.user)
  addresses?: Address;

  @OneToMany(() => Order, (order) => order.user)
  orders?: Order[];

  @UpdateDateColumn()
  updated_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;
}
