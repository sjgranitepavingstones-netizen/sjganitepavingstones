import { Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import sjLogo from "@/assets/sj-granite-paving-stone-logo.jpg";

export const Footer = () => {
  const socialLinks = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/p/DOYmGwZARN3/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      Icon: Instagram,
    },
    {
      label: "X",
      href: "https://x.com/granitepav57662/status/1965417213286121741",
      Icon: Twitter,
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/permalink.php?story_fbid=pfbid0G2ua3sAjPajhRWVcuWLU5VBF3TJSgCLLdCcSqcEorimHv44u64dPSZbAYww69S68l&id=100065436781316",
      Icon: Facebook,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/feed/update/urn:li:activity:7371183035062390784",
      Icon: Linkedin,
    },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-primary/20">
      <div className="container py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <img src={sjLogo} alt="SJ Granite Paving Stone logo" className="h-28 w-auto max-w-full object-contain border border-primary/20" />
          <div className="font-serif text-2xl text-gold-gradient mt-4">SJ Granite Paving Stone</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-secondary-foreground/60 mt-1">Established 2013</div>
          <p className="mt-6 text-sm text-secondary-foreground/70 max-w-md leading-relaxed">
            Professional granite paving, outdoor stonework, flooring, parking designs and custom stone products built with care.
          </p>
          <div className="mt-6 flex gap-3">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full border border-primary/30 inline-flex items-center justify-center text-primary hover:bg-gold-gradient hover:text-primary-foreground hover:border-transparent transition-all duration-500"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-5">Explore</div>
          <ul className="space-y-3 text-sm text-secondary-foreground/80">
            {[
              { l: "Products", to: "/products" },
              { l: "Categories", to: "/categories" },
              { l: "Bangalore Services", to: "/granite-paving-stone-bangalore" },
              { l: "About", to: "/about" },
              { l: "Contact", to: "/contact" },
              { l: "Terms & Conditions", to: "/terms-and-conditions" },
            ].map((x) => (
              <li key={x.l}><Link to={x.to} className="link-gold hover:text-primary transition-colors">{x.l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-5">Contact</div>
          <ul className="space-y-3 text-sm text-secondary-foreground/80">
            <li>India</li>
            <li>+91 82172 57354 (WhatsApp)</li>
            <li>sjgranitepavingstones@gmail.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-secondary-foreground/50">
          <div>&copy; {new Date().getFullYear()} SJ Granite Paving Stone. All rights reserved.</div>
          <Link to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
};
