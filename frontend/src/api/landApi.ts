// src/api/landApi.ts
import axiosClient from "./axiosClient";
import type { LandParcel, LandListResponse,CreateLandRequest,UpdateLandRequest } from "./types";



export const landApi = {
  // Lấy tất cả (cán bộ)
  getAll: () =>
    axiosClient.get<LandListResponse>("/lands").then(r=>r.data),

  // Lấy theo ID
  getById: (id: string) =>
    axiosClient.get<{ message: string; data: LandParcel }>(`/lands/${id}`),

  // Tạo mới
  create: async (data: any) => {
    console.log("API landApi.create - Payload gửi đi:");
    console.log(JSON.stringify(data, null, 2)); 

    try {
      const res = await axiosClient.post("/lands", data);
      console.log("API thành công - Response:", res.data);
      return res.data;
    } catch (error: any) {
      console.error("API lỗi - Response:", error.response?.data);
      throw error;
    }
  },

  // Cập nhật
  update: (id: string, data: UpdateLandRequest) =>
    axiosClient.put<{ message: string; data: LandParcel }>(`/lands/${id}`, data),

  // Tìm kiếm (cán bộ + người dân)
  search: (params: {
    page?: number;
    limit?: number;
    parcel_code?: string;
    address?: string;
    owner_id?: string;
  }) =>
    axiosClient.get<LandListResponse>("/lands/search", { params }),
};