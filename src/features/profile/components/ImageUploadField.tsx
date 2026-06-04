import { useEffect, useRef, useState } from 'react';

interface ImageUploadFieldProps {
  label: string;
  currentUrl: string | null;
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  placeholder?: string;
  heightClassName?: string;
}

export function ImageUploadField({
  label,
  currentUrl,
  onFileSelect,
  accept = 'image/jpeg,image/png,image/webp',
  disabled = false,
  placeholder = 'Photo',
  heightClassName = 'h-48',
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);

  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelect(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Select ${label}`}
        className={[
          'group relative w-full overflow-hidden rounded-2xl border-2 border-dashed transition-colors duration-200',
          heightClassName,
          disabled
            ? 'cursor-not-allowed border-slate-300 opacity-60 dark:border-slate-700'
            : 'cursor-pointer border-slate-300 hover:border-orange-500 dark:border-slate-600',
        ].join(' ')}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') handleClick();
        }}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="h-full w-full object-cover" />
            {!disabled && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-slate-950/55 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  Update photo
                </span>
                <span className="text-sm font-medium text-white">Click to replace</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-500 transition-colors group-hover:text-orange-500 dark:bg-slate-900/50 dark:text-slate-400">
            <span className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {placeholder}
            </span>
            <span className="text-sm font-medium">Click to upload a photo</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">JPG, PNG, or WebP · Max 5 MB</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
