import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Home, PhoneCall, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSeo, breadcrumbSchema } from "@/lib/seo";
import pavingImage from "@/assets/product-parking.jpg";

const helpfulLinks = [
  { label: "View Products", to: "/products" },
  { label: "Stone Categories", to: "/categories" },
  { label: "Contact Us", to: "/contact" },
];

const NotFound = () => {
  const location = useLocation();

  useSeo({
    title: "Page Not Available | SJ Granite Paving Stone",
    description:
      "This page is not available. Explore SJ Granite Paving Stone products, all India stone services, categories and contact options.",
    path: location.pathname,
    robots: "noindex, follow",
    keywords: ["SJ Granite Paving Stone", "granite paving stone India", "stone products India"],
    schema: breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Page Not Available", path: location.pathname },
    ]),
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="relative min-h-[78vh] bg-secondary text-secondary-foreground pt-36 pb-20 overflow-hidden">
        <img
          src={pavingImage}
          alt="Granite paving stone outdoor project"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,hsl(0_0%_0%/0.92),hsl(0_0%_0%/0.74),hsl(0_0%_0%/0.42))]" />

        <div className="container relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 border border-primary/30 bg-background/15 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-primary sm:px-4 sm:text-xs sm:tracking-[0.25em]">
              <Search className="h-4 w-4" />
              Page Not Available
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-white mt-7 leading-tight">
              Let Us Take You Back To The Stone Catalogue
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed max-w-2xl">
              The page you opened may have moved, expired or been typed incorrectly. You can continue with our granite
              paving stone, cobblestone, floor stone and outdoor stone furniture collections from the links below.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-3 px-5 py-4 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.16em] shimmer sm:px-7 sm:tracking-[0.25em]"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Link>
              <a
                href="tel:+918217257354"
                className="inline-flex items-center justify-center gap-3 px-5 py-4 border border-primary/60 text-white text-xs uppercase tracking-[0.16em] hover:bg-primary/10 transition-colors sm:px-7 sm:tracking-[0.25em]"
              >
                <PhoneCall className="h-4 w-4" />
                Call Support
              </a>
            </div>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {helpfulLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group border border-primary/15 bg-background/10 p-5 text-white hover:border-primary/60 hover:bg-background/20 transition-colors"
              >
                <span className="text-xs uppercase tracking-[0.16em] sm:text-sm sm:tracking-[0.2em]">{link.label}</span>
                <ArrowRight className="h-4 w-4 mt-5 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default NotFound;
