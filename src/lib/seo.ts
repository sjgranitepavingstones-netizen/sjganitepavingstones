import { useEffect, useMemo } from "react";
import logoImage from "@/assets/sj-granite-paving-stone-logo.jpg";
import pavingImage from "@/assets/product-parking.jpg";
import cobblestoneImage from "@/assets/product-cobblestone.jpg";
import flooringImage from "@/assets/product-flooring.jpg";
import benchImage from "@/assets/product-bench.jpg";
import chairImage from "@/assets/product-chair.jpg";

const DEFAULT_SITE_URL = "https://www.pavingstones.in";
const BRAND_NAME = "SJ Granite Paving Stone";
const DEFAULT_DESCRIPTION =
  "SJ Granite Paving Stone supplies natural stone, granite paving stone, cobblestone pavers, floor stone, wall stone, outside stone, garden stone, parking stone and outdoor stone furniture for residential, commercial and landscape projects.";

const PRODUCT_IMAGES = [pavingImage, cobblestoneImage, flooringImage, benchImage, chairImage];
const SEO_KEYWORD_LIMIT = 1000;
const SEO_GLOBAL_FALLBACK_LIMIT = 220;

export const INDIA_STATE_LOCATIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const MAJOR_CITY_LOCATIONS = [
  "Bangalore",
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "New Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Ahmedabad",
  "Surat",
  "Jaipur",
  "Kolkata",
  "Lucknow",
  "Indore",
  "Bhopal",
  "Nagpur",
  "Patna",
  "Raipur",
  "Bhubaneswar",
  "Ranchi",
  "Guwahati",
  "Chandigarh",
  "Dehradun",
  "Goa",
  "Kochi",
  "Coimbatore",
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
];

export const LOCATION_SEO_TARGETS = [
  ...INDIA_STATE_LOCATIONS,
  ...MAJOR_CITY_LOCATIONS,
].filter((name, index, list) => list.indexOf(name) === index);

