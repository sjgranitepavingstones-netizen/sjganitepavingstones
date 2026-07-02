import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type ProductCarouselFrame = {
  image: string;
  title: string;
  subtitle?: string | null;
};

type ProductImageCarouselProps = {
  frames: ProductCarouselFrame[];
  alt: string;
  className?: string;
  imageClassName?: string;
  overlayClassName?: string;
  selectedImage?: string;
  intervalMs?: number;
  detailsMs?: number;
  showControls?: boolean;
  onFrameChange?: (frame: ProductCarouselFrame, index: number) => void;
  onFrameSelect?: (frame: ProductCarouselFrame, index: number) => void;
};

export const ProductImageCarousel = ({
  frames,
  alt,
  className = "",
  imageClassName = "",
  overlayClassName = "",
  selectedImage,
  intervalMs = 2500,
  detailsMs = 500,
  showControls = true,
  onFrameChange,
  onFrameSelect,
}: ProductImageCarouselProps) => {
  const cleanFrames = useMemo(
    () => frames.filter((frame) => frame.image),
    [frames]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const activeFrame = useMemo(
    () => cleanFrames[activeIndex] || cleanFrames[0] || {
      image: "/placeholder.svg",
      title: "Product image",
      subtitle: null,
    },
    [activeIndex, cleanFrames]
  );

  useEffect(() => {
    if (!selectedImage) return;
    const selectedIndex = cleanFrames.findIndex((frame) => frame.image === selectedImage);
    if (selectedIndex >= 0) setActiveIndex(selectedIndex);
  }, [cleanFrames, selectedImage]);

  useEffect(() => {
    if (activeIndex >= cleanFrames.length) setActiveIndex(0);
  }, [activeIndex, cleanFrames.length]);

  useEffect(() => {
    onFrameChange?.(activeFrame, activeIndex);
  }, [activeFrame, activeIndex, onFrameChange]);

  useEffect(() => {
    setShowDetails(true);
    const hideTimer = window.setTimeout(() => setShowDetails(false), detailsMs);
    return () => window.clearTimeout(hideTimer);
  }, [activeIndex, detailsMs]);

  useEffect(() => {
    if (cleanFrames.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % cleanFrames.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [cleanFrames.length, intervalMs]);

  const selectFrame = (index: number) => {
    const nextFrame = cleanFrames[index];
    if (!nextFrame) return;
    setActiveIndex(index);
    setShowDetails(true);
    onFrameSelect?.(nextFrame, index);
  };

  const moveFrame = (direction: -1 | 1) => {
    if (cleanFrames.length <= 1) return;
    const nextIndex = (activeIndex + direction + cleanFrames.length) % cleanFrames.length;
    selectFrame(nextIndex);
  };

  const displayFrames = cleanFrames.length ? cleanFrames : [activeFrame];

  return (
    <div className={`group/carousel relative overflow-hidden bg-secondary ${className}`}>
      {displayFrames.map((frame, index) => (
        <img
          key={`${frame.image}-${index}`}
          src={frame.image}
          alt={alt}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] [transition-duration:2500ms] ease-in-out group-hover/carousel:scale-105 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          } ${imageClassName}`}
        />
      ))}
      <div className="absolute inset-0 border border-transparent transition-colors duration-500 group-hover/carousel:border-primary/70" />
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-5 pt-20 transition-all duration-300 group-hover/carousel:translate-y-0 group-hover/carousel:opacity-100 ${
          showDetails ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        } ${overlayClassName}`}
      >
        <div className="text-[10px] uppercase tracking-[0.18em] text-primary">
          {activeFrame.subtitle || "View details"}
        </div>
        <div className="mt-1 font-serif text-lg leading-tight text-white">
          {activeFrame.title}
        </div>
      </div>
      {showControls && cleanFrames.length > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              moveFrame(-1);
            }}
            className="absolute left-3 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/20 text-white/75 backdrop-blur-sm shadow-sm transition-all hover:border-primary/45 hover:bg-black/35 hover:text-white sm:h-10 sm:w-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              moveFrame(1);
            }}
            className="absolute right-3 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/20 text-white/75 backdrop-blur-sm shadow-sm transition-all hover:border-primary/45 hover:bg-black/35 hover:text-white sm:h-10 sm:w-10"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
};
