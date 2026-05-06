import { useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { publicApi } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10).max(2000),
});

export const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      subject: String(fd.get("product") || ""),
      message: String(fd.get("message") || ""),
    };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      toast({ title: "Please check the form", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await publicApi.submitInquiry({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject || null,
        message: parsed.data.message,
      });
    } catch (error) {
      setLoading(false);
      toast({ title: "Submission failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
      return;
    }
    setLoading(false);
    (e.target as HTMLFormElement).reset();
    toast({ title: "Inquiry received", description: "Our team will reach out within 24 hours." });
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-background">
      <div className="container">
        <SectionHeading
          eyebrow="Begin Your Commission"
          title="Request A Private Consultation"
          subtitle="Share a few details and our team will prepare a tailored proposal for your project."
        />

        <div className="mt-16">
          <form onSubmit={onSubmit} className="max-w-3xl mx-auto bg-card border border-border p-10 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="Full Name" name="name" required />
              <Field label="Phone" name="phone" type="tel" required />
            </div>
            <Field label="Email" name="email" type="email" required />
            <Field label="Interested Product" name="product" placeholder="e.g. Garden bench, parking design..." />
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
                Project Details
              </label>
              <textarea
                name="message"
                rows={5}
                required
                className="w-full bg-transparent border-b border-border px-0 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="Tell us about your space, dimensions, and vision..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex items-center gap-3 px-10 py-4 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.3em] font-medium shimmer hover:shadow-gold-glow transition-all duration-500 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Submit Inquiry"}
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-xs text-muted-foreground">
              By submitting, you'll receive a personal response and product details from our team.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) => (
  <div>
    <label className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">{label}</label>
    <input
      type={type}
      name={name}
      required={required}
      placeholder={placeholder}
      className="w-full bg-transparent border-b border-border px-0 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
    />
  </div>
);
