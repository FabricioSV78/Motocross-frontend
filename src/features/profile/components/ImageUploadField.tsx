import { useRef, useState, useEffect } from 'react';

interface ImageUploadFieldProps {
  label: string;
  currentUrl: string | null;
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Campo de upload de imagen con preview
 * Permite seleccionar un archivo de imagen y muestra un preview inmediato
 */
export function ImageUploadField({
  label,
  currentUrl,
  onFileSelect,
  accept = 'image/jpeg,image/png,image/webp',
  disabled = false,
  placeholder = '📷',
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);

  // Sync preview when the external URL changes (e.g. after a save)
  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelect(file);

    // Reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Seleccionar ${label}`}
        className={`
          relative w-full h-48 rounded-xl overflow-hidden border-2 border-dashed
          transition-colors duration-200 cursor-pointer group
          ${disabled
            ? 'border-gray-700 cursor-not-allowed opacity-60'
            : 'border-gray-600 hover:border-orange-500'}
        `}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <span className="text-white text-2xl">📷</span>
                <span className="text-white text-sm font-medium">Cambiar foto</span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-orange-400 transition-colors bg-gray-900/50">
            <span className="text-5xl">{placeholder}</span>
            <span className="text-sm font-medium">Click para subir foto</span>
            <span className="text-xs text-gray-600">JPG, PNG o WebP · máx. 5 MB</span>
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
