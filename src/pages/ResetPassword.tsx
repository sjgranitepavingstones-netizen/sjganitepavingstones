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
const otpSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6 digit OTP"),
  password: z.string().min(8, "Min 8 characters").max(72),
});

const ResetPassword = () => {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get("token") || "";
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

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

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().trim().email("Invalid email").safeParse(email);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setOtpLoading(true);
    setDevOtp(null);
    try {
      const result = await authApi.forgotPassword({ email: parsed.data });
      setOtpSent(true);
      setDevOtp(result.otp || null);
      toast.success(result.emailSent ? "OTP sent to your email" : "Password reset request received");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "OTP request failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = otpSchema.safeParse({ email, otp, password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(parsed.data);
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

        {!token && (
          <form onSubmit={requestOtp} className="mb-5 space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-secondary-foreground/60 mb-2 sm:tracking-[0.25em]">Account Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255}
                className="w-full bg-transparent border border-primary/20 px-4 py-3 text-sm focus:border-primary outline-none transition-colors" />
            </div>
            <button disabled={otpLoading} className="w-full py-3 border border-primary/40 text-primary text-xs uppercase tracking-[0.16em] hover:bg-primary/5 transition-colors disabled:opacity-50 sm:tracking-[0.22em]">
              {otpLoading ? "Sending OTP..." : otpSent ? "Resend OTP" : "Send OTP"}
            </button>
            {devOtp && <div className="border border-primary/30 bg-primary/10 px-4 py-3 text-center text-xs text-primary">Development OTP: {devOtp}</div>}
          </form>
        )}

        <form onSubmit={token ? submit : submitOtp} className="space-y-4">
          {!token && (
            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-secondary-foreground/60 mb-2 sm:tracking-[0.25em]">6 Digit OTP</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                maxLength={6}
                className="w-full bg-transparent border border-primary/20 px-4 py-3 text-center text-xl tracking-[0.35em] focus:border-primary outline-none transition-colors"
              />
            </div>
          )}
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
          <button disabled={loading || (!token && !otpSent)} className="w-full py-3 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.16em] shimmer disabled:opacity-50 sm:tracking-[0.25em]">
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
