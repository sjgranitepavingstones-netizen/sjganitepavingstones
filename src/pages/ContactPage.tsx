import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Contact } from "@/components/Contact";
import { useSeo, localBusinessSchema, breadcrumbSchema } from "@/lib/seo";

const ContactPage = () => {
  useSeo({
    title: "Contact Granite Paving Stone Supplier In Bangalore",
    description:
      "Contact SJ Granite Paving Stone for granite paving stone, cobblestone, floor stone, parking stone and stone chair inquiries in Bangalore, Karnataka.",
    path: "/contact",
    keywords: ["contact granite paving stone Bangalore", "stone supplier Bangalore", "paving stone quote Bangalore"],
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
