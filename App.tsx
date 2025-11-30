import React, { useState, useEffect } from 'react';
import { Search, Loader2, BarChart2, LogIn, LogOut, User as UserIcon, Menu, TrendingUp } from 'lucide-react';
import { searchStock } from './services/gemini';
import StockDisplay from './components/StockDisplay';
import NewsFeed from './components/NewsFeed';
import WatchlistSidebar from './components/WatchlistSidebar';
import AuthModal from './components/AuthModal';
import { AnalysisResult } from './types';
import { useAuth } from './context/AuthContext';

const POPULAR_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries' },
  { symbol: 'TCS', name: 'Tata Consultancy Svcs' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank' },
  { symbol: 'INFY', name: 'Infosys' },
  { symbol: 'SBIN', name: 'State Bank of India' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel' },
  { symbol: 'ITC', name: 'ITC Limited' },
  { symbol: 'LT', name: 'Larsen & Toubro' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki' },
];

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { user, openLogin, logout } = useAuth();

  const performSearch = async (symbol: string) => {
    if (!symbol.trim()) return;

    setLoading(true);
    setError(null);
    setQuery(symbol); // Sync search bar
    
    // Mobile: close sidebar on selection
    if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
    }

    try {
      const result = await searchStock(symbol);
      if (result.stockData) {
        setData(result);
      } else {
        setError("Could not find structured stock data for this symbol. Please try a valid ticker (e.g., AAPL, GOOGL).");
      }
    } catch (err) {
      setError("Failed to fetch stock data. Please check your API key or try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Initial load
  useEffect(() => {
    performSearch('NVDA');
  }, []);

  return (
    <div className="h-screen w-full bg-[#0b0f19] text-gray-100 flex flex-col font-sans overflow-hidden">
      <AuthModal />
      
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-[#0b0f19]/80 backdrop-blur-md z-40 shrink-0">
        <div className="w-full px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             {/* Mobile Menu Button */}
            {user && (
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                <Menu size={20} />
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <BarChart2 className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white hidden sm:block">Stock<span className="text-indigo-400">Pulse</span></span>
            </div>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ticker (e.g. TATASTEEL)..."
              className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-gray-600"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
          </form>

          {/* Auth Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg border border-gray-800">
                  <UserIcon size={14} className="text-indigo-400" />
                  <span className="text-sm font-medium text-gray-300">{user.username}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={openLogin}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Desktop: Conditional | Mobile: Absolute Overlay */}
        {user && (
          <aside className={`
            absolute md:relative z-30 h-full w-64 bg-[#0b0f19] transition-transform duration-300 ease-in-out border-r border-gray-800
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <WatchlistSidebar onSelect={performSearch} />
          </aside>
        )}

        {/* Backdrop for mobile sidebar */}
        {user && isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="min-h-[calc(100vh-250px)]">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-gray-400 animate-pulse font-medium">Analyzing market data with Gemini...</p>
              </div>
            ) : error ? (
              <div className="h-96 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                  <BarChart2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Search Failed</h3>
                <p className="text-gray-400">{error}</p>
              </div>
            ) : data && data.stockData ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stock Data & Chart */}
                <div className="lg:col-span-2 space-y-6">
                  <StockDisplay data={data.stockData} isSimulating={true} />
                </div>

                {/* Right Column: News Feed */}
                <div className="lg:col-span-1">
                  <NewsFeed news={data.news} />
                </div>
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-gray-500">
                 <div className="bg-gray-800/50 p-6 rounded-full mb-6">
                    <TrendingUp className="w-16 h-16 text-indigo-500/50" />
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Market Intelligence</h2>
                 <p className="text-gray-400 max-w-md text-center">
                   Enter a symbol above to view real-time pricing, sentiment analysis, and breaking news powered by Gemini.
                 </p>
              </div>
            )}
          </div>

          {/* Popular Stocks Section */}
          <div className="mt-12 border-t border-gray-800 pt-8 pb-4">
            <h3 className="text-lg font-semibold text-gray-300 mb-4 px-1 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-400" />
              Popular Indian Stocks
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {POPULAR_STOCKS.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => performSearch(stock.symbol)}
                  className="flex flex-col items-start p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800 border border-gray-700/50 hover:border-indigo-500/50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                     <span className="font-bold text-gray-200 group-hover:text-indigo-400">{stock.symbol}</span>
                     <span className="text-[10px] font-bold tracking-wider text-gray-600 group-hover:text-indigo-500/70 opacity-0 group-hover:opacity-100 transition-opacity">VIEW</span>
                  </div>
                  <span className="text-xs text-gray-500 truncate w-full">{stock.name}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;