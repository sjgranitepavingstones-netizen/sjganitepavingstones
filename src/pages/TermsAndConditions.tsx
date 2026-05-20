import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSeo, breadcrumbSchema } from "@/lib/seo";

const terms = [
  {
    title: "Use Of This Website",
    body: "By using this website or sending an inquiry to SJ Granite Paving Stone, you agree to use the information, images and contact forms only for genuine product, quotation or service purposes. Misuse, spam, copying or unauthorized commercial use of website content is not allowed.",
  },
  {
    title: "Quotations And Measurements",
    body: "Every quotation is confirmed directly after reviewing stone type, size, thickness, finish, transport distance, site condition, labor requirement and any custom work. Customers are responsible for sharing accurate measurements and project details.",
  },
  {
    title: "Orders And Payment",
    body: "An order is confirmed only after the customer approves the product details and payment terms. Advance payment may be required for material booking, customization or installation scheduling. Balance payments must be made as agreed before delivery, installation completion or handover.",
  },
  {
    title: "Natural Stone Variation",
    body: "Granite and other natural stones can vary in color, pattern, grain, texture and shade. These variations are part of natural stone and should not be treated as defects. We make every reasonable effort to select suitable material and explain visible differences before final work.",
  },
  {
    title: "Delivery And Installation",
    body: "Delivery and installation timelines are planned in good faith and may change due to material availability, weather, transport delays, site readiness or other practical conditions. The customer must provide safe access, clear working space, water/electricity where needed and timely site approvals.",
  },
  {
    title: "Cancellations And Changes",
    body: "Custom-cut, specially ordered or installed materials may not be cancelled or returned once work has started. Any change in design, size, quantity, finish or location may affect cost and timeline. Approved changes should be confirmed before further work continues.",
  },
  {
    title: "Service Quality And Support",
    body: "We aim to provide professional service, careful handling and durable workmanship. If a customer notices an issue related to our supplied material or installation, they should contact us promptly with photos and details so we can review and suggest a practical solution.",
  },
  {
    title: "Limit Of Responsibility",
    body: "SJ Granite Paving Stone is not responsible for damage caused by misuse, chemical cleaning, heavy impact, poor site maintenance, third-party work, structural movement, water logging or conditions outside our control. Our responsibility is limited to the goods or services supplied by us.",
  },
  {
    title: "Privacy And Contact Details",
    body: "Information submitted through this website may be used to respond to inquiries, prepare quotations and provide service updates. We do not sell customer contact details. Customers can contact us to update or correct their submitted information.",
  },
];

const TermsAndConditions = () => {
  useSeo({
    title: "Terms & Conditions",
    description:
      "Terms and conditions for quotations, orders, delivery, installation and support from SJ Granite Paving Stone in Bangalore, Karnataka.",
    path: "/terms-and-conditions",
    schema: breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Terms & Conditions", path: "/terms-and-conditions" },
    ]),
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-secondary text-secondary-foreground pt-36 pb-16">
        <div className="container text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Policy</span>
          <h1 className="font-serif text-5xl md:text-7xl text-white mt-4 leading-[1.05]">
            Terms & <span className="italic text-gold-gradient">Conditions</span>
          </h1>
          <p className="text-secondary-foreground/70 max-w-2xl mx-auto mt-6 text-sm md:text-base">
            These terms explain how quotations, orders, custom stone work, delivery, installation and customer support are handled.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="space-y-5">
            {terms.map((item, index) => (
              <article key={item.title} className="border border-foreground/10 bg-card/40 p-6 md:p-8">
                <div className="text-[10px] uppercase tracking-[0.3em] text-primary">0{index + 1}</div>
                <h2 className="font-serif text-2xl md:text-3xl mt-3">{item.title}</h2>
                <p className="text-muted-foreground leading-relaxed mt-4">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 border border-primary/20 bg-secondary text-secondary-foreground p-6 md:p-8">
            <h2 className="font-serif text-2xl text-gold-gradient">Contact For Questions</h2>
            <p className="text-secondary-foreground/75 mt-3 leading-relaxed">
              For questions about orders, quotations or service terms, contact SJ Granite Paving Stone at granitepavingstone@gmail.com or WhatsApp +91 82172 57354.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default TermsAndConditions;
