import { createContext } from "react";
import { AuthUser } from "@/lib/api";

export type AuthCtx = {
  user: AuthUser | null;
  session: { token: string } | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  refreshAuth: async () => {},
});
