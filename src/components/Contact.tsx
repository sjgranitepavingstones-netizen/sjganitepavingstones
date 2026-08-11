import { useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { publicApi } from "@/lib/api";
import { z } from "zod";

const PHONE_DIGITS_REGEX = /^[6-9]\d{9}$/;
const INDIAN_PHONE_REGEX = /^\+91[6-9]\d{9}$/;
const NAME_REGEX = /^[\p{L}\s.'-]+$/u;
const hasUsefulText = (value: string) => /[\p{L}\p{N}]/u.test(value);
const normalizePhoneDigits = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length > 10 && digits.startsWith("91") ? digits.slice(2, 12) : digits.slice(0, 10);
};

const schema = z.object({
  name: z.string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "Name must be under 80 characters.")
    .regex(NAME_REGEX, "Name can contain only letters, spaces, dots, apostrophes, and hyphens."),
  email: z.string()
    .trim()
    .email("Please enter a valid email address.")
    .max(255, "Email is too long.")
    .transform((value) => value.toLowerCase()),
  phone: z.string()
    .trim()
    .regex(INDIAN_PHONE_REGEX, "Phone number must be +91 followed by a valid 10 digit Indian mobile number."),
  subject: z.string()
    .trim()
    .min(2, "Please enter the product you are interested in.")
    .max(120, "Product name must be under 120 characters.")
    .refine(hasUsefulText, "Please enter a valid product or requirement."),
  message: z.string()
    .trim()
    .min(15, "Project details must be at least 15 characters.")
    .max(1500, "Project details must be under 1500 characters.")
    .refine(hasUsefulText, "Please enter valid project details."),
});

export const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: `+91${phoneDigits}`,
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
        phone: parsed.data.phone,
        subject: parsed.data.subject,
        message: parsed.data.message,
      });
    } catch (error) {
      setLoading(false);
      toast({ title: "Submission failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
      return;
    }
    setLoading(false);
    form.reset();
    setPhoneDigits("");
    toast({
      title: "Thank you for your inquiry.",
      description: "We have received your details. Our team will review your request and contact you shortly.",
    });
  };

  return (
    <section id="contact" className="py-16 md:py-32 bg-background">
      <div className="container">
        <SectionHeading
          eyebrow="Begin Your Commission"
          title="Request A Private Consultation"
          subtitle="Share a few details and our team will prepare a tailored proposal for your project."
        />

        <div className="mt-16">
          <form onSubmit={onSubmit} className="max-w-3xl mx-auto bg-card border border-border p-5 space-y-6 sm:p-8 md:p-10">
            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="Full Name" name="name" required autoComplete="name" minLength={2} maxLength={80} />
              <PhoneField value={phoneDigits} onChange={setPhoneDigits} />
            </div>
            <Field label="Email" name="email" type="email" required autoComplete="email" maxLength={255} />
            <Field label="Interested Product" name="product" required minLength={2} maxLength={120} placeholder="e.g. Garden bench, parking design..." />
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 sm:tracking-[0.3em]">
                Project Details
              </label>
              <textarea
                name="message"
                rows={5}
                required
                minLength={15}
                maxLength={1500}
                className="w-full bg-transparent border-b border-border px-0 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="Tell us about your space, dimensions, and vision..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-3 px-5 py-4 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.18em] font-medium shimmer hover:shadow-gold-glow transition-all duration-500 disabled:opacity-60 sm:w-auto sm:px-10 sm:tracking-[0.3em]"
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

const PhoneField = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div>
    <label className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 sm:tracking-[0.3em]">
      Phone
    </label>
    <div className="flex border-b border-border transition-colors focus-within:border-primary">
      <span className="flex items-center pr-3 py-3 text-sm font-medium text-foreground">+91</span>
      <input
        type="tel"
        value={value}
        onChange={(event) => onChange(normalizePhoneDigits(event.target.value))}
        required
        inputMode="numeric"
        autoComplete="tel-national"
        pattern={PHONE_DIGITS_REGEX.source}
        maxLength={14}
        placeholder="9876543210"
        title="Enter a valid 10 digit Indian mobile number"
        className="min-w-0 flex-1 bg-transparent px-0 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </div>
    <p className="mt-2 text-xs text-muted-foreground">Enter 10 digits only. We will save it as +91{value || "XXXXXXXXXX"}.</p>
  </div>
);

const Field = ({
  label,
  name,
  type = "text",
  required,
  placeholder,
  minLength,
  maxLength,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  autoComplete?: string;
}) => (
  <div>
    <label className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 sm:tracking-[0.3em]">{label}</label>
    <input
      type={type}
      name={name}
      required={required}
      placeholder={placeholder}
      minLength={minLength}
      maxLength={maxLength}
      autoComplete={autoComplete}
      className="w-full bg-transparent border-b border-border px-0 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
    />
  </div>
);
