import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto, CartItemDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from 'src/guards/admin.guard';
import { JwtAuthGuard } from 'src/guards/auth.guard';

@Controller('cart')
@ApiBearerAuth('access-token')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.cartService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUserId(@Param('userId') userId: string) {
    return this.cartService.findByUserId(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(id, updateCartDto);
  }

  @Post('user/:userId/items')
  @UseGuards(JwtAuthGuard)
  addItemToCart(@Param('userId') userId: string, @Body() itemDto: CartItemDto) {
    return this.cartService.addItemToCart(userId, itemDto);
  }

  @Delete('user/:userId/items/:productId')
  @UseGuards(JwtAuthGuard)
  removeItemFromCart(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItemFromCart(userId, productId);
  }

  // TODO: Run a background job to send notifications to users who have items in their cart for more than 7 days.
  // TODO: Run a background job to clear off carts that have not been updated in 14 days.
}