export const locationSlug = (name: string) => name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const locationNameFromSlug = (slug?: string) => {
  if (!slug) return "India";
  const normalized = slug.toLowerCase();
  const matched = LOCATION_SEO_TARGETS.find((location) => locationSlug(location) === normalized);
  if (matched) return matched;
  return normalized
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const CORE_STONE_TERMS = [
  "natural stone",
  "natural stones",
  "stone paving",
  "paving stone",
  "paving stones",
  "granite paving stone",
  "granite paving stones",
  "granite stone paving",
  "granite stone",
  "cobblestone",
  "cobble stone",
  "cobble paving",
  "cobble stones",
  "cobblestone pavers",
  "cobblestone paving",
  "natural cobblestone",
  "granite cobblestone",
  "floor stone",
  "floor stones",
  "outdoor floor stone",
  "wall stone",
  "wall stones",
  "outside stone",
  "outside stones",
  "outdoor stone",
  "parking stone",
  "parking stones",
  "driveway stone",
  "driveway pavers",
  "garden stone",
  "garden stones",
  "landscape stone",
  "landscaping stone",
  "patio stone",
  "pathway stone",
  "walkway stone",
  "courtyard stone",
  "stone slabs",
  "granite slabs",
  "stone tiles",
  "granite tiles",
  "rough granite stone",
  "flamed granite stone",
  "anti slip stone",
  "stone bench",
  "stone benches",
  "granite bench",
  "stone chair",
  "stone chairs",
  "granite chair",
  "stone table",
  "garden stone furniture",
  "outdoor stone furniture",
  "granite garden furniture",
  "stone seating",
  "granite seating",
];

const SEO_INTENTS = [
  "supplier",
  "manufacturer",
  "dealer",
  "wholesaler",
  "retailer",
  "contractor",
  "installer",
  "installation",
  "supply",
  "supply and installation",
  "price",
  "cost",
  "quotation",
  "near me",
  "for sale",
  "online",
  "design",
  "ideas",
  "work",
  "service",
  "company",
  "factory",
  "bulk supplier",
  "project supplier",
  "commercial supplier",
];

const PROJECT_USE_CASES = [
  "home",
  "villa",
  "farmhouse",
  "resort",
  "hotel",
  "garden",
  "landscape",
  "driveway",
  "parking area",
  "parking lot",
  "pathway",
  "walkway",
  "courtyard",
  "patio",
  "terrace",
  "outdoor area",
  "apartment",
  "commercial project",
  "public park",
  "temple",
  "school",
  "office",
  "construction site",
];

const SEO_MODIFIERS = [
  "best",
  "premium",
  "durable",
  "heavy duty",
  "natural",
  "outdoor",
  "anti slip",
  "weather resistant",
  "long lasting",
  "low maintenance",
  "custom",
  "affordable",
  "quality",
  "black",
  "grey",
  "red",
  "brown",
  "rough finish",
  "flamed finish",
];

const SEO_BRAND_KEYWORDS = [
  "SJ Granite Paving Stone",
  "sj granite stone",
  "sj granite paving stone",
  "SJ Granite Paving Stone India",
  "SJ Granite Paving Stone Bangalore",
  "SJ Granite Paving Stone Bengaluru",
  "SJ Granite Paving Stone Mumbai",
];

const normalizeKeywordList = (keywords: string[], limit = SEO_KEYWORD_LIMIT) => Array.from(new Set(
  keywords
    .map((keyword) => keyword.trim().replace(/\s+/g, " "))
    .filter(Boolean)
)).slice(0, limit);

const buildGenericStoneKeywords = () => {
  const keywords: string[] = [
    ...SEO_BRAND_KEYWORDS,
    ...CORE_STONE_TERMS,
    "netural stone",
    "naturalstone",
    "pavingstones",
    "pavingstone",
    "netualstone",
    "stones",
    "stone",
    "granite",
  ];

  CORE_STONE_TERMS.forEach((term) => {
    SEO_INTENTS.forEach((intent) => {
      keywords.push(`${term} ${intent}`);
    });
    PROJECT_USE_CASES.forEach((useCase) => {
      keywords.push(`${term} for ${useCase}`);
      keywords.push(`${useCase} ${term}`);
    });
    SEO_MODIFIERS.forEach((modifier) => {
      keywords.push(`${modifier} ${term}`);
    });
  });

  const priorityTerms = CORE_STONE_TERMS.slice(0, 36);
  priorityTerms.forEach((term) => {
    LOCATION_SEO_TARGETS.forEach((location) => {
      keywords.push(`${term} ${location}`);
    });
  });

  const serviceTerms = CORE_STONE_TERMS.slice(0, 26);
  const serviceIntents = ["supplier", "manufacturer", "dealer", "installer", "price", "near me"];
  serviceTerms.forEach((term) => {
    serviceIntents.forEach((intent) => {
      ["India", "Bangalore", "Bengaluru", "Karnataka", "Mumbai", "Mysuru", "Mangalore"].forEach((location) => {
        keywords.push(`${term} ${intent} ${location}`);
      });
    });
  });

  return normalizeKeywordList(keywords);
};

export const locationKeywords = (location: string) => [
  `SJ Granite Paving Stone ${location}`,
  ...CORE_STONE_TERMS.slice(0, 28).flatMap((term) => [
    `${term} ${location}`,
    `${term} supplier ${location}`,
    `${term} price ${location}`,
  ]),
  `granite paving stone India`,
  `cobblestone pavers India`,
  `floor stone India`,
  `wall stone India`,
  `outside stone India`,
  `parking stone India`,
  `natural stone supplier India`,
  `outdoor stone furniture India`,
].filter((keyword, index, list) => list.indexOf(keyword) === index);

export const genericStoneKeywords = buildGenericStoneKeywords();

export const SERVICE_LOCATIONS = [
  "India",
  ...LOCATION_SEO_TARGETS,
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
  robots?: string;
  schema?: Record<string, any> | Record<string, any>[];
};

const siteOrigin = () => {
  if (import.meta.env.PROD) return DEFAULT_SITE_URL;

  const configured = import.meta.env.VITE_SITE_URL;
  if (configured) {
    const origin = String(configured).replace(/\/+$/, "");
    if (!origin.includes(".vercel.app")) return origin;
  }

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
  alternateName: [
    "SJ Granite Stone",
    "SJ Granite Paving Stone India",
    "SJ Granite Paving Stone Bangalore",
    "SJ Granite Paving Stone Bengaluru",
    "SJ Granite Paving Stone Mumbai",
    "SJ Natural Stone Supplier",
    "SJ Wall Stone Supplier",
    "SJ Garden Stone Furniture",
  ],
  description: DEFAULT_DESCRIPTION,
  url: absoluteUrl("/"),
  logo: absoluteUrl(logoImage),
  image: [logoImage, ...PRODUCT_IMAGES].map((image) => absoluteUrl(image)),
  telephone: "+91 821 725 7354",
  email: "sjgranitepavingstones@gmail.com",
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
    "Natural stone supply for paving, flooring and outdoor landscape projects",
    "Granite paving stone supply and installation in India",
    "Cobblestone pavers for gardens, pathways and landscape projects across India",
    "Outdoor floor stone for patios, terraces, temples and walkways",
    "Wall stone, outside stone and garden stone products for landscape projects",
    "Parking stone pavers for villas, resorts, hotels and commercial sites",
    "Stone benches, stone chairs and granite garden furniture supply",
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
    telephone: "+91 821 725 7354",
    url: absoluteUrl("/"),
  },
  url: absoluteUrl(path),
});

