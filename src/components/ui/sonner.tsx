import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      closeButton
      richColors
      duration={4500}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-md group-[.toaster]:border group-[.toaster]:border-primary/25 group-[.toaster]:bg-background/95 group-[.toaster]:text-foreground group-[.toaster]:shadow-deep group-[.toaster]:backdrop-blur-md",
          title: "group-[.toast]:font-serif group-[.toast]:text-base group-[.toast]:font-semibold",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton: "group-[.toast]:rounded-sm group-[.toast]:bg-primary group-[.toast]:px-3 group-[.toast]:py-2 group-[.toast]:text-[11px] group-[.toast]:font-medium group-[.toast]:uppercase group-[.toast]:tracking-[0.18em] group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "group-[.toast]:border-primary/20 group-[.toast]:bg-background group-[.toast]:text-foreground/60 group-[.toast]:hover:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
