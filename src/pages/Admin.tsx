import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import {
  BadgeCheck,
  Bell,
  Database,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  Upload,
  Image as ImgIcon,
} from "lucide-react";

type Tab = "products" | "variants" | "categories" | "hero" | "reviews" | "inquiries" | "lead-agent" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "products", label: "Products" },
  { id: "variants", label: "Variants" },
  { id: "categories", label: "Categories" },
  { id: "hero", label: "Hero Images" },
  { id: "reviews", label: "Reviews" },
  { id: "inquiries", label: "Inquiries" },
  { id: "lead-agent", label: "Lead Agent" },
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
            <span className="text-[10px] uppercase tracking-[0.18em] text-primary sm:tracking-[0.3em]">Control Center</span>
            <h1 className="font-serif text-4xl md:text-5xl mt-2">Admin Panel</h1>
          </div>
          <Link to="/" className="text-xs uppercase tracking-[0.16em] text-foreground/60 hover:text-primary sm:tracking-[0.25em]">Back to site</Link>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-foreground/10 mb-8">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-3 text-[10px] uppercase tracking-[0.14em] border-b-2 -mb-px transition-colors sm:px-4 sm:text-[11px] sm:tracking-[0.22em] ${tab===t.id?"border-primary text-primary":"border-transparent text-foreground/60 hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "products" && <ProductsAdmin />}
        {tab === "variants" && <VariantsAdmin />}
        {tab === "categories" && <CategoriesAdmin />}
        {tab === "hero" && <HeroImagesAdmin />}
        {tab === "reviews" && <ReviewsAdmin />}
        {tab === "inquiries" && <InquiriesAdmin />}
        {tab === "lead-agent" && <LeadAgentAdmin />}
        {tab === "settings" && <SettingsAdmin />}
      </section>
      <Footer />
    </main>
  );
};

