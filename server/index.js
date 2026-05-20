import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dns from "dns";
import { del, put } from "@vercel/blob";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const uploadsDir = process.env.VERCEL === "1" ? "/tmp/uploads" : path.join(rootDir, "uploads");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-before-live";
const MAX_OPTIMIZED_IMAGE_BYTES = Number(process.env.MAX_OPTIMIZED_IMAGE_BYTES || 220 * 1024);
const DEFAULT_CLIENT_URLS = [
  "http://localhost:8080",
  "https://pavingstones.in",
  "https://www.pavingstones.in",
];
const CLIENT_URLS = (process.env.CLIENT_URL || DEFAULT_CLIENT_URLS.join(","))
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
DEFAULT_CLIENT_URLS.forEach((url) => {
  if (!CLIENT_URLS.includes(url)) CLIENT_URLS.push(url);
});
if (process.env.VERCEL_URL) CLIENT_URLS.push(`https://${process.env.VERCEL_URL}`);
const PRIMARY_CLIENT_URL = CLIENT_URLS[0] || "http://localhost:8080";
const INQUIRY_RECIPIENT_EMAIL = process.env.INQUIRY_RECIPIENT_EMAIL || "granitepavingstone@gmail.com";
const SMTP_FROM = process.env.SMTP_FROM || `SJ Granite Paving Stone <${INQUIRY_RECIPIENT_EMAIL}>`;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

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

const User = mongoose.model("User", new mongoose.Schema({
  full_name: String,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  avatar_url: String,
  reset_token_hash: String,
  reset_token_expires_at: Date,
}, commonOptions));

const Category = mongoose.model("Category", new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true },
  description: String,
  image_url: String,
  sort_order: { type: Number, default: 0 },
}, commonOptions));

const Product = mongoose.model("Product", new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  slug: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true },
  tagline: String,
  description: String,
  main_image_url: String,
  featured: { type: Boolean, default: false },
}, commonOptions));

const ProductVariant = mongoose.model("ProductVariant", new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  color: String,
  material: String,
  image_url: String,
  sort_order: { type: Number, default: 0 },
}, commonOptions));

const WorkflowStep = mongoose.model("WorkflowStep", new mongoose.Schema({
  step_number: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image_url: String,
  duration_label: String,
}, commonOptions));

const Review = mongoose.model("Review", new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  author_name: { type: String, required: true },
  author_email: String,
  author_role: String,
  rating: { type: Number, default: 5, min: 1, max: 5 },
  content: { type: String, required: true },
  avatar_url: String,
  featured: { type: Boolean, default: true },
}, commonOptions));

const Inquiry = mongoose.model("Inquiry", new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: String,
  message: { type: String, required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
  status: { type: String, default: "new" },
}, commonOptions));

const HeroImage = mongoose.model("HeroImage", new mongoose.Schema({
  image_url: { type: String, required: true },
  caption: String,
  sort_order: { type: Number, default: 0 },
}, commonOptions));

