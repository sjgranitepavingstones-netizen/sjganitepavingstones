import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { publicApi } from "@/lib/api";
import { colorToCss, variantColorLabel } from "@/lib/colors";
import { useSeo, absoluteUrl, breadcrumbSchema, SERVICE_LOCATIONS } from "@/lib/seo";
import { createProductWhatsAppUrl } from "@/lib/whatsapp";

type Variant = {
  id: string;
  name: string;
  color: string | null;
  material: string | null;
  image_url: string;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  main_image_url: string | null;
};

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [active, setActive] = useState<Variant | null>(null);
  const activeLabel = active ? variantColorLabel(active.color, active.name) : "";
  const whatsappUrl = product ? createProductWhatsAppUrl(product, active, activeLabel) : "#";

  useSeo({
    title: product ? `${product.name} Bangalore Granite Stone Product` : "Granite Stone Product Bangalore",
    description:
      product?.description ||
      "Granite paving stone, cobblestone, floor stone, parking stone and outdoor stone furniture product details from SJ Granite Paving Stone in Bangalore.",
    path: slug ? `/products/${slug}` : "/products",
    image: active?.image_url || product?.main_image_url || undefined,
    keywords: [
      product?.name || "granite paving stone Bangalore",
      "stone product Bangalore",
      "granite paving stone",
      "cobblestone Bangalore",
      "floor stone Bangalore",
      "granite paving stone Mumbai",
      "granite paving stone Karnataka",
      "paving stone Mysuru",
      "cobblestone Mangalore",
    ],
    schema: product
      ? [
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description || `${product.name} from SJ Granite Paving Stone in Bangalore.`,
            image: absoluteUrl(active?.image_url || product.main_image_url || "/placeholder.svg"),
            brand: {
              "@type": "Brand",
              name: "SJ Granite Paving Stone",
            },
            category: "Granite paving stone and outdoor stone product",
            areaServed: SERVICE_LOCATIONS,
            offers: {
              "@type": "Offer",
              availability: "https://schema.org/InStock",
              url: absoluteUrl(`/products/${product.slug}`),
            },
          },
        ]
      : undefined,
  });

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const [p] = await publicApi.list<Product>("products", { slug });
      if (!p) return;
      setProduct(p);
      const v = await publicApi.list<Variant>("product_variants", { product_id: p.id, orderBy: "sort_order" });
      setVariants(v);
      setActive(null);
    })();
  }, [slug]);

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-40 pb-20 text-center text-foreground/60">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="container pt-32 md:pt-36 pb-16 md:pb-24">
        <Link to="/products" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-foreground/60 hover:text-primary mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <div className="group relative aspect-square overflow-hidden bg-secondary img-zoom shadow-luxury">
              <img
                src={active?.image_url || product.main_image_url || "/placeholder.svg"}
                alt={`${active?.name || product.name} Bangalore granite stone`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5 pt-24">
                <div className="mb-3 text-xs text-white/85">
                  <span className="font-serif text-xl text-white">{active ? activeLabel : product.name}</span>
                  {active?.material && <span className="mt-1 block text-white/65">{active.material}</span>}
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-3 bg-[#25D366] px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-all hover:brightness-105 sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" fill="currentColor" />
                  WhatsApp This Image
                </a>
              </div>
            </div>
          </div>

          <div>
            {product.tagline && <span className="text-[10px] uppercase tracking-[0.3em] text-primary">{product.tagline}</span>}
            <h1 className="font-serif text-4xl md:text-5xl mt-3 leading-[1.05]">{product.name}</h1>
            <p className="text-foreground/70 mt-6 leading-relaxed">{product.description}</p>

            <div className="mt-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-8 bg-gold-gradient" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-primary">
                  Product & Variant Options
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className={`group grid grid-cols-[88px_1fr] items-center gap-4 border p-3 text-left transition-all ${!active ? "border-primary bg-primary/5 shadow-gold-glow" : "border-foreground/10 hover:border-primary/60 hover:bg-primary/5"}`}
                  aria-pressed={!active}
                  aria-label={`Select ${product.name}`}
                >
                  <span className="relative block aspect-square overflow-hidden bg-secondary">
                    <img
                      src={product.main_image_url || "/placeholder.svg"}
                      alt={`${product.name} original product`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {!active && (
                      <span className="absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-background/90 text-primary shadow-sm">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className={`block font-serif text-xl leading-tight ${!active ? "text-primary" : "text-foreground"}`}>
                      {product.name}
                    </span>
                    {product.tagline && (
                      <span className="mt-1 block text-xs text-foreground/55">{product.tagline}</span>
                    )}
                  </span>
                </button>

                {variants.map((variant) => {
                    const label = variantColorLabel(variant.color, variant.name);
                    const selected = active?.id === variant.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setActive(variant)}
                        className={`group grid grid-cols-[88px_1fr] items-center gap-4 border p-3 text-left transition-all ${selected ? "border-primary bg-primary/5 shadow-gold-glow" : "border-foreground/10 hover:border-primary/60 hover:bg-primary/5"}`}
                        aria-pressed={selected}
                        aria-label={`Select ${label}`}
                      >
                        <span className="relative block aspect-square overflow-hidden bg-secondary">
                          <img
                            src={variant.image_url || product.main_image_url || "/placeholder.svg"}
                            alt={`${label} ${product.name}`}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span
                            className={`absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm ${selected ? "border-primary" : "border-white/70"}`}
                            style={{ backgroundColor: colorToCss(label) }}
                          >
                            {selected && (
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-background/90 text-primary">
                                <Check className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="min-w-0">
                          <span className={`block font-serif text-xl leading-tight ${selected ? "text-primary" : "text-foreground"}`}>
                            {label}
                          </span>
                          {variant.material && (
                            <span className="mt-1 block text-xs text-foreground/55">{variant.material}</span>
                          )}
                        </span>
                      </button>
                    );
                })}
              </div>

              <div className="mt-5 border-l border-primary/40 pl-4 text-sm text-foreground/70">
                <div className="font-medium text-foreground">{active ? activeLabel : product.name}</div>
                {active?.material && <div className="text-xs text-foreground/50">{active.material}</div>}
                {!active && product.tagline && <div className="text-xs text-foreground/50">{product.tagline}</div>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#25D366] text-white text-xs uppercase tracking-[0.22em] hover:brightness-105 transition-all"
              >
                <MessageCircle className="h-4 w-4" fill="currentColor" />
                WhatsApp This Item
              </a>
              <Link to="/contact" className="inline-flex items-center justify-center px-8 py-3.5 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.25em] shimmer">
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default ProductDetail;
