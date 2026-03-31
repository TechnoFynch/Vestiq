import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductRatingDto {
  @ApiProperty({
    description: 'Product ID to rate',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    description: 'Rating value (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({
    description: 'Rating comment',
    example: 'Great product, highly recommended!',
    maxLength: 1024,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  comment?: string;
}
