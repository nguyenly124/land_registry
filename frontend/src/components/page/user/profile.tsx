import React, { useEffect, useRef, useState } from "react";
import { userApi } from "../../../api/userApi";
import { useAuth } from "../../../context/authContext";
import { Navigate, useNavigate } from "react-router-dom";

import type {
  GetProfileResponse,
  UpdateProfileRequest,
 
} from "../../../api/types";
import { isTokenValid } from "../../../../utils/jwt";

interface UserInfo {
  full_name: string;
  dob: string;
  cccd: string;
  address: string;
  phone: string;
  email: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate=useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userInfo, setUserInfo] = useState<UserInfo>({
    full_name: "",
    dob: "",
    cccd: "",
    address: "",
    phone: "",
    email: "",
  });

  const [originalInfo, setOriginalInfo] = useState<UserInfo & { avatar_url?: string }>({
    full_name: "",
    dob: "",
    cccd: "",
    address: "",
    phone: "",
    email: "",
    avatar_url: undefined,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // === KIỂM TRA TOKEN ===
  useEffect(() => {
   
    if (!user) {
      alert("Vui lòng đăng nhập để xem hồ sơ.");
      navigate("/");
      return;
    }
    if (!isTokenValid(user.token)) {
      alert("Phiên đăng nhập hết hạn.");
      logout();
      navigate("/");
    }
  }, [user, logout, navigate]);
  
  // === FETCH PROFILE ===
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res: GetProfileResponse = await userApi.getProfile();
      const profile = res.data.UserProfile;
      if (profile) {
        const info: UserInfo = {
          full_name: profile.full_name || "",
          dob: profile.dob ? profile.dob.split("-").reverse().join("/") : "",
          cccd: profile.cccd || "",
          address: profile.address || "",
          phone: profile.phone || "",
          email: profile.email || "",
        };
        setUserInfo(info);
        setOriginalInfo({ ...info, avatar_url: profile.avatar_url || undefined });
        setAvatarPreview(profile.avatar_url || null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể tải hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // === DETECT CHANGES ===
  useEffect(() => {
    let dobOriginal = originalInfo.dob;
    if (dobOriginal) {
      const parts = dobOriginal.split("-");
      dobOriginal = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    const infoChanged =
      userInfo.full_name !== originalInfo.full_name ||
      userInfo.dob !== dobOriginal ||
      userInfo.address !== originalInfo.address ||
      userInfo.phone !== originalInfo.phone ||
      userInfo.email !== originalInfo.email;

    const avatarChanged = !!avatarFile || (avatarPreview === null && originalInfo.avatar_url !== undefined);
    setHasChanges(infoChanged || avatarChanged);
  }, [userInfo, avatarFile, avatarPreview, originalInfo]);

  // === HANDLE INPUT CHANGE ===
  const handleChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  // === HANDLE AVATAR SELECT ===
  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result));
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });

  const onSelectAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("Kích thước ảnh tối đa 2MB.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarPreview(dataUrl);
      setAvatarFile(file);
    } catch {
      alert("Không thể đọc file ảnh.");
    }
  };

  // === HANDLE SAVE ===
  const handleSave = async () => {
    setSaving(true);
    try {
      // Format dob từ dd/mm/yyyy sang YYYY-MM-DD
      let dobFormatted = userInfo.dob;
      if (dobFormatted) {
        const parts = dobFormatted.split("/");
        if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
          alert("Ngày sinh phải đúng định dạng dd/mm/yyyy");
          return;
        }
        dobFormatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      // Chỉ gửi các field cho phép
      const profileData: UpdateProfileRequest = {};
      if (userInfo.full_name !== originalInfo.full_name) profileData.full_name = userInfo.full_name.trim() || null;
      if (dobFormatted !== originalInfo.dob) profileData.dob = dobFormatted || null;
      if (userInfo.address !== originalInfo.address) profileData.address = userInfo.address.trim() || null;
      if (userInfo.phone !== originalInfo.phone) profileData.phone = userInfo.phone.trim() || null;
      if (userInfo.email !== originalInfo.email) profileData.email = userInfo.email.trim() || null;

      if (Object.keys(profileData).length > 0) {
        await userApi.updateProfile(profileData);
      }

      if (avatarFile) {
        await userApi.uploadAvatar(avatarFile);
        setAvatarFile(null);
      }

      await fetchProfile();
      setIsEditing(false);
      setHasChanges(false);
      alert("Cập nhật thành công!");

    } catch (err: any) {
      console.error("Lỗi cập nhật:", err.response?.data);
      alert(err.response?.data?.message || "Lỗi cập nhật hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  // === HANDLE CANCEL ===
  const handleCancel = () => {
    setUserInfo({
      full_name: originalInfo.full_name,
      dob: originalInfo.dob ? originalInfo.dob.split("-").reverse().join("/") : "",
      cccd: originalInfo.cccd,
      address: originalInfo.address,
      phone: originalInfo.phone,
      email: originalInfo.email,
    });
    setAvatarPreview(originalInfo.avatar_url || null);
    setAvatarFile(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    setIsEditing(false);
    setHasChanges(false);
  };

  // === CLEAR AVATAR ===
  const clearAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarPreview(null);
    setAvatarFile(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  // === LOADING ===
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg my-10">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* THÔNG TIN CÁ NHÂN */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">THÔNG TIN CÁ NHÂN</h2>
          <p className="text-gray-500 text-sm mb-8">
            Vui lòng kiểm tra kỹ thông tin.
          </p>

          <div className="space-y-5">
            {/* FULL NAME */}
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700 w-32">Họ và tên </label>
              {isEditing ? (
                <input
                  type="text"
                  value={userInfo.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nguyễn Văn A"
                />
              ) : (
                <span className="flex-1 text-gray-800 font-medium">{userInfo.full_name || "--"}</span>
              )}
            </div>

            {/* DOB */}
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700 w-32">Ngày sinh:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={userInfo.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="dd/mm/yyyy"
                />
              ) : (
                <span className="flex-1 text-gray-800">{userInfo.dob || "--"}</span>
              )}
            </div>

            {/* CCCD - CHỈ HIỂN THỊ */}
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700 w-32">CCCD:</label>
              <span className="flex-1 text-gray-800 font-mono bg-gray-100 px-3 py-2 rounded-lg">
                {userInfo.cccd || "--"}
              </span>
            </div>

            {/* ADDRESS */}
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700 w-32">Địa chỉ:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={userInfo.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Số nhà, đường, phường/xã..."
                />
              ) : (
                <span className="flex-1 text-gray-800">{userInfo.address || "--"}</span>
              )}
            </div>

            {/* PHONE */}
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700 w-32">Điện thoại:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={userInfo.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0901234567"
                />
              ) : (
                <span className="flex-1 text-gray-800">{userInfo.phone || "--"}</span>
              )}
            </div>

            {/* EMAIL */}
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700 w-32">Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              ) : (
                <span className="flex-1 text-gray-800">{userInfo.email || "--"}</span>
              )}
            </div>
          </div>

          {/* NÚT HÀNH ĐỘNG */}
          <div className="flex gap-3 mt-8 justify-center">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition ${
                    hasChanges && !saving
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md transition"
              >
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {/* ẢNH ĐẠI DIỆN */}
        <div className="flex flex-col items-center lg:items-start">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">Ảnh đại diện</h3>
          
          <div
            onClick={() => isEditing && avatarInputRef.current?.click()}
            className={`relative w-56 h-56 border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all ${
              isEditing ? "border-blue-400 hover:border-blue-600" : "border-gray-300"
            }`}
          >
            {avatarPreview ? (
              <>
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                {isEditing && (
                  <button
                    onClick={clearAvatar}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                    title="Xóa ảnh"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                {isEditing ? (
                  <>
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-medium">Click để tải ảnh</p>
                  </>
                ) : (
                  <>
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20 mb-3" />
                    <p className="text-sm">Chưa có ảnh</p>
                  </>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">Tối đa 2MB, định dạng JPG/PNG</p>

          {/* === INPUT FILE ẨN (SỬA ĐỂ ĐẠT A11Y) === */}
          <input
            id="avatar-upload"
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={onSelectAvatar}
            className="hidden"
            aria-label="Tải lên ảnh đại diện"
            title="Chọn file ảnh đại diện (JPG, PNG, tối đa 2MB)"
          />
        </div>
      </div>
    </div>
  );
}