// src/styles/colors.ts
export const colors = {
  primary: '#1E40AF',
  // secondary: '#6366f1',
  // accent: '#10b981',
  // success: '#22c55e',
  // warning: '#f59e0b',
  // danger: '#ef4444',
  // muted: '#6b7280',
  // bg: '#ffffff',
  // fg: '#111827',
  // border: '#e5e7eb',
} as const;

export type ColorName = keyof typeof colors;

// tuỳ thích: helper nhỏ
export const getColor = (name: ColorName) => colors[name];

// cũng export default để import mặc định cho nhanh
export default colors;
// export default  getColor;
