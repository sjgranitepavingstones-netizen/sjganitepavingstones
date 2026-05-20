import quarryImage from "@/assets/workflow-quarry.webp";
import factoryImage from "@/assets/workflow-factory.webp";
import installationImage from "@/assets/workflow-installation.webp";

const steps = [
  {
    number: "01",
    title: "Responsible Stone Sourcing",
    image: quarryImage,
    alt: "Granite stone blocks being sourced from a quarry",
    copy:
      "We begin with legally sourced natural stone from approved quarry supply channels. Strong granite blocks are selected for durability, color tone and outdoor performance before they move toward production.",
  },
  {
    number: "02",
    title: "Factory Cutting & Finishing",
    image: factoryImage,
    alt: "Granite stone being cut and finished in a factory",
    copy:
      "At the factory, the raw stone is cut, shaped and finished into paving stones, cobblestone pavers, floor stone and custom outdoor stone pieces with careful attention to size, surface and edge quality.",
  },
  {
    number: "03",
    title: "Site Delivery & Installation",
    image: installationImage,
    alt: "Workers installing cobblestone paving at a customer site",
    copy:
      "Once the material is ready, we coordinate delivery to the customer site and support professional fixing for driveways, pathways, gardens, parking areas and outdoor landscapes.",
  },
];

export const CraftWorkflow = () => (
  <section className="bg-secondary text-secondary-foreground py-24 md:py-32 overflow-hidden">
    <div className="container">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-end mb-14">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Our Stone Journey</span>
          <h2 className="font-serif text-4xl md:text-6xl text-white mt-4 leading-tight">
            From The Quarry To Your Outdoor Space
          </h2>
        </div>
        <p className="text-secondary-foreground/70 leading-relaxed max-w-2xl">
          Every project follows a clear, hands-on process. We source natural granite responsibly, prepare it in the
          factory, and bring the finished paving stone, cobblestone and outdoor stone products to the customer site
          with practical installation support.
        </p>
      </div>

      <div className="space-y-8">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="grid lg:grid-cols-2 gap-0 border border-primary/15 bg-background/5"
          >
            <div className={index % 2 === 1 ? "lg:order-2" : ""}>
              <img
                src={step.image}
                alt={step.alt}
                loading="lazy"
                className="h-full min-h-[280px] max-h-[520px] w-full object-cover"
              />
            </div>
            <div className="p-7 md:p-10 lg:p-12 flex flex-col justify-center">
              <div className="text-sm uppercase tracking-[0.35em] text-primary">{step.number}</div>
              <h3 className="font-serif text-3xl md:text-5xl text-white mt-5">{step.title}</h3>
              <p className="text-secondary-foreground/70 leading-relaxed mt-6">{step.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
