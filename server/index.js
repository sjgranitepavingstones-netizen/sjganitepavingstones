import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dns from "dns";
import { put } from "@vercel/blob";
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
const CLIENT_URLS = (process.env.CLIENT_URL || "http://localhost:8080")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
if (process.env.VERCEL_URL) CLIENT_URLS.push(`https://${process.env.VERCEL_URL}`);
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
    callback(new Error("Not allowed by CORS"));
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
  base_price: Number,
  price_label: String,
  main_image_url: String,
  featured: { type: Boolean, default: false },
}, commonOptions));

const ProductVariant = mongoose.model("ProductVariant", new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  color: String,
  material: String,
  image_url: String,
  price: Number,
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

const asId = (id) => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
const clean = (value) => value === "" ? null : value;
const clampRating = (value) => Math.min(5, Math.max(1, Number(value) || 5));
const cleanPayload = (payload = {}) => Object.fromEntries(
  Object.entries(payload)
    .filter(([key]) => !["id", "_id", "__v", "created_at", "updated_at", "categories", "products"].includes(key))
    .map(([key, value]) => [key, clean(value)])
);

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

app.get("/api/health", (_req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 }));

app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      code: "DATABASE_UNAVAILABLE",
      error: "Database is not connected. Please check MongoDB Atlas Network Access and try again.",
    });
  }
  next();
});

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

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    user.reset_token_hash = hashResetToken(token);
    user.reset_token_expires_at = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;
    console.log(`Password reset link for ${email}: ${resetUrl}`);
  }

  res.json({
    message: "If this email exists, a password reset link has been prepared.",
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
const storage = useBlobStorage ? multer.memoryStorage() : multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files can be uploaded."));
    cb(null, true);
  },
});

const uploadImage = async (file) => {
  if (useBlobStorage) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, "_");
    const blob = await put(`uploads/${Date.now()}-${base}${ext}`, file.buffer, {
      access: "public",
      contentType: file.mimetype,
    });
    return blob.url;
  }

  return `/uploads/${file.filename}`;
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
  const doc = await Model.findByIdAndUpdate(id === "main" ? "main" : asId(id), payload, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ error: "Record not found." });
  res.json(doc.toJSON());
}));

app.delete("/api/admin/:table/:id", auth, adminOnly, asyncHandler(async (req, res) => {
  const { table, id } = req.params;
  const Model = models[table];
  if (!Model) return res.status(404).json({ error: "Not found." });
  if (table === "products") await ProductVariant.deleteMany({ product_id: asId(id) });
  await Model.findByIdAndDelete(asId(id));
  res.json({ ok: true });
}));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.code === 11000) return res.status(409).json({ error: "This slug or email already exists." });
  if (err?.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "Image is too large. Please upload an image under 25MB." });
  res.status(500).json({ error: err?.message || "Something went wrong." });
});

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/granite-paving-stone", {
      family: 4,
      serverSelectionTimeoutMS: 15000,
    });
    await SiteSetting.findByIdAndUpdate("main", {
      $setOnInsert: { map_latitude: 12.9716, map_longitude: 77.5946, map_zoom: 14 },
    }, { upsert: true });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error?.message || error);
  }
};

const databaseReady = connectDatabase();

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

export { app, databaseReady };
export default app;
