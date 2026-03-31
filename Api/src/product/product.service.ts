import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  public async searchProducts(searchQueryDto: SearchQueryDto) {
    const {
      query,
      category,
      priceMin,
      priceMax,
      sortBy,
      sortType,
      productRatingMax,
      productRatingMin,
      limit = 10,
      page = 1,
    } = searchQueryDto;

    if (!query && !category) {
      throw new BadRequestException(
        'Either search query or category is required.',
      );
    }

    try {
      if (priceMin && priceMax && priceMax < priceMin) {
        throw new BadRequestException(
          'Max Price cannot be less than Min Price',
        );
      }

      if (
        productRatingMin &&
        productRatingMax &&
        productRatingMax < productRatingMin
      ) {
        throw new BadRequestException(
          'Max Rating cannot be less than Min Rating',
        );
      }

      const queryBuilder = this.productRepo
        .createQueryBuilder('product')
        .innerJoin('product.category', 'category');

      if (query) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('product.name ILIKE :search')
              .orWhere('category.name ILIKE :search')
              .orWhere('product.description ILIKE :search');
          }),
          { search: `%${query}%` },
        );
      }

      if (category) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('category.slug = :category', { category });
          }),
        );
      }

      if (priceMin) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('product.price >= :minPrice').orWhere(
              'product.sale_price >= :minPrice',
            );
          }),
          { minPrice: priceMin },
        );
      }

      if (priceMax) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('product.price <= :maxPrice').orWhere(
              'product.sale_price <= :maxPrice',
            );
          }),
          { maxPrice: priceMax },
        );
      }

      if (productRatingMin) {
        queryBuilder.andWhere('product.product_rating >= :minRating', {
          minRating: productRatingMin,
        });
      }

      if (productRatingMax) {
        queryBuilder.andWhere('product.product_rating <= :maxRating', {
          maxRating: productRatingMax,
        });
      }

      const ratingSubquery = queryBuilder
        .subQuery()
        .select('pr.productId', 'productId')
        .addSelect('ROUND(AVG(pr.rating), 2)', 'avgRating')
        .from('product_rating', 'pr')
        .groupBy('pr."productId"');

      const qb = queryBuilder
        .leftJoin('product.images', 'images')
        .leftJoin('product.inventory', 'stock')
        .leftJoin(
          '(' + ratingSubquery.getQuery() + ')',
          'rating',
          'rating."productId" = product.id',
        )
        .select([
          'product.id',
          'product.name',
          'product.slug',
          'product.price',
          'product.sale_price',
          'category.name',
          'category.slug',
          'images.url',
          'images.is_primary',
        ])
        .addSelect('stock.quantity - stock.reserved', 'remainingStock')
        .addSelect('COALESCE(rating."avgRating", 0)', 'avgRating')
        .take(limit)
        .skip((page - 1) * limit);

      const [products, totalCount] = await Promise.all([
        qb.getRawMany(),
        qb.getCount(),
      ]);

      return {
        data: products,
        total: totalCount,
        limit: limit,
        offset: (page - 1) * limit,
      };
    } catch (error) {
      this.logger.error(error);

      if (error instanceof Error) {
        this.logger.error(error.stack);
      }

      throw new InternalServerErrorException('Something went wrong!');
    }
  }

  public async suggestProducts(query: string) {
    try {
      const ratingSubquery = this.productRepo
        .createQueryBuilder('product')
        .subQuery()
        .select('pr.productId', 'productId')
        .addSelect('ROUND(AVG(pr.rating), 2)', 'avgRating')
        .from('product_rating', 'pr')
        .groupBy('pr."productId"');

      const queryBuilder = this.productRepo
        .createQueryBuilder('product')
        .innerJoin('product.category', 'category')
        .leftJoin(
          '(' + ratingSubquery.getQuery() + ')',
          'rating',
          'rating."productId" = product.id',
        )
        .select([
          'product.id',
          'product.slug',
          'product.name',
          'product.price',
          'category.name',
        ])
        .addSelect('COALESCE(rating."avgRating", 0)', 'avgRating')
        .orderBy('COALESCE(rating."avgRating", 0)', 'DESC')
        .addOrderBy('product.name', 'ASC')
        .limit(3);

      if (query) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('product.name ILIKE :search')
              .orWhere('category.name ILIKE :search')
              .orWhere('product.description ILIKE :search');
          }),
          { search: `%${query}%` },
        );
      }

      interface SuggestionResult {
        product_id: string;
        product_slug: string;
        product_name: string;
        product_price: number;
        category_name: string;
        avgRating: string;
      }

      const suggestions = await queryBuilder.getRawMany();

      return suggestions.map((product: SuggestionResult) => ({
        id: product.product_id,
        slug: product.product_slug,
        name: product.product_name,
        category: product.category_name,
        price: product.product_price,
        averageRating: parseFloat(product.avgRating),
      }));
    } catch (error) {
      console.log(error);
      this.logger.error('Error in suggestProducts:', error);
      throw new InternalServerErrorException(
        'Failed to fetch product suggestions',
      );
    }
  }
}
