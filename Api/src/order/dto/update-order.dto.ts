import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Order status',
    enum: OrderStatus,
    example: 'CONFIRMED',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Address ID for shipping (if address change is allowed)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  addressId?: string;
}
