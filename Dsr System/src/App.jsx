
import { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import DSRForm from './components/DSRForm';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import MyVisits from './components/MyVisits';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, login, logout, isOnline } = useAuth();
  const [currentPage, setCurrentPage] = useState('dsr');

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('dsr');
  };

  const renderPage = () => {
    if (!user) {
      return <LoginForm onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'dsr':
        return <DSRForm user={user} isOnline={isOnline} />;
      case 'visits':
        return <MyVisits user={user} isOnline={isOnline} />;
      case 'admin':
        return user.role === 'admin' ? 
          <AdminDashboard user={user} isOnline={isOnline} /> :
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
              <p className="text-red-600">You do not have permission to access the admin dashboard.</p>
            </div>
          </div>;
      default:
        return <DSRForm user={user} isOnline={isOnline} />;
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {user && (
        <Header 
          user={user} 
          isOnline={isOnline}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />
      )}
      <main className="min-h-screen py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
