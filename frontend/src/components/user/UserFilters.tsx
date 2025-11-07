// src/components/user/UserFilters.tsx
import { Search, Filter } from "lucide-react";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  roleFilter: "Tất cả" | "Người dân" | "Cán bộ"|undefined;
  setRoleFilter: (v: "Tất cả" | "Người dân" | "Cán bộ"|undefined) => void;
}

export default function UserFilters({ search, setSearch, roleFilter, setRoleFilter }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo tên, email, CCCD, mã cán bộ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <select
      aria-label="role"
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value as any)}
        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex items-center gap-2"
      >
        <option value="Tất cả">Tất cả vai trò</option>
        <option value="Người dân">Người dân</option>
        <option value="Cán bộ">Cán bộ</option>
      </select>
    </div>
  );
}