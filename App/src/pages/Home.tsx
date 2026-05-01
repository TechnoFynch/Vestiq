import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight, StarIcon, SportShoe, ArrowRightIcon } from "lucide-react";
import React, { useRef } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axiosInstance";
import apiEndpoints from "@/constants/apiEndpoints";
import { Spinner } from "@/components/ui/spinner";
import { useCarouselBasis } from "@/hooks/useCarouselBasis";
import {
  AlertCircle,
  RefreshCw,
  ShoppingBag, // fallback
  Watch,
  Gift,
  Smartphone,
  Laptop,
  House,
  Sparkles,
  Dumbbell,
} from "lucide-react";

// react-icons — pi (Phosphor Icons)
import {
  PiSneaker,
  PiHighHeel,
  PiHandbag,
  PiBackpack,
  PiDiamondsFourBold,
  PiBaseballCapBold,
  PiBabyCarriage,
} from "react-icons/pi";

// react-icons — tb (Tabler Icons)
import { TbShirt, TbJacket } from "react-icons/tb";

// react-icons — gi (Game Icons)
import { GiBootKick, GiDress, GiTrousers, GiBelt } from "react-icons/gi";
import appRoutes from "@/constants/appRoutes";
import type { ProductCardType } from "@/types/ProductCardType";
import ProductCard from "@/components/ui/product-card";

const HeroSection = () => {
  return (
    <section className="min-h-[340px] bg-amber-50 flex items-center py-12">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 md:px-12 flex flex-col items-center gap-10 sm:flex-row sm:justify-between">
        {/* LEFT CONTENT */}
        <div className="flex-1 space-y-5">
          <Badge className="bg-amber-200 text-amber-800 flex items-center gap-1 w-fit">
            <StarIcon className="w-4 h-4" />
            Summer sale - up to 30% off
          </Badge>

          <h1 className="text-4xl font-semibold leading-tight text-neutral-800">
            Discover products
            <br />
            you'll{" "}
            <span className="italic font-bold text-amber-500">
              actually
            </span>{" "}
            love
          </h1>

          <p className="text-base text-neutral-600 leading-relaxed max-w-sm">
            Curated picks across fashion, electronics, home &amp; more. Free
            shipping on orders above ₹499.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <Button
              asChild
              className="rounded-sm bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Link to="/">Shop the sale</Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="rounded-sm bg-neutral-900 text-white hover:bg-neutral-800"
            >
              <Link to="/">Browse all</Link>
            </Button>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="relative w-full sm:w-[256px] h-52 bg-neutral-800 rounded-2xl flex flex-col items-center justify-center shadow-xl">
          {/* Sale badge */}
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Sale
          </span>

          {/* Image placeholder */}
          <div className="bg-white rounded-xl w-24 h-24 flex items-center justify-center shadow-sm mb-3">
            <SportShoe className="w-10 h-10 text-neutral-400" />
          </div>

          {/* Product info */}
          <p className="text-white text-sm font-semibold">
            Summer Collection 2026
          </p>

          <p className="text-amber-400 text-xs mt-1 flex items-center gap-1 cursor-pointer hover:underline">
            Starting ₹799 <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>
    </section>
  );
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  // Footwear
  shoe: PiSneaker,
  footwear: PiSneaker,
  sneaker: PiSneaker,
  boot: GiBootKick,
  sandal: PiHighHeel,
  heel: PiHighHeel,
  // Clothing
  top: TbShirt,
  shirt: TbShirt,
  tee: TbShirt,
  dress: GiDress,
  jacket: TbJacket,
  coat: TbJacket,
  pant: GiTrousers,
  denim: GiTrousers,
  jeans: GiTrousers,
  // Accessories
  bag: PiHandbag,
  handbag: PiHandbag,
  backpack: PiBackpack,
  watch: Watch,
  jewel: PiDiamondsFourBold,
  ring: PiDiamondsFourBold,
  hat: PiBaseballCapBold,
  cap: PiBaseballCapBold,
  belt: GiBelt,
  // Other
  sport: Dumbbell,
  gym: Dumbbell,
  kids: PiBabyCarriage,
  gift: Gift,
  electronic: Smartphone,
  tech: Laptop,
  home: House,
  beauty: Sparkles,
};

