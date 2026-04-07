import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Address ID for shipping',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  addressId!: string;
}
