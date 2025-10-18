// Data module: land records + simple auth (CCCD login) + CCCD image storage (demo client-side)

export interface LandRecord {
    id: string;               // ID hồ sơ
    recordNumber: string;     // Số hồ sơ
    plotNumber: string;       // Số thửa đất
    area: number;             // Diện tích (m2)
    ownerName: string;        // Tên chủ hộ
    ownerID: string;          // Số CCCD
    registrationDate: string; // Ngày đăng ký
    status: 'pending' | 'approved' | 'rejected' | 'waiting';
    address: string;          // Địa chỉ thửa đất
    purpose: string;          // Mục đích sử dụng
}

export const landRecords: LandRecord[] = [
    {
        id: "HS001",
        recordNumber: "QSD2025001",
        plotNumber: "156/24",
        area: 120.5,
        ownerName: "Nguyễn Văn Bình",
        ownerID: "079203000123",
        registrationDate: "2025-10-01",
        status: "approved",
        address: "156/24 Đường Số 1, Phường Tân Phú, Quận 7, TP.HCM",
        purpose: "Đất ở đô thị"
    },
    {
        id: "HS002",
        recordNumber: "QSD2025002",
        plotNumber: "234/15",
        area: 85.0,
        ownerName: "Nguyễn Văn An",
        ownerID: "079203000456",
        registrationDate: "2025-10-05",
        status: "pending",
        address: "234/15 Đường Số 2, Phường Bình Thuận, Quận 7, TP.HCM",
        purpose: "Đất ở đô thị"
    },
    {
        id: "HS003",
        recordNumber: "QSD2025003",
        plotNumber: "789/42",
        area: 200.0,
        ownerName: "Nguyễn Văn Thắng",
        ownerID: "079203000789",
        registrationDate: "2025-10-08",
        status: "waiting",
        address: "789/42 Đường Số 3, Phường Phú Mỹ, Quận 7, TP.HCM",
        purpose: "Đất nông nghiệp"
    },
    {
        id: "HS004",
        recordNumber: "QSD2025004",
        plotNumber: "567/31",
        area: 150.75,
        ownerName: "Nguyễn Văn An",
        ownerID: "079203001234",
        registrationDate: "2025-10-12",
        status: "rejected",
        address: "567/31 Đường Số 4, Phường Tân Thuận, Quận 7, TP.HCM",
        purpose: "Đất ở đô thị"
    },
    {
        id: "HS005",
        recordNumber: "QSD2025005",
        plotNumber: "890/53",
        area: 300.0,
        ownerName: "Nguyễn Văn An",
        ownerID: "079203005678",
        registrationDate: "2025-10-15",
        status: "pending",
        address: "890/53 Đường Số 5, Phường Tân Quy, Quận 7, TP.HCM",
        purpose: "Đất thương mại dịch vụ"
    }
];

// Map các trạng thái sang tiếng Việt
export const statusMap = {
    pending: 'Đang xử lý',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    waiting: 'Chờ bổ sung'
} as const;

// Map màu sắc cho các trạng thái
export const statusColorMap = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    waiting: 'gray'
} as const;

// Định dạng ngày tháng
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Định dạng diện tích
export function formatArea(area: number): string {
    return `${area.toLocaleString('vi-VN')} m²`;
}

/* ---------- AUTH (demo client-side) ---------- */

export interface AuthUser {
    username: string;         // tên hiển thị / họ tên
    password: string;         // mật khẩu demo (plaintext) — KHÔNG dùng cho production
    CCCD: string;             // số căn cước (dùng để login)
    role: 'admin' | 'user';
    cccdFront?: string;       // optional: dataURL lưu ảnh mặt trước (demo)
    cccdBack?: string;        // optional: dataURL lưu ảnh mặt sau (demo)
}

export const adminAccounts: AuthUser[] = [
  {
    username: 'Admin Test',
    password: 'admin123',
    CCCD: '111111111111',
    role: 'admin'
  }
];

