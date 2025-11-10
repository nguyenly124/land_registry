import axiosclient from './axiosClient';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from './types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await axiosclient.post<LoginResponse>('/auth', data);
    return res.data; 
  },
  
  // Gửi OTP
  sendOTP: async (email: string): Promise<{ message: string }> => {
    const res = await axiosclient.post('/auth/send-otp', { email });
    return res.data;
  },
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const res = await axiosclient.post("/auth/forgot-password", { email: email });
    return res.data;
  },

   resetPassword: async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    const res = await axiosclient.post('/auth/reset-password', { email, otp, newPassword });
    return res.data;
  },

  // Xác thực OTP
  verifyOTP: async (email: string, otp: string): Promise<{ message: string }> => {
    const res = await axiosclient.post('/auth/verify-otp', { email, otp });
    return res.data;
  },

  // Đăng ký cuối cùng
  register: async (data: RegisterRequest) => {
  try {
    const res = await axiosclient.post('/auth/register', data);
    return res.data;
  } catch (err: any) {
    throw err;
  }
},

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const res = await axiosclient.post<RefreshTokenResponse>('/auth/refresh', data);
    return res.data;
  },
};