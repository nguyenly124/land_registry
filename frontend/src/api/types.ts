
export interface AuthUser {
  account_id: string;
  username: string;
  role: 'Người dân' | 'Cán bộ';
  token: string;      
}
export interface LoginResponse {
  message: string;
  token: string;
  user: {
    account_id: string;
    username: string;
    role: 'Người dân' | 'Cán bộ';
    last_login?: string;
  };
}

export interface RegisterResponse {
  message: string;
  user: {
    account_id: string;
    username: string;
    role: 'Người dân' | 'Cán bộ';
  };
}

export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}


export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  full_name: string;
  dob: string;
  address: string;
  phone: string;
  email: string;
  cccd: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// === USER ===
export interface UserProfile {
  full_name: string;
  dob: string;
  address: string;
  phone: string;
  email: string;
  cccd: string;
  position?: string;
  agency?: string;
  staff_code?: string;
  avatar_url?: string | undefined  ;
}

export interface Account {
  account_id: string;
  username: string;
  role: 'Người dân' | 'Cán bộ';
  last_login?: string;
  last_password_change?: string;
  UserProfile?: UserProfile;
}

// === API RESPONSES  ===
export interface GetProfileResponse {
  message: string;
  data: Account;
}

export interface GetUsersByRoleResponse {
  message: string;
  count: number;
  data: Account[];
}
export interface UpdateProfileRequest {
  full_name?: string | null;
  dob?: string | null; 
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}
export interface UpdateProfileResponse {
  message: string;
  profile: UserProfile;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface CreateStaffResponse {
  message: string;
  account: {
    account_id: string;
    username: string;
    role: 'Cán bộ';
  };
  profile: UserProfile;
}

export interface UploadAvatarResponse {
  message: string;
  avatar_url: string;
}

// === REQUEST BODIES ===
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface CreateStaffRequest {
  username: string;
  password: string;
  full_name: string;
  dob: string;
  address: string;
  phone: string;
  email: string;
  cccd: string;
  position: string;
  agency: string;
  staff_code: string;
}

// === LAND ===
export interface LandParcel {
  id: string;
  parcel_code: string;
  address: string;
  area: number;
  description?: string;
  owner_id: string;
  owner?: {
    account_id: string;
    username: string;
    role: string;
    UserProfiles?: UserProfile[];
  };
}

export interface CreateLandRequest {
  parcel_code: string;
  address: string;
  area: number;
  owner_id: string;
  description?: string;
}

export interface LandListResponse {
  message: string;
  items: LandParcel[];
  count: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

// === DOSSIER (Hồ sơ) ===
export interface HoSoDocument {
  doc_id: string;
  hoso_id: string;
  doc_name: string;
  file_path: string;
  uploaded_at: string;
}

export interface HoSo {
  hoso_id: string;
  account_id: string;
  parcel_id?: string;
  type: string;
  status: 'Chờ xử lý' | 'Đang xử lý' | 'Đã duyệt' | 'Từ chối';
  created_at: string;
  updated_at: string;
  account?: {
    username: string;
    role: string;
    UserProfile?: {
      full_name: string;
      phone:string;
      email:string;
    };
  };
  parcel?: {
    parcel_code: string;
    address: string;
    area?: number;
  };
  HoSoDocuments?: {
    doc_id:string,
    doc_name:string,
    file_path:string,
    uploaded_at:string;
  }[];
}

export interface SubmitHoSoRequest {
  type: string;
  parcelId?: string;
}
export interface HoSoResponse {
  message: string;
  data: HoSo;
}
export interface CancelHoSoRequest {
  hosoId: string;
}
export interface UpdateHoSoRequest {
  hosoId: string;
  type?: string;
  parcelId?: string;
}

export interface ApproveHoSoRequest {
  hosoId: string;
  action: 'Đã duyệt' | 'Từ chối' | 'Đang xử lý';
}

export interface HoSoListResponse {
 success: boolean;
  message: string;
  data: HoSo[];
  count: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// === NOTIFICATION ===
export interface Notification {
  notification_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  message: string;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetUnreadNotificationsResponse {
  success: boolean;
  message: string;
  count: number;
  data: Notification[];
}

export interface MarkAsReadRequest {
  notificationId: number;
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
  data?: Notification;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

// === FILE ===
export interface UploadDocumentRequest {
  hoso_id: string;
  file: File;
}

export interface UploadDocumentResponse {
  message: string;
  doc_id: string;
  file_path: string;
}