import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  Inject,
  forwardRef,
  ForbiddenException,
  ConflictException,
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
import { Inventory } from 'src/inventory/entities/inventory.entity';

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
      let newOrder!: Order;

      await this.dataSource.transaction(async (manager) => {
        const cart = (await this.cartService.findByUserId(userId)).cart;

        if (cart.cart_items!.length === 0) {
          throw new BadRequestException("Cart is empty or doesn't exist");
        }

        const address = await this.addressService.findById(
          createOrderDto.addressId,
        );

        if (address.user.id !== userId) {
          throw new ForbiddenException(
            "You don't have permission to use this address",
          );
        }

        const addressSnapshot = {
          full_name: address.full_name,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country,
        };

        let orderTotal = 0;

        newOrder = await manager.save(Order, {
          user: { id: userId },
          address_snapshot: addressSnapshot,
          total_amount: orderTotal,
          status: OrderStatus.PENDING,
        });

        for (const cartItem of cart.cart_items!) {
          const inventory = await manager
            .createQueryBuilder(Inventory, 'inventory')
            .setLock('pessimistic_write')
            .where('inventory.product = :productId', {
              productId: cartItem.product.id,
            })
            .getOne();

          if (inventory) {
            const available = inventory.quantity - inventory.reserved;

            if (available < cartItem.quantity) {
              throw new ConflictException(
                `Insufficient stock for product ${cartItem.product.name}`,
              );
            }

            inventory.reserved += cartItem.quantity;
            await manager.save(inventory);

            orderTotal += cartItem.quantity * cartItem.price_at_add;

            await manager.save(OrderItem, {
              order: { id: newOrder.id },
              product: { id: cartItem.product.id },
              quantity: cartItem.quantity,
              price_at_add: cartItem.price_at_add,
            });

            await this.inventoryService.deductStock(
              manager,
              cartItem.product,
              cartItem.quantity,
            );
          }
        }
        await manager.update(
          Order,
          { id: newOrder.id },
          { total_amount: orderTotal, status: OrderStatus.CONFIRMED },
        );
      });

      await this.cartService.clearCart(userId);

      const order = await this.orderRepo.findOne({
        where: { id: newOrder.id },
        relations: ['user', 'order_items', 'order_items.product'],
      });

      return {
        success: true,
        message: 'Order created successfully',
        order: order,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
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

  async findOne(id: string, userId: string) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id },
        relations: ['user', 'order_items', 'order_items.product'],
      });

      if (!order) {
        throw new BadRequestException(`Order with ID ${id} not found`);
      }

      if (order.user.id !== userId) {
        throw new ForbiddenException(
          `Order with ID ${id} does not belong to user ${userId}`,
        );
      }

      return order;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error fetching order with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch order');
    }
  }

  async findByUserId(userId: string, limit: number = 10, page: number = 1) {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await this.orderRepo.findAndCount({
        where: { user: { id: userId } },
        relations: ['user', 'order_items', 'order_items.product'],
        order: {
          created_at: 'DESC',
        },
        take: limit,
        skip: skip,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
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

  async cancel(id: string, userId: string) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id },
        relations: ['order_items', 'order_items.product'],
      });

      if (order?.user.id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to cancel this order',
        );
      }

      if (
        ![
          OrderStatus.DELIVERED,
          OrderStatus.CONFIRMED,
          OrderStatus.SHIPPED,
          OrderStatus.TO_RETURN,
          OrderStatus.RETURNED,
        ].includes(order.status)
      ) {
        throw new BadRequestException('Order cannot be cancelled at this time');
      }

      await this.dataSource.transaction(async (manager) => {
        for (const orderItem of order.order_items!) {
          await this.inventoryService.restoreStock(
            manager,
            orderItem.product,
            orderItem.quantity,
          );
        }

        await manager.update(Order, order.id, {
          status: OrderStatus.CANCELLED,
        });
      });

      return {
        success: true,
        message: 'Order cancelled successfully',
        order,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Error cancelling order with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to cancel order');
    }
  }
}
