export default {
  user: {
    login: "/login",
    register: "/register",
    home: "/",
    product: (slug: string) => `/products/${slug}`,
    search: (searchQuery?: string) =>
      `/search${searchQuery ? `?q=${searchQuery}` : ""}`,
    productsByCategory: (category: string) => `/categories/${category}`,
  },
};
