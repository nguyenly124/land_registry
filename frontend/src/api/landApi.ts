// src/api/landApi.ts
import axiosClient from "./axiosClient";
import type { LandParcel,LandListResponse } from "./types";
export const landApi = {
  getById: (id: string) =>
    axiosClient.get<{ message: string; data: LandParcel }>(`/lands/${id}`).then(r => r.data),
  getAll: ()=>
    axiosClient.get<LandListResponse>(`/lands`).then(r => r.data),
};