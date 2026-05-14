import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { publicApi } from "@/lib/api";
import { colorToCss, variantColorLabel } from "@/lib/colors";
import { createProductWhatsAppUrl } from "@/lib/whatsapp";

type Variant = { id: string; product_id: string; name: string; color: string | null; material?: string | null; image_url: string; price?: number | null };

export const Products = () => {
  const [items, setItems] = useState<any[]>([]);
  const [variantsByProduct, setVariantsByProduct] = useState<Record<string, Variant[]>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, Variant>>({});

  useEffect(() => {
    (async () => {
      const products = await publicApi.list<any>("products", { featured: true, orderBy: "created_at", limit: 4 });
      setItems(products);
      const variantEntries = await Promise.all(
        products.map(async (product) => [
          product.id,
          await publicApi.list<Variant>("product_variants", { product_id: product.id, orderBy: "sort_order" }),
        ] as const)
      );
      setVariantsByProduct(Object.fromEntries(variantEntries));
    })().catch(() => undefined);
  }, []);

  return (
    <section id="products" className="py-24 md:py-32 bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-gold-gradient" />
              <span className="text-xs uppercase tracking-[0.3em] text-primary font-medium">Bangalore Stone Collection</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] text-white max-w-2xl">
              Granite Paving Stone, <span className="italic text-gold-gradient">Cobblestone & Stone Furniture</span>
            </h2>
          </div>
          <Link to="/products" className="link-gold text-xs uppercase tracking-[0.3em] text-primary inline-flex items-center gap-2 self-start md:self-end">
            View Full Catalogue <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => {
            const variants = variantsByProduct[p.id] || [];
            const selected = selectedVariants[p.id];
            const image = selected?.image_url || p.main_image_url || "/placeholder.svg";
            const selectedLabel = selected ? variantColorLabel(selected.color, selected.name) : "";
            const whatsappUrl = createProductWhatsAppUrl(p, selected, selectedLabel);

            return (
              <div key={p.id} className="group">
                <Link to={`/products/${p.slug}`} className="relative cursor-pointer block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-black img-zoom">
                    <img src={image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    {p.tagline && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-gold-gradient text-primary-foreground text-[10px] uppercase tracking-[0.25em] font-medium">
                        Signature
                      </span>
                    )}
                    <div className="absolute bottom-0 inset-x-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {p.tagline && <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2">{p.tagline}</div>}
                      <h3 className="font-serif text-xl text-white leading-tight">{p.name}</h3>
                      <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <span className="text-sm text-white/80">{selected?.name || p.price_label}</span>
                        <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gold-gradient text-primary-foreground">
                          <ArrowUpRight className="h-4 w-4" />
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
                          className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.14em] transition-colors ${active ? "border-primary text-primary" : "border-white/20 text-white/65 hover:border-primary/50 hover:text-white"}`}
                          aria-pressed={active}
                          aria-label={`Show ${label} ${p.name}`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/25"
                            style={{ backgroundColor: colorToCss(label) }}
                          />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-[#25D366]/60 px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
                >
                  <MessageCircle className="h-3.5 w-3.5" fill="currentColor" />
                  WhatsApp
                </a>
              </div>
            );
          })}
                </div>
      </div>
    </section>
  );
};
