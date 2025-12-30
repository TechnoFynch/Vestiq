import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({
    type: 'int',
    default: 0,
  })
  quantity!: number;

  @Column({
    type: 'int',
    default: 0,
  })
  reserved!: number;

  @UpdateDateColumn()
  updated_at!: number;
}
