import { AuthProvider } from './presentation/components';
import { useAuth } from './presentation/hooks';
import AuthPage from './presentation/pages/AuthPage.tsx';
import DashboardPage from './presentation/pages/DashboardPage.tsx';

/**
 * Main App Component
 * Following Single Responsibility Principle
 */
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return user ? <DashboardPage /> : <AuthPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
