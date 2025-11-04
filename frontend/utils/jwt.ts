// src/utils/jwt.ts
export interface JWTPayload {
  id: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export const parseJwt = (token: string): JWTPayload | null => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const isTokenValid = (token: string): boolean => {
  const payload = parseJwt(token);
  if (!payload) return false;
  return payload.exp * 1000 > Date.now();
};