import { useRef } from 'react';
import { getMediaUrl } from '@/utils/media';

const MAX_PHOTOS = 8;
const MAX_SIZE_MB = 5;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

interface TrackPhotosUploadProps {
  photoUrls: string[];
  pendingFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveUrl: (index: number) => void;
  onRemovePending: (index: number) => void;
  disabled?: boolean;
  error?: string;
}

export function TrackPhotosUpload({
  photoUrls,
  pendingFiles,
  onAddFiles,
  onRemoveUrl,
  onRemovePending,
  disabled = false,
  error,
}: TrackPhotosUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const total = photoUrls.length + pendingFiles.length;

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list?.length) return;

    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of Array.from(list)) {
      if (!ALLOWED.includes(file.type)) {
        errors.push(`${file.name}: invalid format`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`${file.name}: exceeds ${MAX_SIZE_MB} MB`);
        continue;
      }
      valid.push(file);
    }

    const slotsLeft = MAX_PHOTOS - total;
    if (valid.length > slotsLeft) {
      valid.splice(slotsLeft);
    }

    if (valid.length) onAddFiles(valid);
    e.target.value = '';
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-gray-200">Track photos</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Upload from your computer (JPG, PNG, WebP · max {MAX_SIZE_MB} MB each · up to {MAX_PHOTOS})
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {photoUrls.map((url, i) => (
          <PhotoThumb
            key={`url-${url}-${i}`}
            src={getMediaUrl(url) ?? url}
            label="Saved"
            onRemove={() => onRemoveUrl(i)}
            disabled={disabled}
          />
        ))}
        {pendingFiles.map((file, i) => (
          <PhotoThumb
            key={`pending-${file.name}-${i}`}
            src={URL.createObjectURL(file)}
            label="New"
            onRemove={() => onRemovePending(i)}
            disabled={disabled}
          />
        ))}
        {total < MAX_PHOTOS && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-600 hover:border-orange-500/60 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-orange-400 transition-colors disabled:opacity-50"
          >
            <span className="text-2xl">+</span>
            <span className="text-xs font-medium">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={handleFilesSelected}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

function PhotoThumb({
  src,
  label,
  onRemove,
  disabled,
}: {
  src: string;
  label: string;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
      <img src={src} alt="" className="w-full h-full object-cover" />
      <span className="absolute top-1 left-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/60 text-white">
        {label}
      </span>
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/90 text-white text-xs hover:bg-red-500"
          aria-label="Remove photo"
        >
          ×
        </button>
      )}
    </div>
  );
}
