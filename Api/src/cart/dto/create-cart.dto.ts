import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  IsPositive,
  IsOptional,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateCartDto {
  @ApiProperty({
    description: 'User ID for whom the cart is being created',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId!: string;
}

export class CartItemDto {
  @ApiProperty({
    description: 'Product ID to add to cart',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Min(1)
  quantity!: number;
}
