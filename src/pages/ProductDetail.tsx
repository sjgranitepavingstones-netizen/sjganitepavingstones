import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { publicApi } from "@/lib/api";
import { useSeo, absoluteUrl, breadcrumbSchema } from "@/lib/seo";

type Variant = { id: string; name: string; color: string | null; material: string | null; image_url: string; price: number | null };
type Product = { id: string; slug: string; name: string; tagline: string | null; description: string | null; price_label: string | null; main_image_url: string | null };

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [active, setActive] = useState<Variant | null>(null);

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

  if (!product) return (
    <main className="min-h-screen bg-background"><Navbar />
      <div className="container pt-40 pb-20 text-center text-foreground/60">Loading…</div>
    </main>
  );

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="container pt-32 md:pt-36 pb-16 md:pb-24">
        <Link to="/products" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-foreground/60 hover:text-primary mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div>
            <div className="aspect-square overflow-hidden bg-secondary img-zoom shadow-luxury">
              <img src={active?.image_url || product.main_image_url || "/placeholder.svg"}
                   alt={`${active?.name || product.name} Bangalore granite stone`}
                   className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div>
            {product.tagline && <span className="text-[10px] uppercase tracking-[0.3em] text-primary">{product.tagline}</span>}
            <h1 className="font-serif text-4xl md:text-5xl mt-3 leading-[1.05]">{product.name}</h1>
            <p className="text-2xl text-gold-gradient font-serif mt-4">{active?.price ? `₹${active.price}` : product.price_label}</p>
            <p className="text-foreground/70 mt-6 leading-relaxed">{product.description}</p>

            {/* Variants */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-gold-gradient" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-primary">
                  {variants.length} Stone & Color Options
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {variants.map((v) => (
                  <button key={v.id} onClick={() => setActive(v)}
                    className={`group relative aspect-square overflow-hidden border-2 transition-all ${active?.id===v.id?"border-primary shadow-gold-glow":"border-transparent hover:border-primary/40"}`}>
                    <img src={v.image_url} alt={`${v.name} granite stone variant in Bangalore`} className="h-full w-full object-cover" />
                    {active?.id===v.id && (
                      <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-gold-gradient text-primary-foreground inline-flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {active && (
                <div className="mt-4 text-xs text-foreground/70">
                  <span className="font-medium">{active.color}</span>
                  {active.material && <span className="text-foreground/50"> · {active.material}</span>}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-10">
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