const getCategoryIcon = (name: string): React.ElementType => {
  const lower = name.toLowerCase();
  const match = Object.keys(CATEGORY_ICONS).find((kw) => lower.includes(kw));
  return match ? CATEGORY_ICONS[match] : ShoppingBag; // fallback
};

// Deterministic color per index — stable across renders
const PALETTE = [
  { bg: "bg-violet-50", icon: "text-violet-700", accent: "bg-violet-400" },
  { bg: "bg-teal-50", icon: "text-teal-700", accent: "bg-teal-400" },
  { bg: "bg-orange-50", icon: "text-orange-700", accent: "bg-orange-400" },
  { bg: "bg-pink-50", icon: "text-pink-700", accent: "bg-pink-400" },
  { bg: "bg-amber-50", icon: "text-amber-700", accent: "bg-amber-400" },
];

const SKELETON_COUNT = 5;

const CategoryScroller = () => {
  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        apiEndpoints.user.getCategories(),
      );
      return response.data.categories;
    },
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const basis = useCarouselBasis(containerRef);

  // ── Error state ─────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="w-full flex items-center justify-center min-h-36">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-sm">Could not load categories</p>
          <button
            onClick={() => refetch()}
            className="text-xs flex items-center gap-1.5 underline underline-offset-2 hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Shared carousel shell (used for both skeleton + real content) ────────
  const renderItems = () => {
    if (isLoading) {
      return Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <CarouselItem key={i} style={{ flexBasis: basis }}>
          <div className="rounded-xl border border-border p-4 flex flex-col gap-3 h-full">
            <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
            <div className="w-20 h-3 rounded bg-muted animate-pulse" />
            <div className="w-12 h-2.5 rounded bg-muted animate-pulse" />
          </div>
        </CarouselItem>
      ));
    }

    return categories?.map((category: any, i: number) => {
      const palette = PALETTE[i % PALETTE.length];
      const Icon = getCategoryIcon(category.name);

      return (
        <CarouselItem
          key={category.id}
          style={{ flexBasis: basis }}
          className="pl-3"
        >
          <Link
            to={appRoutes.user.products(category.slug)}
            className="group flex flex-col gap-2.5 rounded-xl border border-border bg-background p-4 h-full
                       hover:border-foreground/20 hover:bg-accent/40 transition-colors duration-150"
          >
            <div
              className={`w-9 h-9 rounded-lg ${palette.bg} ${palette.icon} flex items-center justify-center`}
            >
              <Icon size={18} />
            </div>
            <p className="text-sm font-medium text-foreground leading-tight">
              {category.name}
            </p>
            {category.productCount != null && (
              <p className="text-xs text-muted-foreground">
                {category.productCount} items
              </p>
            )}
          </Link>
        </CarouselItem>
      );
    });
  };

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="w-full px-10 my-8">
      {" "}
      {/* px-10 gives buttons room */}
      <Carousel opts={{ align: "start", dragFree: true }}>
        <CarouselContent className="-ml-3">
          {" "}
          {/* tighten gap slightly */}
          {renderItems()}
        </CarouselContent>
        {!isLoading && (
          <>
            <CarouselPrevious className="-left-4" />{" "}
            {/* re-anchor inside padding */}
            <CarouselNext className="-right-4" />
          </>
        )}
      </Carousel>
    </div>
  );
};

const Home = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products"],
    queryFn: () =>
      axiosInstance.get(
        apiEndpoints.user.searchProducts({
          limit: 5,
          page: 1,
          productRatingMin: 4,
        }),
      ),
  });
  return (
    <div>
      <HeroSection />
      <div className="flex-col items-start justify-start gap-2">
        <h1 className="text-xl font-semibold mt-4 flex items-center gap-2">
          Browse by Category <ArrowRightIcon />
        </h1>
        <CategoryScroller />
      </div>
      <div className="flex-col items-start justify-start gap-4">
        <h1>Explore top products</h1>
        {data &&
          data.data.products.map((product: ProductCardType) => (
            <ProductCard {...product} />
          ))}
      </div>
    </div>
  );
};

export default Home;
