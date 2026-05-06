import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import * as Joi from 'joi';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserProfileModule } from './user_profile/user_profile.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { InventoryModule } from './inventory/inventory.module';
import { CartModule } from './cart/cart.module';
import { AddressModule } from './address/address.module';
import { OrderModule } from './order/order.module';
import { ProductRatingModule } from './product-rating/product-rating.module';
import { BrandModule } from './brand/brand.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : '.env.dev',
      load: [configuration],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),

        PORT: Joi.number().default(3000),

        DB_URL: Joi.string().required(),

        DB_SYNC: Joi.boolean().default(false),

        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRY: Joi.string().required(),
        CLOUDINARY_APIKEY: Joi.string().required(),
        CLOUDINARY_SECRET: Joi.string().required(),
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        CORS_ORIGIN: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          url: config.get<string>('db_url'),
          ssl:
            process.env.NODE_ENV === 'production'
              ? { rejectUnauthorized: false }
              : false,
          entities: [join(__dirname, '**/*.entity{.ts,.js}')],
          synchronize: config.get<boolean>('synchronize'),
        };
      },
    }),

    AuthModule,

    UserProfileModule,

    CategoryModule,

    ProductModule,

    InventoryModule,

    CartModule,

    AddressModule,

    OrderModule,

    ProductRatingModule,

    BrandModule,

    WishlistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
