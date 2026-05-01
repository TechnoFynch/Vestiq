import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProductCardType } from "@/types/ProductCardType";

import { HeartIcon, Star } from "lucide-react";
import { Badge } from "./badge";
import { Link } from "react-router";
import appRoutes from "@/constants/appRoutes";

interface RatingBarProps {
  avgRating: number;
  voteCount?: number;
  size?: number;
  showScore?: boolean;
  showVotes?: boolean;
}

const RatingBar = ({
  avgRating,
  voteCount = 0,
  size = 10,
  showScore = true,
  showVotes = true,
}: RatingBarProps) => {
  const clamped = Math.min(5, Math.max(0, avgRating));

  return (
    <div className="flex items-center gap-2">
      {showScore && (
        <span className="text-sm font-semibold text-foreground min-w-7">
          {clamped.toFixed(1)}
        </span>
      )}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPercent = Math.min(
            100,
            Math.max(0, (clamped - (star - 1)) * 100),
          );
          return (
            <div
              key={star}
              className="relative"
              style={{ width: size, height: size }}
            >
              {/* Empty star */}
              <Star
                size={size}
                className="text-muted-foreground/30"
                strokeWidth={1.5}
              />
              {/* Filled overlay */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
              >
                <Star
                  size={size}
                  className="text-yellow-400 fill-yellow-400"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          );
        })}
      </div>
      {showVotes && (
        <span className="text-xs text-muted-foreground">
          ({voteCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};

const ProductCardType = (props: ProductCardType) => {
  return (
    <Link to={appRoutes.user.products(props.product_slug)}>
      <Card
        className="relative mx-auto w-full max-w-sm pt-0! cursor-pointer"
        size="sm"
      >
        {/* Product Image */}
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-t-2xl">
          <img
            src={props.imageUrl}
            alt={props.product_name}
            className="h-full w-full object-cover"
          />
          <div
            className="absolute top-4 right-4 flex items-center justify-center 
             h-9 w-9 rounded-full 
             bg-white/90 backdrop-blur 
             border border-slate-200 
             shadow-sm
             hover:bg-white hover:shadow-md 
             transition-all duration-200 
             active:scale-95 cursor-pointer"
          >
            <HeartIcon
              className={`h-4 w-4 ${props.isWishlisted ? "text-pink-400 fill-pink-400" : "text-slate-600"}`}
            />
          </div>
        </div>

        {/* Product Info */}
        <CardHeader className="p-4">
          <RatingBar avgRating={props.avgRating} voteCount={props.voteCount} />
          <CardTitle className="text-lg font-semibold text-foreground">
            {props.product_name}
          </CardTitle>
          <CardDescription>
            <p className="text-sm text-muted-foreground capitalize">
              {props.brand_name}
            </p>
            <div className="mt-2 flex items-center justify-between">
              {props.product_sale_price ? (
                <div className="flex items-center justify-start gap-1">
                  <span className="text-base line-through font-semibold text-foreground/70">
                    ${props.product_price}
                  </span>{" "}
                  <span className="text-lg font-semibold text-foreground">
                    ${props.product_sale_price}
                  </span>
                  <Badge
                    variant="destructive"
                    className="text-xs rounded-sm ml-2"
                  >
                    {`-${(
                      ((props.product_price - props.product_sale_price) /
                        props.product_price) *
                      100
                    ).toFixed(0)}%`}
                  </Badge>
                </div>
              ) : (
                <span className="text-lg font-semibold text-foreground">
                  ${props.product_price}
                </span>
              )}
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default ProductCardType;