export const userAccounts: AuthUser[] = [
    {
        username: 'Nguyễn Văn An',
        password: 'Test@1234',
        CCCD: '123443211234',
        role: 'user',
    },

    {
        username: 'Nguyễn Văn b',
        password: 'Test@1234b',
        CCCD: '123456789987',
        role: 'user',
    },

    {
        username: 'Nguyễn Văn c',
        password: 'Test@1234c',
        CCCD: '987654321123',
        role: 'user',
    },

    {
        username: 'Nguyễn Văn d',
        password: 'Test@1234d',
        CCCD: '543215678901',
        role: 'user',
    },

    {
        username: 'Nguyễn Văn e',
        password: 'Test@1234e',
        CCCD: '123443211234',
        role: 'user',
    },
    // You can add more users here if needed for UI testing
];

/* ---------- simple auth helpers ---------- */

/**
 * Tìm user theo số CCCD (search trong admin + user arrays)
 */
export function findUserByCCCD(cccd: string): AuthUser | undefined {
  return [...adminAccounts, ...userAccounts].find(u => u.CCCD === cccd);
}

/**
 * Validate đăng nhập bằng CCCD + password
 * Trả về { ok: true, user } hoặc { ok: false, error }
 */
export function validateLoginByCCCD(cccd: string, password: string): { ok: true; user: AuthUser } | { ok: false; error: string } {
  const user = findUserByCCCD(cccd);
  if (!user) return { ok: false, error: 'Người dùng không tồn tại' };
  if (user.password !== password) return { ok: false, error: 'Mật khẩu không đúng' };
  return { ok: true, user };
}

/* ---------- CCCD image storage (demo client-side) ----------
   lưu dưới dạng map trong localStorage: key = 'cccd_images_map'
   structure: { "<CCCD>": { front?: dataUrl, back?: dataUrl }, ... }
   updateUserCCCD() cập nhật cả object in-memory và localStorage.
*/

const STORAGE_KEY_CCCD_IMAGES = 'cccd_images_map';

function readCccdImagesMap(): Record<string, { front?: string; back?: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CCCD_IMAGES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCccdImagesMap(map: Record<string, { front?: string; back?: string }>) {
  try {
    localStorage.setItem(STORAGE_KEY_CCCD_IMAGES, JSON.stringify(map));
  } catch {
    // ignore storage error in demo
  }
}

/**
 * Cập nhật ảnh CCCD cho một user (tìm theo CCCD).
 * frontDataUrl / backDataUrl nếu là null/undefined thì không đổi.
 * Trả về user cập nhật hoặc undefined nếu không tìm thấy user.
 */
export function updateUserCCCD(cccd: string, frontDataUrl?: string | null, backDataUrl?: string | null): AuthUser | undefined {
  const lists = [userAccounts, adminAccounts];
  for (const list of lists) {
    const user = list.find(u => u.CCCD === cccd);
    if (user) {
      if (frontDataUrl !== undefined && frontDataUrl !== null) user.cccdFront = frontDataUrl;
      if (backDataUrl !== undefined && backDataUrl !== null) user.cccdBack = backDataUrl;

      // update storage map
      const map = readCccdImagesMap();
      map[cccd] = {
        ...(map[cccd] || {}),
        ...(frontDataUrl ? { front: frontDataUrl } : {}),
        ...(backDataUrl ? { back: backDataUrl } : {})
      };
      writeCccdImagesMap(map);
      return user;
    }
  }

  // If user not found, still save into map so session can show images if needed
  if (frontDataUrl || backDataUrl) {
    const map = readCccdImagesMap();
    map[cccd] = {
      ...(map[cccd] || {}),
      ...(frontDataUrl ? { front: frontDataUrl } : {}),
      ...(backDataUrl ? { back: backDataUrl } : {})
    };
    writeCccdImagesMap(map);
  }

  return undefined;
}

/**
 * Khi module nạp: khôi phục ảnh từ localStorage vào các object user trong bộ nhớ (nếu tìm thấy)
 */
(function restoreCccdImagesToAccounts() {
  try {
    const map = readCccdImagesMap();
    if (!map) return;
    for (const u of [...userAccounts, ...adminAccounts]) {
      const m = map[u.CCCD];
      if (m) {
        if (m.front) u.cccdFront = m.front;
        if (m.back) u.cccdBack = m.back;
      }
    }
  } catch {
    // ignore
  }
})();

// End of file