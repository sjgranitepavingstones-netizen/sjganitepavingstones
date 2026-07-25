import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { del, put } from "@vercel/blob";
import { fileURLToPath } from "url";
import { closeDatabase, connectDatabase, getDatabaseState, isDatabaseConnected, mongoose } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const uploadsDir = process.env.VERCEL === "1" ? "/tmp/uploads" : path.join(rootDir, "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-before-live";
const MAX_OPTIMIZED_IMAGE_BYTES = Number(process.env.MAX_OPTIMIZED_IMAGE_BYTES || 200 * 1024);
const HARD_OPTIMIZED_IMAGE_BYTES = Number(process.env.HARD_OPTIMIZED_IMAGE_BYTES || 240 * 1024);
const DEFAULT_CLIENT_URLS = [
  "http://localhost:8080",
  "https://pavingstones.in",
  "https://www.pavingstones.in",
];
const PUBLIC_CLIENT_URL = (process.env.PUBLIC_SITE_URL || process.env.VITE_SITE_URL || "https://www.pavingstones.in").replace(/\/+$/, "");
const CLIENT_URLS = (process.env.CLIENT_URL || DEFAULT_CLIENT_URLS.join(","))
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
DEFAULT_CLIENT_URLS.forEach((url) => {
  if (!CLIENT_URLS.includes(url)) CLIENT_URLS.push(url);
});
if (process.env.VERCEL_URL) CLIENT_URLS.push(`https://${process.env.VERCEL_URL}`);
const PRIMARY_CLIENT_URL = CLIENT_URLS[0] || "http://localhost:8080";
const INQUIRY_RECIPIENT_EMAIL = process.env.INQUIRY_RECIPIENT_EMAIL || "sjgranitepavingstones@gmail.com";
const SMTP_FROM = process.env.SMTP_FROM || `SJ Granite Paving Stone <${INQUIRY_RECIPIENT_EMAIL}>`;
const ALLOW_PASSWORD_RESET_LINK_RESPONSE = process.env.ALLOW_PASSWORD_RESET_LINK_RESPONSE === "true";
const DEFAULT_ADMIN_EMAILS = ["sjgranitepavingstones@gmail.com"];
const ADMIN_EMAILS = [...new Set([...DEFAULT_ADMIN_EMAILS, ...(process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)])];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || CLIENT_URLS.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
      return;
    }

    try {
      const originUrl = new URL(origin);
      const allowedHostnames = new Set(
        CLIENT_URLS.flatMap((url) => {
          const hostname = new URL(url).hostname;
          return hostname.startsWith("www.")
            ? [hostname, hostname.replace(/^www\./, "")]
            : [hostname, `www.${hostname}`];
        })
      );

      if (allowedHostnames.has(originUrl.hostname)) {
        callback(null, true);
        return;
      }
    } catch {
      // Fall through to the CORS error below.
    }

    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadsDir));

const commonOptions = {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.password_hash;
      return ret;
    },
  },
};

const defineModel = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

const User = defineModel("User", new mongoose.Schema({
  full_name: String,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  avatar_url: String,
  reset_token_hash: String,
  reset_token_expires_at: Date,
}, commonOptions));

const Category = defineModel("Category", new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true },
  description: String,
  image_url: String,
  sort_order: { type: Number, default: 0 },
}, commonOptions));

const Product = defineModel("Product", new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  slug: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true },
  tagline: String,
  description: String,
  main_image_url: String,
  featured: { type: Boolean, default: false },
}, commonOptions));

const ProductVariant = defineModel("ProductVariant", new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  color: String,
  material: String,
  image_url: String,
  image_urls: { type: [String], default: [] },
  sort_order: { type: Number, default: 0 },
}, commonOptions));

const VariantImage = defineModel("VariantImage", new mongoose.Schema({
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
  image_url: { type: String, required: true },
  sort_order: { type: Number, default: 0 },
}, commonOptions));

const WorkflowStep = defineModel("WorkflowStep", new mongoose.Schema({
  step_number: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image_url: String,
  duration_label: String,
}, commonOptions));

const Review = defineModel("Review", new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  author_name: { type: String, required: true },
  author_email: String,
  author_role: String,
  rating: { type: Number, default: 5, min: 1, max: 5 },
  content: { type: String, required: true },
  avatar_url: String,
  featured: { type: Boolean, default: true },
}, commonOptions));

const Inquiry = defineModel("Inquiry", new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: String,
  message: { type: String, required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
  status: { type: String, default: "new" },
}, commonOptions));

const LeadAgentProfile = defineModel("LeadAgentProfile", new mongoose.Schema({
  name: String,
  companyName: String,
  business_name: { type: String, required: true },
  contact_name: String,
  phone: String,
  whatsapp: String,
  email: String,
  website: String,
  location: String,
  product_interest: String,
  productInterest: String,
  client_type: String,
  customerType: String,
  projectType: String,
  sourceUrl: String,
  city: String,
  state: String,
  source: String,
  score: { type: Number, default: 0 },
  scoreReasons: { type: [String], default: [] },
  quotationAmount: Number,
  qualificationSummary: String,
  urgency: String,
  budgetRange: String,
  priority: { type: String, default: "medium" },
  status: { type: String, default: "new" },
  notes: String,
  next_follow_up: String,
  nextFollowUpAt: String,
  rawPayload: mongoose.Schema.Types.Mixed,
}, commonOptions));

const AdCampaign = defineModel("AdCampaign", new mongoose.Schema({
  title: { type: String, required: true },
  objective: { type: String, default: "LEAD_GENERATION" },
  product: String,
  city: String,
  audience: String,
  offer: String,
  dailyBudget: Number,
  durationDays: Number,
  language: { type: String, default: "English" },
  placements: { type: [String], default: ["Facebook Feed", "Instagram Reels"] },
  aspectRatio: { type: String, default: "9:16" },
  videoDuration: { type: Number, default: 20 },
  image_urls: { type: [String], default: [] },
  primaryText: String,
  headline: String,
  description: String,
  callToAction: { type: String, default: "Get Quote" },
  voiceScript: String,
  voiceStyle: String,
  storyboard: { type: [String], default: [] },
  videoUrl: String,
  landingUrl: String,
  leadFormFields: { type: [String], default: ["name", "phone", "city", "requirement"] },
  status: { type: String, default: "draft" },
  metaCampaignId: String,
  metaAdId: String,
  notes: String,
}, commonOptions));

