import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// tự động gắn token, khỏi phải set headers tay mỗi lần gọi
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const expiredTime = localStorage.getItem("expiredTime");
  // Check hết hạn trước
  if (expiredTime && Date.now() >= Number(expiredTime)) {
    ["accessToken", "role", "teamRole", "userInfo", "expiredTime", "activeAccount", "userStatus",
      "completeProfileStep", "completeProfileStep1", "completeProfileStep2", "completeProfileStep3", "completeProfileStep4"].forEach(
      (key) => localStorage.removeItem(key)
    );
    window.location.href = "/login";
    return Promise.reject(new Error("Token expired"));
  }

  // Còn hạn thì gắn token bình thường
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Chạy SAU KHI nhận response từ server
axiosClient.interceptors.response.use(
  (response) => response, // 2xx → trả về bình thường
  (error) => {
    // Server trả 401 → token bị revoke hoặc invalid phía server
    if (error.response?.status === 401) {
      ["accessToken", "role", "teamRole", "userInfo", "expiredTime", "activeAccount", "userStatus",
        "completeProfileStep", "completeProfileStep1", "completeProfileStep2", "completeProfileStep3", "completeProfileStep4"].forEach(
        (key) => localStorage.removeItem(key)
      );
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);




export default axiosClient;