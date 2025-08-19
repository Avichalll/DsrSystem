import { useEffect, useState } from 'react';
import apiService from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('dsr_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing saved user:', error);
      return null;
    }
  });
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const login = async (credentials) => {
    try {
      // Try API login first
      const response = await apiService.login(credentials);
      const userSession = response.user;
      
      setUser(userSession);
      localStorage.setItem('dsr_user', JSON.stringify(userSession));
      localStorage.setItem('auth_token', response.token);
      
      return userSession;
    } catch (error) {
      console.warn('API login failed, trying local authentication:', error);
      
      // Fallback to local authentication
      const mockUsers = [
        { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
        { id: 2, username: 'rep1', password: 'rep123', role: 'marketing_rep', name: 'Marketing Rep 1' },
        { id: 3, username: 'rep2', password: 'rep456', role: 'marketing_rep', name: 'Marketing Rep 2' }
      ];
      
      const foundUser = mockUsers.find(u => 
        u.username === credentials.username && u.password === credentials.password
      );
      
      if (foundUser) {
        const userSession = { 
          id: foundUser.id, 
          username: foundUser.username, 
          role: foundUser.role, 
          name: foundUser.name 
        };
        
        setUser(userSession);
        localStorage.setItem('dsr_user', JSON.stringify(userSession));
        
        return userSession;
      } else {
        throw new Error('Invalid username or password');
      }
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.warn('API logout failed:', error);
    }
    
    setUser(null);
    localStorage.removeItem('dsr_user');
    localStorage.removeItem('auth_token');
  };

  return { user, login, logout, isOnline };
}