import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, MapPin, PhoneCall } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AtelierInfo } from "@/components/AtelierInfo";
import { useSeo, localBusinessSchema, breadcrumbSchema, serviceSchema } from "@/lib/seo";
import pavingImage from "@/assets/product-parking.jpg";
import flooringImage from "@/assets/product-flooring.jpg";
import chairImage from "@/assets/product-chair.jpg";
import benchImage from "@/assets/product-bench.jpg";

const serviceCards = [
  {
    title: "Granite Paving Stone Bangalore",
    image: pavingImage,
    text: "Durable granite paving stones for driveways, parking areas, villas, commercial entrances, walkways and outdoor landscapes across Bangalore.",
  },
  {
    title: "Cobblestone Pavers",
    image: pavingImage,
    text: "Classic cobblestone and granite setts for garden paths, courtyards, resort landscaping, edging and high-traffic outdoor spaces.",
  },
  {
    title: "Floor Stone & Outdoor Flooring",
    image: flooringImage,
    text: "Natural stone flooring for patios, balconies, terraces, pathways, parking floors and exterior floor finishing in Karnataka climate.",
  },
  {
    title: "Stone Chairs, Benches & Tables",
    image: chairImage,
    text: "Custom granite stone chair, stone bench, garden table and outdoor seating pieces for homes, parks, villas and landscape projects.",
  },
];

const searchTerms = [
  "granite paving stone Bangalore",
  "paving stone Bangalore",
  "cobblestone Bangalore",
  "floor stone Bangalore",
  "parking stone pavers Bangalore",
  "stone chair Bangalore",
  "stone bench Bangalore",
  "outdoor stone flooring Bangalore",
  "granite cobblestone Karnataka",
  "garden stone furniture Bangalore",
];

const areas = [
  "Whitefield",
  "Electronic City",
  "HSR Layout",
  "Koramangala",
  "Indiranagar",
  "Jayanagar",
  "JP Nagar",
  "Hebbal",
  "Yelahanka",
  "Sarjapur Road",
  "Marathahalli",
  "Bannerghatta Road",
];

const BangaloreStoneServices = () => {
  useSeo({
    title: "Granite Paving Stone Bangalore | Cobblestone, Floor Stone & Stone Chairs",
    description:
      "SJ Granite Paving Stone supplies and installs granite paving stone, cobblestone, floor stone, parking pavers, stone chairs and outdoor stone furniture in Bangalore, Karnataka.",
    path: "/granite-paving-stone-bangalore",
    keywords: searchTerms,
    schema: [
      localBusinessSchema(),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Granite Paving Stone Bangalore", path: "/granite-paving-stone-bangalore" },
      ]),
      serviceSchema(
        "Granite paving stone, cobblestone and floor stone in Bangalore",
        "Granite paving stone, cobblestone, parking pavers, floor stone and stone furniture service for Bangalore and Karnataka customers.",
        "/granite-paving-stone-bangalore"
      ),
    ],
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="relative bg-secondary text-secondary-foreground pt-36 pb-20 overflow-hidden">
        <img src={pavingImage} alt="Granite paving stone work in Bangalore" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        <div className="container relative max-w-5xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-gold-gradient" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-medium">Bangalore, Karnataka</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.03] max-w-4xl">
            Granite Paving Stone, Cobblestone & Floor Stone In Bangalore
          </h1>
          <p className="mt-6 text-base md:text-lg text-white/78 max-w-3xl leading-relaxed">
            SJ Granite Paving Stone works with customers across Bangalore for granite paving stone, cobblestone pavers, parking stone, floor stone, outdoor flooring, stone chairs, stone benches and custom garden stone products.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link to="/contact" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.25em] shimmer">
              Get Bangalore Quote <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="tel:+918217257354" className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-primary/60 text-white text-xs uppercase tracking-[0.25em] hover:bg-primary/10 transition-colors">
              <PhoneCall className="h-4 w-4" /> Call Now
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Local Stone Specialist</span>
              <h2 className="font-serif text-4xl md:text-5xl mt-4 leading-tight">
                Built For Bangalore Homes, Villas, Parking Areas & Landscapes
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Bangalore customers often search for strong outdoor stone that can handle vehicle movement, rain, sun and daily foot traffic. Our granite paving stones and cobblestone pavers are selected for strength, finish and long-term outdoor performance.
                </p>
                <p>
                  We support projects for residential houses, villas, commercial buildings, farmhouses, garden landscapes, parking floors, pathways, patios and outdoor seating areas throughout Bengaluru and nearby Karnataka locations.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[pavingImage, flooringImage, chairImage, benchImage].map((image, index) => (
                <img
                  key={image}
                  src={image}
                  alt={`Bangalore granite stone service ${index + 1}`}
                  className="aspect-square w-full object-cover shadow-luxury"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary text-secondary-foreground">
        <div className="container">
          <div className="max-w-3xl">
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Stone Products</span>
            <h2 className="font-serif text-4xl md:text-5xl text-white mt-4">What We Provide In Bangalore</h2>
            <p className="text-secondary-foreground/70 mt-5 leading-relaxed">
              From stone selection to measurement and finishing, our work is planned around the site, usage and design style required by the customer.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {serviceCards.map((service) => (
              <article key={service.title} className="bg-background text-foreground border border-primary/15">
                <img src={service.image} alt={service.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                <div className="p-6">
                  <h3 className="font-serif text-2xl">{service.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{service.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container grid lg:grid-cols-2 gap-12">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Popular Searches</span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4">Stone Keywords We Serve</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {searchTerms.map((term) => (
                <span key={term} className="px-4 py-2 border border-foreground/10 bg-card text-sm text-foreground/75">
                  {term}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Service Areas</span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4">Bengaluru Locations</h2>
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {areas.map((area) => (
                <div key={area} className="flex items-center gap-3 border border-foreground/10 bg-card px-4 py-3">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground/75">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              "Professional on-site measurement and product guidance",
              "Granite, cobblestone and floor stone options for different budgets",
              "Support for parking, garden, pathway and outdoor seating projects",
            ].map((point) => (
              <div key={point} className="flex gap-4 bg-background border border-foreground/10 p-6">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
                <p className="text-foreground/75 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AtelierInfo />
      <Footer />
    </main>
  );
};

export default BangaloreStoneServices;
