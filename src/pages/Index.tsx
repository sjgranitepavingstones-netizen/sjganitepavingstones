import { useParams } from "react-router-dom";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Products } from "@/components/Products";
import { ProductServiceShowcase } from "@/components/ProductServiceShowcase";
import { Categories } from "@/components/Categories";
import { AtelierInfo } from "@/components/AtelierInfo";

import { About } from "@/components/About";
import { CraftWorkflow } from "@/components/CraftWorkflow";
import { Reviews } from "@/components/Reviews";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

import {
  useSeo,
  localBusinessSchema,
  serviceSchema,
  homePageSchema,
  genericStoneKeywords,
  locationKeywords,
  locationNameFromSlug,
} from "@/lib/seo";

import logoImage from "@/assets/sj-granite-paving-stone-logo.jpg";

const Index = () => {
  const { city } = useParams();

  const cityName = locationNameFromSlug(city);

  const hasLocationIntent = Boolean(city);

  const pageTitle = hasLocationIntent
    ? `SJ Granite Paving Stone ${cityName} | Paving Stone, Cobblestone & Stone Furniture`
    : "SJ Granite Paving Stone | Natural Stone, Paving Stone & Cobblestone";

  const pageDescription = hasLocationIntent
    ? `Granite paving stone, cobblestone pavers, floor stone, parking stone, stone benches, stone chairs and outdoor stone furniture for ${cityName} and all India projects.`
    : "SJ Granite Paving Stone supplies natural stone, granite paving stone, cobblestone pavers, floor stone, wall stone, outside stone, garden stone, parking stone and outdoor stone furniture for homes, villas, gardens, parking areas and commercial projects.";

  useSeo({
    title: pageTitle,

    description: pageDescription,

    path: city
      ? `/granite-paving-stone-${city}`
      : "/",

    image: logoImage,

    keywords: hasLocationIntent ? locationKeywords(cityName) : genericStoneKeywords,

    schema: [
      localBusinessSchema(),

      homePageSchema(),

      serviceSchema(
        `Granite paving stone services in ${cityName}`,

        hasLocationIntent
          ? `Granite paving stone, cobblestone pavers, floor stone, parking stone, stone benches and outdoor stone furniture services in ${cityName}.`
          : "Natural stone, granite paving stone, cobblestone pavers, floor stone, wall stone, outside stone, garden stone, parking stone and outdoor stone furniture services.",

        city
          ? `/granite-paving-stone-${city}`
          : "/"
      ),
    ],
  });

  return (
    <main className="min-h-screen bg-secondary">
      <Navbar />

      <Hero />

      <Products />

      <ProductServiceShowcase />

      <Categories />

      <Services />

      <CraftWorkflow />

      <AtelierInfo />

      <About />

      <Reviews />

      <Contact />

      <Footer />
    </main>
  );
};

export default Index;
