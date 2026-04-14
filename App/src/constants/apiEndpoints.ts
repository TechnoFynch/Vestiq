export default {
  register: "/auth/register",
  login: "/auth/login",
  user: {
    getCart: "/cart",
    suggestProducts: (query: string) => `/product/suggest?query=${query}`,
  },
};
