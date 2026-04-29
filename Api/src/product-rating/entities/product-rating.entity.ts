import { Auth } from 'src/auth/entities/auth.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProductRating {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: '1024',
    nullable: true,
  })
  comment!: string;

  @Column({
    type: 'decimal',
    precision: 2,
    scale: 1,
  })
  @Check('"rating" >= 1 AND "rating" <= 5')
  rating!: number;

  @ManyToOne(() => Auth, (user) => user.product_ratings)
  @JoinColumn({ name: 'user_id' })
  user!: Auth;

  @ManyToOne(() => Product, (product) => product.product_rating)
  product!: Product;

  @CreateDateColumn()
  created_at!: Date;
}
