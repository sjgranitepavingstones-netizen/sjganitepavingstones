import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";
import chair from "@/assets/product-chair.jpg";
import flooring from "@/assets/product-flooring.jpg";
import parking from "@/assets/product-parking.jpg";

const categories = [
  { img: parking, name: "Granite Paving Stone", count: 24, desc: "Driveway, pathway and outdoor paving stone for Bangalore sites." },
  { img: parking, name: "Cobblestone Pavers", count: 18, desc: "Granite cobblestone for gardens, courtyards and parking edges." },
  { img: flooring, name: "Floor Stone", count: 36, desc: "Outdoor floor stone for terrace, patio, parking and walkway use." },
  { img: chair, name: "Stone Chairs & Benches", count: 15, desc: "Granite stone chair, bench, table and garden seating products." },
];

export const Categories = () => {
  return (
    <section id="categories" className="py-24 md:py-32 bg-background">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 md:p-10">
                <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2">
                  {String(i + 1).padStart(2, "0")} - {c.count} options
                </div>
                <h3 className="font-serif text-3xl md:text-4xl text-white leading-tight">
                  {c.name}
                </h3>
                <p className="mt-3 text-sm text-white/72 max-w-md">{c.desc}</p>
                <div className="mt-4 inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500">
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
