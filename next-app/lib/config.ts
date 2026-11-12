import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

export interface DecodedToken {
  sub?: string;
  id?: string | number;
  email?: string;
  name?: string;
  role?: string;
  exp?: number; // Expiration timestamp (in seconds)
  iat?: number; // Issued at timestamp
}

// 1. I-save ang JWT token sa localStorage pagkatapos mag-login
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// 2. Kunin ang kasalukuyang nakasave na token
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

// 3. Burahin ang token (para sa Logout)
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// 4. I-decode ang JWT token para makuha ang user info (email, role, exp, atbp.)
export function getDecodedToken(): DecodedToken | null {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Invalid JWT token:", error);
    removeToken();
    return null;
  }
}

// 5. I-check kung valid pa ang token at hindi pa expired
export function isAuthenticated(): boolean {
  const decoded = getDecodedToken();
  if (!decoded) return false;

  // Kung may 'exp' field ang token, i-check kung lumampas na sa kasalukuyang oras
  if (decoded.exp) {
    const currentTimeInSeconds = Date.now() / 1000;
    if (decoded.exp < currentTimeInSeconds) {
      removeToken();
      return false;
    }
  }

  return true;
}