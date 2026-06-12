import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, MessageCircle, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { publicApi } from "@/lib/api";
import { variantColorLabel } from "@/lib/colors";
import { useSeo, breadcrumbSchema, serviceSchema } from "@/lib/seo";
import { createProductWhatsAppUrl } from "@/lib/whatsapp";

type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  main_image_url: string | null;
  category_id: string | null;
};
type Category = { id: string; name: string; slug: string };
type Variant = { id: string; product_id: string; name: string; color: string | null; material?: string | null; image_url: string; image_urls?: string[]; sort_order?: number };

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [variantsByProduct, setVariantsByProduct] = useState<Record<string, Variant[]>>({});
  const [filter, setFilter] = useState<string>("all");
  const [colorFilter, setColorFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  useSeo({
    title: "Granite Paving Stone Products India | Cobblestone & Floor Stone",
    description:
      "Browse granite paving stone, cobblestone pavers, floor stone, parking pavers, stone chairs and outdoor stone furniture from SJ Granite Paving Stone for Bangalore, Karnataka, Mumbai and all India projects.",
    path: "/products",
    keywords: [
      "granite products Bangalore",
      "granite products India",
      "paving stone products India",
      "cobblestone pavers India",
      "floor stone India",
      "paving stone products Bangalore",
      "cobblestone pavers Bangalore",
      "floor stone Bangalore",
      "stone chair Bangalore",
      "granite products Mumbai",
      "paving stone Mysuru",
      "cobblestone Mangalore",
      "floor stone Belgaum",
      "parking stone Tumkur",
      "pavingstone",
      "naturalstone",
    ],
    schema: [
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
      ]),
      serviceSchema(
        "Granite paving stone products in Bangalore, Karnataka and Mumbai",
        "Granite paving stone, cobblestone, floor stone and outdoor stone furniture products for Bangalore, Karnataka and Mumbai projects.",
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

  useEffect(() => {
    const catSlug = searchParams.get("cat");
    if (!catSlug || cats.length === 0) return;
    const matched = cats.find((cat) => cat.slug === catSlug);
    if (matched) setFilter(matched.id);
  }, [cats, searchParams]);

  const categoryProducts = products.filter((product) => filter === "all" || product.category_id === filter);
  const colorOptions = Array.from(
    new Set(
      categoryProducts
        .flatMap((product) => variantsByProduct[product.id] || [])
        .flat()
        .map((variant) => variantColorLabel(variant.color, variant.name))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    if (colorFilter !== "all" && !colorOptions.includes(colorFilter)) {
      setColorFilter("all");
    }
  }, [colorFilter, colorOptions]);

  const filtered = products.filter((p) =>
    (filter === "all" || p.category_id === filter) &&
    (colorFilter === "all" || (variantsByProduct[p.id] || []).some((variant) => variantColorLabel(variant.color, variant.name) === colorFilter)) &&
    (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-secondary text-secondary-foreground pt-36 pb-16 md:pb-20">
        <div className="container text-center">
          <span className="text-[10px] uppercase tracking-[0.18em] text-primary sm:tracking-[0.3em]">India Stone Collection</span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-white mt-4 leading-[1.05]">
            India <span className="italic text-gold-gradient">Stone Catalogue</span>
          </h1>
          <p className="text-secondary-foreground/70 max-w-2xl mx-auto mt-6 text-sm md:text-base">
            Granite paving stone, cobblestone pavers, floor stone, parking stone and stone furniture for Bangalore, Karnataka, Mumbai and all India projects.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container">
          <div className="flex flex-col gap-4 mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[240px_220px]">
              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-foreground/50">Category</span>
                <select
                  value={filter}
                  onChange={(event) => {
                    setFilter(event.target.value);
                    setColorFilter("all");
                  }}
                  className="w-full border border-foreground/15 bg-background px-3 py-3 text-sm outline-none transition-colors focus:border-primary"
                >
                  <option value="all">All categories</option>
                  {cats.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-foreground/50">Color</span>
                <select
                  value={colorFilter}
                  onChange={(event) => setColorFilter(event.target.value)}
                  className="w-full border border-foreground/15 bg-background px-3 py-3 text-sm outline-none transition-colors focus:border-primary"
                >
                  <option value="all">All colors</option>
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search paving stone, cobblestone..."
                className="w-full pl-10 pr-3 py-2.5 bg-transparent border border-foreground/15 text-sm focus:border-primary outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => {
              const variants = variantsByProduct[p.id] || [];
              const colorMatched = colorFilter === "all" ? undefined : variants.find((variant) => variantColorLabel(variant.color, variant.name) === colorFilter);
              const selected = colorMatched;
              const image = selected?.image_url || selected?.image_urls?.[0] || p.main_image_url || "/placeholder.svg";
              const selectedLabel = selected ? variantColorLabel(selected.color, selected.name) : "";
              const whatsappUrl = createProductWhatsAppUrl(p, selected, selectedLabel);

              return (
                <div key={p.id} className="group">
                  <Link to={`/products/${p.slug}${selected ? `?variant=${selected.id}` : ""}`} className="block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-secondary img-zoom">
                      <img src={image} alt={`${p.name} Bangalore granite stone product`} loading="lazy"
                        className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100" />
                      <div className="absolute bottom-0 inset-x-0 p-5 opacity-0 translate-y-6 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        <h3 className="font-serif text-lg text-white">{p.name}</h3>
                        {p.tagline && <p className="text-[10px] uppercase tracking-[0.22em] text-primary mt-1">{p.tagline}</p>}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-white/75">{selected?.name || "View details"}</span>
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gold-gradient text-primary-foreground">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-[#25D366]/60 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[#128C4A] transition-colors hover:bg-[#25D366] hover:text-white sm:px-4 sm:tracking-[0.2em]"
                  >
                    <MessageCircle className="h-3.5 w-3.5" fill="currentColor" />
                    WhatsApp
                  </a>
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
