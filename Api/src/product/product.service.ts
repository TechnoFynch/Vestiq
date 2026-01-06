import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
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

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

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

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
