import { Auth } from 'src/auth/entities/auth.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from './cart_item.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Auth)
  @JoinColumn({ name: 'user_id' })
  user!: Auth;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  cart_items?: CartItem[];

  @UpdateDateColumn()
  updated_at!: Date;

  @CreateDateColumn()
  created_at!: Date;
}
