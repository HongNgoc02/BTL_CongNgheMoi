import axios from "axios";
// Import bộ nhớ dành riêng cho Mobile
import AsyncStorage from '@react-native-async-storage/async-storage';

// Địa chỉ backend cố định (HTTPS qua Nginx + Let's Encrypt trên EC2). URL này KHÔNG đổi.
export const SERVER_URL = "https://api.cnmvchat.click";

const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
});

// Thêm async vì AsyncStorage trên điện thoại cần thời gian chờ (await)
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.log("Lỗi lấy token", e);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
      } catch (e) {
         console.log("Lỗi xóa token", e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;