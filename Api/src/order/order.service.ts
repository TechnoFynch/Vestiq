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
    private readonly inventoryService: InventoryService,
    private readonly cartService: CartService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      // Validate user exists
      const user = await this.authService.findById(createOrderDto.userId);

      if (!user) {
        throw new NotFoundException(`User ${createOrderDto.userId} not found`);
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

      // Validate products and calculate total
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        const product = await this.productService.findById(itemDto.productId);

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
        const product = await this.productService.findByIdWithInventory(
          item.productId,
        );

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

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
        const product = await this.productService.findByIdWithInventory(
          item.productId,
        );

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

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
        const product = await this.productService.findByIdWithInventory(
          orderItem.product.id,
        );

        if (!product) {
          throw new NotFoundException(
            `Product ${orderItem.product.id} not found`,
          );
        }

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
