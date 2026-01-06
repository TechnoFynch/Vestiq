import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from './pipes/file-size-validator.pipe';
import { FileTypeValidationPipe } from './pipes/file-type-validator.pipe';
import { CreateInventoryDto } from 'src/inventory/dto/create-inventory.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Wireless Headphones',
        },
        slug: {
          type: 'string',
          example: 'wireless-headphones',
        },
        sku: {
          type: 'string',
          example: 'SKU-ELEC-001',
        },
        price: {
          type: 'number',
          example: 2999,
        },
        sale_price: {
          type: 'number',
          example: 2999,
        },
        description: {
          type: 'string',
          example: 'Noise cancelling headphones',
        },
        categoryId: {
          type: 'string',
          format: 'uuid',
        },
        quantity: {
          type: 'number',
          example: 50,
          description: 'Initial inventory quantity',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['name', 'price', 'categoryId', 'quantity', 'images'],
    },
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(new FileSizeValidationPipe(), new FileTypeValidationPipe())
    images: Array<Express.Multer.File>,
  ) {
    return this.productService.create(createProductDto, images);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
