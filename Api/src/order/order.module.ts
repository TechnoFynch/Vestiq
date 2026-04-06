import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ProductModule } from 'src/product/product.module';
import { AddressModule } from 'src/address/address.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { CartModule } from 'src/cart/cart.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { OrderItem } from 'src/order/entities/order-item.entity';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [
    AuthModule,
    ProductModule,
    AddressModule,
    InventoryModule,
    CartModule,
    TypeOrmModule.forFeature([Order, OrderItem]),
  ],
})
export class OrderModule {}
