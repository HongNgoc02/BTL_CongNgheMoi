import axios from "axios";
// Import bộ nhớ dành riêng cho Mobile
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  // Tạm thời fix cứng link trực tiếp để test, giữ nguyên :5000
  baseURL: "http://44.200.231.22:5000/api",
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