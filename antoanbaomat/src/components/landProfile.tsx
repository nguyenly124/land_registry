import React, { useEffect, useMemo, useState } from "react";
import {
  landRecords as initialLandRecords,
  statusMap,
  statusColorMap,
  formatDate,
} from "../data/data";
import type { LandRecord } from "../data/data";

/** Ghép lớp màu (class) theo statusColorMap */
function badgeClasses(status: LandRecord["status"]) {
  const color = statusColorMap[status];
  // Lưu ý: nếu dùng Tailwind, class động dạng bg-${color}-100 có thể cần cấu hình safelist
  return `px-3 py-1 rounded-full bg-${color}-100 text-${color}-700`;
}

export default function LandProfile() {
  const recordsPerPage = 3;

  // Bản sao cục bộ của danh sách hồ sơ để UI phản hồi ngay khi thêm/sửa
  const [records, setRecords] = useState<LandRecord[]>([...initialLandRecords]);
  const [currentPage, setCurrentPage] = useState(1);

  // Trạng thái hiện/ẩn modal đăng ký hồ sơ mới
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Trường dữ liệu của form đăng ký
  const [form, setForm] = useState({
    ownerName: "",
    ownerID: "",
    plotNumber: "",
    area: "",
    address: "",
    purpose: "",
  });

  // Nếu có authUser trong localStorage, tự động điền Họ tên & CCCD
  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) {
        const auth = JSON.parse(raw) as { username?: string; CCCD?: string };
        setForm((f) => ({
          ...f,
          ownerName: auth.username ?? f.ownerName,
          ownerID: auth.CCCD ?? f.ownerID,
        }));
      }
    } catch {
      // Bỏ qua lỗi đọc/parse localStorage
    }
    // chỉ chạy 1 lần khi mount
  }, []);

  // Giá trị dẫn xuất: tổng số trang
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(records.length / recordsPerPage)),
    [records.length]
  );

  // Danh sách hồ sơ của trang hiện tại
  const currentRecords = useMemo(
    () =>
      records.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
      ),
    [records, currentPage]
  );

  // Đặt lại form về rỗng
  function resetForm() {
    setForm({
      ownerName: "",
      ownerID: "",
      plotNumber: "",
      area: "",
      address: "",
      purpose: "",
    });
  }

  // Mở modal đăng ký: reset rồi điền sẵn từ authUser (nếu có)
  function handleOpenRegister() {
    resetForm();
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) {
        const auth = JSON.parse(raw) as { username?: string; CCCD?: string };
        setForm((f) => ({
          ...f,
          ownerName: auth.username ?? f.ownerName,
          ownerID: auth.CCCD ?? f.ownerID,
        }));
      }
    } catch {
      // Bỏ qua lỗi
    }
    setShowRegisterModal(true);
  }

  // Đóng modal đăng ký và reset trạng thái gửi
  function handleCloseRegister() {
    setShowRegisterModal(false);
    setSubmitting(false);
  }

  // Cập nhật giá trị form theo từng trường
  function handleChange(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  // Kiểm tra hợp lệ dữ liệu form (validation cơ bản)
  function validateForm(): string | null {
    if (!form.ownerName.trim()) return "Vui lòng nhập tên chủ hộ.";
    if (!form.ownerID.trim() || form.ownerID.trim().length !== 12)
      return "Vui lòng nhập số CCCD (12 chữ số).";
    if (!form.plotNumber.trim()) return "Vui lòng nhập số thửa.";
    if (
      !form.area.trim() ||
      Number.isNaN(Number(form.area)) ||
      Number(form.area) <= 0
    )
      return "Vui lòng nhập diện tích hợp lệ.";
    if (!form.address.trim()) return "Vui lòng nhập địa chỉ.";
    if (!form.purpose.trim()) return "Vui lòng nhập mục đích sử dụng.";
    return null;
  }

  // Sinh mã hồ sơ nội bộ dạng HS00X
  function generateNewId(): string {
    const next = records.length + 1;
    return `HS${String(next).padStart(3, "0")}`;
  }

  // Sinh Số hồ sơ hiển thị dạng QSDYYYYXXX
  function generateRecordNumber(): string {
    const year = new Date().getFullYear();
    const next = records.length + 1;
    return `QSD${year}${String(next).padStart(3, "0")}`;
  }

  // Gửi đăng ký hồ sơ mới
  async function handleSubmitNew(e?: React.FormEvent) {
    e?.preventDefault();
    const err = validateForm();
    if (err) {
      alert(err);
      return;
    }

    setSubmitting(true);

    // Tạo đối tượng hồ sơ mới
    const newRecord: LandRecord = {
      id: generateNewId(),
      recordNumber: generateRecordNumber(),
      plotNumber: form.plotNumber.trim(),
      area: Number(form.area),
      ownerName: form.ownerName.trim(),
      ownerID: form.ownerID.trim(),
      registrationDate: new Date().toISOString().slice(0, 10),
      status: "pending", // mặc định: Chưa duyệt
      address: form.address.trim(),
      purpose: form.purpose.trim(),
    };

    // Cập nhật state cục bộ để UI hiển thị ngay
    setRecords((prev) => {
      const next = [...prev, newRecord];
      return next;
    });

    // Cập nhật mảng gốc (trong module) để các nơi khác đọc được thay đổi (demo client-side)
    try {
      initialLandRecords.push(newRecord);
    } catch {
      // Bỏ qua nếu không thể mutate
    }

    // Chuyển sang trang cuối để người dùng thấy hồ sơ vừa tạo
    setTimeout(() => {
      setCurrentPage(Math.ceil((records.length + 1) / recordsPerPage));
    }, 0);

    alert("Đăng ký hồ sơ thành công. Hồ sơ đang ở trạng thái: Chưa duyệt.");
    setSubmitting(false);
    setShowRegisterModal(false);
  }

  return (
    <div className="container mx-auto px-4 py-8 w-2/3">
      <div className="max-w-6xl mx-auto">
        {/* Phần tiêu đề + nút tạo hồ sơ mới */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-4">
              THÔNG TIN HỒ SƠ ĐẤT
            </h1>
            <p className="text-gray-600">
              Vui lòng kiểm tra kỹ thông tin, nếu có sai sót hãy nhanh chóng gửi
              phản hồi về hệ thống để được hỗ trợ
              <br />
              chỉnh sửa một cách nhanh nhất
            </p>
          </div>

          {/* Nút mở modal đăng ký hồ sơ mới */}
          <div>
            <button
              onClick={handleOpenRegister}
              className="bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700"
            >
              Đăng ký hồ sơ đất mới
            </button>
          </div>
        </div>

        {/* Lưới danh sách hồ sơ theo trang hiện tại */}
        <div className="grid md:grid-cols-3 gap-8 ">
          {currentRecords.map((r) => (
            <article
              key={r.id}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-100"
            >
              {/* Header: Mã hồ sơ + Trạng thái */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Mã hồ sơ</p>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {r.id}
                  </h2>
                </div>
                <span className={badgeClasses(r.status)}>
                  {statusMap[r.status]}
                </span>
              </div>

              {/* Thông tin chi tiết */}
              <dl className="space-y-3">
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-gray-700">Số hồ sơ:</dt>
                  <dd className="text-gray-900">{r.recordNumber}</dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-gray-700">Ngày đăng ký:</dt>
                  <dd className="text-gray-900">{formatDate(r.registrationDate)}</dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-gray-700">Thửa đất:</dt>
                  <dd className="text-gray-900">{r.plotNumber}</dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-gray-700">Chủ hộ:</dt>
                  <dd className="text-gray-900">{r.ownerName}</dd>
                </div>
              </dl>

              {/* Nút xem chi tiết (mở tab mới) */}
              <button
                type="button"
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded w-full mt-6 hover:bg-white hover:text-blue-600 border-2 border-blue-600"
                onClick={() => {
                  window.open(`/landProfile.html?id=${r.id}`, "_blank");
                }}
              >
                Xem hồ sơ
              </button>
            </article>
          ))}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Modal: Đăng ký hồ sơ mới */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseRegister}
          />
          <form
            onSubmit={handleSubmitNew}
            className="relative z-10 w-full max-w-2xl bg-white rounded-lg p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              Đăng ký hồ sơ đất mới
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium">Họ và tên chủ hộ</span>
                <input
                  className="border rounded px-2 py-1"
                  value={form.ownerName}
                  onChange={(e) => handleChange("ownerName", e.target.value)}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Số CMND/CCCD</span>
                <input
                  className="border rounded px-2 py-1"
                  value={form.ownerID}
                  onChange={(e) => handleChange("ownerID", e.target.value)}
                  placeholder="12 chữ số"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Số thửa</span>
                <input
                  className="border rounded px-2 py-1"
                  value={form.plotNumber}
                  onChange={(e) => handleChange("plotNumber", e.target.value)}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Diện tích (m²)</span>
                <input
                  className="border rounded px-2 py-1"
                  value={form.area}
                  onChange={(e) => handleChange("area", e.target.value)}
                />
              </label>

              <label className="flex flex-col col-span-2">
                <span className="text-sm font-medium">Địa chỉ</span>
                <input
                  className="border rounded px-2 py-1"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </label>

              <label className="flex flex-col col-span-2">
                <span className="text-sm font-medium">Mục đích sử dụng</span>
                <input
                  className="border rounded px-2 py-1"
                  value={form.purpose}
                  onChange={(e) => handleChange("purpose", e.target.value)}
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseRegister}
                className="px-4 py-2 rounded border"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                {submitting ? "Đang gửi..." : "Gửi đăng ký"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
