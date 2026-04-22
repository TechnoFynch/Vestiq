import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoryRepo.create(createCategoryDto);
      const savedCategory = await this.categoryRepo.save(category);

      this.logger.log(`Category created with ID: ${savedCategory.id}`);
      return savedCategory;
    } catch (error) {
      this.logger.error('Error creating category:', error);
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async findAll(parentId?: string) {
    try {
      const query = this.categoryRepo.createQueryBuilder('category');

      if (!parentId) {
        query.where('category.parent IS NULL');
      } else if (parentId) {
        // Subcategories
        query.where('category.parent = :parentId', { parentId });
      }

      const categories = await query.getMany();

      return { categories };
    } catch (error) {
      this.logger.error('Error fetching categories:', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.categoryRepo.findOne({
        where: { id },
        relations: ['parent', 'children', 'products'],
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error fetching category with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch category');
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.categoryRepo.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      Object.assign(category, updateCategoryDto);
      const updatedCategory = await this.categoryRepo.save(category);

      this.logger.log(`Category updated with ID: ${id}`);
      return updatedCategory;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error updating category with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async remove(id: string) {
    try {
      const category = await this.categoryRepo.findOne({
        where: { id },
        relations: ['children'],
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      // Check if category has children
      if (category.children && category.children.length > 0) {
        throw new InternalServerErrorException(
          'Cannot delete category with child categories. Please delete or move child categories first.',
        );
      }

      await this.categoryRepo.softDelete(id);

      this.logger.log(`Category soft deleted with ID: ${id}`);
      return { message: `Category with ID ${id} has been deleted` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error deleting category with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to delete category');
    }
  }
}
