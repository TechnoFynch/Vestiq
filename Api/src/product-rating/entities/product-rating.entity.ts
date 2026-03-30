import { Auth } from 'src/auth/entities/auth.entity';
import { Product } from 'src/product/entities/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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
  rating!: number;

  @ManyToOne(() => Auth, (user) => user.product_ratings)
  user!: Auth;

  @ManyToOne(() => Product, (product) => product.product_rating)
  product!: Product;
}
