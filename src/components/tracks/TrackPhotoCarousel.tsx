import { useMemo, useState } from 'react';
import { getMediaUrl } from '@/utils/media';

interface TrackPhotoCarouselProps {
  photos?: string[] | null;
  trackName: string;
}

export function TrackPhotoCarousel({ photos, trackName }: TrackPhotoCarouselProps) {
  const imageUrls = useMemo(
    () => (photos ?? []).map((photo) => getMediaUrl(photo)).filter(Boolean) as string[],
    [photos]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (imageUrls.length === 0) {
    return (
      <section className="flex aspect-[16/9] items-center justify-center rounded-lg border border-gray-700/80 bg-gray-900">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-300">No track photos yet</p>
          <p className="mt-1 text-xs text-gray-500">Photos uploaded by the company will appear here.</p>
        </div>
      </section>
    );
  }

  const activeIndex = Math.min(selectedIndex, imageUrls.length - 1);
  const activeImage = imageUrls[activeIndex];
  const hasMultipleImages = imageUrls.length > 1;

  function goToPrevious() {
    setSelectedIndex((current) => (current === 0 ? imageUrls.length - 1 : current - 1));
  }

  function goToNext() {
    setSelectedIndex((current) => (current === imageUrls.length - 1 ? 0 : current + 1));
  }

  return (
    <section className="overflow-hidden rounded-lg border border-gray-700/80 bg-gray-950">
      <div className="relative aspect-[16/9] bg-gray-900">
        <img
          src={activeImage}
          alt={`${trackName} photo ${activeIndex + 1}`}
          className="h-full w-full object-cover"
        />

        <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
          {activeIndex + 1} / {imageUrls.length}
        </div>

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-lg font-bold text-white transition hover:bg-black"
              aria-label="Previous photo"
            >
              {'<'}
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-lg font-bold text-white transition hover:bg-black"
              aria-label="Next photo"
            >
              {'>'}
            </button>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="flex gap-2 overflow-x-auto border-t border-gray-800 bg-gray-950 p-3">
          {imageUrls.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border transition ${
                activeIndex === index
                  ? 'border-orange-500 ring-2 ring-orange-500/30'
                  : 'border-gray-800 opacity-70 hover:opacity-100'
              }`}
              aria-label={`Show photo ${index + 1}`}
            >
              <img
                src={imageUrl}
                alt={`${trackName} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
