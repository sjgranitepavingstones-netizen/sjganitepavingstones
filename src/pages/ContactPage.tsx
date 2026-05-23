import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Contact } from "@/components/Contact";
import { useSeo, localBusinessSchema, breadcrumbSchema } from "@/lib/seo";

const ContactPage = () => {
  useSeo({
    title: "Contact Granite Paving Stone Supplier In India",
    description:
      "Contact SJ Granite Paving Stone for granite paving stone, cobblestone, floor stone, parking stone and stone chair inquiries in Bangalore, Karnataka, Mumbai and all India.",
    path: "/contact",
    keywords: ["contact granite paving stone India", "stone supplier India", "paving stone quote India", "granite paving stone Bangalore"],
    schema: [
      localBusinessSchema(),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ]),
    ],
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24"><Contact /></div>
      <Footer />
    </main>
  );
};
export default ContactPage;
