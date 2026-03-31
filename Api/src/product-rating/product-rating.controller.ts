import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
  Request,
} from '@nestjs/common';
import { ProductRatingService } from './product-rating.service';
import { CreateProductRatingDto } from './dto/create-product-rating.dto';
import { UpdateProductRatingDto } from './dto/update-product-rating.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/auth.guard';

@Controller('product-rating')
@ApiBearerAuth('access-token')
export class ProductRatingController {
  constructor(private readonly productRatingService: ProductRatingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createProductRatingDto: CreateProductRatingDto,
    @Request() req,
  ) {
    return this.productRatingService.create(
      createProductRatingDto,
      req.user.id,
    );
  }

  @Get('product/:productId')
  @UseGuards(JwtAuthGuard)
  findByProductId(@Param('productId') productId: string) {
    return this.productRatingService.findByProductId(productId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUserId(@Param('userId') userId: string) {
    return this.productRatingService.findByUserId(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateProductRatingDto: UpdateProductRatingDto,
    @Request() req,
  ) {
    return this.productRatingService.update(
      id,
      updateProductRatingDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.productRatingService.remove(id, req.user.id);
  }
}
