import { removeToken } from "@/features/slices/authSlice";
import store from "@/features/store";
import axios from "axios";
import { toast } from "sonner";

const baseUrl = import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(removeToken());
      toast.error("Please login again!");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
