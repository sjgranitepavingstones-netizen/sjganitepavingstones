import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="min-h-screen grid place-items-center text-foreground/50">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (!isAdmin) return (
    <div className="min-h-screen grid place-items-center bg-secondary text-secondary-foreground">
      <div className="text-center px-6">
        <h1 className="font-serif text-4xl text-white mb-4">Access Restricted</h1>
        <p className="text-secondary-foreground/70 mb-6">This area is for administrators only.</p>
        <a href="/" className="text-primary link-gold text-xs uppercase tracking-[0.25em]">Back to home</a>
      </div>
    </div>
  );
  return <>{children}</>;
};

