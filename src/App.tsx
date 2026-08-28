/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Search, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Headset,
  History,
  User as UserIcon,
  Sparkles,
  Smartphone,
  CreditCard,
  Wallet,
  CheckCircle2,
  Lock,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS, Product, OrderRecord } from './types';
import { auth, onAuthStateChanged, signOut, type User } from './firebase';
import { AuthModal } from './components/AuthModal';
import { ProductDetailPage } from './components/ProductDetailPage';
import { TrackOrdersPage } from './components/TrackOrdersPage';
import { ProfilePage } from './components/ProfilePage';
import { AddMoneyPage } from './components/AddMoneyPage';

type ViewMode = 'catalog' | 'detail' | 'track' | 'profile' | 'addmoney';

export default function App() {
  // Navigation View
  const [currentView, setCurrentView] = useState<ViewMode>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Wallet balance state
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexus_wallet_balance');
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const handleBalanceUpdated = (newBalance: number) => {
    setWalletBalance(newBalance);
    try {
      localStorage.setItem('nexus_wallet_balance', newBalance.toString());
    } catch (e) {
      console.error('Failed to save wallet balance', e);
    }
  };

  // Catalog search & categories
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Games' | 'Gift Cards'>('All');

  // Orders list
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_orders_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Filter products
  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectGameById = (productId: string) => {
    const found = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
    handleSelectProduct(found);
  };

  const handleOrderPlaced = (newOrder: OrderRecord) => {
    setOrders(prev => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('nexus_orders_v2', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save order to local storage', e);
      }
      return updated;
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsUserMenuOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-[#1A1A1A]">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none" 
            onClick={() => {
              setSelectedProduct(null);
              setCurrentView('catalog');
            }}
          >
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center shadow-xs">
              <Zap className="text-white w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-950">NEXUS</span>
          </div>
          
          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-7 text-xs font-bold text-gray-600">
            <button 
              onClick={() => {
                setSelectedProduct(null);
                setCurrentView('catalog');
              }} 
              className={`hover:text-black transition-colors ${currentView === 'catalog' ? 'text-black' : ''}`}
            >
              Games Catalog
            </button>
            <button 
              onClick={() => setCurrentView('track')} 
              className={`hover:text-black transition-colors flex items-center gap-1.5 ${currentView === 'track' ? 'text-black' : ''}`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Track Orders</span>
              {orders.length > 0 && (
                <span className="w-4 h-4 bg-black text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {orders.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setCurrentView('profile')} 
              className={`hover:text-black transition-colors flex items-center gap-1.5 ${currentView === 'profile' ? 'text-black' : ''}`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>My Profile</span>
            </button>
          </div>

          {/* Right User Auth Action */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'User'} 
                      className="w-5 h-5 rounded-full object-cover border border-emerald-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold">
                      {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                    </div>
                  )}
                  <span className="max-w-[80px] sm:max-w-[120px] truncate text-gray-800">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2.5 z-50 text-xs"
                    >
                      <div className="px-2.5 py-2 border-b border-gray-100 mb-1">
                        <p className="font-bold text-gray-900 truncate">{currentUser.displayName || 'Google User'}</p>
                        <p className="text-[10px] text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setCurrentView('profile');
                        }}
                        className="w-full text-left px-2.5 py-2 font-medium text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                        Account Hub
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setCurrentView('addmoney');
                        }}
                        className="w-full text-left px-2.5 py-2 font-medium text-emerald-700 hover:bg-emerald-50 rounded-xl flex items-center gap-2"
                      >
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                        Add Money (৳{walletBalance.toFixed(0)})
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setCurrentView('track');
                        }}
                        className="w-full text-left px-2.5 py-2 font-medium text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2"
                      >
                        <History className="w-3.5 h-3.5 text-gray-400" />
                        My Top-Up Orders ({orders.length})
                      </button>

                      <div className="pt-1 mt-1 border-t border-gray-100">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-2.5 py-2 font-semibold text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-black text-white px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold hover:bg-black/85 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden sm:inline">Google</span>
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Router */}
      {currentView === 'detail' && selectedProduct ? (
        <ProductDetailPage
          product={selectedProduct}
          currentUser={currentUser}
          onBack={() => {
            setSelectedProduct(null);
            setCurrentView('catalog');
          }}
          onOrderPlaced={handleOrderPlaced}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      ) : currentView === 'track' ? (
        <TrackOrdersPage
          orders={orders}
          currentUser={currentUser}
          onGoHome={() => {
            setSelectedProduct(null);
            setCurrentView('catalog');
          }}
          onSelectGame={handleSelectGameById}
        />
      ) : currentView === 'addmoney' ? (
        <AddMoneyPage
          currentUser={currentUser}
          walletBalance={walletBalance}
          onBalanceUpdated={handleBalanceUpdated}
          onGoHome={() => {
            setSelectedProduct(null);
            setCurrentView('catalog');
          }}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      ) : currentView === 'profile' ? (
        <ProfilePage
          currentUser={currentUser}
          orders={orders}
          walletBalance={walletBalance}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onGoHome={() => {
            setSelectedProduct(null);
            setCurrentView('catalog');
          }}
          onGoTrackOrders={() => setCurrentView('track')}
          onGoAddMoney={() => setCurrentView('addmoney')}
        />
      ) : (
        /* Home Catalog View */
        <div className="pb-24">
          {/* Responsive Hero Section */}
          <section className="bg-white border-b border-black/5 pt-6 sm:pt-10 pb-8 sm:pb-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="max-w-2xl">
                {/* Header Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/5 rounded-full text-[11px] font-semibold text-gray-700 mb-3 sm:mb-4">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Instant Game Direct Delivery • 24/7 Server Credit</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-950 leading-tight mb-2.5 sm:mb-3">
                  Top Up Game Diamonds <br />
                  <span className="text-gray-400 font-bold">& Digital Gift Cards</span>
                </h1>

                <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
                  Click on your favorite game below to enter your Player ID and receive instant diamond/UC delivery.
                </p>
                
                {/* Search Bar */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text"
                    placeholder="Search Free Fire, PUBG, MLBB, Valorant..."
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] rounded-2xl border border-transparent focus:border-black/20 focus:bg-white focus:ring-2 focus:ring-black/5 transition-all outline-none text-xs sm:text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Catalog Grid */}
          <main className="max-w-7xl mx-auto px-4 py-8">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
              {(['All', 'Games', 'Gift Cards'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat 
                      ? 'bg-black text-white shadow-xs' 
                      : 'bg-white text-gray-600 border border-black/5 hover:border-black/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Game Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-5">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleSelectProduct(product)}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-black/5 shadow-xs group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                    <div>
                      <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden mb-3 bg-gray-100 relative">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {product.popular && (
                          <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                            Popular
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-0.5 group-hover:text-black line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold mb-2">
                        {product.category}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Direct Top-up
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Payment Methods Supported */}
            <div className="mt-12 bg-white rounded-3xl p-5 sm:p-7 border border-black/5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-3.5 text-center md:text-left">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-gray-900">Supported Payment Methods</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500">
                    bKash, Nagad, UPI (GPay/PhonePe), Debit/Credit Cards & Digital Wallets with zero fee.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="px-3 py-1.5 bg-[#F9F9FB] rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 border border-gray-100">
                  <Smartphone className="w-3.5 h-3.5 text-pink-600" /> bKash / Nagad
                </span>
                <span className="px-3 py-1.5 bg-[#F9F9FB] rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 border border-gray-100">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Visa / Mastercard
                </span>
                <span className="px-3 py-1.5 bg-[#F9F9FB] rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 border border-gray-100">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" /> E-Wallets
                </span>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            setSelectedProduct(null);
            setCurrentView('catalog');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${
            currentView === 'catalog' ? 'text-black' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Games</span>
        </button>

        <button
          onClick={() => setCurrentView('addmoney')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${
            currentView === 'addmoney' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Wallet</span>
        </button>

        <button
          onClick={() => setCurrentView('track')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors relative ${
            currentView === 'track' ? 'text-black' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Orders</span>
          {orders.length > 0 && (
            <span className="absolute top-0.5 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setCurrentView('profile')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${
            currentView === 'profile' ? 'text-black' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </div>

      {/* Auth Modal (Google Login / Sign Up) */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        currentUser={currentUser}
      />
    </div>
  );
}
