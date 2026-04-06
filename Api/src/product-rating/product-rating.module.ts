import { Module } from '@nestjs/common';
import { ProductRatingService } from './product-rating.service';
import { ProductRatingController } from './product-rating.controller';
import { ProductModule } from 'src/product/product.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRating } from './entities/product-rating.entity';

@Module({
  controllers: [ProductRatingController],
  providers: [ProductRatingService],
  imports: [
    ProductModule,
    AuthModule,
    TypeOrmModule.forFeature([ProductRating]),
  ],
})
export class ProductRatingModule {}