const AdLead = defineModel("AdLead", new mongoose.Schema({
  campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: "AdCampaign", default: null },
  campaignTitle: String,
  name: String,
  phone: String,
  whatsapp: String,
  email: String,
  city: String,
  requirement: String,
  budget: String,
  source: { type: String, default: "AD_FORM" },
  platform: { type: String, default: "facebook_instagram" },
  status: { type: String, default: "new" },
  rawPayload: mongoose.Schema.Types.Mixed,
}, commonOptions));

const HeroImage = defineModel("HeroImage", new mongoose.Schema({
  image_url: { type: String, required: true },
  caption: String,
  sort_order: { type: Number, default: 0 },
}, commonOptions));

const SiteSetting = defineModel("SiteSetting", new mongoose.Schema({
  _id: { type: String, default: "main" },
  map_latitude: Number,
  map_longitude: Number,
  map_zoom: { type: Number, default: 15 },
  owner_image_url: String,
  lead_agent_schedule: mongoose.Schema.Types.Mixed,
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  toJSON: {
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  },
}));

const models = {
  categories: Category,
  products: Product,
  product_variants: ProductVariant,
  variant_images: VariantImage,
  workflow_steps: WorkflowStep,
  reviews: Review,
  inquiries: Inquiry,
  lead_agent_profiles: LeadAgentProfile,
  ad_campaigns: AdCampaign,
  ad_leads: AdLead,
  hero_images: HeroImage,
  site_settings: SiteSetting,
};

const tableConfig = {
  categories: { orderBy: "sort_order", public: true },
  products: { orderBy: "created_at", public: true },
  product_variants: { orderBy: "sort_order", public: true },
  variant_images: { orderBy: "sort_order", public: true },
  workflow_steps: { orderBy: "step_number", public: true },
  reviews: { orderBy: "created_at", public: true },
  hero_images: { orderBy: "sort_order", public: true },
  site_settings: { orderBy: "updated_at", public: true },
  inquiries: { orderBy: "created_at", public: false },
  lead_agent_profiles: { orderBy: "created_at", public: false },
  ad_campaigns: { orderBy: "created_at", public: false },
  ad_leads: { orderBy: "created_at", public: false },
};

const imageFieldsByTable = {
  categories: ["image_url"],
  products: ["main_image_url"],
  product_variants: ["image_url", "image_urls"],
  variant_images: ["image_url"],
  workflow_steps: ["image_url"],
  reviews: ["avatar_url"],
  ad_campaigns: ["image_urls"],
  hero_images: ["image_url"],
  site_settings: ["owner_image_url"],
};

const asId = (id) => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
const clean = (value) => value === "" ? null : value;
const clampRating = (value) => Math.min(5, Math.max(1, Number(value) || 5));
const normalizeUrlArray = (value) => {
  if (Array.isArray(value)) return [...new Set(value.map((url) => String(url || "").trim()).filter(Boolean))];
  if (typeof value === "string") return value.split(",").map((url) => url.trim()).filter(Boolean);
  return [];
};
const cleanPayload = (payload = {}) => {
  const cleaned = Object.fromEntries(Object.entries(payload)
    .filter(([key]) => !["id", "_id", "__v", "created_at", "updated_at", "categories", "products"].includes(key))
    .map(([key, value]) => [key, clean(value)])
  );
  if (Object.prototype.hasOwnProperty.call(cleaned, "image_urls")) {
    cleaned.image_urls = normalizeUrlArray(cleaned.image_urls);
  }
  return cleaned;
};

const imageUrlsFromDoc = (table, doc) => {
  if (!doc) return [];
  return (imageFieldsByTable[table] || [])
    .flatMap((field) => {
      const value = doc[field];
      return Array.isArray(value) ? value : [value];
    })
    .filter(Boolean);
};

const changedImageUrls = (table, previousDoc, nextPayload) => {
  if (!previousDoc) return [];
  return (imageFieldsByTable[table] || [])
    .filter((field) => Object.prototype.hasOwnProperty.call(nextPayload, field))
    .flatMap((field) => {
      const previousValue = previousDoc[field];
      const nextValue = nextPayload[field];
      const previousUrls = Array.isArray(previousValue) ? previousValue : [previousValue];
      const nextUrls = Array.isArray(nextValue) ? nextValue : [nextValue];
      return previousUrls.filter((url) => url && !nextUrls.includes(url));
    });
};

const isImageStillReferenced = async (url) => {
  const checks = await Promise.all(Object.entries(imageFieldsByTable).map(async ([table, fields]) => {
    const Model = models[table];
    if (!Model) return false;
    return Boolean(await Model.exists({ $or: fields.map((field) => ({ [field]: url })) }));
  }));
  return checks.some(Boolean);
};

const removeStoredImage = async (url) => {
  if (!url || url === "/placeholder.svg") return;

  try {
    if (url.startsWith("/uploads/")) {
      const filename = path.basename(url);
      await fs.promises.unlink(path.join(uploadsDir, filename)).catch((error) => {
        if (error?.code !== "ENOENT") throw error;
      });
      return;
    }

    const hostname = new URL(url).hostname;
    if (hostname.endsWith(".public.blob.vercel-storage.com")) {
      await del(url);
    }
  } catch (error) {
    console.warn("Failed to remove stored image:", error?.message || error);
  }
};

const removeUnusedImages = async (urls) => {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  await Promise.all(uniqueUrls.map(async (url) => {
    if (!(await isImageStillReferenced(url))) await removeStoredImage(url);
  }));
};

const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: "7d" }
);

const hashResetToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const createPasswordResetOtp = () => String(crypto.randomInt(100000, 1000000));
const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const createMailer = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendInquiryEmail = async (inquiry) => {
  const mailer = createMailer();
  if (!mailer) {
    console.warn("Inquiry email was not sent because SMTP settings are missing.");
    return;
  }

  const subject = inquiry.subject ? `New inquiry: ${inquiry.subject}` : "New website inquiry";
  const rows = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone || "Not provided"],
    ["Interested Product", inquiry.subject || "Not provided"],
    ["Message", inquiry.message],
  ];

  await mailer.sendMail({
    from: SMTP_FROM,
    to: INQUIRY_RECIPIENT_EMAIL,
    replyTo: inquiry.email,
    subject,
    text: rows.map(([label, value]) => `${label}: ${value}`).join("\n\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#222">
        <h2 style="margin:0 0 16px">New website inquiry</h2>
        ${rows.map(([label, value]) => `
          <p style="margin:0 0 12px">
            <strong>${escapeHtml(label)}:</strong><br />
            ${escapeHtml(value).replace(/\n/g, "<br />")}
          </p>
        `).join("")}
      </div>
    `,
  });
};

const formatLeadNotification = (type, lead) => {
  const rows = [
    [`New ${type}`],
    ["Name", lead.full_name || lead.name],
    ["Phone", lead.phone],
    ["WhatsApp", lead.whatsapp],
    ["Email", lead.email],
    ["Product", lead.product_interest || lead.subject],
    ["Client Type", lead.client_type],
    ["City", lead.city],
    ["State", lead.state],
    ["Project Size", lead.project_size],
    ["Budget", lead.budget],
    ["Source", lead.source],
    ["Priority", lead.priority],
    ["Status", lead.status],
    ["Message", lead.message || lead.notes],
  ];

  return rows
    .filter((row) => row.length === 1 || row[1])
    .map((row) => row.length === 1 ? `*${row[0]}*` : `*${row[0]}:* ${row[1]}`)
    .join("\n");
};

const notifyAdminOnWhatsApp = async (type, lead) => {
  const message = formatLeadNotification(type, lead);
  const webhookUrl = process.env.WHATSAPP_LEAD_WEBHOOK_URL;
  const cloudToken = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const notifyTo = process.env.WHATSAPP_NOTIFY_TO || process.env.ADMIN_WHATSAPP_NUMBER || "918217257354";

  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, message, lead }),
    });
    if (!response.ok) throw new Error(`WhatsApp webhook failed: ${response.status}`);
    return true;
  }

  if (cloudToken && phoneNumberId && notifyTo) {
    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cloudToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: notifyTo.replace(/\D/g, ""),
        type: "text",
        text: { preview_url: false, body: message.replace(/\*/g, "") },
      }),
    });
    if (!response.ok) throw new Error(`WhatsApp Cloud API failed: ${response.status}`);
    return true;
  }

  console.warn("WhatsApp lead notification skipped because WHATSAPP_LEAD_WEBHOOK_URL or WhatsApp Cloud API env vars are missing.");
  return false;
};

const leadProductLabels = {
  PAVING_STONE: "Paving stones",
  COBBLESTONE: "Cobblestones",
  FLOOR_STONE: "Floor stones",
  GARDEN_STONE: "Garden stones",
  OUTDOOR_TILE: "Outdoor tiles/stones",
  COMMERCIAL_PROJECT: "Commercial projects",
};

const leadCustomerTypeLabels = {
  BUILDER: "Builder",
  CONTRACTOR: "Contractor",
  ARCHITECT: "Architect",
  REAL_ESTATE_DEVELOPER: "Real estate developer",
  HOME_OWNER: "Home owner",
  LANDSCAPE_DESIGNER: "Landscape designer",
  CONSTRUCTION_COMPANY: "Construction company",
  RESORT_HOTEL: "Resort / hotel",
  FARMHOUSE: "Farmhouse",
  GARDEN_DESIGNER: "Garden designer",
  TILE_STONE_DEALER: "Tile / stone dealer",
  OTHER: "Other",
};

const leadBuyerIntentLabels = {
  HOME_GARDEN: "Home garden and outdoor buyers",
  DRIVEWAY_PARKING: "Driveway and parking buyers",
  FARMHOUSE_VILLA: "Farmhouse and villa owners",
  APARTMENT_COMMUNITY: "Apartment and community buyers",
  RESORT_PROPERTY: "Resort and property maintenance buyers",
  ACTIVE_PROJECTS: "Active construction project buyers",
  NEW_CONSTRUCTION: "New building and villa projects",
  LANDSCAPE_PROJECTS: "Landscape and garden projects",
  HOTEL_RESORT: "Hotel, resort and farmhouse projects",
  ARCHITECT_BUILDER: "Architect and builder purchase leads",
};

const normalizeLeadEnum = (value, fallback, allowed) => {
  const cleanValue = String(value || fallback).trim().toUpperCase();
  return allowed.includes(cleanValue) ? cleanValue : fallback;
};

const buildLeadAgentQuery = (input) => {
  const product = (leadProductLabels[input.productInterest] || "paving stones").toLowerCase();
  const customer = (leadCustomerTypeLabels[input.customerType] || "contractor").toLowerCase();
  const buyerIntent = normalizeLeadEnum(input.buyerIntent, "DRIVEWAY_PARKING", Object.keys(leadBuyerIntentLabels));
  const goal = clean(input.goal);

  if (input.customerType === "HOME_OWNER") {
    const homeOwnerQuery = {
      HOME_GARDEN: `villa community farmhouse garden outdoor renovation ${product}`,
      DRIVEWAY_PARKING: `villa community apartment association parking driveway outdoor flooring ${product}`,
      FARMHOUSE_VILLA: `farmhouse villa estate owners garden driveway outdoor stone requirement`,
      APARTMENT_COMMUNITY: `apartment owners association resident welfare association gated community parking landscaping`,
      RESORT_PROPERTY: `resort farmhouse homestay property maintenance garden parking outdoor stone`,
      ACTIVE_PROJECTS: `apartment association villa community farmhouse property maintenance ${product}`,
      NEW_CONSTRUCTION: `villa community farmhouse new home outdoor garden driveway ${product}`,
      LANDSCAPE_PROJECTS: `villa garden farmhouse landscape outdoor paving requirement`,
      HOTEL_RESORT: `resort farmhouse homestay garden parking outdoor stone requirement`,
      ARCHITECT_BUILDER: `villa community apartment association farmhouse driveway ${product}`,
    }[buyerIntent];

    return `${homeOwnerQuery} real customer`;
  }

  if (goal) return `${goal} ${customer} buyer lead`;

  const intentQuery = {
    HOME_GARDEN: `villa garden farmhouse landscape outdoor ${product} requirement`,
    DRIVEWAY_PARKING: `parking driveway outdoor flooring ${product} requirement`,
    FARMHOUSE_VILLA: `farmhouse villa resort outdoor stone project`,
    APARTMENT_COMMUNITY: `apartment association gated community parking landscaping ${product}`,
    RESORT_PROPERTY: `resort hotel farmhouse property maintenance outdoor stone project`,
    ACTIVE_PROJECTS: `architects landscape designers property managers ${product} project requirement`,
    NEW_CONSTRUCTION: `villa home project architects driveway outdoor flooring`,
    LANDSCAPE_PROJECTS: `landscape architects garden designers outdoor paving contractors villa garden`,
    HOTEL_RESORT: `resort hotel farmhouse landscape contractors outdoor stone project`,
    ARCHITECT_BUILDER: `architects builders real estate developers construction project contractors`,
  }[buyerIntent];

  return `${intentQuery} ${customer} buyers`;
};

const isLikelyWrongBuyerLead = (place, customerType = "") => {
  const haystack = [
    place.name,
    place.location,
    place.website,
    place.sourceUrl,
  ].filter(Boolean).join(" ").toLowerCase();

  const isSellerOrFactory = [
    /\bstone\s+(supplier|dealer|shop|store|trader|traders|wholesale|wholesaler|manufacturer|factory|exporter|merchant)\b/,
    /\b(granite|marble|tiles?|blocks?|pavers?|cobble\s*stone|paving\s*stone)\s+(supplier|dealer|shop|store|trader|traders|wholesale|wholesaler|manufacturer|manufacturers|factory|exporter|merchant)\b/,
    /\b(granite|marble|tiles?|blocks?|pavers?|cobble\s*stone|paving\s*stone)\b.{0,40}\b(supplier|dealer|shop|store|trader|traders|wholesale|wholesaler|manufacturer|manufacturers|factory|exporter|merchant)\b/,
    /\b(factory|manufacturer|manufacturers|industrial supplier|building material supplier|hardware store)\b/,
    /\bmarble\s+(and|&)\s+granite\b/,
    /\btile\s+shop\b/,
    /\bstone\s+mart\b/,
  ].some((pattern) => pattern.test(haystack));

  if (isSellerOrFactory) return true;

  if (customerType === "HOME_OWNER") {
    return [
      /\bpavers?\b/,
      /\btiles?\b/,
      /\bgranite\b/,
      /\bstones?\b/,
      /\bmarble\b/,
      /\bbuilders?\b/,
      /\bconstruction\s+(company|companies|contractor|contractors)\b/,
      /\binfratech\b/,
      /\bdevelopers?\b/,
      /\bcontractors?\b/,
    ].some((pattern) => pattern.test(haystack));
  }

  return false;
};

const scoreLeadProfile = (lead) => {
  const notes = `${lead.notes || ""} ${lead.qualificationSummary || ""}`;
  const base = [
    lead.phone ? 14 : 0,
    lead.email ? 10 : 0,
    lead.website ? 8 : 0,
    lead.location ? 10 : 0,
    lead.customerType && lead.customerType !== "OTHER" ? 18 : 8,
    /urgent|site|quotation|villa|project|builder|contractor|architect|hotel|resort/i.test(notes) ? 20 : 8,
    lead.productInterest ? 12 : 0,
    lead.source === "GOOGLE_MAPS" || lead.source === "WEBSITE" || lead.source === "WHATSAPP" ? 8 : 5,
  ].reduce((sum, value) => sum + value, 0);

  const score = Math.max(1, Math.min(100, base));
  return {
    score,
    reasons: [
      lead.phone || lead.email ? "Contact details are available." : "Contact details need manual enrichment.",
      lead.customerType && lead.customerType !== "OTHER" ? "Customer type matches a stone project buyer." : "Customer type needs review.",
      lead.website ? "Business website is available for review." : "Website is not available.",
    ],
    summary: "Rule-based qualification used for this imported public listing.",
  };
};

const findGoogleMapsLeads = async ({ query, city, limit, customerType }) => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured. Add it in Vercel Environment Variables, then redeploy.");
  }

  const requestedLimit = Number(limit) || 5;
  const queries = customerType === "HOME_OWNER"
    ? [
      query,
      "apartment owners association resident welfare association parking maintenance",
      "gated community villa association property manager parking garden",
      "farmhouse resort homestay garden parking property maintenance",
      "villa community estate association outdoor garden driveway",
    ]
    : [query];
  const results = [];
  const seen = new Set();
  const maxCollected = customerType === "HOME_OWNER" ? requestedLimit * 4 : requestedLimit;

  for (const searchQuery of queries) {
    const searchResponse = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.nationalPhoneNumber",
          "places.internationalPhoneNumber",
          "places.websiteUri",
          "places.googleMapsUri",
        ].join(","),
      },
      body: JSON.stringify({
        textQuery: `${searchQuery} in ${city}`,
        pageSize: Math.max(1, Math.min(requestedLimit * 3, 20)),
        regionCode: "IN",
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      let message = "Google Maps search failed.";
      try {
        const parsedError = JSON.parse(errorText);
        message = parsedError.error?.message || message;
      } catch {
        if (errorText) message = errorText;
      }
      throw new Error(message);
    }

    const searchData = await searchResponse.json();
    const places = Array.isArray(searchData.places) ? searchData.places : [];
    places.map((place) => ({
      name: place.displayName?.text || "Unknown place",
      location: place.formattedAddress || city,
      city,
      phone: place.internationalPhoneNumber || place.nationalPhoneNumber,
      website: place.websiteUri,
      sourceUrl: place.googleMapsUri,
      rawPayload: place,
    })).filter((place) => !isLikelyWrongBuyerLead(place, customerType)).forEach((place) => {
      const keyValue = place.sourceUrl || `${place.name}-${place.location}`;
      if (!seen.has(keyValue) && results.length < maxCollected) {
        seen.add(keyValue);
        results.push(place);
      }
    });

    if (customerType !== "HOME_OWNER" && results.length >= requestedLimit) break;
  }

  return results
    .sort((a, b) => Number(Boolean(b.phone)) - Number(Boolean(a.phone)))
    .slice(0, requestedLimit);
};

const buildOwnerAgentMessage = ({ city, product, customer, goal, importedCount, duplicateCount, hotLeads }) => [
  "StoneLead AI Agent report",
  `Goal: ${goal}`,
  `City: ${city}`,
  `Product: ${product}`,
  `Customer type: ${customer}`,
  `Imported: ${importedCount}`,
  `Duplicates skipped: ${duplicateCount}`,
  `High-fit leads: ${hotLeads.length}`,
  "",
  ...hotLeads.slice(0, 5).map((lead, index) =>
    `${index + 1}. ${lead.name || lead.business_name} | Score ${lead.score} | ${lead.phone || "No phone"} | ${lead.location}`,
  ),
  "",
  "Review before outreach. These are public/inbound leads, not guaranteed customers.",
].join("\n");

const getRequestClientUrl = (req) => {
  const origin = req.get("origin");
  if (origin && CLIENT_URLS.includes(origin)) return origin;

  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") return PUBLIC_CLIENT_URL;

  const forwardedHost = req.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProto = req.get("x-forwarded-proto") || "https";
    return `${forwardedProto}://${forwardedHost}`;
  }

  return PRIMARY_CLIENT_URL;
};

const sendPasswordResetEmail = async ({ email, resetUrl, otp }) => {
  const mailer = createMailer();
  if (!mailer) {
    console.warn("Password reset email was not sent because SMTP settings are missing.");
    return false;
  }

  if (otp) {
    await mailer.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "Your SJ Granite Paving Stone password reset OTP",
      text: [
        "We received a request to reset your SJ Granite Paving Stone account password.",
        "",
        `Your password reset OTP is: ${otp}`,
        "",
        "This OTP will expire in 10 minutes. If you did not request this, you can ignore this email.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:560px">
          <h2 style="margin:0 0 12px;color:#111">Reset your password</h2>
          <p>We received a request to reset your SJ Granite Paving Stone account password.</p>
          <p style="font-size:13px;color:#555;margin-bottom:8px">Use this OTP to create a new password:</p>
          <div style="font-size:32px;letter-spacing:10px;font-weight:700;color:#111;background:#f4ead7;border:1px solid #d4a84e;padding:16px 18px;text-align:center">
            ${escapeHtml(otp)}
          </div>
          <p style="font-size:13px;color:#555">This OTP will expire in 10 minutes. If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    return true;
  }

  await mailer.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: "Reset your SJ Granite Paving Stone password",
    text: [
      "We received a request to reset your SJ Granite Paving Stone account password.",
      "",
      `Open this secure link to create a new password: ${resetUrl}`,
      "",
      "This link will expire in 1 hour. If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:560px">
        <h2 style="margin:0 0 12px;color:#111">Reset your password</h2>
        <p>We received a request to reset your SJ Granite Paving Stone account password.</p>
        <p style="margin:24px 0">
          <a href="${escapeHtml(resetUrl)}" style="background:#c9962e;color:#111;text-decoration:none;padding:12px 18px;display:inline-block;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:12px">
            Create new password
          </a>
        </p>
        <p style="font-size:13px;color:#555">This link will expire in 1 hour. If you did not request this, you can ignore this email.</p>
        <p style="font-size:12px;color:#777;word-break:break-all">Reset link: ${escapeHtml(resetUrl)}</p>
      </div>
    `,
  });

  return true;
};

const auth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Please sign in first." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found." });
    const isConfiguredAdmin = ADMIN_EMAILS.includes(String(user.email || "").toLowerCase());
    if (isConfiguredAdmin && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }
    if (!isConfiguredAdmin && user.role === "admin") {
      user.role = "user";
      await user.save();
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required." });
  next();
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get("/api/health", asyncHandler(async (_req, res) => {
  const database = getDatabaseState();
  res.json({ ok: true, database: database.connected, databaseState: database.readyStateName });
}));

app.use("/api", asyncHandler(async (req, res, next) => {
  if (req.path === "/health") return next();
  if (!isDatabaseConnected()) {
    await connectDatabase().catch(() => false);
  }
  if (!isDatabaseConnected()) {
    const database = getDatabaseState();
    return res.status(503).json({
      code: "DATABASE_UNAVAILABLE",
      error: "Database is temporarily unavailable. Please try again shortly.",
      databaseState: database.readyStateName,
    });
  }
  next();
}));

app.post("/api/auth/signup", asyncHandler(async (req, res) => {
  const { full_name, email, password } = req.body;
  if (!full_name || !email || !password || password.length < 8) {
    return res.status(400).json({ error: "Name, valid email, and 8 character password are required." });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) return res.status(409).json({ error: "An account with this email already exists." });
  const userCount = await User.countDocuments();
  const role = ADMIN_EMAILS.includes(normalizedEmail) ? "admin" : "user";
  const user = await User.create({
    full_name: full_name.trim(),
    email: normalizedEmail,
    password_hash: await bcrypt.hash(password, 12),
    role,
  });
  res.status(201).json({ token: signToken(user), user: user.toJSON() });
}));

app.get("/api/auth/status", asyncHandler(async (_req, res) => {
  const userCount = await User.estimatedDocumentCount();
  res.json({ hasUsers: userCount > 0 });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").toLowerCase().trim();
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    return res.status(404).json({
      code: "NO_USERS",
      error: "No account has been registered yet. Please create an account first.",
    });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(404).json({
      code: "USER_NOT_FOUND",
      error: "No account was found with this email. Please create an account first.",
    });
  }

  if (!(await bcrypt.compare(password || "", user.password_hash))) {
    return res.status(401).json({ error: "Email or password is not correct." });
  }
  const isConfiguredAdmin = ADMIN_EMAILS.includes(normalizedEmail);
  if (isConfiguredAdmin && user.role !== "admin") {
    user.role = "admin";
    await user.save();
  }
  if (!isConfiguredAdmin && user.role === "admin") {
    user.role = "user";
    await user.save();
  }
  res.json({ token: signToken(user), user: user.toJSON() });
}));

app.post("/api/auth/forgot-password", asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  const user = await User.findOne({ email });
  let otp = null;
  let emailSent = false;

  if (user) {
    otp = createPasswordResetOtp();
    user.reset_token_hash = hashResetToken(otp);
    user.reset_token_expires_at = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    emailSent = await sendPasswordResetEmail({ email: user.email, otp });
  }

  res.json({
    message: "If this email exists, a password reset OTP has been sent.",
    emailSent,
    expiresInMinutes: 10,
    otp: ALLOW_PASSWORD_RESET_LINK_RESPONSE || process.env.NODE_ENV !== "production" ? otp : null,
  });
}));

app.post("/api/auth/reset-password", asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  const token = String(req.body.token || "").trim();
  const otp = String(req.body.otp || "").replace(/\D/g, "").trim();
  const password = String(req.body.password || "");

  if (!password || password.length < 8) {
    return res.status(400).json({ error: "An 8 character password is required." });
  }

  if (!token && (!email || otp.length !== 6)) {
    return res.status(400).json({ error: "Valid email, 6 digit OTP, and password are required." });
  }

  const filter = {
    reset_token_hash: hashResetToken(token || otp),
    reset_token_expires_at: { $gt: new Date() },
  };
  if (!token) filter.email = email;

  const user = await User.findOne(filter);
  if (!user) return res.status(400).json({ error: token ? "Reset link is invalid or expired." : "OTP is invalid or expired." });

  user.password_hash = await bcrypt.hash(password, 12);
  user.reset_token_hash = undefined;
  user.reset_token_expires_at = undefined;
  await user.save();

  res.json({ message: "Password updated successfully." });
}));

app.get("/api/auth/me", auth, (req, res) => {
  res.json({ user: req.user.toJSON() });
});

const getList = async (table, query) => {
  const Model = models[table];
  const config = tableConfig[table];
  const filter = {};

  if (query.featured != null) filter.featured = query.featured === "true";
  if (query.slug) filter.slug = query.slug;
  if (query.product_id) filter.product_id = asId(query.product_id);
  if (query.variant_id) filter.variant_id = asId(query.variant_id);
  if (query.id) filter._id = query.id === "main" ? "main" : asId(query.id);

  let mongoQuery = Model.find(filter);
  if (table === "products") mongoQuery = mongoQuery.populate("category_id", "name slug");
  const sortDir = query.desc === "true" ? -1 : 1;
  mongoQuery = mongoQuery.sort({ [query.orderBy || config.orderBy]: sortDir });
  if (query.limit) mongoQuery = mongoQuery.limit(Number(query.limit));
  const docs = await mongoQuery;
  const data = docs.map((doc) => {
    const item = doc.toJSON();
    if (table === "products" && item.category_id && typeof item.category_id === "object") {
      item.categories = { name: item.category_id.name, slug: item.category_id.slug };
      item.category_id = item.category_id.id;
    }
    return item;
  });

  if (table === "categories" && query.withCounts === "true") {
    const counts = await Product.aggregate([{ $group: { _id: "$category_id", count: { $sum: 1 } } }]);
    const countMap = new Map(counts.map((row) => [String(row._id), row.count]));
    return data.map((category) => ({ ...category, products: [{ count: countMap.get(category.id) || 0 }] }));
  }

  return data;
};

app.get("/api/:table", asyncHandler(async (req, res) => {
  const { table } = req.params;
  if (!models[table] || !tableConfig[table]?.public) return res.status(404).json({ error: "Not found." });
  res.json(await getList(table, req.query));
}));

app.get("/api/admin/:table", auth, adminOnly, asyncHandler(async (req, res) => {
  const { table } = req.params;
  if (!models[table]) return res.status(404).json({ error: "Not found." });
  res.json(await getList(table, req.query));
}));

app.post("/api/inquiries", asyncHandler(async (req, res) => {
  const payload = cleanPayload(req.body);
  if (!payload.name || !payload.email || !payload.message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }
  const doc = await Inquiry.create(payload);
  await sendInquiryEmail(doc.toJSON()).catch((error) => {
    console.error("Failed to send inquiry email:", error);
  });
  await notifyAdminOnWhatsApp("website inquiry", doc.toJSON()).catch((error) => {
    console.error("Failed to send WhatsApp inquiry notification:", error);
  });
  res.status(201).json(doc.toJSON());
}));

app.post("/api/ad-leads", asyncHandler(async (req, res) => {
  const payload = cleanPayload(req.body);
  if (!payload.name || !payload.phone) {
    return res.status(400).json({ error: "Name and phone are required." });
  }

  const campaign = payload.campaign_id && mongoose.Types.ObjectId.isValid(payload.campaign_id)
    ? await AdCampaign.findById(payload.campaign_id)
    : null;
  const doc = await AdLead.create({
    ...payload,
    campaign_id: campaign?._id || null,
    campaignTitle: payload.campaignTitle || campaign?.title,
    whatsapp: payload.whatsapp || payload.phone,
    source: payload.source || "AD_FORM",
    platform: payload.platform || "facebook_instagram",
    rawPayload: payload.rawPayload || payload,
  });

  await notifyAdminOnWhatsApp("ad lead", {
    name: doc.name,
    phone: doc.phone,
    location: doc.city,
    product_interest: campaign?.product || doc.requirement,
    notes: `${doc.campaignTitle || "Ad campaign"} - ${doc.requirement || "No requirement note"}`,
  }).catch((error) => {
    console.error("Failed to send WhatsApp ad lead notification:", error);
  });

  res.status(201).json(doc.toJSON());
}));

app.get("/api/meta/lead-webhook", (req, res) => {
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (verifyToken && req.query["hub.verify_token"] === verifyToken) {
    return res.send(req.query["hub.challenge"]);
  }
  res.status(403).send("Webhook verification failed");
});

app.post("/api/meta/lead-webhook", asyncHandler(async (req, res) => {
  await AdLead.create({
    name: "Facebook Lead",
    phone: "",
    source: "META_LEAD_WEBHOOK",
    platform: "facebook_instagram",
    status: "new",
    rawPayload: req.body,
  });
  res.sendStatus(200);
}));

app.post("/api/reviews", auth, asyncHandler(async (req, res) => {
  const content = String(req.body.content || "").trim();
  if (content.length < 10 || content.length > 1000) {
    return res.status(400).json({ error: "Please write a review between 10 and 1000 characters." });
  }

  const doc = await Review.create({
    user_id: req.user._id,
    author_name: req.user.full_name || req.user.email.split("@")[0],
    author_email: req.user.email,
    author_role: "Customer",
    rating: clampRating(req.body.rating),
    content,
    avatar_url: clean(req.body.avatar_url),
    featured: true,
  });
  res.status(201).json(doc.toJSON());
}));

const useBlobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files can be uploaded."));
    cb(null, true);
  },
});

const optimizeImage = async (file) => {
  const ext = ".webp";
  const base = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-z0-9_-]/gi, "_");
  const filename = `${Date.now()}-${base}${ext}`;
  const widths = [1600, 1400, 1200, 1000, 900, 800, 700, 640, 560];
  const qualities = [78, 72, 66, 60, 54, 48, 42, 36];
  let buffer;

  for (const width of widths) {
    for (const quality of qualities) {
      buffer = await sharp(file.buffer)
        .rotate()
        .resize({
          width,
          height: width,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality,
          effort: 6,
          smartSubsample: true,
        })
        .toBuffer();

      if (buffer.length <= MAX_OPTIMIZED_IMAGE_BYTES) {
        return { buffer, filename, contentType: "image/webp" };
      }
    }
  }

  if (!buffer || buffer.length > HARD_OPTIMIZED_IMAGE_BYTES) {
    buffer = await sharp(file.buffer)
      .rotate()
      .resize({
        width: 480,
        height: 480,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 32,
        effort: 6,
        smartSubsample: true,
      })
      .toBuffer();
  }

  return { buffer, filename, contentType: "image/webp" };
};

const uploadImage = async (file) => {
  if (process.env.VERCEL === "1" && !useBlobStorage) {
    throw new Error("Image storage is not configured. Please connect Vercel Blob and redeploy.");
  }

  const optimized = await optimizeImage(file);

  if (useBlobStorage) {
    const blob = await put(`uploads/${optimized.filename}`, optimized.buffer, {
      access: "public",
      contentType: optimized.contentType,
    });
    return blob.url;
  }

  await fs.promises.writeFile(path.join(uploadsDir, optimized.filename), optimized.buffer);
  return `/uploads/${optimized.filename}`;
};

app.post("/api/admin/upload", auth, adminOnly, upload.single("image"), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Image file is required." });
  res.status(201).json({ url: await uploadImage(req.file) });
}));

app.post("/api/review-upload", auth, upload.single("image"), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Image file is required." });
  res.status(201).json({ url: await uploadImage(req.file) });
}));

const runLeadAgentWorkflow = async (input = {}) => {
  const productInterest = normalizeLeadEnum(input.productInterest, "PAVING_STONE", Object.keys(leadProductLabels));
  const customerType = normalizeLeadEnum(input.customerType, "CONTRACTOR", Object.keys(leadCustomerTypeLabels));
  const buyerIntent = normalizeLeadEnum(input.buyerIntent, "DRIVEWAY_PARKING", Object.keys(leadBuyerIntentLabels));
  const city = clean(input.city) || "Bengaluru";
  const state = clean(input.state) || "Karnataka";
  const quantity = Math.max(1, Math.min(Number(input.quantity) || 5, 20));
  const minScore = Math.max(1, Math.min(Number(input.minScore) || 75, 100));
  const notifyWhatsApp = input.notifyWhatsApp !== false;
  const query = buildLeadAgentQuery({ ...input, productInterest, customerType, city, state });

  const places = await findGoogleMapsLeads({ query, city, limit: quantity, customerType });
  const imported = [];
  const skippedDuplicates = [];

  for (const place of places) {
    const duplicateFilter = {
      $or: [
        place.sourceUrl ? { sourceUrl: place.sourceUrl } : null,
        place.phone ? { phone: place.phone } : null,
        { name: place.name, city: place.city },
        { business_name: place.name, city: place.city },
      ].filter(Boolean),
    };
    const duplicate = await LeadAgentProfile.findOne(duplicateFilter).select("_id name business_name");
    if (duplicate) {
      skippedDuplicates.push(duplicate.toJSON());
      continue;
    }

    const leadBase = {
      name: place.name,
      business_name: place.name,
      companyName: place.name,
      phone: place.phone,
      whatsapp: place.phone,
      website: place.website,
      location: place.location,
      city: place.city,
      state,
      source: "GOOGLE_MAPS",
      sourceUrl: place.sourceUrl,
      productInterest,
      product_interest: productInterest,
      customerType,
      client_type: customerType,
      buyerIntent,
      projectType: "BOTH",
      notes: `AI Agent buyer search: ${clean(input.goal) || query}. Targeting ${leadBuyerIntentLabels[buyerIntent]}. Stone sellers/dealers are filtered where possible. Verify before outreach.`,
      rawPayload: place.rawPayload,
    };
    const scoring = scoreLeadProfile(leadBase);
    const isHot = scoring.score >= minScore;
    const doc = await LeadAgentProfile.create({
      ...leadBase,
      status: isHot ? "INTERESTED" : "NEW",
      score: scoring.score,
      scoreReasons: scoring.reasons,
      qualificationSummary: scoring.summary,
      nextFollowUpAt: isHot ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : null,
      next_follow_up: isHot ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : null,
    });
    imported.push(doc.toJSON());
  }

  const hotLeads = imported.filter((lead) => Number(lead.score || 0) >= minScore);
  const ownerMessage = buildOwnerAgentMessage({
    city,
    product: leadProductLabels[productInterest],
    customer: `${leadCustomerTypeLabels[customerType]} / ${leadBuyerIntentLabels[buyerIntent]}`,
    goal: clean(input.goal) || query,
    importedCount: imported.length,
    duplicateCount: skippedDuplicates.length,
    hotLeads,
  });
  const waUrl = `https://wa.me/${String(process.env.WHATSAPP_NOTIFY_TO || process.env.ADMIN_WHATSAPP_NUMBER || "918217257354").replace(/\D/g, "")}?text=${encodeURIComponent(ownerMessage)}`;

  if (notifyWhatsApp) {
    await notifyAdminOnWhatsApp("lead agent report", {
      name: "StoneLead AI Agent",
      product_interest: leadProductLabels[productInterest],
      client_type: leadCustomerTypeLabels[customerType],
      city,
      source: "GOOGLE_MAPS",
      status: `${imported.length} imported, ${hotLeads.length} hot`,
      message: ownerMessage,
    }).catch((error) => {
      console.error("Failed to send lead agent WhatsApp notification:", error);
    });
  }

  return {
    goal: clean(input.goal) || query,
    query,
    imported,
    importedCount: imported.length,
    hotLeads,
    hotCount: hotLeads.length,
    skippedDuplicates: skippedDuplicates.length,
    ownerMessage,
    whatsapp: { attempted: notifyWhatsApp, sent: false, waUrl, reason: "Open WhatsApp alert if Cloud API is not configured." },
  };
};

app.post("/api/admin/lead-agent/run", auth, adminOnly, asyncHandler(async (req, res) => {
  res.json(await runLeadAgentWorkflow(req.body));
}));

app.get("/api/admin/lead-agent/schedule", auth, adminOnly, asyncHandler(async (_req, res) => {
  const settings = await SiteSetting.findById("main");
  res.json(settings?.lead_agent_schedule || {
    enabled: false,
    time: "18:00",
    state: "Karnataka",
    city: "Bengaluru",
    productInterest: "PAVING_STONE",
    customerType: "HOME_OWNER",
    buyerIntent: "DRIVEWAY_PARKING",
    quantity: 5,
    minScore: 75,
  });
}));

app.put("/api/admin/lead-agent/schedule", auth, adminOnly, asyncHandler(async (req, res) => {
  const schedule = {
    enabled: req.body.enabled === true,
    time: String(req.body.time || "18:00").slice(0, 5),
    state: clean(req.body.state) || "Karnataka",
    city: clean(req.body.city) || "Bengaluru",
    productInterest: normalizeLeadEnum(req.body.productInterest, "PAVING_STONE", Object.keys(leadProductLabels)),
    customerType: normalizeLeadEnum(req.body.customerType, "HOME_OWNER", Object.keys(leadCustomerTypeLabels)),
    buyerIntent: normalizeLeadEnum(req.body.buyerIntent, "DRIVEWAY_PARKING", Object.keys(leadBuyerIntentLabels)),
    quantity: Math.max(1, Math.min(Number(req.body.quantity) || 5, 20)),
    minScore: Math.max(1, Math.min(Number(req.body.minScore) || 75, 100)),
    lastRunDate: req.body.lastRunDate || null,
    updatedAt: new Date().toISOString(),
  };
  const doc = await SiteSetting.findByIdAndUpdate("main", { lead_agent_schedule: schedule }, { new: true, upsert: true });
  res.json(doc.lead_agent_schedule);
}));

app.post("/api/admin/:table", auth, adminOnly, asyncHandler(async (req, res) => {
  const { table } = req.params;
  const Model = models[table];
  if (!Model) return res.status(404).json({ error: "Not found." });
  const payload = cleanPayload(req.body);
  if (table === "reviews") payload.rating = clampRating(payload.rating);
  if (table === "site_settings") {
    const doc = await SiteSetting.findByIdAndUpdate("main", payload, { new: true, upsert: true });
    return res.json(doc.toJSON());
  }
  const doc = await Model.create(payload);
  res.status(201).json(doc.toJSON());
}));

app.put("/api/admin/:table/:id", auth, adminOnly, asyncHandler(async (req, res) => {
  const { table, id } = req.params;
  const Model = models[table];
  if (!Model) return res.status(404).json({ error: "Not found." });
  const payload = cleanPayload(req.body);
  if (table === "reviews") payload.rating = clampRating(payload.rating);
  const targetId = id === "main" ? "main" : asId(id);
  const previousDoc = await Model.findById(targetId);
  const oldImageUrls = changedImageUrls(table, previousDoc, payload);
  const doc = await Model.findByIdAndUpdate(targetId, payload, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ error: "Record not found." });
  await removeUnusedImages(oldImageUrls);
  res.json(doc.toJSON());
}));

app.delete("/api/admin/:table/:id", auth, adminOnly, asyncHandler(async (req, res) => {
  const { table, id } = req.params;
  const Model = models[table];
  if (!Model) return res.status(404).json({ error: "Not found." });
  const targetId = id === "main" ? "main" : asId(id);
  const imageUrls = [];
  const doc = await Model.findById(targetId);
  imageUrls.push(...imageUrlsFromDoc(table, doc));

  if (table === "products") {
    const variants = await ProductVariant.find({ product_id: asId(id) });
    variants.forEach((variant) => imageUrls.push(...imageUrlsFromDoc("product_variants", variant)));
    const variantIds = variants.map((variant) => variant._id);
    const variantImages = await VariantImage.find({ variant_id: { $in: variantIds } });
    variantImages.forEach((image) => imageUrls.push(...imageUrlsFromDoc("variant_images", image)));
    await VariantImage.deleteMany({ variant_id: { $in: variantIds } });
    await ProductVariant.deleteMany({ product_id: asId(id) });
  }

  if (table === "product_variants") {
    const variantImages = await VariantImage.find({ variant_id: asId(id) });
    variantImages.forEach((image) => imageUrls.push(...imageUrlsFromDoc("variant_images", image)));
    await VariantImage.deleteMany({ variant_id: asId(id) });
  }

  await Model.findByIdAndDelete(targetId);
  await removeUnusedImages(imageUrls);
  res.json({ ok: true });
}));

const getIndiaScheduleNow = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date()).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
};

