
function Header({ user, isOnline, currentPage, onNavigate, onLogout }) {
  const getNavItems = () => {
    const items = [];
    
    if (user.role === 'marketing_rep') {
      items.push(
        { key: 'dsr', label: 'DSR Form', icon: '📝' },
        { key: 'visits', label: 'My Visits', icon: '📋' }
      );
    }
    
    if (user.role === 'admin') {
      items.push(
        { key: 'admin', label: 'Admin Dashboard', icon: '📊' },
        { key: 'visits', label: 'All Visits', icon: '📋' }
      );
    }
    
    return items;
  };

  return (
    <header className="bg-white shadow-sm border-b animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🏥 Hospital DSR System</h1>
              <div className={`ml-4 px-2 py-1 rounded-full text-xs text-white ${isOnline ? 'online-badge' : 'offline-badge'}`}>
                {isOnline ? '● Online' : '● Offline'}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {getNavItems().map(item => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.key 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-sm text-gray-600">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs capitalize">{user.role.replace('_', ' ')}</div>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 pt-2 pb-3">
          <div className="flex space-x-1 overflow-x-auto">
            {getNavItems().map(item => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.key 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
