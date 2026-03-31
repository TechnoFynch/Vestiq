import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateProductRatingDto {
  @ApiPropertyOptional({
    description: 'Rating value (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Rating comment',
    example: 'Updated comment about the product',
    maxLength: 1024,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  comment?: string;
}
