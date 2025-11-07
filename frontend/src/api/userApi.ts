// userApi.ts
import axiosclient from './axiosClient';
import type {
 
  ChangePasswordRequest,
  CreateStaffRequest,
  GetProfileResponse,
  GetUsersByRoleResponse,
  UpdateProfileResponse,
  ChangePasswordResponse,
  CreateStaffResponse,
  UploadAvatarResponse,
  UpdateProfileRequest,
  
} from './types';

export const userApi = {
  getProfile: () =>
    axiosclient.get<GetProfileResponse>('/user/getProfile').then(r => r.data),

  getUsersByRole: (role?: 'Người dân' | 'Cán bộ' | 'Tất cả') =>{
    if (!role || role === 'Tất cả') {
      // Không truyền role hoặc role = "Tất cả" → gọi /users
      return axiosclient.get<GetUsersByRoleResponse>('/user').then(r => r.data);
    } else {
      // Truyền role hợp lệ → gọi /users/role/...
      return axiosclient.get<GetUsersByRoleResponse>(`/user/${role}`).then(r => r.data);
    }
  },

  updateProfile: (data:UpdateProfileRequest ) =>
    axiosclient.put<UpdateProfileResponse>('/user/profile', data).then(r => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    axiosclient.put<ChangePasswordResponse>('/user/changePassword', data).then(r => r.data),

  createStaff: (data: CreateStaffRequest) =>
    axiosclient.post<CreateStaffResponse>('/user/createstaff', data).then(r => r.data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosclient.post<UploadAvatarResponse>('/user/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  }
};