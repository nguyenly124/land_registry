// dossierApi.ts - Viết lại kết nối API dựa trên controller
import axiosClient from './axiosClient';
import type {
  SubmitHoSoRequest, UpdateHoSoRequest, GetHistoryResponse,
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

  getHistory: async (
    hoso_id: string,
    page = 1,
    limit = 10
  ): Promise<GetHistoryResponse> => {
    const response = await axiosClient.get(`/dossier/history/${hoso_id}`, {
      params: { page, limit },
    });
    return response.data;
  },
  // Lấy hồ sơ theo ID - GET /dossiers/:id
  getdetail: (id: string) =>
    axiosClient.get<HoSoResponse>(`/dossier/getdetail/${id}`).then(r => r.data),

  // Cập nhật hồ sơ - PATCH /dossiers/update
  edit: (data: UpdateHoSoRequest) =>
    axiosClient.put<HoSoResponse>('/dossier/edit', data).then(r => r.data),

  // Hủy hồ sơ - PATCH /dossiers/cancel
  cancel: (hosoId: number) =>
    axiosClient.put<HoSoResponse>(`/dossier/cancel/${hosoId}`),

  approve: (hosoId: number) => axiosClient.patch(`/dossier/${hosoId}/approve`),
  reject: (hosoId:number , reason: string) => axiosClient.patch(`/dossier/${hosoId}/reject`, { reason }),
  requestSupplement: (hosoId: number, reason: string) => axiosClient.patch(`/dossier/${hosoId}/supplement`, { reason }),
  confirmProcessing: (hosoId: number) => axiosClient.patch(`/dossier/${hosoId}/confirm`),
  // Tìm kiếm hồ sơ - GET /dossiers/search
  search: (params: {
    query?: string;
    page?: number;
    limit?: number;
    status?: string;
    account_id?: number;
    parcel_id?: number;
  }) => axiosClient.get<HoSoListResponse>('/dossier/search', { params }).then(r => r.data),
};