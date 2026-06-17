import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// tự động gắn token, khỏi phải set headers tay mỗi lần gọi
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;