import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { WishlistDto } from 'src/wishlist/dto/wishlist.dto';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlistByUserId(@Req() req: any) {
    const userId = req.user.sub;
    return this.wishlistService.getWishlistByUserId(userId);
  }

  @Patch('addItem')
  addItemToWishlist(@Body() wishlistDto: WishlistDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.wishlistService.addItemToWishlist(wishlistDto, userId);
  }

  @Patch('removeItem')
  removeItemFromWishlist(@Body() wishlistDto: WishlistDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.wishlistService.removeItemFromWishlist(wishlistDto, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistService.update(+id, updateWishlistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wishlistService.remove(+id);
  }
}