const checkLeadAgentSchedule = async () => {
  if (!isDatabaseConnected()) return;
  const settings = await SiteSetting.findById("main");
  const schedule = settings?.lead_agent_schedule;
  if (!schedule?.enabled) return;

  const now = getIndiaScheduleNow();
  if (schedule.lastRunDate === now.date || schedule.time !== now.time) return;

  const runningSchedule = { ...schedule, lastRunDate: now.date };
  await SiteSetting.findByIdAndUpdate("main", { lead_agent_schedule: runningSchedule }, { upsert: true });
  await runLeadAgentWorkflow({
    ...schedule,
    goal: `Daily scheduled lead collection for ${leadProductLabels[schedule.productInterest] || "stone products"} in ${schedule.city}, ${schedule.state}`,
    notifyWhatsApp: true,
  }).catch(async (error) => {
    console.error("Daily lead agent schedule failed:", error?.message || error);
    await SiteSetting.findByIdAndUpdate("main", {
      "lead_agent_schedule.lastError": error?.message || "Schedule failed",
      "lead_agent_schedule.lastErrorAt": new Date().toISOString(),
    });
  });
};

app.get("/api/cron/lead-agent", asyncHandler(async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized cron request." });
  }
  if (!isDatabaseConnected()) {
    await connectDatabase({ force: true }).catch(() => false);
  }
  await checkLeadAgentSchedule();
  res.json({ ok: true });
}));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.code === 11000) return res.status(409).json({ error: "This slug or email already exists." });
  if (err?.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "Image is too large. Please upload an image under 50MB." });
  res.status(500).json({ error: err?.message || "Something went wrong." });
});

