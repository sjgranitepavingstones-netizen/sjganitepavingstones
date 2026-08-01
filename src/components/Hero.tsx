import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-parking.jpg";
import benchImg from "@/assets/product-bench.jpg";
import chairImg from "@/assets/product-chair.jpg";
import cobblestoneImg from "@/assets/product-cobblestone.jpg";
import flooringImg from "@/assets/product-flooring.jpg";
import parkingImg from "@/assets/product-parking.jpg";
import { publicApi } from "@/lib/api";

type Slide = { id: string; image_url: string; caption: string | null };

const defaultSlides: Slide[] = [
  { id: "default-parking", image_url: heroImg, caption: "Granite paving stone parking design in Bangalore" },
  { id: "default-bench", image_url: benchImg, caption: "Granite stone bench and garden furniture" },
  { id: "default-chair", image_url: chairImg, caption: "Stone chair for outdoor seating" },
  { id: "default-flooring", image_url: flooringImg, caption: "Floor stone and outdoor flooring" },
  { id: "default-paving", image_url: parkingImg, caption: "Granite paving stone slabs with grass joints" },
  { id: "default-cobblestone", image_url: cobblestoneImg, caption: "Cobblestone pavers for landscape pathways" },
];

const SLIDE_DURATION_MS = 7000;

export const Hero = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    publicApi.list<Slide>("hero_images", { orderBy: "sort_order" }).then(setSlides).catch(() => undefined);
  }, []);

  const items: Slide[] = slides.length ? slides : defaultSlides;

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), SLIDE_DURATION_MS);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <section
      id="home"
      className="relative mt-[68px] w-full overflow-hidden bg-secondary px-0 pb-12 pt-3 sm:mt-[76px] md:h-[calc(100vh-76px)] md:min-h-[620px] md:pb-0 md:pt-0"
    >
      <div className="relative mx-auto aspect-[5/4] w-full max-w-[680px] overflow-hidden bg-black shadow-deep md:absolute md:inset-x-0 md:bottom-0 md:top-8 md:aspect-auto md:max-w-none md:shadow-none">
        {items.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity [transition-duration:2000ms] ease-in-out ${i === idx ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={s.image_url}
              alt={s.caption || "Granite paving stone and floor stone showcase in Bangalore"}
              width={1920}
              height={1088}
              className={`absolute inset-0 h-full w-full object-contain md:object-cover ${i === idx ? "md:animate-ken-burns" : ""}`}
            />
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-8">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 transition-all ${i === idx ? "w-8 bg-primary" : "w-4 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
