import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from 'src/product/entities/product.entity';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [TypeOrmModule.forFeature([Cart, CartItem, Product])],
})
export class CartModule {}
