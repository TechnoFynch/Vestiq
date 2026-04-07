import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateInventoryDto } from './create-inventory.dto';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateInventoryDto {
  @ApiProperty({
    description: 'Product ID for which inventory is being created',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  productId!: string;

  @ApiPropertyOptional({
    description: 'Available quantity of the product',
    example: 100,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;
}
