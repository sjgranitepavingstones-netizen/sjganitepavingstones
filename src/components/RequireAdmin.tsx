import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="min-h-screen grid place-items-center text-foreground/50">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (!isAdmin) return (
    <div className="min-h-screen grid place-items-center bg-secondary text-secondary-foreground">
      <div className="text-center px-6">
        <h1 className="font-serif text-4xl text-white mb-4">Access Restricted</h1>
        <p className="text-secondary-foreground/70 mb-6">
          Please sign in with the admin email: sjgranitepavingstones@gmail.com
        </p>
        <button
          type="button"
          onClick={() => {
            signOut();
            window.location.href = "/login";
          }}
          className="bg-gold-gradient px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground"
        >
          Sign in as admin
        </button>
      </div>
    </div>
  );
  return <>{children}</>;
};