const SiteSetting = mongoose.model("SiteSetting", new mongoose.Schema({
  _id: { type: String, default: "main" },
  map_latitude: Number,
  map_longitude: Number,
  map_zoom: { type: Number, default: 15 },
  owner_image_url: String,
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
  workflow_steps: WorkflowStep,
  reviews: Review,
  inquiries: Inquiry,
  hero_images: HeroImage,
  site_settings: SiteSetting,
};

const tableConfig = {
  categories: { orderBy: "sort_order", public: true },
  products: { orderBy: "created_at", public: true },
  product_variants: { orderBy: "sort_order", public: true },
  workflow_steps: { orderBy: "step_number", public: true },
  reviews: { orderBy: "created_at", public: true },
  hero_images: { orderBy: "sort_order", public: true },
  site_settings: { orderBy: "updated_at", public: true },
  inquiries: { orderBy: "created_at", public: false },
};

const imageFieldsByTable = {
  categories: ["image_url"],
  products: ["main_image_url"],
  product_variants: ["image_url"],
  workflow_steps: ["image_url"],
  reviews: ["avatar_url"],
  hero_images: ["image_url"],
  site_settings: ["owner_image_url"],
};

const asId = (id) => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
const clean = (value) => value === "" ? null : value;
const clampRating = (value) => Math.min(5, Math.max(1, Number(value) || 5));
const cleanPayload = (payload = {}) => Object.fromEntries(
  Object.entries(payload)
    .filter(([key]) => !["id", "_id", "__v", "created_at", "updated_at", "categories", "products"].includes(key))
    .map(([key, value]) => [key, clean(value)])
);

const imageUrlsFromDoc = (table, doc) => {
  if (!doc) return [];
  return (imageFieldsByTable[table] || [])
    .map((field) => doc[field])
    .filter(Boolean);
};

const changedImageUrls = (table, previousDoc, nextPayload) => {
  if (!previousDoc) return [];
  return (imageFieldsByTable[table] || [])
    .filter((field) => Object.prototype.hasOwnProperty.call(nextPayload, field))
    .map((field) => previousDoc[field])
    .filter((url) => url && !Object.values(nextPayload).includes(url));
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

const getRequestClientUrl = (req) => {
  const origin = req.get("origin");
  if (origin && CLIENT_URLS.includes(origin)) return origin;

  const forwardedHost = req.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProto = req.get("x-forwarded-proto") || "https";
    return `${forwardedProto}://${forwardedHost}`;
  }

  return PRIMARY_CLIENT_URL;
};

const sendPasswordResetEmail = async ({ email, resetUrl }) => {
  const mailer = createMailer();
  if (!mailer) {
    console.warn("Password reset email was not sent because SMTP settings are missing.");
    return false;
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

let databaseConnectionPromise = null;

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return true;
  if (databaseConnectionPromise) return databaseConnectionPromise;

  databaseConnectionPromise = mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/granite-paving-stone", {
    family: 4,
    serverSelectionTimeoutMS: 15000,
  })
    .then(async () => {
      await SiteSetting.findByIdAndUpdate("main", {
        $setOnInsert: { map_latitude: 12.9716, map_longitude: 77.5946, map_zoom: 14 },
      }, { upsert: true });
      console.log("MongoDB connected");
      return true;
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error?.message || error);
      throw error;
    })
    .finally(() => {
      databaseConnectionPromise = null;
    });

  return databaseConnectionPromise;
};

app.get("/api/health", asyncHandler(async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDatabase().catch(() => false);
  }
  res.json({ ok: true, database: mongoose.connection.readyState === 1 });
}));

app.use("/api", asyncHandler(async (req, res, next) => {
  if (req.path === "/health") return next();
  if (mongoose.connection.readyState !== 1) {
    await connectDatabase().catch(() => false);
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      code: "DATABASE_UNAVAILABLE",
      error: "Database is not connected. Please check MongoDB Atlas Network Access and try again.",
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
  const role = userCount === 0 || ADMIN_EMAILS.includes(normalizedEmail) ? "admin" : "user";
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
  res.json({ token: signToken(user), user: user.toJSON() });
}));

app.post("/api/auth/forgot-password", asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  const user = await User.findOne({ email });
  let resetUrl = null;
  let emailSent = false;

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    user.reset_token_hash = hashResetToken(token);
    user.reset_token_expires_at = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    resetUrl = `${getRequestClientUrl(req)}/reset-password?token=${token}`;
    emailSent = await sendPasswordResetEmail({ email: user.email, resetUrl });
  }

  res.json({
    message: "If this email exists, a password reset link has been sent.",
    emailSent,
    resetUrl: process.env.NODE_ENV === "production" ? null : resetUrl,
  });
}));

app.post("/api/auth/reset-password", asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: "Valid reset token and 8 character password are required." });
  }

  const user = await User.findOne({
    reset_token_hash: hashResetToken(token),
    reset_token_expires_at: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ error: "Reset link is invalid or expired." });

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
  res.status(201).json(doc.toJSON());
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
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files can be uploaded."));
    cb(null, true);
  },
});

const optimizeImage = async (file) => {
  const ext = ".webp";
  const base = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-z0-9_-]/gi, "_");
  const filename = `${Date.now()}-${base}${ext}`;
  let width = 1600;
  let quality = 78;
  let buffer;

  do {
    buffer = await sharp(file.buffer)
      .rotate()
      .resize({
        width,
        height: width,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    if (buffer.length <= MAX_OPTIMIZED_IMAGE_BYTES) break;
    if (quality > 56) quality -= 6;
    else if (width > 1000) {
      width -= 200;
      quality = 72;
    } else break;
  } while (true);

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
    await ProductVariant.deleteMany({ product_id: asId(id) });
  }

  await Model.findByIdAndDelete(targetId);
  await removeUnusedImages(imageUrls);
  res.json({ ok: true });
}));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.code === 11000) return res.status(409).json({ error: "This slug or email already exists." });
  if (err?.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "Image is too large. Please upload an image under 25MB." });
  res.status(500).json({ error: err?.message || "Something went wrong." });
});

const databaseReady = connectDatabase().catch(() => false);

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

export { app, databaseReady };
export default app;
