import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";
import { publicApi } from "@/lib/api";
import bench from "@/assets/product-bench.jpg";

type SiteSettings = {
  owner_image_url?: string | null;
};

const highlights = [
  "Granite paving and parking stone work",
  "Outdoor flooring, garden and villa stone design",
  "Custom benches, seating and decorative pieces",
  "Professional measurement, finishing and installation support",
];

export const About = () => {
  const [ownerImageUrl, setOwnerImageUrl] = useState<string | null>(null);

  useEffect(() => {
    publicApi
      .list<SiteSettings>("site_settings", { id: "main" })
      .then(([data]) => setOwnerImageUrl(data?.owner_image_url || null))
      .catch(() => undefined);
  }, []);

  const imageSrc = ownerImageUrl || bench;
  const imageAlt = ownerImageUrl
    ? "Mohammad Javeed, owner of SJ Granite Paving Stone"
    : "SJ Granite Paving Stone craftsmanship";

  return (
    <section id="about" className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="container grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="relative">
          <div className="img-zoom aspect-[4/5] overflow-hidden shadow-luxury">
            <img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="absolute -bottom-8 -right-4 md:-right-12 bg-secondary text-secondary-foreground p-8 md:p-10 max-w-xs shadow-deep">
            <div className="font-serif text-5xl md:text-6xl text-gold-gradient leading-none">2013</div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-primary">Established</div>
            <p className="mt-4 text-sm text-secondary-foreground/70 leading-relaxed">
              Founded by Mohammad Javeed with a clear focus on dependable granite paving and stone service.
            </p>
          </div>
          <div className="absolute -top-6 -left-6 h-24 w-24 border-l-2 border-t-2 border-primary hidden md:block" />
        </div>

        <div>
          <SectionHeading
            align="left"
            eyebrow="About Us"
            title="SJ Granite Paving Stone"
          />
          <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed">
            <p>
              SJ Granite Paving Stone started in 2013 under the ownership of Mohammad Javeed. From the beginning, our purpose has been simple: provide strong materials, neat workmanship and a professional service experience for every customer.
            </p>
            <p>
              We work with granite paving stones, parking designs, outdoor flooring, garden stone products and custom decorative stone pieces. Every project is handled with attention to measurement, stone selection, finishing detail and long-term durability.
            </p>
            <p>
              Our team believes good service means clear communication, honest guidance, careful delivery and clean execution at the site. Whether the work is for a home, villa, commercial space or outdoor landscape, we aim to complete it with quality that the customer can trust.
            </p>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            {highlights.map((item) => (
              <div key={item} className="border border-foreground/10 px-4 py-3 text-sm text-foreground/75 bg-card/40">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
            {[
              { v: "2013", l: "Started" },
              { v: "850+", l: "Projects" },
              { v: "100%", l: "Service Focus" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-serif text-3xl text-gold-gradient">{s.v}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>

          <Link
            to="/contact"
            className="mt-10 inline-flex items-center gap-3 px-8 py-4 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.3em] font-medium shimmer hover:shadow-gold-glow transition-all duration-500"
          >
            Contact Our Team
          </Link>
        </div>
      </div>
    </section>
  );
};
