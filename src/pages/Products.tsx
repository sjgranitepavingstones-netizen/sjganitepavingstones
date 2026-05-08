import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { publicApi } from "@/lib/api";
import { colorToCss, variantColorLabel } from "@/lib/colors";
import { useSeo, breadcrumbSchema, serviceSchema } from "@/lib/seo";

type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  price_label: string | null;
  main_image_url: string | null;
  category_id: string | null;
};
type Category = { id: string; name: string; slug: string };
type Variant = { id: string; product_id: string; name: string; color: string | null; image_url: string; sort_order?: number };

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [variantsByProduct, setVariantsByProduct] = useState<Record<string, Variant[]>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, Variant>>({});
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  useSeo({
    title: "Granite Paving Stone Products Bangalore | Cobblestone & Floor Stone",
    description:
      "Browse granite paving stone, cobblestone pavers, floor stone, parking pavers, stone chairs and outdoor stone furniture from SJ Granite Paving Stone in Bangalore.",
    path: "/products",
    keywords: [
      "granite products Bangalore",
      "paving stone products Bangalore",
      "cobblestone pavers Bangalore",
      "floor stone Bangalore",
      "stone chair Bangalore",
    ],
    schema: [
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
      ]),
      serviceSchema(
        "Granite paving stone products in Bangalore",
        "Granite paving stone, cobblestone, floor stone and outdoor stone furniture products for Bangalore projects.",
        "/products"
      ),
    ],
  });

  useEffect(() => {
    (async () => {
      const [p, c] = await Promise.all([
        publicApi.list<Product>("products", { orderBy: "created_at" }),
        publicApi.list<Category>("categories", { orderBy: "sort_order" }),
      ]);
      setProducts(p);
      setCats(c);
      const variantEntries = await Promise.all(
        p.map(async (product) => [
          product.id,
          await publicApi.list<Variant>("product_variants", { product_id: product.id, orderBy: "sort_order" }),
        ] as const)
      );
      setVariantsByProduct(Object.fromEntries(variantEntries));
    })();
  }, []);

  const filtered = products.filter((p) =>
    (filter === "all" || p.category_id === filter) &&
    (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-secondary text-secondary-foreground pt-36 pb-16 md:pb-20">
        <div className="container text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Bangalore Collection</span>
          <h1 className="font-serif text-5xl md:text-7xl text-white mt-4 leading-[1.05]">
            Bangalore <span className="italic text-gold-gradient">Stone Catalogue</span>
          </h1>
          <p className="text-secondary-foreground/70 max-w-2xl mx-auto mt-6 text-sm md:text-base">
            Granite paving stone, cobblestone pavers, floor stone, parking stone and stone furniture for Bangalore and Karnataka projects.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilter("all")}
                className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] border transition-colors ${filter === "all" ? "bg-foreground text-background border-foreground" : "border-foreground/15 hover:border-primary"}`}>
                All
              </button>
              {cats.map((c) => (
                <button key={c.id} onClick={() => setFilter(c.id)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-[0.25em] border transition-colors ${filter === c.id ? "bg-foreground text-background border-foreground" : "border-foreground/15 hover:border-primary"}`}>
                  {c.name}
                </button>
              ))}
            </div>
            <div className="relative md:w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search paving stone, cobblestone..."
                className="w-full pl-10 pr-3 py-2.5 bg-transparent border border-foreground/15 text-sm focus:border-primary outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => {
              const variants = variantsByProduct[p.id] || [];
              const selected = selectedVariants[p.id];
              const image = selected?.image_url || p.main_image_url || "/placeholder.svg";

              return (
                <div key={p.id} className="group">
                  <Link to={`/products/${p.slug}`} className="block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-secondary img-zoom">
                      <img src={image} alt={`${p.name} Bangalore granite stone product`} loading="lazy"
                        className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 inset-x-0 p-5">
                        <h3 className="font-serif text-lg text-white">{p.name}</h3>
                        {p.tagline && <p className="text-[10px] uppercase tracking-[0.22em] text-primary mt-1">{p.tagline}</p>}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-white/75">{selected?.name || p.price_label}</span>
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gold-gradient text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {variants.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {variants.map((variant) => {
                        const label = variantColorLabel(variant.color, variant.name);
                        const active = selected?.id === variant.id;

                        return (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => setSelectedVariants((current) => ({ ...current, [p.id]: variant }))}
                            className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.14em] transition-colors ${active ? "border-primary text-primary" : "border-foreground/15 text-foreground/60 hover:border-primary/50 hover:text-foreground"}`}
                            aria-pressed={active}
                            aria-label={`Show ${label} ${p.name}`}
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-foreground/15"
                              style={{ backgroundColor: colorToCss(label) }}
                            />
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && <p className="text-center text-foreground/50 py-16">No products found.</p>}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default ProductsPage;
