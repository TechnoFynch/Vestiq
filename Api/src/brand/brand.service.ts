import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from 'src/brand/entities/brand.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BrandService {
  private readonly logger = new Logger(BrandService.name);

  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
  ) {}

  create(createBrandDto: CreateBrandDto) {
    return 'This action adds a new brand';
  }

  findAll() {
    return `This action returns all brand`;
  }

  findOne(id: number) {
    return `This action returns a #${id} brand`;
  }

  update(id: number, updateBrandDto: UpdateBrandDto) {
    return `This action updates a #${id} brand`;
  }

  remove(id: number) {
    return `This action removes a #${id} brand`;
  }

  async getProductsByBrand(brandId: string) {
    try {
      const productsByBrand = await this.brandRepo.findOne({
        where: { id: brandId },
        relations: ['products'],
      });

      if (!productsByBrand) {
        throw new BadRequestException('Brand not found');
      }

      return { productsByBrand };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      else {
        throw new InternalServerErrorException('Something went wrong');
      }
    }
  }
}
