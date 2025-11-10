// src/pages/staff/UserManagement.tsx
import { useState, useEffect } from "react";
import { userApi } from "../../../api/userApi";
import type { Account } from "../../../api/types";
import { Plus, User } from "lucide-react";
import { useAuth } from "../../../context/authContext";
import UserTable from "../../../components/user/UserTable";
import UserFilters from "../../../components/user/UserFilters";
import CreateStaffModal from "../../../components/user/CreateStaffModal";

export default function UserManagement() {
  const [users, setUsers] = useState<Account[]>([]);
  const [filtered, setFiltered] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"Tất cả" | "Người dân" | "Cán bộ"| undefined >("Tất cả");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const {user}=useAuth();
  useEffect(() => {
    if (!user || user?.role !== "Cán bộ") return;
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const role = roleFilter === "Tất cả" ? undefined : roleFilter;
      const res = await userApi.getUsersByRole(role);
      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      alert("Lỗi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // TÌM KIẾM
  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = users.filter(u =>
      u.UserProfile?.full_name?.toLowerCase().includes(lower) ||
      u.username.toLowerCase().includes(lower) ||
      u.UserProfile?.email?.toLowerCase().includes(lower) ||
      u.UserProfile?.cccd?.includes(search) ||
      u.UserProfile?.staff_code?.includes(search)
    );
    setFiltered(filtered);
  }, [search, users]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadUsers();
  };

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
                <User className="w-8 h-8" />
                Quản lý người dùng
              </h1>
              <p className="text-gray-600 mt-1">
                Tổng: <strong className="text-blue-700">{filtered.length}</strong> người dùng
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5" />
              Tạo cán bộ
            </button>
          </div>

          <UserFilters
            search={search}
            setSearch={setSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
          />
        </div>

        {/* BẢNG */}
        <UserTable users={filtered} />

        {/* MODAL TẠO CÁN BỘ */}
        {showCreateModal && (
          <CreateStaffModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
        )}
      </div>
    </div>
  );
}