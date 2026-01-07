import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  Matches,
  IsInt,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Apple iPhone 15',
    maxLength: 256,
  })
  @IsString()
  @MaxLength(256)
  name!: string;

  @ApiProperty({
    description: 'Unique product slug (URL-friendly)',
    example: 'apple-iphone-15',
    maxLength: 512,
  })
  @IsString()
  @MaxLength(512)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase and hyphen-separated',
  })
  slug!: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest Apple iPhone with A17 chip',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'Product price',
    example: 79999.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiPropertyOptional({
    description: 'Discounted sale price',
    example: 74999.99,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  sale_price?: number;

  @ApiProperty({
    description: 'Stock Keeping Unit (SKU)',
    example: 'APL-IP15-BLK-128',
    maxLength: 256,
  })
  @IsString()
  @MaxLength(256)
  sku!: string;

  @ApiProperty({
    description: 'Category ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({
    description: 'Available quantity of the product',
    example: 100,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  quantity?: number;
}
