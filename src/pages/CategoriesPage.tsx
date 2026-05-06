import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { publicApi } from "@/lib/api";
import { useSeo, breadcrumbSchema, serviceSchema } from "@/lib/seo";

const CategoriesPage = () => {
  const [cats, setCats] = useState<any[]>([]);
  useSeo({
    title: "Stone Categories Bangalore | Paving Stone, Cobblestone & Floor Stone",
    description:
      "Explore granite paving stone, cobblestone pavers, floor stone, parking stone and stone furniture categories for Bangalore and Karnataka projects.",
    path: "/categories",
    keywords: ["stone categories Bangalore", "paving stone category Bangalore", "cobblestone floor stone Bangalore"],
    schema: [
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Categories", path: "/categories" },
      ]),
      serviceSchema(
        "Stone product categories in Bangalore",
        "Granite paving stone, cobblestone, floor stone and stone furniture categories for Bangalore customers.",
        "/categories"
      ),
    ],
  });

  useEffect(() => {
    publicApi.list("categories", { orderBy: "sort_order", withCounts: true }).then(setCats).catch(() => undefined);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-secondary text-secondary-foreground pt-36 pb-16">
        <div className="container text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Bangalore Collections</span>
          <h1 className="font-serif text-5xl md:text-7xl text-white mt-4">Stone <span className="italic text-gold-gradient">Categories</span></h1>
          <p className="text-secondary-foreground/70 max-w-2xl mx-auto mt-6 text-sm md:text-base">
            Granite paving stone, cobblestone, floor stone, parking pavers and outdoor stone furniture categories.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-6">
          {cats.map((c) => (
            <Link key={c.id} to={`/products?cat=${c.slug}`} className="group relative aspect-[16/10] overflow-hidden img-zoom bg-secondary block">
              <img src={c.image_url || "/placeholder.svg"} alt={c.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-8">
                <span className="text-[10px] uppercase tracking-[0.3em] text-primary">
                  {c.products?.[0]?.count ?? 0} Products
                </span>
                <h3 className="font-serif text-3xl md:text-4xl text-white mt-2">{c.name}</h3>
                <p className="text-white/70 text-sm mt-2 max-w-md">{c.description}</p>
                <span className="inline-flex items-center gap-2 text-primary text-[10px] uppercase tracking-[0.3em] mt-4">
                  Explore <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default CategoriesPage;
