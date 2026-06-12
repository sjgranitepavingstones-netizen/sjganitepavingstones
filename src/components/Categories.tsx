import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";
import bench from "@/assets/product-bench.jpg";
import chair from "@/assets/product-chair.jpg";
import cobblestone from "@/assets/product-cobblestone.jpg";
import flooring from "@/assets/product-flooring.jpg";
import parking from "@/assets/product-parking.jpg";

const categories = [
  { img: parking, name: "Granite Paving Stone", count: 24, desc: "Large granite paving slabs for driveways, courtyards, parking areas and villa landscapes." },
  { img: cobblestone, name: "Cobblestone Pavers", count: 18, desc: "Decorative cobblestone paving for gardens, courtyards and landscape pathways." },
  { img: flooring, name: "Floor Stone", count: 36, desc: "Outdoor floor stone for temple, terrace, patio, parking and walkway use." },
  { img: bench, name: "Stone Benches & Tables", count: 15, desc: "Granite bench, table and garden furniture products for premium outdoor spaces." },
  { img: chair, name: "Garden Stone Seating", count: 12, desc: "Durable granite seating sets for resorts, homes, gardens and landscape projects." },
];

export const Categories = () => {
  return (
    <section id="categories" className="py-16 md:py-32 bg-background">
      <div className="container">
        <SectionHeading
          eyebrow="Browse The Range"
          title="Product Categories"
          subtitle="Explore granite paving stone, cobblestone, floor stone, parking pavers and stone furniture for Bangalore and Karnataka projects."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((c, i) => (
            <Link
              key={c.name}
              to="/granite-paving-stone-bangalore"
              className="group relative block aspect-[16/10] overflow-hidden img-zoom bg-secondary"
            >
              <img src={c.img} alt={`${c.name} in Bangalore`} loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 p-5 opacity-0 translate-y-6 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 sm:p-8 md:p-10">
                <div className="text-[10px] uppercase tracking-[0.18em] text-primary mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:tracking-[0.3em]">
                  {String(i + 1).padStart(2, "0")} - {c.count} options
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
                  {c.name}
                </h3>
                <p className="mt-3 max-w-md text-sm text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{c.desc}</p>
                <div className="mt-4 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-xs sm:tracking-[0.3em]">
                  Discover <span className="h-px w-8 bg-gold-gradient" />
                </div>
              </div>
              <span className="pointer-events-none absolute inset-0 border border-transparent group-hover:border-primary/60 transition-colors duration-500" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
