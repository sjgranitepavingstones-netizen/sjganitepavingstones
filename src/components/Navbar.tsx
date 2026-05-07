import { useEffect, useState } from "react";
import { Link, NavLink as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/useAuth";
import sjLogoMark from "@/assets/sj-granite-paving-stone-mark.jpg";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/granite-paving-stone-bangalore", label: "Bangalore" },
  { to: "/workflow", label: "Workflow" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAdmin, loading, signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-secondary/95 backdrop-blur-xl border-b border-primary/10 py-2.5"
          : "bg-secondary/40 backdrop-blur-sm py-3.5"
      )}
    >
      <nav className="container flex items-center justify-between gap-3 xl:gap-5">
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <img src={sjLogoMark} alt="SJ Granite Paving Stone" className="h-10 w-10 md:h-12 md:w-12 object-cover rounded border border-primary/25" />
          <span className="hidden sm:flex flex-col leading-none">
            <span className="font-serif text-lg xl:text-xl text-gold-gradient tracking-tight whitespace-nowrap">SJ Granite Paving Stone</span>
            <span className="text-[8px] uppercase tracking-[0.25em] text-secondary-foreground/60 mt-1">Est. 2013</span>
          </span>
        </Link>

        <ul className="hidden xl:flex items-center gap-5">
          {links.map((l) => (
            <li key={l.to}>
              <RouterLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "link-gold text-[10px] uppercase tracking-[0.18em] font-medium transition-colors whitespace-nowrap",
                    isActive ? "text-primary" : "text-secondary-foreground/85 hover:text-primary"
                  )
                }
              >
                {l.label}
              </RouterLink>
            </li>
          ))}
        </ul>

        <div className="hidden xl:flex items-center gap-2 shrink-0">
          {user ? (
            <>
              {!loading && isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-primary/40 text-primary text-[10px] uppercase tracking-[0.22em] hover:bg-primary/10 transition-colors"
                >
                  <Shield className="h-3 w-3" /> Admin
                </Link>
              )}
              <button
                onClick={() => { signOut(); navigate("/"); }}
                className="inline-flex items-center gap-1.5 text-secondary-foreground/80 text-[10px] uppercase tracking-[0.22em] hover:text-primary transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-secondary-foreground/85 text-[10px] uppercase tracking-[0.22em] hover:text-primary transition-colors"
            >
              <User className="h-3.5 w-3.5" /> Login
            </Link>
          )}
          <Link
            to="/contact"
            className="inline-flex items-center px-4 py-2 bg-gold-gradient text-primary-foreground text-[10px] uppercase tracking-[0.2em] font-medium shimmer hover:shadow-gold-glow transition-all duration-500 whitespace-nowrap"
          >
            Get Quote
          </Link>
        </div>

        <button
          className="xl:hidden text-secondary-foreground p-2 -mr-2 shrink-0"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile and tablet drawer */}
      <div
        className={cn(
          "xl:hidden overflow-hidden bg-secondary/98 backdrop-blur-xl transition-[max-height] duration-500 ease-out",
          open ? "max-h-[640px]" : "max-h-0"
        )}
      >
        <ul className="container py-5 flex flex-col gap-4">
          {links.map((l) => (
            <li key={l.to}>
              <RouterLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "block text-xs uppercase tracking-[0.22em]",
                    isActive ? "text-primary" : "text-secondary-foreground/85"
                  )
                }
              >
                {l.label}
              </RouterLink>
            </li>
          ))}
          <li className="pt-2 border-t border-primary/10 flex flex-col gap-3">
            {user ? (
              <>
                {!loading && isAdmin && (
                  <Link to="/admin" className="text-xs uppercase tracking-[0.22em] text-primary inline-flex items-center gap-1.5">
                    <Shield className="h-3 w-3" /> Admin Panel
                  </Link>
                )}
                <button onClick={() => { signOut(); navigate("/"); }} className="text-left text-xs uppercase tracking-[0.22em] text-secondary-foreground/85 inline-flex items-center gap-1.5">
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="text-xs uppercase tracking-[0.22em] text-secondary-foreground/85 inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Login / Sign up
              </Link>
            )}
            <Link to="/contact" className="inline-flex items-center px-5 py-2.5 bg-gold-gradient text-primary-foreground text-[10px] uppercase tracking-[0.25em] w-fit">
              Get Quote
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

