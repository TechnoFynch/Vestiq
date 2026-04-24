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
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 256,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 256,
    unique: true,
  })
  slug!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  logo?: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @OneToMany(() => Product, (product) => product.brand)
  products!: Product[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
