import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import appRoutes from "@/constants/appRoutes";
import type { ProductSuggestion } from "@/types/ProductSuggestion";
import { StarIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const ProductSuggestionListItem = (props: ProductSuggestion) => {
  return (
    <Item variant="outline" asChild role="listitem">
      <Link to={appRoutes.user.product(props.slug)}>
        <ItemMedia variant="image">
          <img src={props.thumb} alt={props.name} width={32} height={32} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">
            {props.name} in{" "}
            <span className="text-muted-foreground">{props.category}</span>
          </ItemTitle>
          <ItemDescription className="flex gap-1 items-center justify-start">
            <StarIcon className="w-4 h-4" /> {props.averageRating}/5
          </ItemDescription>
        </ItemContent>
        <ItemContent className="flex-non text-center">
          ${props.price}
        </ItemContent>
      </Link>
    </Item>
  );
};

export default ProductSuggestionListItem;
