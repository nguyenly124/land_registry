// dossierApi.ts - Viết lại kết nối API dựa trên controller
import axiosClient from './axiosClient';
import type {
  SubmitHoSoRequest, UpdateHoSoRequest, ApproveHoSoRequest, CancelHoSoRequest,
  HoSoResponse, HoSoListResponse
} from './types';

export const dossierApi = {
  // Nộp hồ sơ mới - POST /dossiers/submit
  submit: (data: SubmitHoSoRequest) =>
    axiosClient.post<HoSoResponse>('/dossier/submit', data).then(r => r.data),

  // Lấy tất cả hồ sơ - GET /dossiers
  getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    axiosClient
      .get<HoSoListResponse>('/dossier/getall', { params }) 
      .then(r => r.data),

  // Lấy hồ sơ theo ID - GET /dossiers/:id
  getdetail: (id: string) =>
    axiosClient.get<HoSoResponse>(`/dossier/getdetail/${id}`).then(r => r.data),

  // Cập nhật hồ sơ - PATCH /dossiers/update
  edit: (data: UpdateHoSoRequest) =>
    axiosClient.put<HoSoResponse>('/dossier/edit', data).then(r => r.data),

  // Hủy hồ sơ - PATCH /dossiers/cancel
  cancel: (data: CancelHoSoRequest) =>
    axiosClient.put<HoSoResponse>('/dossier/cancel', data).then(r=> r.data),

  approve: (hosoId: string) => axiosClient.patch(`/dossiers/${hosoId}/approve`),
  reject: (hosoId: string, reason: string) => axiosClient.patch(`/dossiers/${hosoId}/reject`, { reason }),
  requestSupplement: (hosoId: string, note: string) => axiosClient.patch(`/dossiers/${hosoId}/supplement`, { note }),
  confirmProcessing: (hosoId: string) => axiosClient.patch(`/dossiers/${hosoId}/confirm`),
  // Tìm kiếm hồ sơ - GET /dossiers/search
  search: (params: {
    query?: string;
    page?: number;
    limit?: number;
    status?: string;
    account_id?: string;
    parcel_id?: string;
  }) => axiosClient.get<HoSoListResponse>('/dossier/search', { params }).then(r => r.data),
};