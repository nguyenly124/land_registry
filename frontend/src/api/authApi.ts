import axiosclient from './axiosClient';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from './types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await axiosclient.post<LoginResponse>('/auth', data);
    console.log("Raw API /auth response:", res.data);
    return res.data; 
  },
  
  // Gửi OTP
  sendOTP: async (email: string): Promise<{ message: string }> => {
    const res = await axiosclient.post('/auth/send-otp', { email });
    return res.data;
  },

  // Xác thực OTP
  verifyOTP: async (email: string, otp: string): Promise<{ message: string }> => {
    const res = await axiosclient.post('/auth/verify-otp', { email, otp });
    return res.data;
  },

  // Đăng ký cuối cùng
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const res = await axiosclient.post<RegisterResponse>('/auth/register', data);
    return res.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const res = await axiosclient.post<RefreshTokenResponse>('/auth/refresh', data);
    return res.data;
  },
};