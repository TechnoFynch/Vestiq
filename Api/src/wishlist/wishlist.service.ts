import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from 'src/wishlist/entities/wishlist.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { ProductService } from 'src/product/product.service';
import { WishlistDto } from 'src/wishlist/dto/wishlist.dto';
import { Auth } from 'src/auth/entities/auth.entity';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepo: Repository<Wishlist>,
    private readonly authService: AuthService,
    private readonly productService: ProductService,
  ) {}

  async getWishlistByUserId(userId: string) {
    try {
      const user = await this.authService.findById(userId);

      const wishlist = await this.wishlistRepo.find({
        where: { user: user },
        relations: ['product'],
      });

      return wishlist;
    } catch (error) {
      this.logger.log(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async addItemToWishlist(wishlistDto: WishlistDto, userId: string) {
    try {
      const user = await this.authService.findById(userId);

      const product = await this.productService.findById(wishlistDto.productId);

      const existingItem = await this.wishlistRepo.findOne({
        where: { user: user, product: product },
      });

      if (existingItem) {
        throw new BadRequestException('Item already in wishlist');
      }

      const wishlistItem = this.wishlistRepo.create();

      wishlistItem.user = user;
      wishlistItem.product = product;

      return wishlistItem;
    } catch (error) {
      this.logger.log(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async removeItemFromWishlist(wishlistDto: WishlistDto, userId: string) {
    try {
      const wishlist = await this.wishlistRepo.findOne({
        where: {
          user: { id: userId } as Auth,
          product: { id: wishlistDto.productId } as Product,
        },
      });

      if (!wishlist) {
        throw new BadRequestException('Wishlist item not found');
      }

      await this.wishlistRepo.remove(wishlist);

      return { message: 'Item removed from wishlist successfully' };
    } catch (error) {
      this.logger.log(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  update(id: number, updateWishlistDto: UpdateWishlistDto) {
    return `This action updates a #${id} wishlist`;
  }

  remove(id: number) {
    return `This action removes a #${id} wishlist`;
  }
}
