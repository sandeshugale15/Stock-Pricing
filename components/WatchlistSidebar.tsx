import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, TrendingUp, TrendingDown, Star } from 'lucide-react';

interface WatchlistSidebarProps {
  onSelect: (symbol: string) => void;
}

const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({ onSelect }) => {
  const { user, watchlist, removeFromWatchlist } = useAuth();

  if (!user) return null;

  return (
    <div className="w-full h-full flex flex-col bg-gray-900/50 border-r border-gray-800 backdrop-blur-md">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <Star className="text-indigo-400 fill-indigo-400/20" size={18} />
        <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Your Watchlist</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {watchlist.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-gray-500 text-center p-4">
            <p className="text-sm">No stocks tracked yet.</p>
            <p className="text-xs mt-1">Star a stock to add it here.</p>
          </div>
        ) : (
          watchlist.map((item) => (
            <div 
              key={item.symbol}
              className="group relative flex items-center justify-between p-3 rounded-xl bg-gray-800/40 hover:bg-gray-800 border border-transparent hover:border-gray-700 transition-all cursor-pointer"
              onClick={() => onSelect(item.symbol)}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{item.symbol}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${item.changePercent >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate max-w-[120px]">
                  {item.companyName}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-mono text-gray-300">${item.price.toFixed(2)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(item.symbol);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all absolute right-2 top-8 md:static"
                  title="Remove from watchlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-gray-800 bg-gray-900/80">
        <div className="flex items-center justify-between text-xs text-gray-500">
           <span>{watchlist.length} items</span>
           <span>Sort: Default</span>
        </div>
      </div>
    </div>
  );
};

export default WatchlistSidebar;