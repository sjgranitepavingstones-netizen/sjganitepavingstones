import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-parking.jpg";
import benchImg from "@/assets/product-bench.jpg";
import chairImg from "@/assets/product-chair.jpg";
import flooringImg from "@/assets/product-flooring.jpg";
import parkingImg from "@/assets/product-parking.jpg";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { publicApi } from "@/lib/api";

type Slide = { id: string; image_url: string; caption: string | null };

const defaultSlides: Slide[] = [
  { id: "default-parking", image_url: heroImg, caption: "Granite paving stone parking design in Bangalore" },
  { id: "default-bench", image_url: benchImg, caption: "Granite stone bench and garden furniture" },
  { id: "default-chair", image_url: chairImg, caption: "Stone chair for outdoor seating" },
  { id: "default-flooring", image_url: flooringImg, caption: "Floor stone and outdoor flooring" },
  { id: "default-paving", image_url: parkingImg, caption: "Cobblestone and outdoor stone paving" },
];

export const Hero = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    publicApi.list<Slide>("hero_images", { orderBy: "sort_order" }).then(setSlides).catch(() => undefined);
  }, []);

  const items: Slide[] = slides.length ? slides : defaultSlides;

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 2500);
    return () => clearInterval(t);
  }, [items.length]);

  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);
  const next = () => setIdx((i) => (i + 1) % items.length);

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden bg-secondary">
      <div className="absolute inset-0">
        {items.map((s, i) => (
          <img
            key={s.id}
            src={s.image_url}
            alt={s.caption || "Granite paving stone and floor stone showcase in Bangalore"}
            width={1920}
            height={1088}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity [transition-duration:2000ms] ease-in-out ${i === idx ? "opacity-100 animate-ken-burns" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(0_0%_0%/0.55)_0%,hsl(0_0%_0%/0.3)_40%,hsl(0_0%_0%/0.85)_100%)]" />
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 grid place-items-center border border-primary/40 text-white/80 hover:text-primary hover:border-primary bg-background/20 backdrop-blur-sm transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 grid place-items-center border border-primary/40 text-white/80 hover:text-primary hover:border-primary bg-background/20 backdrop-blur-sm transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 transition-all ${i === idx ? "w-8 bg-primary" : "w-4 bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>
        </>
      )}

      <div className="relative z-10 container min-h-screen flex flex-col justify-center pt-32 pb-20">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-6 animate-fade-in-down">
            <span className="h-px w-12 bg-gold-gradient" />
            <span className="text-xs uppercase tracking-[0.4em] text-primary font-medium">
              Professional Granite Paving Since 2013
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[0.95] text-white animate-fade-in">
            SJ Granite
            <span className="block italic text-gold-gradient mt-2">Paving Stone</span>
            <span className="block">Bangalore</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base md:text-lg text-white/80 font-light leading-relaxed animate-fade-in [animation-delay:200ms]">
            Granite paving stone, cobblestone, floor stone, parking pavers, stone chairs and garden stone furniture for Bangalore and Karnataka projects.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 animate-fade-in [animation-delay:400ms]">
            <Link
              to="/granite-paving-stone-bangalore"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.3em] font-medium shimmer hover:shadow-gold-glow transition-all duration-500"
            >
              Bangalore Stone Services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-3 px-8 py-4 border border-primary/60 text-white text-xs uppercase tracking-[0.3em] font-medium hover:bg-primary/10 hover:border-primary transition-all duration-500"
            >
              Get a Quote
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl animate-fade-in [animation-delay:600ms]">
            {[
              { v: "BLR + KA", l: "Service Area" },
              { v: "2013", l: "Established" },
              { v: "5+", l: "Stone Categories" },
              { v: "100%", l: "Service Focus" },
            ].map((s) => (
              <div key={s.l} className="border-l border-primary/40 pl-4">
                <div className="font-serif text-2xl md:text-3xl text-gold-gradient">{s.v}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/60 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <a
        href="#products"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60 hover:text-primary transition-colors animate-gold-pulse"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown className="h-4 w-4" />
      </a>
    </section>
  );
};
