// src/components/dossier/CreateDossierModal.tsx
import { useState, useEffect } from "react";
import { dossierApi } from "../../api/dossierApi";
import { fileApi } from "../../api/fileApi";
import { landApi } from "../../api/landApi";
import type { LandParcel, HoSo } from "../../api/types";
import { X, Upload, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: (hoso: HoSo) => void;
}

export default function CreateDossierModal({ onClose, onSuccess }: Props) {
  const [type, setType] = useState("");
  const [parcelId, setParcelId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load thửa đất của người dùng
  useEffect(() => {
    const loadParcels = async () => {
      try {
        setLoading(true);
        const res = await landApi.getAll();
        setParcels(res.data);
      } catch (err) {
        alert("Lỗi tải danh sách thửa đất");
      } finally {
        setLoading(false);
      }
    };
    loadParcels();
  }, []);

  // Danh sách file bắt buộc theo loại hồ sơ
  const requiredFiles = type === "Đăng ký sử dụng"
    ? ["Sổ đỏ", "CMND/CCCD"]
    : type === "Chuyển nhượng"
    ? ["Hợp đồng chuyển nhượng", "CMND/CCCD", "Sổ đỏ"]
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return alert("Vui lòng chọn loại hồ sơ");
    if (files.length === 0) return alert("Vui lòng tải lên ít nhất 1 tài liệu");

    setUploading(true);
    try {
      // BƯỚC 1: TẠO HỒ SƠ
      const hosoRes = await dossierApi.submit({
        type,
        parcelId: parcelId || undefined,
      });
      console.log(">>> Hồ sơ tạo xong:", hosoRes);
      const hosoId = hosoRes.data.hoso_id;
      console.log("id ho so:", hosoId);
      // BƯỚC 2: UPLOAD FILE
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('hoso_id', hosoId.toString());

      // await fileApi.upload(formData);
      console.log(">>> Bắt đầu upload file");

      await fileApi.upload(formData);

      console.log(">>> Upload thành công");
      // THÀNH CÔNG
      onSuccess(hosoRes.data);
      onClose();
      alert("Nộp hồ sơ và tài liệu thành công!");

    } catch (err: any) {
      const msg = err.response?.data?.message || "Lỗi khi xử lý hồ sơ";
      alert(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-900">Tạo hồ sơ mới</h3>
          <button 
            aria-label="create"
            onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* LOẠI HỒ SƠ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại hồ sơ <span className="text-red-500">*</span>
            </label>
            <select
              aria-label="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">-- Chọn loại hồ sơ --</option>
              <option value="Đăng ký sử dụng">Đăng ký sử dụng</option>
              <option value="Chuyển nhượng">Chuyển nhượng</option>
            </select>
          </div>

          {/* THỬA ĐẤT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thửa đất (tùy chọn)
            </label>
            {loading ? (
              <div className="px-4 py-2.5 text-gray-500">Đang tải...</div>
            ) : (
              <select
                aria-label="loading"
                value={parcelId}
                onChange={(e) => setParcelId(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Không chọn thửa đất --</option>
                {parcels.map(p => (
                  <option key={p.parcel_id} value={p.parcel_id}>
                    {p.parcel_code} - {p.address}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* TẢI FILE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tải tài liệu lên <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
              >
                Chọn file
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Hỗ trợ: PDF, JPG, PNG (tối đa 10MB)
              </p>
            </div>

            {/* DANH SÁCH FILE */}
            {files.length > 0 && (
              <div className="mt-3 space-y-1">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                    <span className="truncate max-w-xs">{file.name}</span>
                    <button
                      aria-label="filename"
                      type="button"
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* YÊU CẦU FILE */}
            {requiredFiles.length > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Yêu cầu tài liệu:</p>
                  <ul className="list-disc list-inside text-amber-700">
                    {requiredFiles.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* NÚT */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={uploading || !type || files.length === 0}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
              Nộp hồ sơ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}