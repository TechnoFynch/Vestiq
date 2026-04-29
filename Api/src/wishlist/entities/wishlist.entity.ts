import { Auth } from 'src/auth/entities/auth.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Auth, (auth) => auth.wishlist)
  user!: Auth;

  @ManyToOne(() => Product)
  product?: Product;

  @CreateDateColumn()
  createdAt!: Date;
}
