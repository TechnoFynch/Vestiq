import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto) {
    try {
      let inventory = this.inventoryRepo.create();

      inventory.product = { id: createInventoryDto.productId } as Product;
      inventory.quantity = createInventoryDto.quantity ?? 0;

      inventory = await this.inventoryRepo.save(inventory);

      this.logger.log(`New inventory created with ID: ${inventory.id}`);

      return {
        success: true,
        inventoryId: inventory.id,
      };
    } catch (error) {
      this.logger.error(error);

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto) {
    try {
      const inventory = await this.inventoryRepo.findOne({
        where: { id },
        relations: ['product'],
      });

      if (!inventory) {
        throw new NotFoundException(`Inventory with ID ${id} not found`);
      }

      const { quantity } = updateInventoryDto;

      if (quantity !== undefined) {
        const newQuantity = inventory.quantity + quantity;

        // Check if quantity would drop below 0 (insufficient inventory)
        if (newQuantity < 0) {
          throw new InternalServerErrorException(
            `Insufficient inventory. Current quantity: ${inventory.quantity}, attempted to take: ${Math.abs(quantity)}`,
          );
        }

        // Add or subtract quantity based on positive/negative value
        inventory.quantity = newQuantity;
      }

      const updatedInventory = await this.inventoryRepo.save(inventory);

      this.logger.log(
        `Inventory updated for product ID: ${inventory.product.id}, new quantity: ${updatedInventory.quantity}`,
      );

      return {
        success: true,
        inventoryId: updatedInventory.id,
        productId: updatedInventory.product.id,
        newQuantity: updatedInventory.quantity,
        quantityChange: quantity || 0,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error updating inventory with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to update inventory');
    }
  }

  async remove(id: string) {
    try {
      const inventory = await this.inventoryRepo.findOne({
        where: { id },
        relations: ['product'],
      });

      if (!inventory) {
        throw new NotFoundException(`Inventory with ID ${id} not found`);
      }

      // Set inventory quantity to 0 for the product
      inventory.quantity = 0;
      inventory.reserved = 0;

      const updatedInventory = await this.inventoryRepo.save(inventory);

      this.logger.log(
        `Inventory reset to 0 for product ID: ${inventory.product.id}`,
      );

      return {
        success: true,
        inventoryId: updatedInventory.id,
        productId: updatedInventory.product.id,
        message: `Inventory for product ${inventory.product.id} has been reset to 0`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error resetting inventory with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to reset inventory');
    }
  }
}
