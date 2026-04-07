import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from 'src/guards/admin.guard';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { UpdateCartItemDto } from 'src/cart/dto/update-cart_item.dto';

@Controller('cart')
@ApiBearerAuth('access-token')
export class CartController {
  constructor(private readonly cartService: CartService) {}

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

  @Patch('items')
  @UseGuards(JwtAuthGuard)
  update(@Req() req: any, @Body() updateCartItemDto: UpdateCartItemDto) {
    const userId = req.user.userId;
    return this.cartService.updateItem(userId, updateCartItemDto);
  }

  @Post('items')
  @UseGuards(JwtAuthGuard)
  addItemToCart(@Req() req: any, @Body() itemDto: CartItemDto) {
    const userId = req.user.userId;
    return this.cartService.addItemToCart(userId, itemDto);
  }

  @Delete('cart/items/:productId')
  @UseGuards(JwtAuthGuard)
  removeItemFromCart(@Req() req: any, @Param('productId') productId: string) {
    const userId = req.user.userId as string;
    return this.cartService.removeItemFromCart(userId, productId);
  }

  @Delete('user/:userId')
  @UseGuards(JwtAuthGuard)
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }

  // TODO: Run a background job to send notifications to users who have items in their cart for more than 7 days.
  // TODO: Run a background job to clear off carts that have not been updated in 14 days.
}
