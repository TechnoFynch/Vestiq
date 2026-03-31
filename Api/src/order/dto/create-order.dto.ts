import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsArray,
  IsInt,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    description: 'Quantity of product',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'User ID placing the order',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId!: string;

  @ApiProperty({
    description: 'Address ID for shipping',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  addressId!: string;

  @ApiProperty({
    description: 'Order items',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
