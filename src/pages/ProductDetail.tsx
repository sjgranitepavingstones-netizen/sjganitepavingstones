import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { publicApi } from "@/lib/api";
import { colorToCss, variantColorLabel } from "@/lib/colors";
import { useSeo, absoluteUrl, breadcrumbSchema } from "@/lib/seo";
import { createProductWhatsAppUrl } from "@/lib/whatsapp";

type Variant = {
  id: string;
  name: string;
  color: string | null;
  material: string | null;
  image_url: string;
  price: number | null;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  price_label: string | null;
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
            areaServed: "Bangalore, Karnataka",
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
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
      setActive(v[0] || null);
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
            <div className="aspect-square overflow-hidden bg-secondary img-zoom shadow-luxury">
              <img
                src={active?.image_url || product.main_image_url || "/placeholder.svg"}
                alt={`${active?.name || product.name} Bangalore granite stone`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div>
            {product.tagline && <span className="text-[10px] uppercase tracking-[0.3em] text-primary">{product.tagline}</span>}
            <h1 className="font-serif text-4xl md:text-5xl mt-3 leading-[1.05]">{product.name}</h1>
            <p className="text-2xl text-gold-gradient font-serif mt-4">
              {active?.price ? `Rs. ${active.price}` : product.price_label}
            </p>
            <p className="text-foreground/70 mt-6 leading-relaxed">{product.description}</p>

            {variants.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center gap-3 mb-5">
                  <span className="h-px w-8 bg-gold-gradient" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary">
                    {variants.length} Color Options
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          <span className="mt-2 block text-xs text-foreground/70">
                            {variant.price ? `Rs. ${variant.price}` : product.price_label || "Contact for price"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {active && (
                  <div className="mt-5 border-l border-primary/40 pl-4 text-sm text-foreground/70">
                    <div className="font-medium text-foreground">{activeLabel}</div>
                    {active.material && <div className="text-xs text-foreground/50">{active.material}</div>}
                  </div>
                )}
              </div>
            )}

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
              <Link to="/workflow" className="inline-flex items-center justify-center px-8 py-3.5 border border-foreground/20 text-xs uppercase tracking-[0.25em] hover:border-primary hover:text-primary transition-colors">
                How It's Made
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
