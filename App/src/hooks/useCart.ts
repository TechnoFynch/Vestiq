import apiEndpoints from "@/constants/apiEndpoints";
import store from "@/features/store";
import { axiosInstance } from "@/services/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const fetchCart = async () => {
  const res = await axiosInstance.get(apiEndpoints.user.getCart);
  return res.data;
};

export const useCart = () => {
  const token = store.getState().auth.token;

  return useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!token,
  });
};
