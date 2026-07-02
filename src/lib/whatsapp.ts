import { absoluteUrl } from "@/lib/seo";

export const WHATSAPP_NUMBER = "918217257354";
export const WHATSAPP_DISPLAY = "+91 821 725 7354";

type WhatsAppProduct = {
  name: string;
  slug?: string;
  tagline?: string | null;
  main_image_url?: string | null;
};

type WhatsAppVariant = {
  name?: string | null;
  color?: string | null;
  material?: string | null;
  image_url?: string | null;
};

export const createProductWhatsAppUrl = (
  product: WhatsAppProduct,
  variant?: WhatsAppVariant | null,
  selectedLabel?: string
) => {
  const imageUrl = variant?.image_url || product.main_image_url || "";
  const message = [
    "Hello SJ Granite Paving Stone,",
    "",
    "I am interested in this product:",
    `Product: ${product.name}`,
    product.tagline ? `Type: ${product.tagline}` : null,
    selectedLabel ? `Selected variant: ${selectedLabel}` : variant?.name ? `Selected variant: ${variant.name}` : null,
    variant?.color ? `Color: ${variant.color}` : null,
    variant?.material ? `Material: ${variant.material}` : null,
    imageUrl ? `Image: ${absoluteUrl(imageUrl)}` : null,
    "",
    "Please share more details.",
  ].filter(Boolean).join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};