export const homePageSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "SJ Granite Paving Stone Natural Stone Products & Services",
  url: absoluteUrl("/"),
  description: DEFAULT_DESCRIPTION,
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: absoluteUrl(logoImage),
  },
  about: [
    "Natural stone",
    "SJ Granite Stone",
    "Granite paving stone",
    "Cobblestone pavers",
    "Floor stone",
    "Wall stone",
    "Outside stone",
    "Parking stone pavers",
    "Stone benches and stone chairs",
    "Outdoor stone furniture",
    "Natural stone supplier India",
    "Garden stone products India",
  ],
  hasPart: [
    { name: "Granite Paving Stone", image: pavingImage },
    { name: "Cobblestone Pavers", image: cobblestoneImage },
    { name: "Outdoor Floor Stone", image: flooringImage },
    { name: "Stone Benches", image: benchImage },
    { name: "Stone Chairs", image: chairImage },
  ].map((item) => ({
    "@type": "CreativeWork",
    name: item.name,
    image: absoluteUrl(item.image),
  })),
});

export const useSeo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  keywords = [],
  image = logoImage,
  robots = "index, follow, max-image-preview:large",
  schema,
}: SeoOptions) => {
  const keywordsMeta = normalizeKeywordList([
    ...keywords,
    ...genericStoneKeywords.slice(0, SEO_GLOBAL_FALLBACK_LIMIT),
  ]).join(", ");
  const schemaJson = useMemo(() => {
    if (!schema) return "";
    const graph = Array.isArray(schema) ? schema.map(removeContext) : [removeContext(schema)];
    return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  }, [schema]);

  useEffect(() => {
    const canonical = absoluteUrl(path || `${window.location.pathname}${window.location.search}`);
    const imageUrl = absoluteUrl(image);
    const fullTitle = title.includes(BRAND_NAME) ? title : `${BRAND_NAME} | ${title}`;

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', { content: description });
    upsertMeta('meta[name="robots"]', { content: robots });
    if (keywordsMeta) upsertMeta('meta[name="keywords"]', { content: keywordsMeta });
    upsertMeta('meta[property="og:type"]', { content: "website" });
    upsertMeta('meta[property="og:site_name"]', { content: BRAND_NAME });
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
  }, [title, description, path, image, robots, keywordsMeta, schemaJson]);
};
