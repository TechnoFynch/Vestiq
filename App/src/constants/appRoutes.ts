export default {
  user: {
    login: "/login",
    register: "/register",
    home: "/",
    products: (slug: string) => `/products/${slug}`,
    search: "/products/search",
  },
};
