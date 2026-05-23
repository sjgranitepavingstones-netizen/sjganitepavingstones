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
import { useSeo, localBusinessSchema, serviceSchema, homePageSchema } from "@/lib/seo";
import logoImage from "@/assets/sj-granite-paving-stone-logo.jpg";

const Index = () => {
  useSeo({
    title: "SJ Granite Paving Stone India | Paving Stone, Cobblestone & Stone Furniture",
    description:
      "Granite paving stone, cobblestone pavers, floor stone, parking stone, stone benches, stone chairs and outdoor stone furniture for Bangalore, Karnataka, Mumbai and all India projects.",
    path: "/",
    image: logoImage,
    keywords: [
      "granite paving stone Bangalore",
      "granite paving stone India",
      "paving stone India",
      "cobblestone pavers India",
      "floor stone India",
      "parking stone India",
      "natural stone supplier India",
      "outdoor stone furniture India",
      "paving stone Bangalore",
      "cobblestone Bangalore",
      "floor stone Bangalore",
      "parking stone Bangalore",
      "stone chair Bangalore",
      "stone bench Bangalore",
      "granite paving stone Mumbai",
      "cobblestone Mumbai",
      "granite paving stone Mysuru",
      "granite cobblestone Mangalore",
      "paving stone Hubli Dharwad",
      "floor stone Belgaum",
      "parking stone Tumkur",
      "granite paving stone Delhi",
      "cobblestone Hyderabad",
      "paving stone Chennai",
      "floor stone Pune",
      "garden stone furniture India",
    ],
    schema: [
      localBusinessSchema(),
      homePageSchema(),
      serviceSchema(
        "Granite paving stone, cobblestone and outdoor stone furniture services",
        "Granite paving stone, cobblestone pavers, floor stone, parking stone, stone benches, stone chairs and outdoor stone furniture for Bangalore, Karnataka, Mumbai and all India customers.",
        "/"
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
