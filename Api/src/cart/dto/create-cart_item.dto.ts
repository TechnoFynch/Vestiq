import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({
    example: 'b7a3f2f4-9c6e-4c8e-9f12-8a1b9f4e5c3d',
    description: 'Product ID to be added to the cart',
  })
  @IsUUID()
  product!: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product',
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Min(1)
  quantity!: number;
}
