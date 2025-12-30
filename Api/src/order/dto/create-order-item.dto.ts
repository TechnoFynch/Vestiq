import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    example: 'b7a3f2f4-9c6e-4c8e-9f12-8a1b9f4e5c3d',
    description: 'Product ID',
  })
  @IsUUID()
  product_id!: string;

  @ApiProperty({
    example: 'Apple Watch Series 9',
    description: 'Product name at the time of purchase',
  })
  @IsString()
  product_name!: string;

  @ApiProperty({
    example: 39999.99,
    description: 'Product price at checkout',
  })
  @IsPositive()
  price!: number;

  @ApiProperty({
    example: 1,
    description: 'Quantity purchased',
  })
  @IsInt()
  @IsPositive()
  quantity!: number;
}
