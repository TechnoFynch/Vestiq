import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductRatingDto } from './dto/create-product-rating.dto';
import { UpdateProductRatingDto } from './dto/update-product-rating.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductRating } from './entities/product-rating.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/product/entities/product.entity';
import { Auth } from 'src/auth/entities/auth.entity';

@Injectable()
export class ProductRatingService {
  private readonly logger = new Logger(ProductRatingService.name);

  constructor(
    @InjectRepository(ProductRating)
    private readonly productRatingRepo: Repository<ProductRating>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Auth)
    private readonly userRepo: Repository<Auth>,
  ) {}

  async create(createProductRatingDto: CreateProductRatingDto, userId: string) {
    try {
      // Validate user exists
      const user = await this.userRepo.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      // Validate product exists
      const product = await this.productRepo.findOne({
        where: { id: createProductRatingDto.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product ${createProductRatingDto.productId} not found`,
        );
      }

      // Check if user already rated this product
      const existingRating = await this.productRatingRepo.findOne({
        where: {
          user: { id: userId },
          product: { id: createProductRatingDto.productId },
        },
      });

      if (existingRating) {
        throw new BadRequestException('User has already rated this product');
      }

      // Create new rating
      const rating = this.productRatingRepo.create({
        user,
        product,
        rating: createProductRatingDto.rating,
        comment: createProductRatingDto.comment,
      });

      const savedRating = await this.productRatingRepo.save(rating);

      // Get complete rating with relations
      const completeRating = await this.productRatingRepo.findOne({
        where: { id: savedRating.id },
        relations: ['user', 'product'],
      });

      this.logger.log(
        `Rating created: ${savedRating.id} by user ${userId} for product ${createProductRatingDto.productId}`,
      );
      return {
        success: true,
        rating: completeRating,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Error creating product rating:', error);
      throw new InternalServerErrorException('Failed to create product rating');
    }
  }

  async findByProductId(productId: string) {
    try {
      // Validate product exists
      const product = await this.productRepo.findOne({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${productId} not found`);
      }

      const ratings = await this.productRatingRepo.find({
        where: { product: { id: productId } },
        relations: ['user', 'product'],
        order: {
          created_at: 'DESC',
        },
      });

      return ratings;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error fetching ratings for product ${productId}:`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch product ratings');
    }
  }

  async findByUserId(userId: string) {
    try {
      // Validate user exists
      const user = await this.userRepo.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      const ratings = await this.productRatingRepo.find({
        where: { user: { id: userId } },
        relations: ['user', 'product'],
        order: {
          created_at: 'DESC',
        },
      });

      return ratings;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error fetching ratings for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to fetch user ratings');
    }
  }

  async update(
    id: string,
    updateProductRatingDto: UpdateProductRatingDto,
    userId: string,
  ) {
    try {
      const rating = await this.productRatingRepo.findOne({
        where: { id },
        relations: ['user', 'product'],
      });

      if (!rating) {
        throw new NotFoundException(`Rating with ID ${id} not found`);
      }

      // Check if user owns this rating
      if (rating.user.id !== userId) {
        throw new BadRequestException('User can only update their own ratings');
      }

      // Update rating fields
      if (updateProductRatingDto.rating !== undefined) {
        rating.rating = updateProductRatingDto.rating;
      }

      if (updateProductRatingDto.comment !== undefined) {
        rating.comment = updateProductRatingDto.comment;
      }

      const updatedRating = await this.productRatingRepo.save(rating);

      this.logger.log(`Rating ${id} updated by user ${userId}`);
      return {
        success: true,
        rating: updatedRating,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error updating rating with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to update rating');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const rating = await this.productRatingRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!rating) {
        throw new NotFoundException(`Rating with ID ${id} not found`);
      }

      // Check if user owns this rating
      if (rating.user.id !== userId) {
        throw new BadRequestException('User can only delete their own ratings');
      }

      await this.productRatingRepo.delete(id);

      this.logger.log(`Rating ${id} deleted by user ${userId}`);
      return {
        success: true,
        message: 'Rating deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error deleting rating with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to delete rating');
    }
  }
}
