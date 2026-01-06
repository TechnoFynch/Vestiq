import {
  Injectable,
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

  findAll() {
    return `This action returns all inventory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventory`;
  }

  update(id: number, updateInventoryDto: UpdateInventoryDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }
}
