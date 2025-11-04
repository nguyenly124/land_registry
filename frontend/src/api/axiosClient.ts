// src/api/axiosClient.ts
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});
  axiosClient.interceptors.request.use(
    (config) => {
      const authUser = sessionStorage.getItem('authUser');
      if (authUser) {
        try {
          const user = JSON.parse(authUser);
          if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        } catch (e) {
          console.error('Lỗi parse authUser:', e);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const isTokenError =
      err.response?.status === 401 &&
      (!err.response?.data?.message ||
        err.response?.data?.message.includes("token") ||
        err.response?.data?.message.includes("Token") ||
        err.response?.data?.message.includes("expired"));

    if (isTokenError) {
      alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.");
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authUser');
      
      window.location.href = '/';
    }

    
    return Promise.reject(err);
  }
);
export default axiosClient;
