import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
    maxLength: 256,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  name!: string;

  @ApiProperty({
    description: 'Unique slug (URL-friendly)',
    example: 'electronics',
    maxLength: 512,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(512)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase and hyphen-separated',
  })
  slug!: string;

  @ApiPropertyOptional({
    description: 'Parent category ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  parent_id?: string;
}
