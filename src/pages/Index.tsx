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
  locationKeywords,
  locationNameFromSlug,
} from "@/lib/seo";

import logoImage from "@/assets/sj-granite-paving-stone-logo.jpg";

const Index = () => {
  const { city } = useParams();

  const cityName = locationNameFromSlug(city);

  const pageTitle = city
    ? `SJ Granite Paving Stone ${cityName} | Paving Stone, Cobblestone & Stone Furniture`
    : "SJ Granite Paving Stone India | Paving Stone, Cobblestone & Stone Furniture";

  const pageDescription = `Granite paving stone, cobblestone pavers, floor stone, parking stone, stone benches, stone chairs and outdoor stone furniture for ${cityName} and all India projects.`;

  useSeo({
    title: pageTitle,

    description: pageDescription,

    path: city
      ? `/granite-paving-stone-${city}`
      : "/",

    image: logoImage,

    keywords: locationKeywords(cityName),

    schema: [
      localBusinessSchema(),

      homePageSchema(),

      serviceSchema(
        `Granite paving stone services in ${cityName}`,

        `Granite paving stone, cobblestone pavers, floor stone, parking stone, stone benches and outdoor stone furniture services in ${cityName}.`,

        city
          ? `/granite-paving-stone-${city}`
          : "/"
      ),
    ],
  });

  return (
    <main className="min-h-screen bg-background">
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
