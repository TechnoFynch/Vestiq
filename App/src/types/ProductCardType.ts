export interface ProductCardType {
  product_id: string;
  product_name: string;
  product_slug: string;
  product_price: number;
  product_sale_price: number;
  category_name: string;
  category_slug: string;
  brand_id: string;
  brand_name: string;
  brand_slug: string;
  images_url: string;
  remainingStock: number;
  avgRating: number;
  totalVotes: number;
  isWishlisted: boolean;
}
