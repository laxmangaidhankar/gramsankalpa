import axios from "axios";
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 12e4,
  // 120s — GEE calls can be slow
});
api.interceptors.request.use((config) => {
  return config;
});
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);
export const apiService = {
  get: (url, params, config) => api.get(url, { params, ...config }),
  post: (url, data, config) => api.post(url, data, config),
  search: (url, params, config) => api.get(url, { params, ...config }),
};
