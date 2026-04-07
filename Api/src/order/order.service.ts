import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Repository } from 'typeorm';
import { InventoryService } from 'src/inventory/inventory.service';
import { CartService } from 'src/cart/cart.service';
import { AuthService } from 'src/auth/auth.service';
import { AddressService } from 'src/address/address.service';
import { ProductService } from 'src/product/product.service';
import { OrderStatus } from './enums/order-status.enum';
import { DataSource } from 'typeorm';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => AddressService))
    private readonly addressService: AddressService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    @Inject(InventoryService)
    private readonly inventoryService: InventoryService,
    @Inject(CartService)
    private readonly cartService: CartService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    try {
      const products: Product[] = [];

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Validate user exists
      const user = await this.authService.findById(userId);

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      // Validate address exists and belongs to user
      const address = await this.addressService.findById(
        createOrderDto.addressId,
      );

      if (!address) {
        throw new NotFoundException(
          `Address ${createOrderDto.addressId} not found or doesn't belong to user`,
        );
      }

      const cart = await this.cartService.findByUserId(userId);

      if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      let totalAmount = 0;

      const orderItems: Partial<OrderItem>[] = [];

      for (const cartItem of cart.cart_items) {
        const product = await this.productService.findById(cartItem.product.id);

        if (!product) {
          throw new NotFoundException(
            `Product ${cartItem.product.id} not found`,
          );
        }

        products.push(product);

        const available =
          product.inventory.quantity - product.inventory.reserved;
        if (available < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${cartItem.product.id}`,
          );
        }

        const itemTotal =
          (product.sale_price ?? product.price) * cartItem.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product: product,
          quantity: cartItem.quantity,
          price: itemTotal,
        });
      }

      const order = queryRunner.manager.create(Order, {
        user,
        address_snapshot: address,
        total_amount: totalAmount,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(order);

      for (const itemData of orderItems) {
        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          product: itemData.product,
          quantity: itemData.quantity,
          price: itemData.price,
        });
        await queryRunner.manager.save(orderItem);

        if (orderItem.product.inventory) {
          await this.inventoryService.update(
            orderItem.product.id,
            orderItem.quantity,
          );
        }
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Error creating order:', error);
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async findAll() {
    try {
      const orders = await this.orderRepo.find({
        relations: ['user', 'order_items', 'order_items.product'],
        order: {
          created_at: 'DESC',
        },
      });

      return orders;
    } catch (error) {
      this.logger.error('Error fetching orders:', error);
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id },
        relations: ['user', 'order_items', 'order_items.product'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error fetching order with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch order');
    }
  }

  async findByUserId(userId: string) {
    try {
      const orders = await this.orderRepo.find({
        where: { user: { id: userId } },
        relations: ['user', 'order_items', 'order_items.product'],
        order: {
          created_at: 'DESC',
        },
      });

      return orders;
    } catch (error) {
      this.logger.error(`Error fetching orders for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to fetch user orders');
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    // try {
    //   const order = await this.orderRepo.findOne({
    //     where: { id },
    //     relations: ['user', 'order_items', 'order_items.product'],
    //   });
    //   if (!order) {
    //     throw new NotFoundException(`Order with ID ${id} not found`);
    //   }
    //   if (updateOrderDto.status !== undefined) {
    //     order.status = updateOrderDto.status;
    //   }
    //   const updatedOrder = await this.orderRepo.save(order);
    //   this.logger.log(
    //     `Order ${id} updated to status: ${updateOrderDto.status}`,
    //   );
    //   return {
    //     success: true,
    //     order: updatedOrder,
    //   };
    // } catch (error) {
    //   if (error instanceof NotFoundException) {
    //     throw error;
    //   }
    //   this.logger.error(`Error updating order with ID ${id}:`, error);
    //   throw new InternalServerErrorException('Failed to update order');
    // }
  }

  async cancel(id: string) {
    // try {
    //   const order = await this.orderRepo.findOne({
    //     where: { id },
    //     relations: ['user', 'order_items', 'order_items.product'],
    //   });
    //   if (!order) {
    //     throw new NotFoundException(`Order with ID ${id} not found`);
    //   }
    //   if (order.status !== OrderStatus.PENDING) {
    //     throw new BadRequestException(
    //       `Cannot cancel order with status: ${order.status}`,
    //     );
    //   }
    //   // Restore inventory
    //   for (const orderItem of order.order_items || []) {
    //     const product = await this.productService.findById(
    //       orderItem.product.id,
    //     );
    //     if (!product) {
    //       throw new NotFoundException(
    //         `Product ${orderItem.product.id} not found`,
    //       );
    //     }
    //     if (product.inventory) {
    //       await this.inventoryService.updateAdmin(product.inventory.id,
    //         quantity: orderItem.quantity,
    //     );
    //     }
    //   }
    //   // Update order status
    //   order.status = OrderStatus.CANCELLED;
    //   await this.orderRepo.save(order);
    //   this.logger.log(`Order ${id} cancelled and inventory restored`);
    //   return {
    //     success: true,
    //     message: 'Order cancelled successfully',
    //     order,
    //   };
    // } catch (error) {
    //   if (
    //     error instanceof NotFoundException ||
    //     error instanceof BadRequestException
    //   ) {
    //     throw error;
    //   }
    //   this.logger.error(`Error cancelling order with ID ${id}:`, error);
    //   throw new InternalServerErrorException('Failed to cancel order');
    // }
  }
}
