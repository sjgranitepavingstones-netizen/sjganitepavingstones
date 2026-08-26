import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionHeading } from "@/components/SectionHeading";
import { breadcrumbSchema, localBusinessSchema, serviceSchema, useSeo } from "@/lib/seo";
import { SEO_LANDING_PAGES, findSeoLandingPage } from "@/lib/seoLandingPages";

const WHATSAPP_NUMBER = "918217257354";

const SeoLandingPage = () => {
  const { slug } = useParams();
  const matchedPage = findSeoLandingPage(slug);
  const page = matchedPage || SEO_LANDING_PAGES[0];

  const whatsappMessage = encodeURIComponent(
    `Hello SJ Granite Paving Stone, I need details for ${page.service} in ${page.location}.`
  );

  useSeo({
    title: page.title,
    description: page.description,
    path: `/seo/${page.slug}`,
    image: page.image,
    keywords: page.keywords,
    schema: [
      localBusinessSchema(),
      serviceSchema(page.service, page.description, `/seo/${page.slug}`),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: page.h1, path: `/seo/${page.slug}` },
      ]),
    ],
  });

  if (!matchedPage) return <Navigate to="/" replace />;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative overflow-hidden bg-secondary pt-32 text-secondary-foreground md:pt-40">
        <div className="absolute inset-0">
          <img
            src={page.image}
            alt={page.h1}
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(0_0%_0%/0.92),hsl(0_0%_0%/0.72),hsl(0_0%_0%/0.5))]" />
        </div>

        <div className="container relative grid gap-10 pb-20 md:grid-cols-[1.1fr_0.9fr] md:items-end md:pb-28">
          <div className="max-w-4xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-gold-gradient" />
              <span className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
                {page.eyebrow}
              </span>
            </div>

            <h1 className="font-serif text-4xl font-light leading-[0.98] text-white sm:text-5xl md:text-7xl">
              {page.h1}
            </h1>

            <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-white/78 md:text-lg">
              {page.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#25D366] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#1fb457]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Now
              </a>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-3 border border-primary/50 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                View Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="border border-primary/25 bg-black/30 p-6 backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
              Service Focus
            </p>
            <h2 className="mt-3 font-serif text-3xl font-light text-white">
              {page.service}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Location served: {page.location}. For project enquiries, share your site area,
              preferred stone type and photos on WhatsApp for a quick discussion.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 md:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="Why Choose SJ Granite"
            title={`Natural stone support for ${page.location}`}
            subtitle="We supply practical outdoor stone products for homeowners, builders, architects, resorts, gardens, parking areas and commercial landscape projects."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {page.highlights.map((highlight) => (
              <div key={highlight} className="border border-border bg-card p-6 shadow-card-luxury">
                <CheckCircle2 className="mb-5 h-6 w-6 text-primary" />
                <h3 className="font-serif text-2xl font-light">{highlight}</h3>
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-8 border-t border-border pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <img
              src={page.image}
              alt={`${page.service} by SJ Granite Paving Stone`}
              className="aspect-[4/3] w-full object-cover"
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">
                Indexed SEO Page
              </p>
              <h2 className="mt-4 font-serif text-3xl font-light md:text-5xl">
                {page.h1} by SJ Granite Paving Stone
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                This page is created for customers searching for {page.keywords.slice(0, 4).join(", ")}.
                It connects visitors to the main website, product catalogue and WhatsApp enquiry flow.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {page.keywords.slice(0, 5).map((keyword) => (
                  <span key={keyword} className="border border-primary/20 px-3 py-2 text-xs text-muted-foreground">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default SeoLandingPage;
