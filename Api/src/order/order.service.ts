import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/product/entities/product.entity';
import { Auth } from 'src/auth/entities/auth.entity';
import { Address } from 'src/address/entities/address.entity';
import { InventoryService } from 'src/inventory/inventory.service';
import { CartService } from 'src/cart/cart.service';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Auth)
    private readonly userRepo: Repository<Auth>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    private readonly inventoryService: InventoryService,
    private readonly cartService: CartService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      // Validate user exists
      const user = await this.userRepo.findOne({
        where: { id: createOrderDto.userId },
      });

      if (!user) {
        throw new NotFoundException(`User ${createOrderDto.userId} not found`);
      }

      // Validate address exists and belongs to user
      const address = await this.addressRepo.findOne({
        where: {
          id: createOrderDto.addressId,
          user: { id: createOrderDto.userId },
        },
      });

      if (!address) {
        throw new NotFoundException(
          `Address ${createOrderDto.addressId} not found or doesn't belong to user`,
        );
      }

      // Validate products and calculate total
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        const product = await this.productRepo.findOne({
          where: { id: itemDto.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product ${itemDto.productId} not found`);
        }

        const itemTotal = product.price * itemDto.quantity;
        totalAmount += itemTotal;

        const orderItem = this.orderItemRepo.create({
          product,
          quantity: itemDto.quantity,
          price: product.price,
        });

        orderItems.push(orderItem);
      }

      // Check inventory availability
      for (const item of createOrderDto.items) {
        const product = await this.productRepo.findOne({
          where: { id: item.productId },
          relations: ['inventory'],
        });

        if (!product.inventory || product.inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient inventory for product ${product.name}. Available: ${product.inventory?.quantity || 0}, Requested: ${item.quantity}`,
          );
        }
      }

      // Create order with address snapshot
      const addressSnapshot = {
        full_name: address.full_name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        country: address.country,
        postal_code: address.postal_code,
      };

      const order = this.orderRepo.create({
        user,
        address_snapshot: addressSnapshot,
        total_amount: totalAmount,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await this.orderRepo.save(order);

      // Create order items
      for (const orderItem of orderItems) {
        orderItem.order = savedOrder;
        await this.orderItemRepo.save(orderItem);
      }

      // Update inventory (subtract quantities)
      for (const item of createOrderDto.items) {
        const product = await this.productRepo.findOne({
          where: { id: item.productId },
          relations: ['inventory'],
        });

        if (product.inventory) {
          await this.inventoryService.update(product.inventory.id, {
            quantity: -item.quantity,
          });
        }
      }

      // Get complete order with relations
      const completeOrder = await this.orderRepo.findOne({
        where: { id: savedOrder.id },
        relations: ['user', 'order_items', 'order_items.product'],
      });

      this.logger.log(
        `Order created: ${savedOrder.id} for user ${createOrderDto.userId}`,
      );
      return {
        success: true,
        order: completeOrder,
      };
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
    try {
      const order = await this.orderRepo.findOne({
        where: { id },
        relations: ['user', 'order_items', 'order_items.product'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      if (updateOrderDto.status !== undefined) {
        order.status = updateOrderDto.status;
      }

      const updatedOrder = await this.orderRepo.save(order);

      this.logger.log(
        `Order ${id} updated to status: ${updateOrderDto.status}`,
      );
      return {
        success: true,
        order: updatedOrder,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error updating order with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to update order');
    }
  }

  async cancel(id: string) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id },
        relations: ['user', 'order_items', 'order_items.product'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          `Cannot cancel order with status: ${order.status}`,
        );
      }

      // Restore inventory
      for (const orderItem of order.order_items || []) {
        const product = await this.productRepo.findOne({
          where: { id: orderItem.product.id },
          relations: ['inventory'],
        });

        if (product.inventory) {
          await this.inventoryService.update(product.inventory.id, {
            quantity: orderItem.quantity,
          });
        }
      }

      // Update order status
      order.status = OrderStatus.CANCELLED;
      await this.orderRepo.save(order);

      this.logger.log(`Order ${id} cancelled and inventory restored`);
      return {
        success: true,
        message: 'Order cancelled successfully',
        order,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error cancelling order with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to cancel order');
    }
  }
}
