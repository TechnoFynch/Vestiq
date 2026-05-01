import { Card } from "@/components/ui/card";
import type { ProductCardType } from "@/types/ProductCardType";

import { Star } from "lucide-react";

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
  size = 20,
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
    <Card className="relative mx-auto w-full max-w-sm pt-0" size="sm">
      {/* Product Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-t-2xl">
        <img
          src={props.images_url}
          alt={props.product_name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground">
          {props.product_name}
        </h3>
        <p className="text-sm text-muted-foreground">{props.category_name}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            ${props.product_price.toFixed(2)}
          </span>
          <button className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCardType;
