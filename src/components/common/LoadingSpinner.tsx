/**
 * Componente de spinner de carga
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: '16px',
    md: '32px',
    lg: '48px',
  };

  const spinnerSize = sizeClasses[size];

  return (
    <div
      style={{
        display: 'inline-block',
        width: spinnerSize,
        height: spinnerSize,
        border: '3px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '50%',
        borderTopColor: '#007bff',
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Componente para páginas de carga full-page
 */
export function PageLoader({ message }: { message?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '1rem',
      }}
    >
      <LoadingSpinner size="lg" />
      {message && (
        <p style={{ color: '#666', marginTop: '1rem' }}>{message}</p>
      )}
    </div>
  );
}
