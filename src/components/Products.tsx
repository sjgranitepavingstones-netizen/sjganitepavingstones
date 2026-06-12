import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { publicApi } from "@/lib/api";
import { variantColorLabel } from "@/lib/colors";
import { createProductWhatsAppUrl } from "@/lib/whatsapp";

export const Products = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [variantsByProduct, setVariantsByProduct] = useState<Record<string, any[]>>({});
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");

  useEffect(() => {
    (async () => {
      const [products, cats] = await Promise.all([
        publicApi.list<any>("products", { featured: true, orderBy: "created_at", limit: 8 }),
        publicApi.list<any>("categories", { orderBy: "sort_order" }),
      ]);
      setItems(products);
      setCategories(cats);

      const variantEntries = await Promise.all(
        products.map(async (product) => [
          product.id,
          await publicApi.list<any>("product_variants", { product_id: product.id, orderBy: "sort_order" }),
        ] as const)
      );
      setVariantsByProduct(Object.fromEntries(variantEntries));
    })().catch(() => undefined);
  }, []);

  const categoryItems = items.filter((product) => categoryFilter === "all" || product.category_id === categoryFilter);
  const colorOptions = Array.from(
    new Set(
      categoryItems
        .flatMap((product) => variantsByProduct[product.id] || [])
        .map((variant) => variantColorLabel(variant.color, variant.name))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    if (colorFilter !== "all" && !colorOptions.includes(colorFilter)) {
      setColorFilter("all");
    }
  }, [colorFilter, colorOptions]);

  const filteredItems = items.filter((product) =>
    (categoryFilter === "all" || product.category_id === categoryFilter) &&
    (colorFilter === "all" || (variantsByProduct[product.id] || []).some((variant) => variantColorLabel(variant.color, variant.name) === colorFilter))
  );

  return (
    <section id="products" className="py-16 md:py-32 bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-gold-gradient" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-primary font-medium sm:text-xs sm:tracking-[0.3em]">India Stone Collection</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] text-white max-w-2xl">
              Granite Paving Stone, <span className="italic text-gold-gradient">Cobblestone & Stone Furniture</span>
            </h2>
          </div>
          <Link to="/products" className="link-gold text-xs uppercase tracking-[0.18em] text-primary inline-flex items-center gap-2 self-start sm:tracking-[0.3em] md:self-end">
            View Full Catalogue <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-secondary-foreground/55">Category</span>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setColorFilter("all");
              }}
              className="w-full border border-primary/20 bg-secondary/60 px-3 py-3 text-sm text-white outline-none transition-colors focus:border-primary"
            >
              <option className="text-foreground" value="all">All categories</option>
              {categories.map((cat) => (
                <option className="text-foreground" key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-secondary-foreground/55">Color</span>
            <select
              value={colorFilter}
              onChange={(event) => setColorFilter(event.target.value)}
              className="w-full border border-primary/20 bg-secondary/60 px-3 py-3 text-sm text-white outline-none transition-colors focus:border-primary"
            >
              <option className="text-foreground" value="all">All colors</option>
              {colorOptions.map((color) => (
                <option className="text-foreground" key={color} value={color}>{color}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.slice(0, 4).map((p) => {
            const variants = variantsByProduct[p.id] || [];
            const selected = colorFilter === "all"
              ? undefined
              : variants.find((variant) => variantColorLabel(variant.color, variant.name) === colorFilter);
            const selectedLabel = selected ? variantColorLabel(selected.color, selected.name) : "";
            const image = selected?.image_url || selected?.image_urls?.[0] || p.main_image_url || "/placeholder.svg";
            const whatsappUrl = createProductWhatsAppUrl(p, selected || null, selectedLabel);

            return (
              <div key={p.id} className="group">
                <Link to={`/products/${p.slug}${selected ? `?variant=${selected.id}` : ""}`} className="relative cursor-pointer block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-black img-zoom">
                    <img src={image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100" />
                    {p.tagline && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-gold-gradient text-primary-foreground text-[10px] uppercase tracking-[0.16em] font-medium opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100 sm:tracking-[0.25em]">
                        Signature
                      </span>
                    )}
                    <div className="absolute bottom-0 inset-x-0 p-6 translate-y-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      {p.tagline && <div className="text-[10px] uppercase tracking-[0.18em] text-primary mb-2 sm:tracking-[0.3em]">{p.tagline}</div>}
                      <h3 className="font-serif text-xl text-white leading-tight">{p.name}</h3>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-white/80">{selectedLabel || "View details"}</span>
                        <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gold-gradient text-primary-foreground">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-[#25D366]/60 px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white sm:px-4 sm:tracking-[0.2em]"
                >
                  <MessageCircle className="h-3.5 w-3.5" fill="currentColor" />
                  WhatsApp
                </a>
              </div>
            );
          })}
                </div>
        {filteredItems.length === 0 && (
          <p className="mt-8 text-center text-sm text-secondary-foreground/60">No featured products found for this category and color.</p>
        )}
      </div>
    </section>
  );
};