let databaseInitializationPromise = null;

const initializeDatabase = async () => {
  if (databaseInitializationPromise) return databaseInitializationPromise;

  databaseInitializationPromise = connectDatabase({ force: true })
    .then(async () => {
      await SiteSetting.findByIdAndUpdate("main", {
        $setOnInsert: { map_latitude: 12.9716, map_longitude: 77.5946, map_zoom: 14 },
      }, { upsert: true });
      return true;
    })
    .catch((error) => {
      console.error("Database startup initialization failed:", error?.message || error);
      return false;
    });

  return databaseInitializationPromise;
};

const databaseReady = initializeDatabase();

if (process.env.VERCEL !== "1") {
  const server = app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });

  const leadAgentInterval = setInterval(() => {
    checkLeadAgentSchedule().catch((error) => {
      console.error("Lead agent schedule check failed:", error?.message || error);
    });
  }, 60 * 1000);

  leadAgentInterval.unref?.();

  const shutdown = async (signal) => {
    console.log(`${signal} received. Closing API server and MongoDB connection.`);
    clearInterval(leadAgentInterval);
    server.close(async () => {
      await closeDatabase().catch((error) => {
        console.error("MongoDB shutdown failed:", error?.message || error);
      });
      process.exit(0);
    });
  };

  process.once("SIGINT", () => { void shutdown("SIGINT"); });
  process.once("SIGTERM", () => { void shutdown("SIGTERM"); });
}

export { app, databaseReady };
export default app;
