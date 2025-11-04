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

  getUsersByRole: (role: 'Người dân' | 'Cán bộ') =>
    axiosclient.get<GetUsersByRoleResponse>(`/user/getUsersByRole/${role}`).then(r => r.data),

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