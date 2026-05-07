import { useEffect, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { Quote, Star, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { publicApi } from "@/lib/api";
import { useAuth } from "@/context/useAuth";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type Review = {
  id: string;
  author_name: string;
  author_email?: string | null;
  author_role: string | null;
  avatar_url?: string | null;
  content: string;
  rating: number;
};

export const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [i, setI] = useState(0);
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadReviews = () => {
    publicApi
      .list<Review>("reviews", { featured: true, orderBy: "created_at", desc: true })
      .then((data) => {
        setReviews(data);
        setI(0);
      })
      .catch(() => undefined);
  };

  useEffect(() => { loadReviews(); }, []);

  useEffect(() => {
    if (reviews.length === 0) return;
    const t = setInterval(() => setI((v) => (v + 1) % reviews.length), 6000);
    return () => clearInterval(t);
  }, [reviews.length]);

  const uploadImage = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setUploading(true);
    try {
      const { url } = await publicApi.uploadReviewImage(file);
      setAvatarUrl(url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (content.trim().length < 10) {
      toast.error("Please write at least 10 characters");
      return;
    }
    setSubmitting(true);
    try {
      await publicApi.submitReview({ rating, content, avatar_url: avatarUrl });
      toast.success("Review submitted");
      setRating(5);
      setContent("");
      setAvatarUrl(null);
      loadReviews();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const r = reviews[i];
  const displayRating = Math.min(5, Math.max(1, Number(r?.rating) || 5));

  return (
    <section id="reviews" className="py-24 md:py-32 bg-dark-gradient text-secondary-foreground relative overflow-hidden">
      <Quote className="absolute top-20 left-10 h-40 w-40 text-primary/10" />
      <Quote className="absolute bottom-20 right-10 h-40 w-40 text-primary/10 rotate-180" />

      <div className="container relative">
        <SectionHeading eyebrow="Voices Of Our Clients" title="Words Etched In Stone" />

        <div className="mt-16 max-w-3xl mx-auto text-center min-h-[260px]">
          {r ? (
          <div key={r.id} className="animate-fade-in">
            <div className="flex justify-center gap-1 text-primary mb-8">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className={`h-4 w-4 ${k < displayRating ? "fill-current" : "text-primary/25"}`} />
              ))}
            </div>
            <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light text-white leading-relaxed italic">
              "{r.content}"
            </p>
            <div className="mt-10 flex flex-col items-center">
              <img src={r.avatar_url || "/placeholder.svg"} alt={r.author_name} className="h-16 w-16 rounded-full object-cover bg-white/10 border border-primary/30 mb-4" />
              <div className="font-serif text-xl text-gold-gradient">{r.author_name}</div>
              {r.author_email && <div className="text-[10px] uppercase tracking-[0.25em] text-secondary-foreground/45 mt-2">{r.author_email}</div>}
              {r.author_role && <div className="text-[10px] uppercase tracking-[0.3em] text-secondary-foreground/60 mt-2">{r.author_role}</div>}
            </div>
          </div>
          ) : (
            <p className="text-sm text-secondary-foreground/60">No customer reviews yet.</p>
          )}
        </div>

        {reviews.length > 1 && <div className="mt-12 flex items-center justify-center gap-6">
          <button onClick={() => setI((v) => (v - 1 + reviews.length) % reviews.length)}
            className="h-12 w-12 rounded-full border border-primary/40 text-primary hover:bg-gold-gradient hover:text-primary-foreground hover:border-transparent transition-all duration-500 inline-flex items-center justify-center" aria-label="Previous">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {reviews.map((_, k) => (
              <button key={k} onClick={() => setI(k)}
                className={`h-px transition-all duration-500 ${k === i ? "w-12 bg-gold-gradient" : "w-6 bg-secondary-foreground/30"}`} aria-label={`Go to review ${k + 1}`} />
            ))}
          </div>
          <button onClick={() => setI((v) => (v + 1) % reviews.length)}
            className="h-12 w-12 rounded-full border border-primary/40 text-primary hover:bg-gold-gradient hover:text-primary-foreground hover:border-transparent transition-all duration-500 inline-flex items-center justify-center" aria-label="Next">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>}

        <div className="mt-16 max-w-2xl mx-auto border border-primary/20 p-6 md:p-8 bg-black/20">
          {user ? (
            <form onSubmit={submitReview} className="space-y-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-primary">Customer Review</div>
                  <div className="text-xs text-secondary-foreground/60 mt-1">{user.email}</div>
                </div>
                <div className="flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <button key={k} type="button" onClick={() => setRating(k + 1)} aria-label={`${k + 1} star`}>
                      <Star className={`h-5 w-5 ${k < rating ? "fill-current" : "text-primary/30"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                className="w-full bg-transparent border border-primary/20 px-4 py-3 text-sm text-white placeholder:text-secondary-foreground/40 focus:border-primary outline-none resize-none"
                placeholder="Write your experience..."
              />
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 text-[10px] uppercase tracking-[0.22em] text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                  <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading..." : "Upload Image"}
                  <input type="file" accept="image/*" hidden onChange={(e) => void uploadImage(e.target.files?.[0])} />
                </label>
                {avatarUrl && <img src={avatarUrl} className="h-12 w-12 rounded-full object-cover border border-primary/30" />}
                <button disabled={submitting || uploading} className="px-6 py-3 bg-gold-gradient text-primary-foreground text-[10px] uppercase tracking-[0.25em] disabled:opacity-50">
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-primary">Customer Review</div>
                <p className="text-sm text-secondary-foreground/60 mt-2">Please login to add your 5-star review.</p>
              </div>
              <Link to="/login" className="px-6 py-3 bg-gold-gradient text-primary-foreground text-[10px] uppercase tracking-[0.25em]">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

