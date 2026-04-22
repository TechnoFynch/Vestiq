import { Card } from "@/components/ui/card";
import type { ProductCardType } from "@/types/ProductCardType";

const ProductCardType = (props: ProductCardType) => {
  return (
    <Card className="relative mx-auto w-full max-w-sm pt-0" size="sm">
      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
        <img
          src={props.image}
          alt={props.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground">{props.name}</h3>
        <p className="text-sm text-muted-foreground">{props.category}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            ${props.price.toFixed(2)}
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
