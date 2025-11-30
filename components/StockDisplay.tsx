import React, { useEffect, useState } from 'react';
import { StockData } from '../types';
import StockChart from './StockChart';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus, Activity, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StockDisplayProps {
  data: StockData;
  isSimulating: boolean;
}

const StockDisplay: React.FC<StockDisplayProps> = ({ data: initialData, isSimulating }) => {
  const [liveData, setLiveData] = useState<StockData>(initialData);
  const { isWatched, addToWatchlist, removeFromWatchlist, user, openLogin } = useAuth();

  const isStockWatched = isWatched(initialData.symbol);

  const toggleWatchlist = () => {
    if (!user) {
      openLogin();
      return;
    }
    
    if (isStockWatched) {
      removeFromWatchlist(initialData.symbol);
    } else {
      addToWatchlist({
        symbol: initialData.symbol,
        companyName: initialData.companyName,
        price: liveData.price,
        changePercent: liveData.changePercent,
        addedAt: Date.now()
      });
    }
  };

  // Update internal state when props change (new search)
  useEffect(() => {
    setLiveData(initialData);
  }, [initialData]);

  // Simulate live ticker movement
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setLiveData(prev => {
        const volatility = prev.price * 0.0005; // 0.05% fluctuation
        const change = (Math.random() - 0.5) * volatility;
        const newPrice = prev.price + change;
        
        // Recalculate percent change roughly based on the day's open
        const openPrice = initialData.price / (1 + (initialData.changePercent / 100));
        const newChangePercent = ((newPrice - openPrice) / openPrice) * 100;

        return {
          ...prev,
          price: newPrice,
          changePercent: newChangePercent,
        };
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isSimulating, initialData]);

  const isPositive = liveData.changePercent >= 0;
  const ColorIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const colorClass = isPositive ? "text-emerald-400" : "text-red-400";
  const bgClass = isPositive ? "bg-emerald-500/10" : "bg-red-500/10";

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in zoom-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            {liveData.symbol}
            <button 
              onClick={toggleWatchlist}
              className={`p-1.5 rounded-lg transition-all ${isStockWatched ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-600 hover:text-gray-400'}`}
              title={isStockWatched ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              <Star size={24} fill={isStockWatched ? "currentColor" : "none"} />
            </button>
            <span className="text-lg font-medium text-gray-400 bg-gray-800 px-2 py-1 rounded-md">
              {liveData.companyName}
            </span>
          </h1>
          <div className="flex items-baseline gap-4 mt-2">
            <span className="text-6xl font-bold text-white tracking-tighter">
              ${liveData.price.toFixed(2)}
            </span>
            <div className={`flex items-center gap-1 text-xl font-semibold px-3 py-1 rounded-full ${bgClass} ${colorClass}`}>
              <ColorIcon size={24} />
              <span>{liveData.changePercent > 0 ? '+' : ''}{liveData.changePercent.toFixed(2)}%</span>
            </div>
          </div>
          <p className="text-gray-400 mt-2 text-sm flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             Real-time Market Data via Gemini Grounding
          </p>
        </div>
        
        {/* Sentiment Badge */}
        <div className={`flex flex-col items-end px-6 py-4 rounded-xl border ${
          liveData.sentiment === 'bullish' ? 'border-emerald-500/30 bg-emerald-900/10' :
          liveData.sentiment === 'bearish' ? 'border-red-500/30 bg-red-900/10' :
          'border-gray-500/30 bg-gray-800/20'
        }`}>
          <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">AI Sentiment</span>
          <div className="flex items-center gap-2">
            {liveData.sentiment === 'bullish' && <TrendingUp className="text-emerald-400" size={24} />}
            {liveData.sentiment === 'bearish' && <TrendingDown className="text-red-400" size={24} />}
            {liveData.sentiment === 'neutral' && <Minus className="text-gray-400" size={24} />}
            <span className={`text-2xl font-bold capitalize ${
              liveData.sentiment === 'bullish' ? 'text-emerald-400' :
              liveData.sentiment === 'bearish' ? 'text-red-400' :
              'text-gray-400'
            }`}>
              {liveData.sentiment}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-gray-300 font-medium flex items-center gap-2">
             <Activity size={18} /> Intraday Performance
           </h3>
           <div className="flex gap-2">
             {['1D', '1W', '1M', '1Y'].map(tf => (
               <button key={tf} className={`px-3 py-1 text-xs rounded-lg transition-colors ${tf === '1D' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                 {tf}
               </button>
             ))}
           </div>
        </div>
        <StockChart data={liveData} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Market Cap" value={liveData.marketCap} />
        <StatCard label="Volume" value="24.5M" /> {/* Mocked volume */}
        <StatCard label="P/E Ratio" value="-" />
        <StatCard label="52W High" value="-" />
      </div>

      {/* Analysis Section */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-3">AI Market Summary</h3>
        <p className="text-gray-300 leading-relaxed text-lg">
          {liveData.summary}
        </p>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl">
    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
    <p className="text-white font-mono text-lg font-medium mt-1">{value}</p>
  </div>
);

export default StockDisplay;