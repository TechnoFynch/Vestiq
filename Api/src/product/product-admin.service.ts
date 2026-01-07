import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductImage } from './entities/product_image.entity';
import { InventoryService } from 'src/inventory/inventory.service';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { cloudinaryAccessType } from 'src/config/configuration';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { PaginationQueryDto } from 'src/global-dtos/pagination-query.dto';
import { Category } from 'src/category/entities/category.entity';

@Injectable()
export class ProductAdminService {
  private readonly logger = new Logger(ProductAdminService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly producImageRepo: Repository<ProductImage>,

    private readonly dataSource: DataSource,

    private readonly inventoryService: InventoryService,

    private readonly configService: ConfigService,
  ) {
    cloudinary.config(
      this.configService.getOrThrow<cloudinaryAccessType>('cloudinary'),
    );
  }

  async create(
    createProductDto: CreateProductDto,
    images: Express.Multer.File[],
  ) {
    const uploadedImages: UploadApiResponse[] = [];

    try {
      // 1️⃣ PARALLEL image uploads (external side-effect)
      const uploadResults = await Promise.all(
        images.map((file, index) =>
          this.uploadImageBuffers(file.buffer, {
            folder: 'products',
            public_id: `product_tmp_${Date.now()}_${index}`,
          }),
        ),
      );

      uploadedImages.push(...uploadResults);

      this.logger.log(
        `Uploaded ${uploadedImages.length} image(s) successfully`,
      );

      // 2️⃣ DB TRANSACTION (ALL OR NOTHING)
      const product = await this.dataSource.transaction(async (manager) => {
        // ─── Product ─────────────────────────────
        const newProduct = await manager.save(Product, {
          name: createProductDto.name,
          slug: createProductDto.slug,
          description: createProductDto.description,
          price: createProductDto.price,
          sale_price: createProductDto.sale_price,
          sku: createProductDto.sku,
          category: { id: createProductDto.categoryId },
        });

        this.logger.log(`Product created with ID ${newProduct.id}`);

        // ─── Inventory ───────────────────────────
        await manager.save(Inventory, {
          product: { id: newProduct.id },
          quantity: createProductDto.quantity,
          reserved: 0,
        });

        // ─── Product Images ──────────────────────
        const productImages = uploadedImages.map((img, index) =>
          manager.create(ProductImage, {
            product: { id: newProduct.id },
            url: img.secure_url,
            is_primary: index === 0, // 👈 deterministic
          }),
        );

        await manager.save(ProductImage, productImages);

        return newProduct;
      });

      this.logger.log(`Product ${product.id} created successfully`);

      return {
        success: true,
        message: 'Product created successfully',
        productId: product.id,
      };
    } catch (error) {
      this.logger.error(error);

      // 3️⃣ Cloudinary CLEANUP (manual rollback)
      if (uploadedImages.length) {
        await cloudinary.api.delete_resources(
          uploadedImages.map((img) => img.public_id),
        );
      }

      if (error instanceof QueryFailedError) {
        const err: any = error;

        if (err.code === '23505') {
          throw new ConflictException('Duplicate value violation');
        }
      }

      throw new InternalServerErrorException('Failed to create product');
    }
  }

  private uploadImageBuffers(
    buffer: Buffer,
    options: {
      folder: string;
      public_id?: string;
    },
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          public_id: options.public_id,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Image upload failed'));
          resolve(result);
        },
      );

      Readable.from(buffer).pipe(stream);
    });
  }

  async findAll(pagination: PaginationQueryDto) {
    try {
      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 10;

      const [products, total] = await this.productRepo.findAndCount({
        relations: ['inventory', 'category'],
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          category: {
            name: true,
            slug: true,
          },
          inventory: {
            quantity: true,
          },
          name: true,
          slug: true,
          description: true,
          price: true,
          sale_price: true,
          sku: true,
        },
        take: limit,
        skip: (page - 1) * limit,
      });

      return {
        data: products,
        total: total,
        limit: limit,
        offset: page,
      };
    } catch (error) {
      this.logger.error(error);

      throw new InternalServerErrorException('Something went wrong!');
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.productRepo.findOneOrFail({
        where: { id: id },
        relations: ['inventory', 'category', 'images'],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          sale_price: true,
          sku: true,
          created_at: true,
          updated_at: true,
          deleted_at: true,
          category: {
            id: true,
            slug: true,
            name: true,
          },
          inventory: {
            quantity: true,
          },
          images: {
            id: true,
            is_primary: true,
            url: true,
          },
        },
      });

      return {
        data: product,
      };
    } catch (error) {
      this.logger.error(error);

      throw new InternalServerErrorException('Something went wrong!');
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      // 1️⃣ Find product
      const product = await this.productRepo.findOne({
        where: { id },
        relations: ['category', 'inventory'],
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // 2️⃣ Handle category update (categoryId → relation)
      if (updateProductDto.categoryId) {
        product.category = {
          id: updateProductDto.categoryId,
        } as Category; // intentional partial reference
      }

      if (updateProductDto.quantity) {
        this.inventoryService.update(product.inventory.id, {
          quantity: updateProductDto.quantity,
        });
      }

      // 3️⃣ Explicitly ignore quantity (inventory handled elsewhere)
      const {
        quantity, // 👈 ignored on purpose
        categoryId, // 👈 already handled
        ...updatableFields
      } = updateProductDto;

      // 4️⃣ Apply remaining scalar fields safely
      Object.assign(product, updatableFields);

      await this.productRepo.save(product);

      return {
        success: true,
        message: 'Product updated successfully',
      };
    } catch (error) {
      this.logger.error(error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async remove(id: string) {
    try {
      const product = await this.productRepo.findOneByOrFail({ id: id });

      await this.productRepo.softDelete({ id: product.id });

      this.logger.log(`Product ${product.id} marked as not available`);

      return {
        success: true,
        message: `Product ${product.name} deleted`,
      };
    } catch (error) {
      this.logger.error(error);

      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
