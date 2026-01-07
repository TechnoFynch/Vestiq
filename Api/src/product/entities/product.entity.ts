import { Category } from 'src/category/entities/category.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductImage } from './product_image.entity';
import { CartItem } from 'src/cart/entities/cart_item.entity';
import { OrderItem } from 'src/order/entities/order-item.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: '256',
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 512,
    unique: true,
  })
  slug!: string;

  @Column({
    type: 'varchar',
  })
  description!: string;

  @Column({
    type: 'decimal',
    scale: 2,
    precision: 10,
  })
  price!: number;

  @Column({
    type: 'decimal',
    scale: 2,
    precision: 10,
    nullable: true,
  })
  sale_price?: number;

  @Column({
    type: 'varchar',
    length: 256,
    unique: true,
  })
  sku!: string;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @OneToOne(() => Inventory, (inventory) => inventory.product)
  inventory!: Inventory;

  @OneToMany(() => ProductImage, (productImage) => productImage.product)
  images?: ProductImage[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cart_items?: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems?: OrderItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;
}
