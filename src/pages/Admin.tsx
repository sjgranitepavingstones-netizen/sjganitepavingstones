import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Upload, Image as ImgIcon } from "lucide-react";

type Tab = "products" | "variants" | "categories" | "hero" | "workflow" | "reviews" | "inquiries" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "products", label: "Products" },
  { id: "variants", label: "Variants" },
  { id: "categories", label: "Categories" },
  { id: "hero", label: "Hero Images" },
  { id: "workflow", label: "Workflow" },
  { id: "reviews", label: "Reviews" },
  { id: "inquiries", label: "Inquiries" },
  { id: "settings", label: "Settings" },
];

const Admin = () => {
  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => { document.title = "Admin Panel | SJ Granite Paving Stone"; }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="container pt-32 pb-20">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Control Center</span>
            <h1 className="font-serif text-4xl md:text-5xl mt-2">Admin Panel</h1>
          </div>
          <Link to="/" className="text-xs uppercase tracking-[0.25em] text-foreground/60 hover:text-primary">← Back to site</Link>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-foreground/10 mb-8">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-[11px] uppercase tracking-[0.22em] border-b-2 -mb-px transition-colors ${tab===t.id?"border-primary text-primary":"border-transparent text-foreground/60 hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "products" && <ProductsAdmin />}
        {tab === "variants" && <VariantsAdmin />}
        {tab === "categories" && <CategoriesAdmin />}
        {tab === "hero" && <HeroImagesAdmin />}
        {tab === "workflow" && <WorkflowAdmin />}
        {tab === "reviews" && <ReviewsAdmin />}
        {tab === "inquiries" && <InquiriesAdmin />}
        {tab === "settings" && <SettingsAdmin />}
      </section>
      <Footer />
    </main>
  );
};

// ============ Reusable image uploader ============
const ImageUploader = ({ value, onChange, label = "Image" }: { value: string | null; onChange: (url: string) => void; label?: string }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const upload = async (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setBusy(true);
    try {
      const { url } = await adminApi.upload(f);
      onChange(url);
      toast.success("Uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.25em] text-foreground/60 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 bg-muted overflow-hidden border border-foreground/10 grid place-items-center">
          {value ? <img src={imageSrc(value)} onError={imageFallback} className="h-full w-full object-cover" /> : <ImgIcon className="h-5 w-5 text-foreground/30" />}
        </div>
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.currentTarget.value = "";
        }} />
        <button type="button" onClick={() => ref.current?.click()} disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 border border-foreground/15 text-[10px] uppercase tracking-[0.22em] hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
          <Upload className="h-3.5 w-3.5" /> {busy ? "Uploading…" : "Upload"}
        </button>
        {value && <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-3 py-2 bg-transparent border border-foreground/10 text-xs" />}
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNodeLike }) => (
  <div>
    <label className="block text-[10px] uppercase tracking-[0.25em] text-foreground/60 mb-2">{label}</label>
    {children}
  </div>
);
type ReactNodeLike = React.ReactNode;

const inputCls = "w-full px-3 py-2.5 bg-transparent border border-foreground/15 text-sm focus:border-primary outline-none";

const imageSrc = (url?: string | null) => url || "/placeholder.svg";
const imageFallback = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = "/placeholder.svg";
};

