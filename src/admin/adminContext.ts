import { createContext, useContext } from "react";

export interface AdminState {
  isAdmin: boolean;
  /** Stores the secret from an `?admin_secret=` link. */
  unlock: (secret: string) => void;
  /** Forgets the secret on this device. */
  lock: () => void;
}

export const AdminContext = createContext<AdminState | null>(null);

export function useAdmin(): AdminState {
  const state = useContext(AdminContext);
  if (!state) throw new Error("useAdmin must be used inside <AdminProvider>");
  return state;
}
