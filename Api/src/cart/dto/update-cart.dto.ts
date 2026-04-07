import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CartItemDto } from './create-cart.dto';

export class UpdateCartDto {
  @ApiPropertyOptional({
    description: 'Cart items to add/update',
    type: [CartItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items?: CartItemDto[];
}
