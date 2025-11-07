// src/components/dossier/CreateDossierModal.tsx
import { useState, useEffect } from "react";
import { dossierApi } from "../../api/dossierApi";
import { fileApi } from "../../api/fileApi";
import { landApi } from "../../api/landApi";
import type { LandParcel, HoSo } from "../../api/types";
import { X, Upload, AlertCircle, Loader2, User, FileText } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: (hoso: HoSo) => void;
}

export default function CreateDossierModal({ onClose, onSuccess }: Props) {
  const [type, setType] = useState("");
  const [parcelCode, setParcelCode] = useState(""); 
  const [parcelId, setParcelId] = useState("");     
  const [files, setFiles] = useState<File[]>([]);
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Thông tin người nhận (chuyển nhượng)
  const [receiverName, setReceiverName] = useState("");
  const [receiverIdNumber, setReceiverIdNumber] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");

  // Load thửa đất (chỉ dùng cho chuyển nhượng)
  useEffect(() => {
    if (type === "Chuyển nhượng") {
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
    }
  }, [type]);

  // Danh sách file bắt buộc
  const requiredFiles = type === "Đăng ký sử dụng"
    ? ["Sổ đỏ", "CMND/CCCD"]
    : type === "Chuyển nhượng"
    ? ["Hợp đồng chuyển nhượng", "CMND/CCCD người chuyển", "CMND/CCCD người nhận", "Sổ đỏ"]
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!type) return alert("Vui lòng chọn loại hồ sơ");
  if (files.length === 0) return alert("Vui lòng tải lên tài liệu");

  setUploading(true);
  try {
    let finalParcelId: number | undefined = undefined;

    // === ĐĂNG KÝ SỬ DỤNG: Tìm parcel_id từ parcel_code ===
    if (type === "Đăng ký sử dụng") {
      if (!parcelCode.trim()) {
        return alert("Vui lòng nhập mã thửa đất");
      }
      
      // Gọi API tìm thửa đất theo mã
      const parcel = await landApi.searchid({ query: parcelCode.trim() });

      if (!parcel) {
        return alert(`Không tìm thấy thửa đất với mã: ${parcelCode}`);
      }

      finalParcelId = parcel.parcel_id;
    }
    // === CHUYỂN NHƯỢNG: Dùng parcelId đã chọn ===
    if (type === "Chuyển nhượng") {
      if (!parcelId) return alert("Vui lòng chọn thửa đất");
      finalParcelId = Number(parcelId);
    }

    // === TẠO PAYLOAD CHUNG ===
    const payload: any = {
      type,
      parcelId: finalParcelId,
    };

    if (type === "Chuyển nhượng") {
      payload.receiver_info = {
        full_name: receiverName.trim(),
        id_number: receiverIdNumber.trim(),
        phone: receiverPhone.trim(),
        address: receiverAddress.trim(),
      };
    }
    const hosoRes = await dossierApi.submit(payload);
    const hosoId = hosoRes.data.hoso_id;

    // === UPLOAD FILE ===
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('hoso_id', hosoId.toString());
    await fileApi.upload(formData);

    onSuccess(hosoRes.data);
    onClose();
    alert("Nộp hồ sơ thành công!");

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
          <button aria-label="close" onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
              onChange={(e) => {
                setType(e.target.value);
                setParcelCode("");
                setParcelId("");
                setReceiverName("");
                setReceiverIdNumber("");
                setReceiverPhone("");
                setReceiverAddress("");
              }}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">-- Chọn loại hồ sơ --</option>
              <option value="Đăng ký sử dụng">Đăng ký sử dụng</option>
              <option value="Chuyển nhượng">Chuyển nhượng</option>
            </select>
          </div>

          {/* THỬA ĐẤT */}
          {type === "Đăng ký sử dụng" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã thửa đất <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={parcelCode}
                  onChange={(e) => setParcelCode(e.target.value)}
                  placeholder="VD: ABC-123-XYZ"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Nhập chính xác mã thửa đất cần đăng ký</p>
            </div>
          )}

          {type === "Chuyển nhượng" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thửa đất chuyển nhượng <span className="text-red-500">*</span>
              </label>
              {loading ? (
                <div className="px-4 py-2.5 text-gray-500">Đang tải danh sách thửa đất...</div>
              ) : (
                <select
                  aria-label="land"
                  value={parcelId}
                  onChange={(e) => setParcelId(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">-- Chọn thửa đất --</option>
                  {parcels.map(p => (
                    <option key={p.parcel_id} value={p.parcel_id}>
                      {p.parcel_code} - {p.address} (Diện tích: {p.area} m²)
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* THÔNG TIN NGƯỜI NHẬN (CHUYỂN NHƯỢNG) */}
          {type === "Chuyển nhượng" && (
            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-blue-700" />
                <h4 className="font-semibold text-blue-900">Thông tin người nhận chuyển nhượng</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Nguyễn Văn B"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CMND/CCCD <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={receiverIdNumber}
                    onChange={(e) => setReceiverIdNumber(e.target.value)}
                    placeholder="123456789"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    placeholder="123 Đường ABC, Quận 1, TP.HCM"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          )}

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

            {files.length > 0 && (
              <div className="mt-3 space-y-1">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                    <span className="truncate max-w-xs">{file.name}</span>
                    <button
                      aria-label="file"
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