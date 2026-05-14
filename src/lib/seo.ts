import { useEffect, useMemo } from "react";
import logoImage from "@/assets/sj-granite-paving-stone-logo.jpg";

const DEFAULT_SITE_URL = "https://www.pavingstones.in";
const BRAND_NAME = "SJ Granite Paving Stone";
const DEFAULT_DESCRIPTION =
  "SJ Granite Paving Stone provides granite paving stone, cobblestone, floor stone, parking pavers and stone chairs across Bangalore, Karnataka and Mumbai.";

export const SERVICE_LOCATIONS = [
  "Bangalore",
  "Bengaluru",
  "Mumbai",
  "Karnataka",
  "Mysuru",
  "Mangalore",
  "Hubli",
  "Dharwad",
  "Belgaum",
  "Tumkur",
  "Davangere",
  "Shimoga",
  "Udupi",
  "Manipal",
  "Hassan",
  "Mandya",
  "Ballari",
  "Vijayapura",
  "Gulbarga",
  "Whitefield",
  "Electronic City",
  "HSR Layout",
  "Koramangala",
  "Indiranagar",
  "Jayanagar",
  "JP Nagar",
  "Hebbal",
  "Yelahanka",
  "Sarjapur Road",
];

type SeoOptions = {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  image?: string;
  schema?: Record<string, any> | Record<string, any>[];
};

const siteOrigin = () => {
  const configured = import.meta.env.VITE_SITE_URL;
  if (configured) {
    const origin = String(configured).replace(/\/+$/, "");
    if (!origin.includes(".vercel.app")) return origin;
  }
  if (import.meta.env.PROD) return DEFAULT_SITE_URL;
  if (typeof window !== "undefined" && window.location.origin) return window.location.origin;
  return DEFAULT_SITE_URL;
};

export const absoluteUrl = (path = "/") => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${normalizedPath}`;
};

const upsertMeta = (selector: string, attrs: Record<string, string>) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    const key = selector.includes("property=") ? "property" : "name";
    const value = selector.match(/\[(?:name|property)="([^"]+)"\]/)?.[1];
    if (value) tag.setAttribute(key, value);
    document.head.appendChild(tag);
  }
  Object.entries(attrs).forEach(([key, value]) => tag?.setAttribute(key, value));
};

const upsertLink = (rel: string, href: string) => {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = rel;
    document.head.appendChild(tag);
  }
  tag.href = href;
};

const removeContext = (schema: Record<string, any>) => {
  const { "@context": _context, ...rest } = schema;
  return rest;
};

export const localBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
  name: BRAND_NAME,
  alternateName: ["SJ Granite Paving Stone Bangalore", "SJ Granite Paving Stone Bengaluru"],
  description: DEFAULT_DESCRIPTION,
  url: absoluteUrl("/"),
  logo: absoluteUrl(logoImage),
  image: absoluteUrl(logoImage),
  telephone: "+918217257354",
  email: "granitepavingstone@gmail.com",
  foundingDate: "2013",
  founder: {
    "@type": "Person",
    name: "Mohammad Javeed",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangalore",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  areaServed: SERVICE_LOCATIONS,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
  ],
  makesOffer: [
    "Granite paving stone installation in Bangalore",
    "Cobblestone paving in Bangalore",
    "Floor stone and outdoor stone flooring",
    "Parking stone pavers",
    "Stone chairs, stone benches and garden stone furniture",
  ].map((name) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name,
      areaServed: SERVICE_LOCATIONS,
      provider: {
        "@type": "LocalBusiness",
        name: BRAND_NAME,
      },
    },
  })),
});

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const serviceSchema = (name: string, description: string, path: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name,
  description,
  serviceType: name,
  areaServed: SERVICE_LOCATIONS.map((name) => ({
    "@type": ["City", "AdministrativeArea"],
    name,
  })),
  provider: {
    "@type": "LocalBusiness",
    name: BRAND_NAME,
    telephone: "+918217257354",
    url: absoluteUrl("/"),
  },
  url: absoluteUrl(path),
});

export const useSeo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  keywords = [],
  image = logoImage,
  schema,
}: SeoOptions) => {
  const keywordsMeta = keywords.join(", ");
  const schemaJson = useMemo(() => {
    if (!schema) return "";
    const graph = Array.isArray(schema) ? schema.map(removeContext) : [removeContext(schema)];
    return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  }, [schema]);

  useEffect(() => {
    const canonical = absoluteUrl(path || `${window.location.pathname}${window.location.search}`);
    const imageUrl = absoluteUrl(image);
    const fullTitle = title.includes(BRAND_NAME) ? title : `${title} | ${BRAND_NAME}`;

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', { content: description });
    upsertMeta('meta[name="robots"]', { content: "index, follow, max-image-preview:large" });
    if (keywordsMeta) upsertMeta('meta[name="keywords"]', { content: keywordsMeta });
    upsertMeta('meta[property="og:type"]', { content: "website" });
    upsertMeta('meta[property="og:title"]', { content: fullTitle });
    upsertMeta('meta[property="og:description"]', { content: description });
    upsertMeta('meta[property="og:url"]', { content: canonical });
    upsertMeta('meta[property="og:image"]', { content: imageUrl });
    upsertMeta('meta[name="twitter:card"]', { content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { content: description });
    upsertMeta('meta[name="twitter:image"]', { content: imageUrl });
    upsertLink("canonical", canonical);

    if (schemaJson) {
      let script = document.getElementById("page-json-ld") as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = "page-json-ld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = schemaJson;
    }
  }, [title, description, path, image, keywordsMeta, schemaJson]);
};
