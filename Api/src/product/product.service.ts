import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchQueryDto } from './dto/search-query.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly authService: AuthService,
  ) {}

  public async searchProducts(
    searchQueryDto: SearchQueryDto,
    userId: string | undefined,
  ) {
    const {
      query,
      category,
      priceMin,
      priceMax,
      sortBy,
      sortType,
      productRatingMax,
      productRatingMin,
      brand,
      limit = 10,
      page = 1,
    } = searchQueryDto;

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

      let validatedUserId: string | undefined = undefined;
      if (userId) {
        const user = await this.authService.findById(userId);
        if (user) validatedUserId = userId;
      }

      const ratingSubquery = this.productRepo.manager
        .createQueryBuilder()
        .select('pr.productId', 'productId')
        .addSelect('ROUND(AVG(pr.rating), 2)', 'avgRating')
        .from('product_rating', 'pr')
        .groupBy('pr."productId"')
        .getQuery();

      const voteCountSubquery = this.productRepo.manager
        .createQueryBuilder()
        .select('pr.product_id', 'productId')
        .addSelect('COUNT(pr.id)', 'voteCount')
        .from('product_rating', 'pr')
        .groupBy('pr."product_id"')
        .getQuery();

      const primaryImageSubquery = this.productRepo.manager
        .createQueryBuilder()
        .select('img.product_id', 'product_id')
        .addSelect('img.url', 'url')
        .from('product_image', 'img')
        .where('img.is_primary = true')
        .getQuery();

      const queryBuilder = this.productRepo
        .createQueryBuilder('product')
        .innerJoin('product.category', 'category')
        .leftJoin('product.brand', 'brand')
        .leftJoin('product.inventory', 'stock')
        .leftJoin(
          `(${primaryImageSubquery})`,
          'primary_image',
          'primary_image.product_id = product.id',
        )
        .leftJoin(
          `(${ratingSubquery})`,
          'rating',
          'rating."productId" = product.id',
        )
        .leftJoin(
          `(${voteCountSubquery})`,
          'votes',
          'votes."productId" = product.id',
        );

      if (validatedUserId) {
        queryBuilder.leftJoin(
          'wishlist',
          'wishlist',
          'wishlist."productId" = product.id AND wishlist."userId" = :validatedUserId',
          { validatedUserId },
        );
      }

      // stock filter
      queryBuilder.andWhere('stock.quantity - stock.reserved > 0');

      // full text search
      if (query) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('product.name ILIKE :search')
              .orWhere('category.name ILIKE :search')
              .orWhere('product.description ILIKE :search')
              .orWhere('brand.name ILIKE :search');
          }),
          { search: `%${query}%` },
        );
      }

      if (category) {
        queryBuilder.andWhere('category.slug = :category', { category });
      }

      if (brand) {
        queryBuilder.andWhere('brand.slug = :brand', { brand });
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
        queryBuilder.andWhere('COALESCE(rating."avgRating", 0) >= :minRating', {
          minRating: productRatingMin,
        });
      }

      if (productRatingMax) {
        queryBuilder.andWhere('COALESCE(rating."avgRating", 0) <= :maxRating', {
          maxRating: productRatingMax,
        });
      }

      queryBuilder
        .select([
          'product.id',
          'product.name',
          'product.slug',
          'product.price',
          'product.sale_price',
          'category.name',
          'category.slug',
          'brand.name',
          'brand.slug',
        ])
        .addSelect('primary_image.url', 'imageUrl')
        .addSelect('stock.quantity - stock.reserved', 'remainingStock')
        .addSelect('COALESCE(rating."avgRating", 0)', 'avgRating')
        .addSelect('COALESCE(votes."voteCount", 0)', 'voteCount')
        .addSelect(
          validatedUserId
            ? 'CASE WHEN wishlist."productId" IS NOT NULL THEN true ELSE false END'
            : 'false',
          'isWishlisted',
        )
        .limit(limit)
        .offset((page - 1) * limit);

      if (sortBy) {
        queryBuilder.orderBy(
          sortBy === 'price' ? 'product.price' : 'product.name',
          sortType ?? 'ASC',
        );
      }

      const [products, totalCount] = await Promise.all([
        queryBuilder.getRawMany(),
        queryBuilder.getCount(),
      ]);

      return {
        products,
        total: totalCount,
        limit,
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
        .innerJoin('product.images', 'images', 'images.is_primary = true')
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
          'images.url',
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
        images_url: string;
        product_price: number;
        category_name: string;
        avgRating: string;
      }

      const suggestions = await queryBuilder.getRawMany();

      const products = suggestions.map((product: SuggestionResult) => ({
        id: product.product_id,
        slug: product.product_slug,
        name: product.product_name,
        thumb: product.images_url,
        category: product.category_name,
        price: product.product_price,
        averageRating: parseFloat(product.avgRating),
      }));

      return {
        products,
      };
    } catch (error) {
      console.log(error);
      this.logger.error('Error in suggestProducts:', error);
      throw new InternalServerErrorException(
        'Failed to fetch product suggestions',
      );
    }
  }

  async findById(id: string) {
    try {
      const product = await this.productRepo.findOne({
        where: { id },
        relations: ['category', 'inventory', 'images', 'product_rating'],
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error fetching product with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch product');
    }
  }
}
