import { useEffect } from 'react';

interface InlineToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  visible: boolean;
}

export function InlineToast({ message, type = 'info', onClose, visible }: InlineToastProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose && onClose(), 3000);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  if (!visible) return null;

  const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className={`fixed top-6 right-6 z-50 ${bg} text-white px-4 py-3 rounded shadow-lg`} role="status">
      <div className="flex items-center gap-3">
        <div className="font-medium">{message}</div>
        <button onClick={onClose} aria-label="Cerrar" className="text-white/80 hover:text-white">✕</button>
      </div>
    </div>
  );
}

export default InlineToast;
