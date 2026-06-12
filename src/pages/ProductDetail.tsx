import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
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
  image_urls?: string[];
};

type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  main_image_url: string | null;
};

const normalizeImageUrls = (value: unknown): string[] => {
  const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return Array.from(new Set(list.map((image) => String(image || "").trim()).filter(Boolean)));
};

const ProductDetail = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const requestedVariantId = searchParams.get("variant");
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [active, setActive] = useState<Variant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const mainImageRef = useRef<HTMLDivElement>(null);
  const activeLabel = active ? variantColorLabel(active.color, active.name) : "";
  const whatsappUrl = product ? createProductWhatsAppUrl(product, active, activeLabel) : "#";
  const variantMainImage = active?.image_url || product?.main_image_url || "";
  const variantExtraImages = active
    ? normalizeImageUrls(active.image_urls).filter((image) => image !== variantMainImage)
    : [];
  const heroImage = selectedImage || variantMainImage || product?.main_image_url || "/placeholder.svg";

  useSeo({
    title: product ? `${product.name} India Granite Stone Product` : "Granite Stone Product India",
    description:
      product?.description ||
      "Granite paving stone, cobblestone, floor stone, parking stone and outdoor stone furniture product details from SJ Granite Paving Stone for Bangalore, Karnataka, Mumbai and all India projects.",
    path: slug ? `/products/${slug}` : "/products",
    image: active?.image_url || product?.main_image_url || undefined,
    keywords: [
      product?.name || "granite paving stone Bangalore",
      "granite paving stone India",
      "stone product India",
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
            description: product.description || `${product.name} from SJ Granite Paving Stone in India.`,
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
      const normalizedVariants = v.map((variant) => ({ ...variant, image_urls: normalizeImageUrls(variant.image_urls) }));
      setVariants(normalizedVariants);
      const matchedVariant = requestedVariantId ? normalizedVariants.find((variant) => variant.id === requestedVariantId) || null : null;
      setActive(matchedVariant);
      setSelectedImage(matchedVariant?.image_url || matchedVariant?.image_urls?.[0] || p.main_image_url || "");
    })();
  }, [slug, requestedVariantId]);

  useEffect(() => {
    if (active) {
      setSelectedImage(active.image_url || active.image_urls?.[0] || product?.main_image_url || "");
      return;
    }
    setSelectedImage(product?.main_image_url || "");
  }, [active, product]);

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
        <Link to="/products" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-foreground/60 hover:text-primary mb-8 sm:tracking-[0.25em]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <div ref={mainImageRef} className="group relative aspect-square overflow-hidden bg-secondary shadow-luxury">
              <img
                src={heroImage}
                alt={`${active?.name || product.name} India granite stone`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 border border-transparent transition-colors duration-500 group-hover:border-primary/70" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5 pt-24 transition-all duration-500 group-hover:from-black/95">
                <div className="mb-3 text-xs text-white/85">
                  <span className="font-serif text-xl text-white">{active ? activeLabel : product.name}</span>
                  {active?.material && <span className="mt-1 block text-white/65">{active.material}</span>}
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-3 bg-[#25D366] px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-white transition-all hover:brightness-105 sm:w-auto sm:tracking-[0.2em]"
                >
                  <MessageCircle className="h-4 w-4" fill="currentColor" />
                  WhatsApp This Image
                </a>
              </div>
            </div>
          </div>

          <div>
            {product.tagline && <span className="text-[10px] uppercase tracking-[0.18em] text-primary sm:tracking-[0.3em]">{product.tagline}</span>}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-3 leading-[1.05]">{product.name}</h1>
            <p className="text-foreground/70 mt-6 leading-relaxed">{product.description}</p>

            <div className="mt-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-8 bg-gold-gradient" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-primary sm:tracking-[0.3em]">
                  Product & Variant Options
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className={`group grid grid-cols-[72px_1fr] items-center gap-3 border p-3 text-left transition-all sm:grid-cols-[88px_1fr] sm:gap-4 ${!active ? "border-primary bg-primary/5 shadow-gold-glow" : "border-foreground/10 hover:border-primary/60 hover:bg-primary/5"}`}
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
                        onClick={() => {
                          setActive(variant);
                          setSelectedImage(variant.image_url || variant.image_urls?.[0] || product.main_image_url || "");
                        }}
                        className={`group grid grid-cols-[72px_1fr] items-center gap-3 border p-3 text-left transition-all sm:grid-cols-[88px_1fr] sm:gap-4 ${selected ? "border-primary bg-primary/5 shadow-gold-glow" : "border-foreground/10 hover:border-primary/60 hover:bg-primary/5"}`}
                        aria-pressed={selected}
                        aria-label={`Select ${label}`}
                      >
                        <span className="relative block aspect-square overflow-hidden bg-secondary">
                          <img
                            src={variant.image_url || variant.image_urls?.[0] || product.main_image_url || "/placeholder.svg"}
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
                          {normalizeImageUrls(variant.image_urls).filter((image) => image && image !== variant.image_url).length > 0 && (
                            <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-primary">
                              {normalizeImageUrls(variant.image_urls).filter((image) => image && image !== variant.image_url).length} more photos
                            </span>
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
                className="inline-flex w-full items-center justify-center gap-3 px-5 py-3.5 bg-[#25D366] text-white text-xs uppercase tracking-[0.16em] hover:brightness-105 transition-all sm:w-auto sm:px-8 sm:tracking-[0.22em]"
              >
                <MessageCircle className="h-4 w-4" fill="currentColor" />
                WhatsApp This Item
              </a>
              <Link to="/contact" className="inline-flex w-full items-center justify-center px-5 py-3.5 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.16em] shimmer sm:w-auto sm:px-8 sm:tracking-[0.25em]">
                Request Quote
              </Link>
            </div>
          </div>
        </div>

        {active && variantExtraImages.length > 0 && (
          <div className="mt-16 md:mt-20">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-primary sm:tracking-[0.3em]">
                  {activeLabel} Color Photos
                </span>
                <h2 className="mt-3 font-serif text-3xl sm:text-4xl">More Images In This Color</h2>
              </div>
              <span className="hidden text-sm text-foreground/50 sm:block">{variantExtraImages.length} more photos</span>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {variantExtraImages.map((image, index) => (
                <div
                  key={`${image}-large-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedImage(image);
                    mainImageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedImage(image);
                      mainImageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                  className={`group relative aspect-[4/3] overflow-hidden bg-secondary text-left shadow-luxury ${heroImage === image ? "ring-2 ring-primary" : ""}`}
                  aria-label={`Open ${activeLabel || product.name} large image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${activeLabel || product.name} large photo ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 border border-transparent transition-colors duration-500 group-hover:border-primary/70" />
                  <span className="absolute inset-x-0 bottom-0 translate-y-4 bg-gradient-to-t from-black/85 to-transparent p-5 pt-16 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="mb-3 block text-xs uppercase tracking-[0.18em] text-white/85">View As Main Image</span>
                    <a
                      href={product ? createProductWhatsAppUrl(product, { ...active, image_url: image }, activeLabel) : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-2 bg-[#25D366] px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-white"
                    >
                      <MessageCircle className="h-3.5 w-3.5" fill="currentColor" />
                      WhatsApp
                    </a>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
};

export default ProductDetail;
