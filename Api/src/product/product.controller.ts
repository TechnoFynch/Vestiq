import { Controller, Get, Query, Req } from '@nestjs/common';
import { SearchQueryDto, SortBy, SortType } from './dto/search-query.dto';
import { SuggestQueryPipe } from './pipes/suggest-query-validator.pipe';
import { ProductService } from './product.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/search')
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({ name: 'productRatingMin', required: false, type: Number })
  @ApiQuery({ name: 'productRatingMax', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: SortBy })
  @ApiQuery({ name: 'sortType', required: false, enum: SortType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  searchProducts(@Query() searchQueryDto: SearchQueryDto, @Req() req: any) {
    const userId = req.user?.sub;
    return this.productService.searchProducts(searchQueryDto, userId);
  }

  @Get('/suggest')
  suggestProducts(@Query('query', SuggestQueryPipe) query: string) {
    return this.productService.suggestProducts(query);
  }
}
