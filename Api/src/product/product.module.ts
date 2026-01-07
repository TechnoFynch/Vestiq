import { Module } from '@nestjs/common';
import { ProductAdminService } from './product-admin.service';
import { ProductAdminController } from './product-admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product_image.entity';
import { ProductImageService } from './product-image.service';
import { InventoryModule } from 'src/inventory/inventory.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [ProductAdminController],
  providers: [ProductAdminService, ProductImageService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    InventoryModule,
    ConfigModule,
  ],
})
export class ProductModule {}
