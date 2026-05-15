import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ApiError, authApi, authStore } from "@/lib/api";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});

const Login = () => {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const redirectTo = loc.state?.from || "/";
  const { refreshAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [resetRequested, setResetRequested] = useState(false);
  const [hasRegisteredUsers, setHasRegisteredUsers] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    authApi
      .status()
      .then(({ hasUsers }) => setHasRegisteredUsers(hasUsers))
      .catch(() => undefined);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    try {
      const { token } = await authApi.login({ email: parsed.data.email, password: parsed.data.password });
      authStore.setToken(token);
      await refreshAuth();
      toast.success("Welcome back");
      nav(redirectTo);
    } catch (error) {
      if (error instanceof ApiError && ["NO_USERS", "USER_NOT_FOUND"].includes(error.code || "")) {
        toast.error(error.message, {
          description: "Registration takes less than a minute.",
          action: {
            label: "Create account",
            onClick: () => nav("/signup"),
          },
        });
      } else {
        toast.error(error instanceof Error ? error.message : "Sign in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().trim().email("Invalid email").safeParse(forgotEmail);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setForgotLoading(true);
    setResetUrl(null);
    setResetRequested(false);
    try {
      const result = await authApi.forgotPassword({ email: parsed.data });
      setResetUrl(result.resetUrl);
      setResetRequested(true);
      toast.success(result.emailSent ? "Password reset email sent" : "Password reset request received");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reset request failed");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground">
      <Navbar />
      <section className="container max-w-md pt-40 pb-24">
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Members</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white mt-3">Welcome Back</h1>
          <p className="text-secondary-foreground/60 mt-3 text-sm">Sign in to manage quotes & orders</p>
        </div>

        {hasRegisteredUsers === false && (
          <div className="mb-6 border border-primary/30 bg-primary/10 px-5 py-4 text-center shadow-gold-glow">
            <div className="font-serif text-2xl text-white">Create your first account</div>
            <p className="mt-2 text-sm text-secondary-foreground/70">
              No user is registered yet. Please create an account first to continue.
            </p>
            <Link
              to="/signup"
              className="mt-4 inline-flex px-5 py-2 bg-gold-gradient text-primary-foreground text-[10px] uppercase tracking-[0.22em]"
            >
              Register now
            </Link>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-secondary-foreground/60 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255}
              className="w-full bg-transparent border border-primary/20 px-4 py-3 text-sm focus:border-primary outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-secondary-foreground/60 mb-2">Password</label>
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
          <div className="text-right">
            <button type="button" onClick={() => setShowForgot((value) => !value)} className="text-[10px] uppercase tracking-[0.22em] text-primary link-gold">
              Forgot password?
            </button>
          </div>
          <button disabled={loading} className="w-full py-3 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.25em] shimmer disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {showForgot && (
          <form onSubmit={requestReset} className="mt-6 border border-primary/20 p-5 space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-secondary-foreground/60 mb-2">Account Email</label>
              <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required maxLength={255}
                className="w-full bg-transparent border border-primary/20 px-4 py-3 text-sm focus:border-primary outline-none transition-colors" />
            </div>
            <button disabled={forgotLoading} className="w-full py-3 border border-primary/40 text-primary text-xs uppercase tracking-[0.22em] hover:bg-primary/5 transition-colors disabled:opacity-50">
              {forgotLoading ? "Sending..." : "Send reset email"}
            </button>
            {resetRequested && (
              <p className="text-center text-xs text-secondary-foreground/60 leading-relaxed">
                If an account exists for this email, a reset link has been sent. Please check inbox and spam folder.
              </p>
            )}
            {resetUrl && (
              <Link to={resetUrl.replace(window.location.origin, "")} className="block text-center text-xs text-primary link-gold break-all">
                Open password reset link
              </Link>
            )}
          </form>
        )}
        <p className="text-center text-xs text-secondary-foreground/60 mt-6">
          New here? <Link to="/signup" className="text-primary link-gold">Create an account</Link>
        </p>
      </section>
      <Footer />
    </main>
  );
};

export default Login;

