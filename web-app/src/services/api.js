
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://44.200.231.22:5000/api",
  //baseURL: import.meta.env.VITE_API_URL || 'http://192.168.1.4:5000/api',
  //baseURL: import.meta.env.VITE_API_URL || 'http://10.17.87.137:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;