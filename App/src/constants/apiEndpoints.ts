export default {
  register: "/auth/register",
  login: "/auth/login",
  user: {
    getCart: "/cart",
    suggestProducts: (query: string) => `/product/suggest?query=${query}`,
    getCategories: (parentId?: string) =>
      `/category?parent_id=${parentId ? `${parentId}` : "null"}`,
    searchProducts: (filters?: {
      query?: string;
      category?: string;
      brand?: string;
      priceMin?: number;
      priceMax?: number;
      productRatingMin?: number;
      productRatingMax?: number;
      sortBy?: string;
      sortType?: "ASC" | "DESC";
      page?: number;
      limit?: number;
    }) => {
      if (!filters) return "/products";
      const params = new URLSearchParams();
      if (filters.query) params.set("q", filters.query);
      if (filters.category) params.set("category", filters.category);
      if (filters.brand) params.set("brand", filters.brand);
      if (filters.priceMin) params.set("priceMin", String(filters.priceMin));
      if (filters.priceMax) params.set("priceMax", String(filters.priceMax));
      if (filters.productRatingMin)
        params.set("productRatingMin", String(filters.productRatingMin));
      if (filters.productRatingMax)
        params.set("productRatingMax", String(filters.productRatingMax));
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortType) params.set("sortType", filters.sortType);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      const qs = params.toString();
      return `/products${qs ? `?${qs}` : ""}`;
    },
  },
};
