import { SectionHeading } from "./SectionHeading";
import { Hammer, Compass, Truck, Shield, Sparkles, Ruler } from "lucide-react";

const services = [
  { icon: Compass, title: "Stone Design Guidance", desc: "Granite paving stone, cobblestone and floor stone planning for Bangalore homes, villas and commercial spaces." },
  { icon: Hammer, title: "Granite Craftsmanship", desc: "Neat cutting, finishing and placement for paving stone, parking pavers, stone chairs, benches and outdoor stonework." },
  { icon: Ruler, title: "On-Site Measurement", desc: "Professional site measurement for parking areas, pathways, gardens, patios, terraces and floor stone projects." },
  { icon: Truck, title: "Bangalore Delivery", desc: "Material coordination and delivery support for Bengaluru and nearby Karnataka locations." },
  { icon: Sparkles, title: "Polish & Finishing", desc: "Surface finishing, edge detailing and practical guidance for maintaining outdoor granite and floor stone." },
  { icon: Shield, title: "Reliable Service", desc: "Clear communication, careful handling and durable workmanship from inquiry to installation support." },
];

export const Services = () => {
  return (
    <section id="services" className="py-24 md:py-32 bg-background relative">
      <div className="container">
        <SectionHeading
          eyebrow="Bangalore Stone Services"
          title="Crafted Stone, Curated Service"
          subtitle="From granite paving stone and cobblestone to floor stone and stone furniture, every project is planned for the site, usage and finish the customer needs."
        />

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="group relative bg-background p-10 transition-all duration-700 hover:bg-secondary cursor-default"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute top-0 left-0 h-px w-0 bg-gold-gradient transition-all duration-700 group-hover:w-full" />
              <div className="relative">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full border border-primary/30 text-primary group-hover:bg-gold-gradient group-hover:text-primary-foreground group-hover:border-transparent transition-all duration-500">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-serif text-2xl font-medium group-hover:text-primary-glow transition-colors duration-500">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground group-hover:text-secondary-foreground/80 transition-colors duration-500">
                  {s.desc}
                </p>
                <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-primary/70">
                  0{i + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
