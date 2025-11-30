import React, { useState } from 'react';
import { X, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal: React.FC = () => {
  const { isLoginOpen, closeLogin, login } = useAuth();
  const [username, setUsername] = useState('');

  if (!isLoginOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
      setUsername('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeLogin}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <button 
            onClick={closeLogin}
            className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
              <User className="text-indigo-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400 text-sm mt-1">Sign in to sync your watchlist</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-gray-700"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!username.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Tracking <ArrowRight size={18} />
            </button>
          </form>
        </div>
        <div className="bg-gray-950/50 p-4 text-center border-t border-gray-800">
          <p className="text-xs text-gray-500">
            This is a demo authentication. No password required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;