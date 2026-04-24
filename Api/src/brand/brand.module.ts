import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from 'src/brand/entities/brand.entity';

@Module({
  controllers: [BrandController],
  providers: [BrandService],
  imports: [TypeOrmModule.forFeature([Brand])],
})
export class BrandModule {}
