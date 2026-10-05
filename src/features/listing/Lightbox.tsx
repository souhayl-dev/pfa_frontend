import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { resolveAssetUrl } from "../../shared/api/http";
import type { Photo } from "../../shared/api/types";

interface LightboxProps {
  photos: Photo[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
  title: string;
}

/** The photos full screen. Arrow keys, the on-screen arrows and a swipe all move through them. */
export function Lightbox({ photos, index, onChange, onClose, title }: LightboxProps) {
  const touchStart = useRef<number | null>(null);
  const previous = () => onChange((index - 1 + photos.length) % photos.length);
  const next = () => onChange((index + 1) % photos.length);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onChange((index - 1 + photos.length) % photos.length);
      if (event.key === "ArrowRight") onChange((index + 1) % photos.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, photos.length, onChange, onClose]);

  const arrow = "absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex animate-fade flex-col bg-ink-900/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Photos de ${title}`}
      onTouchStart={(event) => (touchStart.current = event.touches[0].clientX)}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const distance = event.changedTouches[0].clientX - touchStart.current;
        touchStart.current = null;
        if (Math.abs(distance) > 50) (distance > 0 ? previous : next)();
      }}
    >
      <header className="flex items-center justify-between px-4 py-3 text-white">
        <p className="text-sm font-semibold" aria-live="polite">
          {index + 1} / {photos.length}
        </p>
        <button onClick={onClose} aria-label="Fermer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/25">
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6" onClick={onClose}>
        <img
          key={photos[index].id}
          src={resolveAssetUrl(photos[index].url)}
          alt={`${title}, photo ${index + 1}`}
          className="max-h-full max-w-full animate-fade rounded-xl object-contain"
          onClick={(event) => event.stopPropagation()}
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={(event) => {
                event.stopPropagation();
                previous();
              }}
              aria-label="Photo précédente"
              className={`${arrow} left-3`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                next();
              }}
              aria-label="Photo suivante"
              className={`${arrow} right-3`}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
