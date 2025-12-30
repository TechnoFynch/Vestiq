import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateProductImageDto {
  @ApiProperty({
    description: 'Product ID this image belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    description: 'Publicly accessible image URL',
    example: 'https://cdn.example.com/products/iphone-15-front.jpg',
    maxLength: 1024,
  })
  @IsString()
  @IsUrl()
  @MaxLength(1024)
  url!: string;

  @ApiPropertyOptional({
    description: 'Whether this image is the primary image for the product',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;
}
