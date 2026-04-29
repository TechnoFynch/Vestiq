import { Auth } from 'src/auth/entities/auth.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Auth, (auth) => auth.wishlist)
  @JoinColumn({ name: 'user_id' })
  user!: Auth;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @CreateDateColumn()
  createdAt!: Date;
}
