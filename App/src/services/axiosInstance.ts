import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = ""; // TODO: Get token from store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Clear state
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