// ============ Reusable image uploader ============
const ImageUploader = ({ value, onChange, label = "Image" }: { value: string | null; onChange: (url: string) => void | Promise<void>; label?: string }) => {
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
      await onChange(url);
      toast.success("Uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.16em] text-foreground/60 mb-2 sm:tracking-[0.25em]">{label}</label>
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

const MultiImageUploader = ({
  values = [],
  onChange,
  onSetMain,
  label = "Gallery images",
}: {
  values?: string[];
  onChange: (urls: string[]) => void;
  onSetMain?: (url: string) => void;
  label?: string;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const cleanValues = cleanImageUrls(values);
  const [draftUrls, setDraftUrls] = useState<string[]>(cleanValues);
  const emptySlots = Math.max(5 - cleanValues.length, 1);

  useEffect(() => {
    setDraftUrls(cleanImageUrls(values));
  }, [values]);

  const commitDraftUrls = (nextDraft = draftUrls) => {
    onChange(cleanImageUrls(nextDraft));
  };

  const updateAt = (index: number, value: string) => {
    const next = draftUrls.map((url, itemIndex) => itemIndex === index ? value : url);
    setDraftUrls(next);
  };

  const removeAt = (index: number) => {
    const next = draftUrls.filter((_, itemIndex) => itemIndex !== index);
    setDraftUrls(next);
    onChange(cleanImageUrls(next));
  };

  const upload = async (files: FileList | null) => {
    const selected = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
    if (selected.length === 0) return;
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        const { url } = await adminApi.upload(file);
        uploaded.push(url);
      }
      onChange([...cleanValues, ...uploaded]);
      toast.success(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.16em] text-foreground/60 mb-2 sm:tracking-[0.25em]">{label}</label>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-foreground/50">
        <span>{cleanValues.length} additional image{cleanValues.length === 1 ? "" : "s"} saved in this color</span>
        {cleanValues.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="text-destructive hover:underline">
            Remove all
          </button>
        )}
      </div>
      <div className="space-y-3">
        {cleanValues.map((url, index) => (
          <div key={`${url}-${index}`} className="grid gap-3 border border-foreground/10 bg-muted/40 p-3 sm:grid-cols-[92px_1fr]">
            <div className="overflow-hidden bg-muted">
              <img src={imageSrc(url)} onError={imageFallback} className="aspect-square w-full object-cover" />
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/50">Image {index + 1}</span>
                {onSetMain && (
                  <button
                    type="button"
                    onClick={() => onSetMain(url)}
                    className="px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-primary hover:bg-primary/10"
                  >
                    Set main
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-destructive hover:bg-destructive/10"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
              <input
                value={draftUrls[index] ?? url}
                onChange={(event) => updateAt(index, event.target.value)}
                onBlur={() => commitDraftUrls()}
                className="w-full px-3 py-2 bg-background border border-foreground/10 text-xs"
                aria-label={`Edit additional image ${index + 1} URL`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {Array.from({ length: emptySlots }).map((_, index) => (
          <button
            key={`empty-${index}`}
            type="button"
            disabled={busy}
            onClick={() => ref.current?.click()}
            className="aspect-square border border-dashed border-primary/50 px-2 text-primary text-[10px] uppercase tracking-[0.12em] disabled:opacity-60"
          >
            {busy ? "Uploading" : `Add Image ${cleanValues.length + index + 1}`}
          </button>
        ))}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => void upload(e.target.files)} />
      <p className="mt-2 text-xs text-foreground/50">Main variant image stays separate. These additional color images show below the selected color on the detail page. Remove or upload, then press Save.</p>
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
const cleanImageUrls = (urls: unknown): string[] => {
  const list = Array.isArray(urls) ? urls : typeof urls === "string" ? urls.split(",") : [];
  return Array.from(new Set(list.map((url) => String(url || "").trim()).filter(Boolean)));
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
              <div className="text-xs text-foreground/50">{[p.categories?.name, p.featured ? "Featured" : null].filter(Boolean).join(" | ")}</div>
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
    setItems((data || []).map((variant: any) => ({ ...variant, image_urls: cleanImageUrls(variant.image_urls) })));
  }, [productId]);
  useEffect(() => { load(); }, [load]);

  const openVariant = async (variant: any) => {
    setEditing({ ...variant, image_urls: cleanImageUrls(variant.image_urls) });
    try {
      const [fresh] = await adminApi.list("product_variants", { id: variant.id });
      if (fresh) setEditing({ ...fresh, image_urls: cleanImageUrls((fresh as any).image_urls) });
    } catch {
      // Keep the already opened variant if a fresh read is unavailable.
    }
  };

  const currentEditingImageUrls = () =>
    cleanImageUrls(editing?.image_urls);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      product_id: productId,
      name: editing.name || "",
      color: editing.color || "",
      material: editing.material || "",
      image_url: editing.image_url || "",
      image_urls: currentEditingImageUrls(),
      sort_order: Number(editing.sort_order) || 0,
    };
    try {
      if (editing.id) await adminApi.update("product_variants", editing.id, payload);
      else await adminApi.create("product_variants", payload);
      toast.success("Saved"); setEditing(null); load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  };

  const updateVariantImages = async (next: any) => {
    const nextUrls = cleanImageUrls(next.image_urls);
    const normalized = { ...next, image_urls: nextUrls };
    setEditing(normalized);
    setItems((current) => current.map((item) => item.id === normalized.id ? normalized : item));
    if (!normalized.id) return;
    try {
      const saved = await adminApi.update("product_variants", normalized.id, {
        product_id: productId,
        name: normalized.name || "",
        color: normalized.color || "",
        material: normalized.material || "",
        image_url: normalized.image_url || "",
        image_urls: nextUrls,
        sort_order: Number(normalized.sort_order) || 0,
      });
      const savedVariant = { ...(saved as any), image_urls: cleanImageUrls((saved as any).image_urls) };
      setEditing(savedVariant);
      setItems((current) => current.map((item) => item.id === savedVariant.id ? savedVariant : item));
      if (nextUrls.length > 0 && savedVariant.image_urls.length === 0) {
        toast.error("Multiple images were not saved by the backend. Please redeploy the backend changes.");
        return;
      }
      toast.success("Variant images saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image update failed");
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
        <button onClick={() => setEditing({ name: "", image_url: "", image_urls: [], sort_order: items.length + 1 })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-gradient text-primary-foreground text-[10px] uppercase tracking-[0.22em]">
          <Plus className="h-3.5 w-3.5" /> New Variant
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((v) => (
          <div key={v.id} className="border border-foreground/10 group relative">
            <img src={imageSrc(v.image_url || v.image_urls?.[0])} onError={imageFallback} className="aspect-square w-full object-cover" />
            <div className="p-2 text-xs">
              <div className="truncate font-medium">{v.color || v.name}</div>
              <div className="text-foreground/50 truncate text-[10px]">
                {[v.material, v.image_urls?.length ? `${v.image_urls.length} photos` : null].filter(Boolean).join(" | ")}
              </div>
            </div>
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openVariant(v)} className="p-1.5 bg-background/90 hover:text-primary"><Pencil className="h-3 w-3" /></button>
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
            <Field label="Sort"><input type="number" className={inputCls} value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} /></Field>
            <ImageUploader
              label="Main variant image"
              value={editing.image_url}
              onChange={(url) => setEditing({ ...editing, image_url: url })}
            />
            <MultiImageUploader
              label="Additional images for this color"
              values={currentEditingImageUrls()}
              onChange={(urls) => void updateVariantImages({ ...editing, image_urls: cleanImageUrls(urls) })}
              onSetMain={(url) => void updateVariantImages({
                ...editing,
                image_url: url,
                image_urls: currentEditingImageUrls().filter((item) => item !== url),
              })}
            />
            <button className="w-full py-3 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.25em]">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ============ Generic CRUD list (for categories and reviews) ============
const CategoriesAdmin = () => <SimpleCrud
  table="categories" orderBy="sort_order"
  columns={[{ k: "name", label: "Name" }, { k: "slug", label: "Slug" }, { k: "sort_order", label: "Order", type: "number" }]}
  textareas={[{ k: "description", label: "Description" }]}
  imageField="image_url"
  display={(r) => <><img src={imageSrc(r.image_url)} onError={imageFallback} className="h-12 w-12 object-cover bg-muted" /><div className="flex-1"><div className="font-medium">{r.name}</div><div className="text-xs text-foreground/50">{r.slug}</div></div></>}
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

// ============ STONELEAD AI COMMAND CENTER ============
const productLabels = {
  PAVING_STONE: "Paving stones",
  COBBLESTONE: "Cobblestones",
  FLOOR_STONE: "Floor stones",
  GARDEN_STONE: "Garden stones",
  OUTDOOR_TILE: "Outdoor tiles/stones",
  COMMERCIAL_PROJECT: "Commercial projects",
} as const;

const customerTypeLabels = {
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
} as const;

const sourceLabels = {
  GOOGLE_MAPS: "Google Maps",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  WEBSITE: "Website",
  CSV_UPLOAD: "CSV upload",
  LOCAL_LISTING: "Local listing",
  CONTRACTOR_LIST: "Contractor list",
  MANUAL: "Manual",
} as const;

const statusLabels = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  QUOTATION_SENT: "Quotation Sent",
  CONVERTED: "Converted",
  REJECTED: "Rejected",
  OPTED_OUT: "Opted Out",
} as const;

const projectTypeLabels = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  BOTH: "Residential + commercial",
} as const;

const leadStates = ["Karnataka", "Maharashtra", "Tamil Nadu", "Telangana", "Kerala", "Delhi", "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal"];
const leadCitiesByState: Record<string, string[]> = {
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
  Maharashtra: ["Mumbai", "Pune", "Navi Mumbai", "Nagpur", "Nashik"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Hosur", "Salem"],
  Telangana: ["Hyderabad", "Warangal", "Karimnagar"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
  Delhi: ["New Delhi", "Delhi", "Dwarka"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Kota"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Ghaziabad", "Kanpur"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri"],
};

const leadName = (lead: any) => lead.companyName || lead.business_name || lead.name || "Untitled lead";
const leadProduct = (lead: any) => lead.productInterest || lead.product_interest || "PAVING_STONE";
const leadCustomer = (lead: any) => lead.customerType || lead.client_type || "OTHER";
const leadStatus = (lead: any) => lead.status || "NEW";
const leadLocation = (lead: any) => lead.location || [lead.city, lead.state].filter(Boolean).join(", ");

const LeadAgentAdmin = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [notice, setNotice] = useState("");
  const [agentResult, setAgentResult] = useState<any | null>(null);
  const [overlay, setOverlay] = useState("");
  const [collecting, setCollecting] = useState(false);
  const [leadTarget, setLeadTarget] = useState({
    state: "Karnataka",
    city: "Bengaluru",
    productInterest: "PAVING_STONE",
    customerType: "CONTRACTOR",
    quantity: 5,
    minScore: 75,
  });
  const [schedule, setSchedule] = useState<any>({
    enabled: false,
    time: "18:00",
    state: "Karnataka",
    city: "Bengaluru",
    productInterest: "PAVING_STONE",
    customerType: "CONTRACTOR",
    quantity: 5,
    minScore: 75,
  });
  const [savingSchedule, setSavingSchedule] = useState(false);
  const leadsRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const data = await adminApi.list("lead_agent_profiles", { orderBy: "created_at", desc: true });
    setLeads(data || []);
  };

  useEffect(() => {
    load();
    adminApi.getLeadAgentSchedule().then((data) => {
      if (data) setSchedule((current: any) => ({ ...current, ...data }));
    }).catch(() => undefined);
  }, []);

  const totals = summarizeLeads(leads);

  const updateLeadTarget = (patch: Partial<typeof leadTarget>) => {
    setLeadTarget((current) => {
      const next = { ...current, ...patch };
      if (patch.state) next.city = leadCitiesByState[patch.state]?.[0] || "";
      return next;
    });
  };

  const updateSchedule = (patch: any) => {
    setSchedule((current: any) => {
      const next = { ...current, ...patch };
      if (patch.state) next.city = leadCitiesByState[patch.state]?.[0] || "";
      return next;
    });
  };

  const selectedProductLabel = productLabels[leadTarget.productInterest as keyof typeof productLabels] || "stone products";

  const saveLead = async (payload: any) => {
    const cleanPayload = {
      ...payload,
      business_name: payload.business_name || payload.companyName || payload.name,
      name: payload.name || payload.contact_name || payload.business_name || payload.companyName,
      companyName: payload.companyName || payload.business_name,
      product_interest: payload.productInterest || payload.product_interest,
      client_type: payload.customerType || payload.client_type,
      location: payload.location || [payload.city, payload.state].filter(Boolean).join(", "),
      next_follow_up: payload.nextFollowUpAt || payload.next_follow_up,
      score: Number(payload.score || 0),
      quotationAmount: Number(payload.quotationAmount || 0),
    };

    if (!cleanPayload.business_name) throw new Error("Lead or company name is required");
    if (cleanPayload.id) await adminApi.update("lead_agent_profiles", cleanPayload.id, cleanPayload);
    else await adminApi.create("lead_agent_profiles", cleanPayload);
  };

  const handleSaveLead = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await saveLead(editing);
      toast.success("Lead saved");
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  };

  const deleteLead = async (lead: any) => {
    if (!confirm(`Delete this lead?\n\n${leadName(lead)}`)) return;
    try {
      await adminApi.remove("lead_agent_profiles", lead.id);
      toast.success("Lead deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  const collectLeads = async ({
    goal,
    productInterest,
    customerType,
    quantity,
    minScore,
    city = "Bengaluru",
    state = "Karnataka",
  }: {
    goal: string;
    productInterest: string;
    customerType: string;
    quantity: number;
    minScore: number;
    city?: string;
    state?: string;
  }) => {
    if (collecting) return;

    setNotice("AI Agent running...");
    setAgentResult(null);
    setCollecting(true);
    setOverlay("One-click lead workflow cholche: target read, Google Maps search, AI score, CRM save.");
    try {
      const [result] = await Promise.all([
        adminApi.runLeadAgent({
          goal,
          city,
          state,
          productInterest,
          customerType,
          quantity,
          minScore,
          notifyWhatsApp: true,
        }),
        wait(5000),
      ]);
      setAgentResult(result);
      await load();
      setNotice(`AI Agent done: ${result.importedCount} leads imported, ${result.hotCount} high-fit leads found.`);
      toast.success(`${result.importedCount} lead imported`);
      window.setTimeout(() => leadsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI Agent failed";
      setNotice(message);
      toast.error(message);
    } finally {
      setOverlay("");
      setCollecting(false);
    }
  };

  const saveSchedule = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingSchedule(true);
    try {
      const saved = await adminApi.saveLeadAgentSchedule(schedule);
      setSchedule(saved);
      toast.success(saved.enabled ? "Daily evening lead agent enabled" : "Daily lead agent saved as paused");
      setNotice(saved.enabled ? `Daily schedule saved: ${saved.city}, ${saved.state} at ${saved.time}.` : "Daily schedule saved but paused.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Schedule save failed");
    } finally {
      setSavingSchedule(false);
    }
  };

  return (
    <div className="space-y-5">
      {overlay && <LeadFindingOverlay message={overlay} />}

      <section className="overflow-hidden border border-foreground/10 bg-muted/20">
        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="mb-3 inline-flex border border-primary/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">StoneLead AI</p>
            <h2 className="font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">Lead Command Center</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/65">
              Select area, product and client count. The agent will collect public leads, score them, save them in CRM and prepare a WhatsApp report.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <LeadField label="State">
                <select className={inputCls} value={leadTarget.state} onChange={(event) => updateLeadTarget({ state: event.target.value })}>
                  {leadStates.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
              </LeadField>
              <LeadField label="City / Area">
                <select className={inputCls} value={leadTarget.city} onChange={(event) => updateLeadTarget({ city: event.target.value })}>
                  {(leadCitiesByState[leadTarget.state] || []).map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </LeadField>
              <LeadField label="Product">
                <select className={inputCls} value={leadTarget.productInterest} onChange={(event) => updateLeadTarget({ productInterest: event.target.value })}>
                  {Object.entries(productLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </LeadField>
              <LeadField label="Client type">
                <select className={inputCls} value={leadTarget.customerType} onChange={(event) => updateLeadTarget({ customerType: event.target.value })}>
                  {Object.entries(customerTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </LeadField>
              <LeadField label="How many clients">
                <select className={inputCls} value={leadTarget.quantity} onChange={(event) => updateLeadTarget({ quantity: Number(event.target.value) })}>
                  {[3, 5, 8, 10, 15, 20].map((count) => <option key={count} value={count}>{count} clients</option>)}
                </select>
              </LeadField>
              <LeadField label="Minimum score">
                <select className={inputCls} value={leadTarget.minScore} onChange={(event) => updateLeadTarget({ minScore: Number(event.target.value) })}>
                  {[60, 70, 75, 80, 90].map((score) => <option key={score} value={score}>{score}+</option>)}
                </select>
              </LeadField>
            </div>
            <button
              type="button"
              disabled={collecting}
              onClick={() => collectLeads({
                goal: `Find real ${selectedProductLabel} buyers from ${customerTypeLabels[leadTarget.customerType as keyof typeof customerTypeLabels]} in ${leadTarget.city}, ${leadTarget.state}`,
                ...leadTarget,
              })}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-gold-gradient px-5 py-3 text-xs uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-60 sm:w-auto sm:tracking-[0.18em]"
            >
              <Sparkles size={17} /> {collecting ? "Collecting Clients..." : `Collect ${leadTarget.quantity} Leads Now`}
            </button>
          </div>
          <form onSubmit={saveSchedule} className="border border-foreground/10 bg-background/80 p-4">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Daily Evening Agent</p>
              <h3 className="mt-1 font-serif text-2xl">Morning select, evening report</h3>
              <p className="mt-2 text-sm leading-6 text-foreground/60">
                Save this target in the morning. When the server is running, the agent will collect leads at the selected India time and send the report to WhatsApp.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <LeadField label="Enable daily run">
                <select className={inputCls} value={schedule.enabled ? "yes" : "no"} onChange={(event) => updateSchedule({ enabled: event.target.value === "yes" })}>
                  <option value="yes">Active</option>
                  <option value="no">Paused</option>
                </select>
              </LeadField>
              <LeadField label="Evening time">
                <input type="time" className={inputCls} value={schedule.time || "18:00"} onChange={(event) => updateSchedule({ time: event.target.value })} />
              </LeadField>
              <LeadField label="State">
                <select className={inputCls} value={schedule.state || "Karnataka"} onChange={(event) => updateSchedule({ state: event.target.value })}>
                  {leadStates.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
              </LeadField>
              <LeadField label="City / Area">
                <select className={inputCls} value={schedule.city || "Bengaluru"} onChange={(event) => updateSchedule({ city: event.target.value })}>
                  {(leadCitiesByState[schedule.state || "Karnataka"] || []).map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </LeadField>
              <LeadField label="Product">
                <select className={inputCls} value={schedule.productInterest || "PAVING_STONE"} onChange={(event) => updateSchedule({ productInterest: event.target.value })}>
                  {Object.entries(productLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </LeadField>
              <LeadField label="Clients">
                <select className={inputCls} value={schedule.quantity || 5} onChange={(event) => updateSchedule({ quantity: Number(event.target.value) })}>
                  {[3, 5, 8, 10, 15, 20].map((count) => <option key={count} value={count}>{count} clients</option>)}
                </select>
              </LeadField>
            </div>
            <button disabled={savingSchedule} className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-primary/40 px-5 py-3 text-xs uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/10 disabled:opacity-60">
              {savingSchedule ? "Saving..." : "Save Daily Lead Plan"}
            </button>
          </form>
        </div>
      </section>

      {notice && <div className="border border-primary/20 bg-primary/5 p-3 text-sm font-medium text-foreground/75">{notice}</div>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric title="Total leads" value={totals.total} icon={<Database size={18} />} />
        <Metric title="Hot leads" value={totals.hot} icon={<Sparkles size={18} />} />
        <Metric title="Follow-ups" value={totals.pendingFollowUps} icon={<Bell size={18} />} />
        <Metric title="Converted" value={totals.converted} icon={<BadgeCheck size={18} />} />
        <Metric title="Revenue estimate" value={`Rs ${totals.revenue.toLocaleString("en-IN")}`} icon={<Target size={18} />} />
      </section>

      {agentResult && (
        <section className="border border-foreground/10 bg-background p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Agent output</p>
          <div className="mt-4 grid gap-3">
            <textarea className={inputCls + " min-h-32"} value={agentResult.ownerMessage} readOnly />
            <a className="inline-flex w-full justify-center border border-foreground/15 px-4 py-3 text-xs uppercase tracking-[0.16em] hover:border-primary hover:text-primary sm:w-fit" href={agentResult.waUrl} target="_blank" rel="noreferrer">
              Open WhatsApp alert
            </a>
          </div>
        </section>
      )}

      <div ref={leadsRef}>
        <LeadTable leads={leads} onEdit={setEditing} onDelete={deleteLead} />
      </div>

      {editing?.id && <LeadEditModal editing={editing} setEditing={setEditing} onSubmit={handleSaveLead} />}
    </div>
  );
};

const LeadEditModal = ({ editing, setEditing, onSubmit }: { editing: any; setEditing: (value: any) => void; onSubmit: (event: React.FormEvent) => void }) => (
  <div className="fixed inset-0 z-[115] grid place-items-end bg-black/40 px-3 py-4 backdrop-blur-sm sm:place-items-center">
    <form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-foreground/10 bg-background p-4 shadow-2xl sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <SectionTitle icon={<Pencil size={20} />} title="Edit Client" subtitle="Update CRM details and follow-up status." />
        <button type="button" onClick={() => setEditing(null)} className="border border-foreground/15 px-3 py-2 text-xs uppercase tracking-[0.14em]">Close</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <LeadField label="Lead name"><input required className={inputCls} value={editing?.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value, business_name: e.target.value })} /></LeadField>
      <LeadField label="Company"><input className={inputCls} value={editing?.companyName || editing?.business_name || ""} onChange={(e) => setEditing({ ...editing, companyName: e.target.value, business_name: e.target.value })} /></LeadField>
      <LeadField label="Phone"><input className={inputCls} value={editing?.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></LeadField>
      <LeadField label="Email"><input type="email" className={inputCls} value={editing?.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></LeadField>
      <LeadField label="Location"><input className={inputCls} value={editing?.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></LeadField>
      <LeadField label="Source"><select className={inputCls} value={editing?.source || "MANUAL"} onChange={(e) => setEditing({ ...editing, source: e.target.value })}>{Object.entries(sourceLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></LeadField>
      <LeadField label="Interest"><select className={inputCls} value={leadProduct(editing || {})} onChange={(e) => setEditing({ ...editing, productInterest: e.target.value, product_interest: e.target.value })}>{Object.entries(productLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></LeadField>
      <LeadField label="Customer"><select className={inputCls} value={leadCustomer(editing || {})} onChange={(e) => setEditing({ ...editing, customerType: e.target.value, client_type: e.target.value })}>{Object.entries(customerTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></LeadField>
      <LeadField label="Project"><select className={inputCls} value={editing?.projectType || "BOTH"} onChange={(e) => setEditing({ ...editing, projectType: e.target.value })}>{Object.entries(projectTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></LeadField>
      <LeadField label="Score"><input type="number" min={0} max={100} className={inputCls} value={editing?.score ?? 0} onChange={(e) => setEditing({ ...editing, score: e.target.value })} /></LeadField>
      <LeadField label="Status"><select className={inputCls} value={leadStatus(editing || {})} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></LeadField>
      <LeadField label="Quotation"><input type="number" className={inputCls} value={editing?.quotationAmount ?? 0} onChange={(e) => setEditing({ ...editing, quotationAmount: e.target.value })} /></LeadField>
      <LeadField label="Follow-up"><input type="date" className={inputCls} value={editing?.nextFollowUpAt || editing?.next_follow_up || ""} onChange={(e) => setEditing({ ...editing, nextFollowUpAt: e.target.value, next_follow_up: e.target.value })} /></LeadField>
      <LeadField label="Notes" wide><textarea rows={3} className={inputCls} value={editing?.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></LeadField>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => setEditing(null)} className="border border-foreground/15 px-5 py-3 text-xs uppercase tracking-[0.18em]">Cancel</button>
        <button className="bg-gold-gradient px-5 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground">Update Client</button>
      </div>
    </form>
  </div>
);

const LeadTable = ({ leads, onEdit, onDelete }: { leads: any[]; onEdit: (lead: any) => void; onDelete: (lead: any) => void }) => (
  <section className="overflow-hidden border border-foreground/10">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 p-5">
      <SectionTitle icon={<Search size={20} />} title="CRM Leads" subtitle="Score, status, source, contact and follow-up." />
    </div>
    <div className="grid gap-3 p-3 md:hidden">
      {leads.map((lead) => (
        <div key={lead.id} className="border border-foreground/10 bg-muted/15 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{leadName(lead)}</p>
              <p className="mt-1 text-sm text-foreground/55">{leadLocation(lead) || "Location not set"}</p>
            </div>
            <Score score={Number(lead.score || 0)} />
          </div>
          <div className="mt-3 grid gap-2 text-sm text-foreground/65">
            <p><span className="font-semibold text-foreground">Interest:</span> {productLabels[leadProduct(lead) as keyof typeof productLabels] || leadProduct(lead)}</p>
            <p><span className="font-semibold text-foreground">Source:</span> {sourceLabels[lead.source as keyof typeof sourceLabels] || lead.source || "-"}</p>
            <p><span className="font-semibold text-foreground">Status:</span> {statusLabels[leadStatus(lead) as keyof typeof statusLabels] || leadStatus(lead)}</p>
            <p><span className="font-semibold text-foreground">Follow-up:</span> {formatLeadDate(lead.nextFollowUpAt || lead.next_follow_up)}</p>
          </div>
          <div className="mt-3">
            <ContactActions lead={lead} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="inline-flex items-center justify-center gap-2 border border-foreground/15 px-3 py-2 text-xs uppercase tracking-[0.12em] hover:border-primary hover:text-primary" type="button" onClick={() => onEdit(lead)}><Pencil size={14} /> Edit</button>
            <button className="inline-flex items-center justify-center gap-2 border border-red-200 bg-red-50 px-3 py-2 text-xs uppercase tracking-[0.12em] text-red-700 hover:bg-red-100" type="button" onClick={() => onDelete(lead)}><Trash2 size={14} /> Delete</button>
          </div>
        </div>
      ))}
      {leads.length === 0 && <p className="p-6 text-center text-sm text-foreground/50">No leads saved yet.</p>}
    </div>
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-primary/10 text-xs uppercase text-primary">
          <tr>
            <th className="p-3">Lead</th>
            <th className="p-3">Contact</th>
            <th className="p-3">Source</th>
            <th className="p-3">Interest</th>
            <th className="p-3">Score</th>
            <th className="p-3">Status</th>
            <th className="p-3">Quotation</th>
            <th className="p-3">Follow-up</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-t border-foreground/10">
              <td className="p-3"><p className="font-semibold">{leadName(lead)}</p><p className="text-foreground/50">{leadLocation(lead)}</p></td>
              <td className="p-3"><ContactActions lead={lead} /></td>
              <td className="p-3">{sourceLabels[lead.source as keyof typeof sourceLabels] || lead.source || "-"}</td>
              <td className="p-3">{productLabels[leadProduct(lead) as keyof typeof productLabels] || leadProduct(lead)}</td>
              <td className="p-3"><Score score={Number(lead.score || 0)} /></td>
              <td className="p-3">{statusLabels[leadStatus(lead) as keyof typeof statusLabels] || leadStatus(lead)}</td>
              <td className="p-3">Rs {Number(lead.quotationAmount || 0).toLocaleString("en-IN")}</td>
              <td className="p-3">{formatLeadDate(lead.nextFollowUpAt || lead.next_follow_up)}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button className="border border-foreground/15 px-3 py-2 text-xs hover:border-primary hover:text-primary" type="button" onClick={() => onEdit(lead)}><Pencil size={14} /></button>
                  <button className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 hover:bg-red-100" type="button" onClick={() => onDelete(lead)}><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
          {leads.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-foreground/50">No leads saved yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </section>
);

const Metric = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <div className="border border-foreground/10 bg-muted/20 p-4">
    <div className="mb-3 flex items-center justify-between"><p className="text-sm font-medium text-foreground/60">{title}</p><span className="text-primary">{icon}</span></div>
    <p className="text-2xl font-bold sm:text-3xl">{value}</p>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="border border-foreground/10 bg-muted/20 p-3">
    <p className="text-xs font-bold uppercase tracking-[0.12em] text-foreground/55">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
  </div>
);

const LeadField = ({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) => (
  <label className={`grid gap-1 text-sm font-medium text-foreground ${wide ? "md:col-span-2 lg:col-span-4" : ""}`}>{label}{children}</label>
);

const SectionTitle = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) => (
  <div>
    <div className="flex items-center gap-2"><span className="text-primary">{icon}</span><h2 className="font-serif text-xl">{title}</h2></div>
    {subtitle && <p className="mt-1 text-sm text-foreground/55">{subtitle}</p>}
  </div>
);

const Score = ({ score }: { score: number }) => (
  <span className="inline-flex rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">{score}</span>
);

const LeadFindingOverlay = ({ message }: { message: string }) => (
  <div className="fixed inset-0 z-[120] grid place-items-center bg-black/45 px-4 backdrop-blur-sm">
    <div className="w-full max-w-5xl overflow-hidden border border-primary/30 bg-background shadow-2xl">
      <div className="border-b border-foreground/10 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Workflow Running</p>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl">Collecting real client details...</h2>
            <p className="mt-1 text-sm font-medium text-foreground/60">{message}</p>
          </div>
          <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Live Agent
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden bg-muted/20 p-5 sm:p-6">
        <div className="lead-workflow-track hidden sm:block" />
        <div className="lead-workflow-runner hidden sm:block" />
        <div className="relative grid gap-4 sm:grid-cols-4">
          {[
            ["Target", "Product + city", "Reading selected product, area and client type."],
            ["Google Maps", "Public listing", "Finding matching public business listings."],
            ["AI Score", "Fit + priority", "Checking relevance, duplicates and priority."],
            ["CRM Save", "Ready to edit", "Saving clients and preparing WhatsApp report."],
          ].map(([title, sub], index) => (
            <div key={title} className="lead-workflow-step relative border border-foreground/10 bg-background p-4 text-center shadow-sm">
              <span className="lead-step-node mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                <span className="lead-step-number">{index + 1}</span>
                <span className="lead-step-check">✓</span>
              </span>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs text-foreground/50">{sub}</p>
              <p className="mt-3 text-xs leading-5 text-foreground/55">{index === 0 ? "Reading selected product, area and client type." : index === 1 ? "Finding matching public business listings." : index === 2 ? "Checking relevance, duplicates and priority." : "Saving clients and preparing WhatsApp report."}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 border border-foreground/10 bg-background/70 p-4">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary shadow-[0_0_14px_hsl(var(--primary))]" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Automation log</p>
          </div>
          <div className="mt-3 grid gap-2 text-xs text-foreground/60 sm:grid-cols-2">
            <p className="animate-pulse">Reading selected product and location...</p>
            <p className="animate-pulse [animation-delay:0.5s]">Fetching public business listings...</p>
            <p className="animate-pulse [animation-delay:1s]">Checking duplicate clients...</p>
            <p className="animate-pulse [animation-delay:1.5s]">Saving client details below...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ContactActions = ({ lead }: { lead: any }) => {
  const phone = cleanLeadPhone(lead.whatsapp || lead.phone);
  const email = String(lead.email || "").trim();
  return (
    <div className="flex flex-wrap gap-2">
      {phone ? <><a className="border border-foreground/15 px-2 py-1 text-xs hover:border-primary hover:text-primary" href={`tel:${phone}`}>Call</a><a className="border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-800" href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a></> : <span className="text-xs text-foreground/45">No phone</span>}
      {email ? <a className="border border-foreground/15 px-2 py-1 text-xs hover:border-primary hover:text-primary" href={`mailto:${email}`}>Mail</a> : null}
    </div>
  );
};

const cleanLeadPhone = (phone?: string | null) => {
  if (!phone) return "";
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length === 10 ? `+91${digits}` : trimmed;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const formatLeadDate = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-IN") : "Not set";

const summarizeLeads = (leads: any[]) => ({
  total: leads.length,
  hot: leads.filter((lead) => Number(lead.score || 0) >= 75).length,
  pendingFollowUps: leads.filter((lead) => !["CONVERTED", "REJECTED", "OPTED_OUT"].includes(leadStatus(lead))).length,
  converted: leads.filter((lead) => leadStatus(lead) === "CONVERTED").length,
  revenue: leads.reduce((sum, lead) => sum + Number(lead.quotationAmount || 0), 0),
  bySource: Object.entries(leads.reduce<Record<string, number>>((acc, lead) => {
    const key = lead.source || "MANUAL";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})),
  byProduct: Object.entries(leads.reduce<Record<string, number>>((acc, lead) => {
    const key = leadProduct(lead);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})),
});

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

  const settingsPayload = (nextForm = form) => {
    const lat = nextForm.map_latitude.trim() ? parseFloat(nextForm.map_latitude) : null;
    const lng = nextForm.map_longitude.trim() ? parseFloat(nextForm.map_longitude) : null;

    if ((nextForm.map_latitude.trim() && Number.isNaN(lat)) || (nextForm.map_longitude.trim() && Number.isNaN(lng))) {
      throw new Error("Please enter valid latitude and longitude");
    }

    return {
      id: "main",
      map_latitude: lat,
      map_longitude: lng,
      map_zoom: parseInt(nextForm.map_zoom) || 15,
      owner_image_url: nextForm.owner_image_url || null,
    };
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.update("site_settings", "main", settingsPayload());
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Settings save failed");
    }
  };

  const saveOwnerImage = async (url: string) => {
    const nextForm = { ...form, owner_image_url: url };
    setForm(nextForm);
    await adminApi.update("site_settings", "main", settingsPayload(nextForm));
    toast.success("About page image saved");
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
          onChange={saveOwnerImage}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <button className="w-full px-5 py-3 bg-gold-gradient text-primary-foreground text-xs uppercase tracking-[0.16em] sm:w-auto sm:px-8 sm:tracking-[0.25em]">
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
