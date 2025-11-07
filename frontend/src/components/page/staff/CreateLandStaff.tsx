// src/components/page/staff/CreateLandStaff.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { landApi } from "../../../api/landApi";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ParcelMap from "../../common/ParcelMap";
import type { LandParcel } from "../../../api/types";

// === SCHEMA ===
const createLandSchema = z.object({
  parcel_code: z.string().min(1).max(100),
  address: z.string().min(1).max(255),
  area: z.number().positive(),
  
  owner_id: z
    .string()
    .transform((val) => (val === "" ? null : val)) 
    .nullable()  
    .optional(),

  land_type: z.string().max(100).optional(),
  certificate_number: z.string().max(100).optional(),

  certificate_issue_date: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),

  registration_status: z.enum(["Chưa cấp", "Đang xử lý", "Đã cấp"]).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

type CreateLandForm = z.infer<typeof createLandSchema>;

const createPreviewParcel = (data: Partial<CreateLandForm>): LandParcel | null => {
  if (!data.latitude || !data.longitude) return null;
  return {
    parcel_id: "preview",
    parcel_code: data.parcel_code || "Chưa nhập mã",
    address: data.address || "Chưa nhập địa chỉ",
    area: data.area || 0,
    latitude: data.latitude,
    longitude: data.longitude,
    owner_id: data.owner_id,
    land_type: data.land_type,
    certificate_number: data.certificate_number,
    certificate_issue_date: data.certificate_issue_date,
    registration_status: data.registration_status,
  } as LandParcel;
};

export default function CreateLandStaff() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateLandForm>({
    resolver: zodResolver(createLandSchema),
    defaultValues: {
      latitude: 10.775,
      longitude: 106.695,
    },
  });

  const formValues = useWatch({ control });
  const previewParcel = createPreviewParcel(formValues);

  const onSubmit = async (data: CreateLandForm) => {
    setSubmitting(true);

    // LOG 1: DỮ LIỆU FORM TRƯỚC KHI GỬI
    console.log("Form Submit – Dữ liệu người dùng nhập:");
    console.log(JSON.stringify(data, null, 2));

    try {
      // LOG 2: ĐƯỢC GỌI TRONG landApi.create
      await landApi.create(data);
      alert("Tạo thửa đất thành công!");
      navigate("/landstaff");
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi tạo thửa đất");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          Back to list
        </button>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-8">
            Tạo thửa đất mới
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* === THÔNG TIN CƠ BẢN === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã thửa đất <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("parcel_code")}
                  placeholder="VD: 01A.02B.03"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.parcel_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.parcel_code.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("address")}
                  placeholder="Số 10, Đường Hùng Vương, P.6, TP.HCM"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diện tích (m²) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("area", { valueAsNumber: true })}
                  placeholder="150.50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.area && (
                  <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại đất
                </label>
                <select
                  {...register("land_type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Chọn loại đất --</option>
                  <option value="Đất ở đô thị">Đất ở đô thị</option>
                  <option value="Đất nông nghiệp">Đất nông nghiệp</option>
                  <option value="Đất thương mại">Đất thương mại</option>
                </select>
              </div>
            </div>

            {/* === CHỦ SỞ HỮU === */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID chủ sở hữu (nếu có)
              </label>
              <input
                type="number"
                {...register("owner_id")}
                placeholder="Để trống nếu chưa có chủ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* === GIẤY CHỨNG NHẬN === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số GCN
                </label>
                <input
                  {...register("certificate_number")}
                  placeholder="AB123456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày cấp GCN
                </label>
                <input
                  type="date"
                  {...register("certificate_issue_date")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái đăng ký
                </label>
                <select
                  {...register("registration_status")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Chọn trạng thái --</option>
                  <option value="Chưa cấp">Chưa cấp</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đã cấp">Đã cấp</option>
                </select>
              </div>
            </div>

            {/* === TỌA ĐỘ + BẢN ĐỒ XEM TRƯỚC === */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vĩ độ (Latitude)
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    {...register("latitude", { valueAsNumber: true })}
                    placeholder="10.775"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.latitude && (
                    <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kinh độ (Longitude)
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    {...register("longitude", { valueAsNumber: true })}
                    placeholder="106.695"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.longitude && (
                    <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
                  )}
                </div>
              </div>

              {/* GỌI LẠI ParcelMap */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xem trước vị trí trên bản đồ
                </label>
                {previewParcel ? (
                  <ParcelMap land={previewParcel} />
                ) : (
                  <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 border-2 border-dashed">
                    Nhập tọa độ để xem bản đồ
                  </div>
                )}
              </div>
            </div>

            {/* === NÚT HÀNH ĐỘNG === */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-70"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo thửa đất"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}