import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(8, "Min 8 characters").max(72),
});

const ResetPassword = () => {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    if (!token) { toast.error("Reset token missing"); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password: parsed.data.password });
      toast.success("Password updated");
      nav("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground">
      <Navbar />
      <section className="container max-w-md pt-40 pb-24">
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.18em] text-primary sm:tracking-[0.3em]">Security</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white mt-3">Reset Password</h1>
          <p className="text-secondary-foreground/60 mt-3 text-sm">Create a new password for your account</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.16em] text-secondary-foreground/60 mb-2 sm:tracking-[0.25em]">New Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required maxLength={72}
                className="w-full bg-transparent border border-primary/20 px-4 py-3 pr-12 text-sm focus:border-primary outline-none transition-colors" />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-foreground/50 hover:text-primary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button disabled={loading || !token} className="w-full py-3 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.16em] shimmer disabled:opacity-50 sm:tracking-[0.25em]">
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
        <p className="text-center text-xs text-secondary-foreground/60 mt-6">
          Remembered it? <Link to="/login" className="text-primary link-gold">Sign in</Link>
        </p>
      </section>
      <Footer />
    </main>
  );
};

export default ResetPassword;
