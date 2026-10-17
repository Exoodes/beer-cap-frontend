// The admin secret, kept on this device. Storage can be unavailable
// (private mode, blocked site data): then admin mode lasts until a reload.
const ADMIN_TOKEN_KEY = "admin_token";

export function readAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeAdminToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
    else localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // See above: nothing to keep it in.
  }
}
