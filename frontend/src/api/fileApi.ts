import axios from 'axios';
import axiosClient from './axiosClient';

import type { HoSoDocument } from './types';

const uploadClient = axios.create({
  baseURL: axiosClient.defaults.baseURL,
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: axiosClient.defaults.headers.common.Authorization,
  },
});

export const fileApi = {
  upload: (formData: FormData) => {
  return axiosClient.post('/file/submit', formData);
  },
  getByHoSoId: (hoso_id: string) =>
    axiosClient.get<HoSoDocument[]>(`/file/hoso/${hoso_id}`).then(r => r.data),

  getById: (doc_id: string) =>
    axiosClient.get<HoSoDocument>(`/file/${doc_id}`).then(r => r.data),

  delete: (doc_id: string) =>
    axiosClient.delete<any>(`/file/${doc_id}`).then(r => r.data.data),
};