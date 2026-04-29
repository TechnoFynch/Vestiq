export default {
  user: {
    login: "/login",
    register: "/register",
    home: "/",
    product: (slug: string) => `/products/${slug}`,
    search: "/products/search",
  },
};
