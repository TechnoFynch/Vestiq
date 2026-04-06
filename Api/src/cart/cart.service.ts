import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateCartDto, CartItemDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { ProductService } from 'src/product/product.service';
import { Inject, forwardRef } from '@nestjs/common';
import type { Auth } from 'src/auth/entities/auth.entity';

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

  async create(createCartDto: CreateCartDto) {
    try {
      // Check if user already has a cart
      const existingCart = await this.cartRepo.findOne({
        where: { user: { id: createCartDto.userId } },
        relations: ['cart_items'],
      });

      if (existingCart) {
        return {
          success: true,
          message: 'User already has a cart',
          cart: existingCart,
        };
      }

      // Create new cart for user
      const user = { id: createCartDto.userId } as Auth;
      const cart = this.cartRepo.create({ user });
      const savedCart = await this.cartRepo.save(cart);

      this.logger.log(`New cart created for user ID: ${createCartDto.userId}`);
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

  async update(id: string, updateCartDto: UpdateCartDto) {
    try {
      const cart = await this.cartRepo.findOne({
        where: { id },
        relations: ['cart_items', 'cart_items.product'],
      });

      if (!cart) {
        throw new NotFoundException(`Cart with ID ${id} not found`);
      }

      // Clear entire cart if 'all' flag is true
      if (updateCartDto.all) {
        await this.cartItemRepo.delete({ cart: { id } });
        const clearedCart = await this.cartRepo.findOne({
          where: { id },
          relations: ['user', 'cart_items', 'cart_items.product'],
        });

        this.logger.log(`Cart ${id} cleared for user ${cart.user.id}`);
        return {
          success: true,
          message: 'Cart cleared successfully',
          cart: clearedCart,
        };
      }

      // Handle cart items updates
      if (updateCartDto.items && updateCartDto.items.length > 0) {
        for (const itemDto of updateCartDto.items) {
          // Verify product exists and get current price
          const product = await this.productService.findById(itemDto.productId);

          if (!product) {
            throw new NotFoundException(
              `Product ${itemDto.productId} not found`,
            );
          }

          // Check if item already exists in cart
          const existingItem = cart.cart_items?.find(
            (item) => item.product.id === itemDto.productId,
          );

          if (existingItem) {
            // Update existing item quantity
            existingItem.quantity = itemDto.quantity;
            await this.cartItemRepo.save(existingItem);
          } else {
            // Add new item to cart
            const cartItem = this.cartItemRepo.create({
              cart,
              product,
              quantity: itemDto.quantity,
              price_at_add: product.price,
            });
            await this.cartItemRepo.save(cartItem);
          }
        }
      }

      // Return updated cart with fresh relations
      const updatedCart = await this.cartRepo.findOne({
        where: { id },
        relations: ['user', 'cart_items', 'cart_items.product'],
      });

      this.logger.log(`Cart ${id} updated for user ${cart.user.id}`);
      return {
        success: true,
        cart: updatedCart,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error updating cart with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to update cart');
    }
  }

  async addItemToCart(userId: string, itemDto: CartItemDto) {
    try {
      // Get or create cart for user
      let cart = await this.cartRepo.findOne({
        where: { user: { id: userId } },
        relations: ['cart_items', 'cart_items.product'],
      });

      if (!cart) {
        // Create new cart for user
        const user = { id: userId } as Auth;
        cart = this.cartRepo.create({ user });
        cart = await this.cartRepo.save(cart);
      }

      // Verify product exists and get current price
      const product = await this.productService.findById(itemDto.productId);

      if (!product) {
        throw new NotFoundException(`Product ${itemDto.productId} not found`);
      }

      // Check if item already exists in cart
      const existingItem = cart.cart_items?.find(
        (item) => item.product.id === itemDto.productId,
      );

      if (existingItem) {
        // Update existing item quantity
        existingItem.quantity += itemDto.quantity;
        await this.cartItemRepo.save(existingItem);
      } else {
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
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error adding item to cart for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to add item to cart');
    }
  }

  async removeItemFromCart(userId: string, productId: string) {
    try {
      const cart = await this.cartRepo.findOne({
        where: { user: { id: userId } },
        relations: ['cart_items'],
      });

      if (!cart) {
        throw new NotFoundException(`Cart for user ${userId} not found`);
      }

      const cartItem = cart.cart_items?.find(
        (item) => item.product.id === productId,
      );

      if (!cartItem) {
        throw new NotFoundException(`Item ${productId} not found in cart`);
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
}
