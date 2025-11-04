import axios from 'axios';
import axiosClient from './axiosClient';

import type { HoSoDocument, ApiResponse } from './types';

const uploadClient = axios.create({
  baseURL: axiosClient.defaults.baseURL,
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: axiosClient.defaults.headers.common.Authorization,
  },
});

export const fileApi = {
  upload: (hoso_id: string, file: File) => {
    const form = new FormData();
    form.append('hoso_id', hoso_id);
    form.append('file', file);
    return uploadClient.post<ApiResponse<HoSoDocument>>('/files/upload', form).then(r => r.data.data);
  },

  getByHoSoId: (hoso_id: string) =>
    axiosClient.get<ApiResponse<HoSoDocument[]>>(`/files/hoso/${hoso_id}`).then(r => r.data.data),

  getById: (doc_id: string) =>
    axiosClient.get<ApiResponse<HoSoDocument>>(`/files/${doc_id}`).then(r => r.data.data),

  delete: (doc_id: string) =>
    axiosClient.delete<ApiResponse<any>>(`/files/${doc_id}`).then(r => r.data.data),
};