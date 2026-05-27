import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export const SectionHeading = ({ eyebrow, title, subtitle, align = "center", className }: SectionHeadingProps) => (
  <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
    {eyebrow && (
      <div className={cn("flex flex-wrap items-center gap-2 sm:gap-3 mb-5", align === "center" && "justify-center")}>
        <span className="hidden h-px w-8 bg-gold-gradient sm:block md:w-10" />
        <span className="text-[10px] uppercase tracking-[0.18em] text-primary font-medium sm:text-xs sm:tracking-[0.3em]">{eyebrow}</span>
        <span className="hidden h-px w-8 bg-gold-gradient sm:block md:w-10" />
      </div>
    )}
    <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05]">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed font-light">
        {subtitle}
      </p>
    )}
  </div>
);
