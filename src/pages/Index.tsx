import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Products } from "@/components/Products";
import { Categories } from "@/components/Categories";
import { AtelierInfo } from "@/components/AtelierInfo";
import { About } from "@/components/About";
import { Reviews } from "@/components/Reviews";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { useSeo, localBusinessSchema, serviceSchema } from "@/lib/seo";

const Index = () => {
  useSeo({
    title: "Granite Paving Stone Bangalore | Cobblestone & Floor Stone",
    description:
      "SJ Granite Paving Stone provides granite paving stone, cobblestone, floor stone, parking pavers, stone chairs and outdoor stone furniture in Bangalore, Karnataka and Mumbai.",
    path: "/",
    keywords: [
      "granite paving stone Bangalore",
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
    ],
    schema: [
      localBusinessSchema(),
      serviceSchema(
        "Granite paving stone and cobblestone service in Bangalore, Karnataka and Mumbai",
        "Granite paving stone, cobblestone, floor stone, parking pavers and stone furniture for Bangalore, Karnataka and Mumbai customers.",
        "/"
      ),
    ],
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Products />
      <Categories />
      <Services />
      <AtelierInfo />
      <About />
      <Reviews />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
