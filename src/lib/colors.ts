const NAMED_COLORS: Record<string, string> = {
  black: "#171717",
  blue: "#2563eb",
  brown: "#7c4a2d",
  cream: "#eadfc8",
  gold: "#d6a334",
  gray: "#9ca3af",
  green: "#15803d",
  grey: "#9ca3af",
  ivory: "#f8f3e7",
  pink: "#f3a6b5",
  red: "#b91c1c",
  silver: "#b8bec7",
  white: "#f8fafc",
  yellow: "#eab308",
};

const COLOR_HINTS: Array<[string, string]> = [
  ["silver", "#b8bec7"],
  ["grey", "#9ca3af"],
  ["gray", "#9ca3af"],
  ["black", "#171717"],
  ["white", "#f8fafc"],
  ["cream", "#eadfc8"],
  ["ivory", "#f8f3e7"],
  ["gold", "#d6a334"],
  ["yellow", "#eab308"],
  ["brown", "#7c4a2d"],
  ["red", "#b91c1c"],
  ["green", "#15803d"],
  ["blue", "#2563eb"],
  ["pink", "#f3a6b5"],
  ["orange", "#ea580c"],
  ["natural", "#a79f92"],
];

export const variantColorLabel = (color?: string | null, fallback?: string | null) =>
  (color || fallback || "Natural").trim();

export const colorToCss = (value?: string | null) => {
  const color = (value || "").trim();
  if (!color) return "#a79f92";
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) return color;
  if (/^(rgb|hsl)a?\(/i.test(color)) return color;

  const normalized = color.toLowerCase();
  if (NAMED_COLORS[normalized]) return NAMED_COLORS[normalized];

  const match = COLOR_HINTS.find(([hint]) => normalized.includes(hint));
  return match?.[1] || "#a79f92";
};
