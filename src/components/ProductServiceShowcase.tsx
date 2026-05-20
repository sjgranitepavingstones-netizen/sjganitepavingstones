import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import paving from "@/assets/product-parking.jpg";
import cobblestone from "@/assets/product-cobblestone.jpg";
import flooring from "@/assets/product-flooring.jpg";
import bench from "@/assets/product-bench.jpg";
import chair from "@/assets/product-chair.jpg";

const showcase = [
  {
    image: paving,
    title: "Granite Paving Stone",
    service: "Driveway, villa entrance, parking area and landscape paving supply.",
  },
  {
    image: cobblestone,
    title: "Cobblestone Pavers",
    service: "Pattern cobblestone work for gardens, pathways and premium outdoor floors.",
  },
  {
    image: flooring,
    title: "Outdoor Floor Stone",
    service: "Natural floor stone for patios, terraces, temples and exterior walkways.",
  },
  {
    image: bench,
    title: "Stone Benches & Tables",
    service: "Granite garden furniture for homes, resorts, farmhouses and public spaces.",
  },
  {
    image: chair,
    title: "Garden Stone Seating",
    service: "Durable outdoor seating sets with supply, finishing and delivery support.",
  },
];

export const ProductServiceShowcase = () => {
  return (
    <section className="bg-secondary py-24 text-secondary-foreground md:py-32">
      <div className="container">
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-gold-gradient" />
              <span className="text-xs uppercase tracking-[0.3em] text-primary">Products & Services</span>
            </div>
            <h2 className="font-serif text-4xl leading-[1.05] text-white md:text-5xl">
              More Stone Options For Outdoor Projects
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-secondary-foreground/70 md:text-base">
              Choose the product style and service support needed for paving, flooring, landscaping and garden stone furniture projects.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 self-start text-xs uppercase tracking-[0.3em] text-primary link-gold md:self-end"
          >
            View Catalogue <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-px bg-primary/20 sm:grid-cols-2 lg:grid-cols-5">
          {showcase.map((item, index) => (
            <Link
              key={item.title}
              to="/products"
              className="group relative min-h-[360px] overflow-hidden bg-black"
            >
              <img
                src={item.image}
                alt={`${item.title} service by SJ Granite Paving Stone`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-primary">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="font-serif text-2xl leading-tight text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/78">{item.service}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
