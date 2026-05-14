import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Factory, Handshake, PackageCheck } from "lucide-react";
import { publicApi } from "@/lib/api";
import logo from "@/assets/sj-granite-paving-stone-mark.jpg";

type SiteSettings = {
  owner_image_url?: string | null;
};

const highlights = [
  { icon: Factory, title: "Manufacturing", text: "Granite cobblestone and paving stone made for outdoor strength." },
  { icon: PackageCheck, title: "Wholesale & Retail", text: "Supplying bulk orders, retail needs and project quantities." },
  { icon: Handshake, title: "Dealer Network", text: "Reliable dealing, clear guidance and timely material support." },
  { icon: BadgeCheck, title: "Quality Focus", text: "Careful selection, finishing and delivery for every order." },
];

export const About = () => {
  const [ownerImageUrl, setOwnerImageUrl] = useState<string | null>(null);

  useEffect(() => {
    publicApi
      .list<SiteSettings>("site_settings", { id: "main" })
      .then(([data]) => setOwnerImageUrl(data?.owner_image_url || null))
      .catch(() => undefined);
  }, []);

  const imageSrc = ownerImageUrl || logo;
  const imageAlt = ownerImageUrl
    ? "Mohammad Javeed, owner of SJ Granite Paving Stone"
    : "SJ Granite Paving Stone";

  return (
    <section id="about" className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="relative bg-secondary px-7 py-9 text-secondary-foreground md:px-10 md:py-12">
            <div className="absolute inset-x-0 top-0 h-px bg-gold-gradient" />
            <div className="flex items-center gap-5">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-primary/40 bg-background shadow-gold-glow md:h-32 md:w-32">
                <img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Founder & Proprietor</span>
                <h2 className="mt-2 font-serif text-3xl text-white md:text-4xl">Mohammad Javeed</h2>
                <p className="mt-2 text-sm text-secondary-foreground/65">SJ Granite Paving Stone</p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-y border-white/10 py-6">
              {[
                { v: "2013", l: "Established" },
                { v: "3", l: "Business Lines" },
                { v: "IN", l: "Supply Reach" },
              ].map((item) => (
                <div key={item.l}>
                  <div className="font-serif text-3xl text-gold-gradient md:text-4xl">{item.v}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-[0.25em] text-secondary-foreground/55">{item.l}</div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm leading-7 text-secondary-foreground/72">
              Since 2013, we have worked with builders, contractors, homeowners and landscape teams who need dependable stone materials with honest guidance and consistent supply.
            </p>
          </div>

          <div className="lg:pt-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold-gradient" />
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">About The Company</span>
            </div>
            <h1 className="mt-5 font-serif text-4xl leading-[1.05] md:text-6xl">
              Granite, cobblestone and paving stone supply with trusted experience.
            </h1>

            <div className="mt-8 space-y-5 text-muted-foreground leading-8">
              <p>
                My name is Mohammad Javeed. Since 2013, I have been working in granite cobblestone, paving stone and related natural stone products as a manufacturer, wholesaler, retailer and dealer.
              </p>
              <p>
                At SJ Granite Paving Stone, we supply durable stone materials for residential, commercial and landscape projects. Our work covers granite paving stones, cobblestones, parking pavers, outdoor flooring stones and custom stone requirements.
              </p>
              <p>
                We focus on strong material quality, practical product guidance, fair dealing and dependable supply. Whether the requirement is a single site order or a larger project quantity, our goal is to make the buying process clear, professional and reliable.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item.title} className="border border-foreground/10 bg-card/40 p-5">
                  <item.icon className="h-5 w-5 text-primary" />
                  <div className="mt-4 font-serif text-xl text-foreground">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-3 bg-gold-gradient px-7 py-4 text-xs font-medium uppercase tracking-[0.25em] text-primary-foreground shimmer transition-all duration-500 hover:shadow-gold-glow"
              >
                View Products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-3 border border-foreground/15 px-7 py-4 text-xs font-medium uppercase tracking-[0.25em] transition-colors hover:border-primary hover:text-primary"
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
