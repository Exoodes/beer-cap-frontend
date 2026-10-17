import { type ReactNode, useMemo, useState } from "react";
import { AdminContext, type AdminState } from "./adminContext";
import { readAdminToken, writeAdminToken } from "./token";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => readAdminToken() !== null);

  const state = useMemo<AdminState>(
    () => ({
      isAdmin,
      unlock: (secret) => {
        writeAdminToken(secret);
        setIsAdmin(true);
      },
      lock: () => {
        writeAdminToken(null);
        setIsAdmin(false);
      },
    }),
    [isAdmin],
  );

  return (
    <AdminContext.Provider value={state}>{children}</AdminContext.Provider>
  );
}