// ============ PRODUCTS ============
const ProductsAdmin = () => {
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const data = await adminApi.list("products", { orderBy: "created_at", desc: true });
    setItems(data || []);
  };
  useEffect(() => {
    load();
    adminApi.list("categories", { orderBy: "sort_order" }).then((data) => setCats(data || [])).catch(() => undefined);
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...editing };
    delete payload.categories;
    if (payload.base_price === "") payload.base_price = null;
    try {
      if (payload.id) await adminApi.update("products", payload.id, payload);
      else await adminApi.create("products", payload);
      toast.success("Saved"); setEditing(null); load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product (and all its variants)?")) return;
    try {
      await adminApi.remove("products", id);
      toast.success("Deleted"); load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setEditing({ name: "", slug: "", featured: false })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-gradient text-primary-foreground text-[10px] uppercase tracking-[0.22em]">
          <Plus className="h-3.5 w-3.5" /> New Product
        </button>
      </div>

      <div className="border border-foreground/10 divide-y divide-foreground/5">
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-muted/40">
            <img src={imageSrc(p.main_image_url)} onError={imageFallback} className="h-14 w-14 object-cover bg-muted" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-xs text-foreground/50">{p.categories?.name} · {p.price_label || "—"} {p.featured && "· ★"}</div>
            </div>
            <button onClick={() => setEditing(p)} className="p-2 hover:text-primary"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => del(p.id)} className="p-2 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-foreground/50 text-sm">No products yet</p>}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit Product" : "New Product"}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Name"><input required className={inputCls} value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Slug (url)"><input required className={inputCls} value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
            <Field label="Tagline"><input className={inputCls} value={editing.tagline || ""} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} /></Field>
            <Field label="Description"><textarea rows={4} className={inputCls} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Base Price (₹)"><input type="number" step="0.01" className={inputCls} value={editing.base_price ?? ""} onChange={(e) => setEditing({ ...editing, base_price: e.target.value })} /></Field>
              <Field label="Price Label"><input className={inputCls} value={editing.price_label || ""} onChange={(e) => setEditing({ ...editing, price_label: e.target.value })} placeholder="e.g. ₹2,500 / sq ft" /></Field>
            </div>
            <Field label="Category">
              <select className={inputCls} value={editing.category_id || ""} onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })}>
                <option value="">— None —</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <ImageUploader label="Main image" value={editing.main_image_url} onChange={(url) => setEditing({ ...editing, main_image_url: url })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured
            </label>
            <button className="w-full py-3 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.25em]">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ============ VARIANTS ============
const VariantsAdmin = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => {
    adminApi.list("products", { orderBy: "name" }).then((data) => {
      setProducts(data || []);
      if (data?.[0]) setProductId(data[0].id);
    }).catch(() => undefined);
  }, []);

  const load = useCallback(async () => {
    if (!productId) return;
    const data = await adminApi.list("product_variants", { product_id: productId, orderBy: "sort_order" });
    setItems(data || []);
  }, [productId]);
  useEffect(() => { load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...editing, product_id: productId };
    if (payload.price === "") payload.price = null;
    try {
      if (payload.id) await adminApi.update("product_variants", payload.id, payload);
      else await adminApi.create("product_variants", payload);
      toast.success("Saved"); setEditing(null); load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  };
  const del = async (id: string) => {
    if (!confirm("Delete variant?")) return;
    try {
      await adminApi.remove("product_variants", id);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className={inputCls + " md:w-80"}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button onClick={() => setEditing({ name: "", image_url: "", sort_order: items.length + 1 })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-gradient text-primary-foreground text-[10px] uppercase tracking-[0.22em]">
          <Plus className="h-3.5 w-3.5" /> New Variant
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((v) => (
          <div key={v.id} className="border border-foreground/10 group relative">
            <img src={imageSrc(v.image_url)} onError={imageFallback} className="aspect-square w-full object-cover" />
            <div className="p-2 text-xs">
              <div className="truncate font-medium">{v.color || v.name}</div>
              <div className="text-foreground/50 truncate text-[10px]">{v.material}</div>
            </div>
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(v)} className="p-1.5 bg-background/90 hover:text-primary"><Pencil className="h-3 w-3" /></button>
              <button onClick={() => del(v.id)} className="p-1.5 bg-background/90 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit Variant" : "New Variant"}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Name"><input required className={inputCls} value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Color"><input className={inputCls} value={editing.color || ""} onChange={(e) => setEditing({ ...editing, color: e.target.value })} /></Field>
              <Field label="Material"><input className={inputCls} value={editing.material || ""} onChange={(e) => setEditing({ ...editing, material: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (₹)"><input type="number" step="0.01" className={inputCls} value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: e.target.value })} /></Field>
              <Field label="Sort"><input type="number" className={inputCls} value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} /></Field>
            </div>
            <ImageUploader label="Variant image" value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} />
            <button className="w-full py-3 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.25em]">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ============ Generic CRUD list (for categories, workflow, reviews) ============
const CategoriesAdmin = () => <SimpleCrud
  table="categories" orderBy="sort_order"
  columns={[{ k: "name", label: "Name" }, { k: "slug", label: "Slug" }, { k: "sort_order", label: "Order", type: "number" }]}
  textareas={[{ k: "description", label: "Description" }]}
  imageField="image_url"
  display={(r) => <><img src={imageSrc(r.image_url)} onError={imageFallback} className="h-12 w-12 object-cover bg-muted" /><div className="flex-1"><div className="font-medium">{r.name}</div><div className="text-xs text-foreground/50">{r.slug}</div></div></>}
/>;

const WorkflowAdmin = () => <SimpleCrud
  table="workflow_steps" orderBy="step_number"
  columns={[
    { k: "step_number", label: "Step #", type: "number" },
    { k: "title", label: "Title" },
    { k: "duration_label", label: "Duration label" },
  ]}
  textareas={[{ k: "description", label: "Description" }]}
  imageField="image_url"
  display={(r) => <><img src={imageSrc(r.image_url)} onError={imageFallback} className="h-12 w-12 object-cover bg-muted" /><div className="flex-1"><div className="font-medium">0{r.step_number} · {r.title}</div><div className="text-xs text-foreground/50 truncate">{r.description}</div></div></>}
/>;

const ReviewsAdmin = () => <SimpleCrud
  table="reviews" orderBy="created_at" desc
  columns={[
    { k: "author_name", label: "Author" },
    { k: "author_email", label: "Email" },
    { k: "author_role", label: "Role" },
    { k: "rating", label: "Rating", type: "number", min: 1, max: 5 },
  ]}
  textareas={[{ k: "content", label: "Review content" }]}
  imageField="avatar_url"
  display={(r) => (
    <>
      <img src={r.avatar_url || "/placeholder.svg"} className="h-12 w-12 object-cover bg-muted rounded-full" />
      <div className="flex-1 min-w-0">
        <div className="font-medium">{r.author_name} · {"★".repeat(Math.min(5, Math.max(1, Number(r.rating) || 5)))}</div>
        {r.author_email && <div className="text-xs text-foreground/50 truncate">{r.author_email}</div>}
        <div className="text-xs text-foreground/50 truncate">{r.content}</div>
      </div>
    </>
  )}
/>;

type Col = { k: string; label: string; type?: "text" | "number"; min?: number; max?: number };
const SimpleCrud = ({ table, columns, textareas = [], imageField, orderBy, desc, display }:
  { table: string; columns: Col[]; textareas?: { k: string; label: string }[]; imageField?: string; orderBy: string; desc?: boolean; display: (r: any) => React.ReactNode }) => {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = useCallback(async () => {
    const data = await adminApi.list(table, { orderBy, desc: !!desc });
    setItems(data || []);
  }, [desc, orderBy, table]);
  useEffect(() => { load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...editing };
    columns.forEach((c) => {
      if (c.type === "number" && payload[c.k] !== "" && payload[c.k] != null) {
        const value = Number(payload[c.k]);
        payload[c.k] = Math.min(c.max ?? value, Math.max(c.min ?? value, value));
      }
    });
    try {
      if (payload.id) await adminApi.update(table, payload.id, payload);
      else await adminApi.create(table, payload);
      toast.success("Saved"); setEditing(null); load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this row?")) return;
    try {
      await adminApi.remove(table, id);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 px-4 py-2 bg-gold-gradient text-primary-foreground text-[10px] uppercase tracking-[0.22em]">
          <Plus className="h-3.5 w-3.5" /> New
        </button>
      </div>
      <div className="border border-foreground/10 divide-y divide-foreground/5">
        {items.map((r) => (
          <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-muted/40">
            {display(r)}
            <button onClick={() => setEditing(r)} className="p-2 hover:text-primary"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => del(r.id)} className="p-2 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit" : "New"}>
          <form onSubmit={save} className="space-y-4">
            {columns.map((c) => (
              <Field key={c.k} label={c.label}>
                <input type={c.type || "text"} min={c.min} max={c.max} className={inputCls} value={editing[c.k] ?? ""} onChange={(e) => setEditing({ ...editing, [c.k]: e.target.value })} />
              </Field>
            ))}
            {textareas.map((t) => (
              <Field key={t.k} label={t.label}>
                <textarea rows={4} className={inputCls} value={editing[t.k] ?? ""} onChange={(e) => setEditing({ ...editing, [t.k]: e.target.value })} />
              </Field>
            ))}
            {imageField && <ImageUploader label="Image" value={editing[imageField]} onChange={(url) => setEditing({ ...editing, [imageField]: url })} />}
            <button className="w-full py-3 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.25em]">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ============ INQUIRIES (read-only + delete) ============
const InquiriesAdmin = () => {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const data = await adminApi.list("inquiries", { orderBy: "created_at", desc: true });
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);
  const del = async (id: string) => {
    if (!confirm("Delete inquiry?")) return;
    try {
      await adminApi.remove("inquiries", id);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };
  return (
    <div className="border border-foreground/10 divide-y divide-foreground/5">
      {items.map((i) => (
        <div key={i.id} className="p-5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="font-medium">{i.name} <span className="text-foreground/50 text-xs ml-2">{i.email}</span></div>
              <div className="text-xs text-foreground/50">{new Date(i.created_at).toLocaleString()} · {i.subject || "General"}</div>
            </div>
            <button onClick={() => del(i.id)} className="p-2 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{i.message}</p>
          {i.phone && <p className="text-xs text-foreground/50 mt-2">Phone: {i.phone}</p>}
        </div>
      ))}
      {items.length === 0 && <p className="p-8 text-center text-foreground/50 text-sm">No inquiries yet</p>}
    </div>
  );
};

// ============ HERO IMAGES (carousel) ============
const HeroImagesAdmin = () => {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const bulkRef = useRef<HTMLInputElement>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const maxHeroImages = 6;

  const load = async () => {
    const data = await adminApi.list("hero_images", { orderBy: "sort_order" });
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing.image_url) { toast.error("Please upload an image"); return; }
    const payload: any = {
      image_url: editing.image_url,
      caption: editing.caption || null,
      sort_order: Number(editing.sort_order ?? 0),
    };
    try {
      if (editing.id) await adminApi.update("hero_images", editing.id, payload);
      else await adminApi.create("hero_images", payload);
      toast.success("Saved"); setEditing(null); load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this hero image?")) return;
    try {
      await adminApi.remove("hero_images", id);
      toast.success("Deleted"); load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  const uploadMany = async (files: FileList | null) => {
    const selected = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
    if (selected.length === 0) {
      toast.error("Please choose image files");
      return;
    }

    const remaining = maxHeroImages - items.length;
    if (remaining <= 0) {
      toast.error(`You can keep up to ${maxHeroImages} carousel images`);
      return;
    }

    const filesToUpload = selected.slice(0, remaining);
    if (selected.length > remaining) {
      toast.message(`Only ${remaining} more image${remaining === 1 ? "" : "s"} can be added`);
    }

    setBulkUploading(true);
    try {
      for (let index = 0; index < filesToUpload.length; index += 1) {
        const { url } = await adminApi.upload(filesToUpload[index]);
        await adminApi.create("hero_images", {
          image_url: url,
          caption: null,
          sort_order: items.length + index + 1,
        });
      }
      toast.success(`${filesToUpload.length} carousel image${filesToUpload.length === 1 ? "" : "s"} uploaded`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBulkUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <p className="text-xs text-foreground/60">
          Recommended: 5-6 images for the homepage carousel ({items.length} added)
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            ref={bulkRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              void uploadMany(e.target.files);
              e.currentTarget.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => bulkRef.current?.click()}
            disabled={bulkUploading || items.length >= maxHeroImages}
            className="inline-flex items-center gap-2 px-4 py-2 border border-foreground/15 text-[10px] uppercase tracking-[0.22em] hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
            <Upload className="h-3.5 w-3.5" /> {bulkUploading ? "Uploading..." : "Upload 5-6 Images"}
          </button>
          <button
            onClick={() => setEditing({ image_url: "", caption: "", sort_order: items.length + 1 })}
            disabled={items.length >= maxHeroImages}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-gradient text-primary-foreground text-[10px] uppercase tracking-[0.22em] disabled:opacity-50">
            <Plus className="h-3.5 w-3.5" /> New Hero Image
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((h) => (
          <div key={h.id} className="border border-foreground/10 group relative">
            <img src={imageSrc(h.image_url)} onError={imageFallback} className="aspect-[16/9] w-full object-cover" />
            <div className="p-3 text-xs">
              <div className="font-medium truncate">#{h.sort_order} {h.caption || "(no caption)"}</div>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(h)} className="p-1.5 bg-background/90 hover:text-primary"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => del(h.id)} className="p-1.5 bg-background/90 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-full p-8 text-center text-foreground/50 text-sm border border-foreground/10">No hero images yet</p>}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit Hero Image" : "New Hero Image"}>
          <form onSubmit={save} className="space-y-4">
            <ImageUploader label="Hero image" value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} />
            <Field label="Caption (optional)">
              <input className={inputCls} value={editing.caption || ""} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} />
            </Field>
            <Field label="Sort order">
              <input type="number" className={inputCls} value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
            </Field>
            <button className="w-full py-3 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.25em]">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ============ SITE SETTINGS ============
const SettingsAdmin = () => {
  const [form, setForm] = useState<{ map_latitude: string; map_longitude: string; map_zoom: string; owner_image_url: string }>({
    map_latitude: "", map_longitude: "", map_zoom: "15", owner_image_url: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .list("site_settings", { id: "main" })
      .then(([data]: any[]) => {
        if (data) {
          setForm({
            map_latitude: data.map_latitude?.toString() ?? "",
            map_longitude: data.map_longitude?.toString() ?? "",
            map_zoom: (data.map_zoom ?? 15).toString(),
            owner_image_url: data.owner_image_url ?? "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(form.map_latitude);
    const lng = parseFloat(form.map_longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error("Please enter valid latitude and longitude");
      return;
    }
    const payload = {
      id: "main",
      map_latitude: lat,
      map_longitude: lng,
      map_zoom: parseInt(form.map_zoom) || 15,
      owner_image_url: form.owner_image_url || null,
    };
    try {
      await adminApi.update("site_settings", "main", payload);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Settings save failed");
    }
  };

  if (loading) return <p className="text-sm text-foreground/50">Loading…</p>;

  const previewSrc = form.map_latitude && form.map_longitude
    ? `https://www.google.com/maps?q=${form.map_latitude},${form.map_longitude}&z=${form.map_zoom || 15}&output=embed`
    : null;

  return (
    <div className="max-w-2xl">
      <h3 className="font-serif text-2xl mb-2">Business Settings</h3>
      <p className="text-xs text-foreground/60 mb-6">
        Upload the small founder image for the About page and keep the Google Maps location updated.
      </p>
      <form onSubmit={save} className="space-y-4">
        <ImageUploader
          label="About page founder image"
          value={form.owner_image_url || null}
          onChange={(url) => setForm({ ...form, owner_image_url: url })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude">
            <input className={inputCls} placeholder="12.9716" value={form.map_latitude}
              onChange={(e) => setForm({ ...form, map_latitude: e.target.value })} />
          </Field>
          <Field label="Longitude">
            <input className={inputCls} placeholder="77.5946" value={form.map_longitude}
              onChange={(e) => setForm({ ...form, map_longitude: e.target.value })} />
          </Field>
        </div>
        <Field label="Zoom (1-20)">
          <input type="number" min={1} max={20} className={inputCls} value={form.map_zoom}
            onChange={(e) => setForm({ ...form, map_zoom: e.target.value })} />
        </Field>
        <button className="px-8 py-3 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.25em]">
          Save Settings
        </button>
      </form>

      {previewSrc && (
        <div className="mt-8">
          <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/60 mb-2">Preview</div>
          <div className="aspect-[16/10] border border-foreground/15">
            <iframe title="Map preview" src={previewSrc} className="w-full h-full" loading="lazy" />
          </div>
        </div>
      )}
    </div>
  );
};

// ============ Modal ============
const Modal = ({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) => (
  <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto" onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} className="bg-background border border-foreground/10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 my-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-2xl">{title}</h3>
        <button onClick={onClose} className="text-foreground/50 hover:text-foreground text-2xl leading-none">×</button>
      </div>
      {children}
    </div>
  </div>
);

export default Admin;
