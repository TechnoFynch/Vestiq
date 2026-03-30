import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum SortBy {
  PRICE = 'price',
  NAME = 'name',
  RATING = 'product_rating',
}

export enum SortType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SearchQueryDto {
  // 🔍 Text search
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MinLength(3)
  query?: string;

  // 🗂 Category filter (slug)
  @IsOptional()
  @IsString()
  category?: string;

  // 💰 Price filters
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  productRatingMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  productRatingMax?: number;

  // 🔃 Sorting
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.RATING;

  @IsOptional()
  @IsEnum(SortType)
  sortType?: SortType = SortType.DESC;

  // 📄 Pagination
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
