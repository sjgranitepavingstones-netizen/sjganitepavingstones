import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AtelierInfo } from "@/components/AtelierInfo";
import { About } from "@/components/About";
import { Reviews } from "@/components/Reviews";
import { useSeo, localBusinessSchema, breadcrumbSchema } from "@/lib/seo";

const AboutPage = () => {
  useSeo({
    title: "About SJ Granite Paving Stone Bangalore",
    description:
      "Learn about SJ Granite Paving Stone, started in 2013 by Mohammad Javeed, serving Bangalore with granite paving stone, cobblestone, floor stone and outdoor stone products.",
    path: "/about",
    keywords: ["SJ Granite Paving Stone Bangalore", "Mohammad Javeed granite", "granite paving company Bangalore"],
    schema: [
      localBusinessSchema(),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ]),
    ],
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24"><About /><AtelierInfo /></div>
      <Reviews />
      <Footer />
    </main>
  );
};
export default AboutPage;
