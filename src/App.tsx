import { AppProviders } from '@/providers/AppProviders';
import { AppRouter } from '@/router/AppRouter';
import { ErrorBoundary } from '@/components/common';

/**
 * Componente raíz de la aplicación
 * 
 * Estructura:
 * - ErrorBoundary: Captura errores globales
 * - AppProviders: Agrupa todos los providers (React Query, Auth, etc.)
 * - AppRouter: Configuración de rutas
 */
function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
