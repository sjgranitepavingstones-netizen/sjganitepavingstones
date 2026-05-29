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
} from "@/lib/seo";

import logoImage from "@/assets/sj-granite-paving-stone-logo.jpg";

const Index = () => {
  const { city } = useParams();

  const cityName = city
    ? city
        .split("-")
        .join(" ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "India";

  const pageTitle = `SJ Granite Paving Stone ${cityName} | Paving Stone, Cobblestone & Stone Furniture`;

  const pageDescription = `Granite paving stone, cobblestone pavers, floor stone, parking stone, stone benches, stone chairs and outdoor stone furniture for ${cityName} and all India projects.`;

  useSeo({
    title: pageTitle,

    description: pageDescription,

    path: city
      ? `/granite-paving-stone-${city}`
      : "/",

    image: logoImage,

    keywords: [
      `granite paving stone ${cityName}`,
      `paving stone ${cityName}`,
      `cobblestone ${cityName}`,
      `floor stone ${cityName}`,
      `parking stone ${cityName}`,
      `stone furniture ${cityName}`,

      `granite paving stone India`,
      `cobblestone pavers India`,
      `floor stone India`,
      `parking stone India`,
      `natural stone supplier India`,
      `outdoor stone furniture India`,
    ],

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