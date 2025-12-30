import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 256,
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
    length: 1024,
    nullable: true,
  })
  parent_id?: string;

  @OneToMany(() => Product, (products) => products.category)
  products?: Product[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;
}
