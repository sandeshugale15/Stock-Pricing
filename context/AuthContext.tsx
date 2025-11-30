import React, { createContext, useContext, useState, useEffect } from 'react';
import { WatchlistItem } from '../types';

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  watchlist: WatchlistItem[];
  isLoginOpen: boolean;
  login: (username: string) => void;
  logout: () => void;
  openLogin: () => void;
  closeLogin: () => void;
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (symbol: string) => void;
  isWatched: (symbol: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Load user from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('stock_app_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadWatchlist(parsedUser.username);
    }
  }, []);

  const loadWatchlist = (username: string) => {
    const saved = localStorage.getItem(`stock_watchlist_${username}`);
    if (saved) {
      setWatchlist(JSON.parse(saved));
    } else {
      setWatchlist([]);
    }
  };

  const login = (username: string) => {
    const newUser = { username };
    setUser(newUser);
    localStorage.setItem('stock_app_user', JSON.stringify(newUser));
    loadWatchlist(username);
    setIsLoginOpen(false);
  };

  const logout = () => {
    setUser(null);
    setWatchlist([]);
    localStorage.removeItem('stock_app_user');
  };

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  const addToWatchlist = (item: WatchlistItem) => {
    if (!user) {
      openLogin();
      return;
    }
    // Avoid duplicates
    if (watchlist.some(w => w.symbol === item.symbol)) return;

    const updated = [...watchlist, item];
    setWatchlist(updated);
    localStorage.setItem(`stock_watchlist_${user.username}`, JSON.stringify(updated));
  };

  const removeFromWatchlist = (symbol: string) => {
    if (!user) return;
    const updated = watchlist.filter(i => i.symbol !== symbol);
    setWatchlist(updated);
    localStorage.setItem(`stock_watchlist_${user.username}`, JSON.stringify(updated));
  };

  const isWatched = (symbol: string) => {
    return watchlist.some(i => i.symbol === symbol);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      watchlist, 
      isLoginOpen, 
      login, 
      logout, 
      openLogin, 
      closeLogin, 
      addToWatchlist, 
      removeFromWatchlist, 
      isWatched 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};