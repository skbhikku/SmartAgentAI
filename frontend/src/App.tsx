import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Navigation } from './components/Layout/Navigation';
import { UserDashboard } from './components/Dashboard/UserDashboard';
import { AgentDashboard } from './components/Dashboard/AgentDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { TicketsPage } from './components/Pages/TicketsPage';
import { KnowledgeBasePage } from './components/Pages/KnowledgeBasePage';
import { UsersPage } from './components/Pages/UsersPage';
import { AnalyticsPage } from './components/Pages/AnalyticsPage';
import { SettingsPage } from './components/Pages/SettingsPage';
import { Home } from './components/Layout/Home';

function App() {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState<'home' | 'login' | 'register'>('home');
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 🔥 Not logged in → Show Home, Login, or Register
  if (!user) {
    if (authPage === 'home') {
      return (
        <Home 
          onSignIn={() => setAuthPage('login')}
          onSignUp={() => setAuthPage('register')}
        />
      );
    }
    if (authPage === 'login') {
      return <LoginForm onSwitchToRegister={() => setAuthPage('register')} />;
    }
    if (authPage === 'register') {
      return <RegisterForm onSwitchToLogin={() => setAuthPage('login')} />;
    }
  }

  // 🔥 Logged in → Show app pages
const renderPage = () => {
  switch (currentPage) {
    case 'dashboard':
      if (user?.role === 'user') return <UserDashboard />;
      if (user?.role === 'agent') return <AgentDashboard />;
      if (user?.role === 'admin') return <AdminDashboard />;
      return <UserDashboard />;

    case 'tickets':
      return <TicketsPage />;

    case 'knowledge-base':
      return <KnowledgeBasePage />;

    case 'users':
      return user?.role === 'admin' ? <UsersPage /> : <UserDashboard />;

    case 'analytics':
      return user?.role === 'admin' ? <AnalyticsPage /> : <UserDashboard />;

    case 'settings':
      return <SettingsPage />;

    default:
      return <UserDashboard />;
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={() => setCurrentPage('dashboard')}
      />
      <main className="flex-1 lg:ml-0">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
