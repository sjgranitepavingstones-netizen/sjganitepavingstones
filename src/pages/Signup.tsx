import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, authStore } from "@/lib/api";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().trim().min(2, "Name too short").max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
});

const Signup = () => {
  const nav = useNavigate();
  const { refreshAuth } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    try {
      const { full_name, email, password } = parsed.data;
      const { token } = await authApi.signup({ full_name, email, password });
      authStore.setToken(token);
      await refreshAuth();
      toast.success("Account created");
      nav("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Account creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground">
      <Navbar />
      <section className="container max-w-md pt-40 pb-24">
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Join</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white mt-3">Create Account</h1>
          <p className="text-secondary-foreground/60 mt-3 text-sm">Save quotes, track orders, exclusive previews</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {(["full_name","email","password"] as const).map((k) => (
            <div key={k}>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-secondary-foreground/60 mb-2">
                {k === "full_name" ? "Full name" : k}
              </label>
              {k === "password" ? (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    maxLength={72}
                    className="w-full bg-transparent border border-primary/20 px-4 py-3 pr-12 text-sm focus:border-primary outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-foreground/50 hover:text-primary transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              ) : (
                <input
                  type={k === "email" ? "email" : "text"}
                  value={(form as any)[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  required
                  maxLength={255}
                  className="w-full bg-transparent border border-primary/20 px-4 py-3 text-sm focus:border-primary outline-none transition-colors"
                />
              )}
            </div>
          ))}
          <button disabled={loading} className="w-full py-3 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.25em] shimmer disabled:opacity-50">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="text-center text-xs text-secondary-foreground/60 mt-6">
          Already have an account? <Link to="/login" className="text-primary link-gold">Sign in</Link>
        </p>
      </section>
      <Footer />
    </main>
  );
};

export default Signup;

