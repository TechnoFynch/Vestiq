import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CartItemDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { ProductService } from 'src/product/product.service';
import { Inject, forwardRef } from '@nestjs/common';
import type { Auth } from 'src/auth/entities/auth.entity';
import { UpdateCartItemDto } from 'src/cart/dto/update-cart_item.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  private async findOrCreate(userId: string) {
    try {
      // Check if user already has a cart
      const existingCart = await this.cartRepo.findOne({
        where: { user: { id: userId } },
        relations: ['user', 'cart_items', 'cart_items.product'],
      });

      if (existingCart) {
        return {
          success: true,
          message: 'User already has a cart',
          cart: existingCart,
        };
      }

      // Create new cart for user
      const user = { id: userId } as Auth;
      const cart = this.cartRepo.create({ user });
      const savedCart = await this.cartRepo.save(cart);

      this.logger.log(`New cart created for user ID: ${userId}`);
      return {
        success: true,
        cart: savedCart,
      };
    } catch (error) {
      this.logger.error('Error creating cart:', error);
      throw new InternalServerErrorException('Failed to create cart');
    }
  }

  async findAll() {
    try {
      const carts = await this.cartRepo.find({
        relations: ['user', 'cart_items', 'cart_items.product'],
        order: {
          updated_at: 'DESC',
        },
      });

      return carts;
    } catch (error) {
      this.logger.error('Error fetching carts:', error);
      throw new InternalServerErrorException('Failed to fetch carts');
    }
  }

  async findOne(id: string) {
    try {
      const cart = await this.cartRepo.findOne({
        where: { id },
        relations: ['user', 'cart_items', 'cart_items.product'],
      });

      if (!cart) {
        throw new NotFoundException(`Cart with ID ${id} not found`);
      }

      return cart;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error fetching cart with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch cart');
    }
  }

  async findByUserId(userId: string) {
    try {
      const cart = await this.cartRepo.findOne({
        where: { user: { id: userId } },
        relations: ['user', 'cart_items', 'cart_items.product'],
      });

      if (!cart) {
        throw new NotFoundException(`Cart for user ${userId} not found`);
      }

      return cart;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error fetching cart for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to fetch user cart');
    }
  }

  async addItemToCart(userId: string, itemDto: CartItemDto) {
    try {
      // Get or create cart for user
      const cart = await this.findByUserId(userId);

      // Verify product exists and get current price
      const product = await this.productService.findById(itemDto.productId);

      //Validate availability of inventory:
      const available = product.inventory.quantity - product.inventory.reserved;

      const existingItem = cart.cart_items?.find(
        (item) => item.product.id === itemDto.productId,
      );

      if (existingItem) {
        const currentQtyInCart = existingItem.quantity;

        if (currentQtyInCart + itemDto.quantity > available) {
          throw new ConflictException(
            `Not enough inventory for product ${itemDto.productId}`,
          );
        }

        // Update existing item quantity
        existingItem.quantity += itemDto.quantity;
        await this.cartItemRepo.save(existingItem);
      } else {
        if (itemDto.quantity > available) {
          throw new ConflictException(
            `Not enough inventory for product ${itemDto.productId}`,
          );
        }

        // Add new item to cart
        const cartItem = this.cartItemRepo.create({
          cart,
          product,
          quantity: itemDto.quantity,
          price_at_add: product.price,
        });
        await this.cartItemRepo.save(cartItem);
      }

      // Return updated cart
      const updatedCart = await this.cartRepo.findOne({
        where: { id: cart.id },
        relations: ['user', 'cart_items', 'cart_items.product'],
      });

      this.logger.log(`Item added to cart ${cart.id} for user ${userId}`);
      return {
        success: true,
        cart: updatedCart,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(`Error adding item to cart for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to add item to cart');
    }
  }

  async updateItem(userId: string, updateCartItemDto: UpdateCartItemDto) {
    try {
      const cart = await this.cartRepo.findOne({
        where: { user: { id: userId } as Auth },
        relations: ['cart_items', 'cart_items.product'],
      });

      if (!cart) {
        throw new BadRequestException(`Cart for user ${userId} not found`);
      }

      const itemToUpdate = cart.cart_items?.find(
        (item) => item.product.id === updateCartItemDto.productId,
      );

      if (!itemToUpdate) {
        throw new BadRequestException(
          `Item with product ID ${updateCartItemDto.productId} not found in cart`,
        );
      }

      const available =
        itemToUpdate.product.inventory.quantity -
        itemToUpdate.product.inventory.reserved;

      if (itemToUpdate.quantity < updateCartItemDto.quantity!) {
        if (available < updateCartItemDto.quantity!) {
          throw new ConflictException('Not enough inventory available');
        }
      }

      itemToUpdate.quantity = updateCartItemDto.quantity!;
      const updatedCart = await this.cartItemRepo.save(itemToUpdate);

      this.logger.log(`Cart ${userId} updated for user ${cart.user.id}`);
      return {
        success: true,
        cart: updatedCart,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error updating cart with ID ${userId}:`, error);
      throw new InternalServerErrorException('Failed to update cart');
    }
  }

  async removeItemFromCart(userId: string, productId: string) {
    try {
      const cart = await this.cartRepo.findOne({
        where: { user: { id: userId } as Auth },
        relations: ['cart_items'],
      });

      if (!cart) {
        throw new BadRequestException(`Cart for user ${userId} not found`);
      }

      const cartItem = cart.cart_items?.find(
        (item) => item.product.id === productId,
      );

      if (!cartItem) {
        throw new BadRequestException(`Item ${productId} not found in cart`);
      }

      await this.cartItemRepo.delete(cartItem.id);

      // Return updated cart
      const updatedCart = await this.cartRepo.findOne({
        where: { id: cart.id },
        relations: ['user', 'cart_items', 'cart_items.product'],
      });

      this.logger.log(`Item ${productId} removed from cart ${cart.id}`);
      return {
        success: true,
        message: 'Item removed from cart',
        cart: updatedCart,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error removing item from cart for user ${userId}:`,
        error,
      );
      throw new InternalServerErrorException('Failed to remove item from cart');
    }
  }

  async clearCart(userId: string) {
    try {
      const cart = await this.cartRepo.findOne({
        where: { user: { id: userId } },
        relations: ['cart_items'],
      });

      if (!cart) {
        throw new BadRequestException(`Cart for user ${userId} not found`);
      }

      await this.cartItemRepo.delete({ cart: { id: cart.id } });

      this.logger.log(`Cart ${cart.id} cleared for user ${userId}`);
      return {
        success: true,
        message: 'Cart cleared successfully',
        cart,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Error clearing cart for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to clear cart');
    }
  }
}
