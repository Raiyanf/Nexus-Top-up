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
  History,
  User as UserIcon,
  Sparkles,
  Smartphone,
  CreditCard,
  Wallet,
  Shield,
  Key,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS, Product, OrderRecord, UserProfile } from './types';
import { 
  auth, 
  onAuthStateChanged, 
  signOut, 
  syncUserProfileOnLogin,
  listenUserProfile,
  listenAllOrdersInDb,
  listenAllUsers,
  ADMIN_EMAILS,
  type User 
} from './firebase';
import { AuthModal } from './components/AuthModal';
import { ProductDetailPage } from './components/ProductDetailPage';
import { TrackOrdersPage } from './components/TrackOrdersPage';
import { ProfilePage } from './components/ProfilePage';
import { AddMoneyPage } from './components/AddMoneyPage';
import { AdminPanel } from './components/AdminPanel';

type ViewMode = 'catalog' | 'detail' | 'track' | 'profile' | 'addmoney' | 'admin';

export default function App() {
  // Navigation View
  const [currentView, setCurrentView] = useState<ViewMode>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Auth state & User Profile from Realtime Database
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Wallet balance state
  const [walletBalance, setWalletBalance] = useState<number>(0);

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

  // Realtime Orders list
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  // Check if current user is admin
  const isAdmin = currentUserProfile?.role === 'admin' || (currentUser?.email ? ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) : false);

  // 1. Listen to Firebase Auth state and synchronize user profile with RTDB
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Sync user profile to Realtime Database upon authentication
        try {
          const profile = await syncUserProfileOnLogin(user);
          setCurrentUserProfile(profile);
          if (profile && typeof profile.walletBalance === 'number') {
            setWalletBalance(profile.walletBalance);
          }
        } catch (err) {
          console.error('Error syncing user profile on auth state change:', err);
        }

        // Subscribe to live Realtime Database user profile updates
        unsubscribeProfile = listenUserProfile(user.uid, (profile) => {
          if (profile) {
            setCurrentUserProfile(profile);
            if (typeof profile.walletBalance === 'number') {
              setWalletBalance(profile.walletBalance);
            }
          }
        });
      } else {
        setCurrentUserProfile(null);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  // 2. Subscribe to live orders and user collections from Realtime Database
  useEffect(() => {
    const unsubOrders = listenAllOrdersInDb((ordersList) => {
      setOrders(ordersList);
    });

    const unsubUsers = listenAllUsers((usersList) => {
      setAllUsers(usersList);
    });

    return () => {
      unsubOrders();
      unsubUsers();
    };
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
      const exists = prev.some(o => o.id === newOrder.id);
      if (exists) return prev;
      return [newOrder, ...prev];
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsUserMenuOpen(false);
      if (currentView === 'admin') {
        setCurrentView('catalog');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-[#1A1A1A]">
      {/* Top Navbar (Hidden in Admin Mode to keep Admin dashboard immersive) */}
      {currentView !== 'admin' && (
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
                onClick={() => setCurrentView('addmoney')} 
                className={`hover:text-black transition-colors flex items-center gap-1.5 ${currentView === 'addmoney' ? 'text-emerald-700' : ''}`}
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add Money (৳{walletBalance.toFixed(0)})</span>
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

              {isAdmin && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="bg-amber-400 text-black px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs hover:bg-amber-300 transition-all cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              )}
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
                          <p className="font-bold text-gray-900 truncate">{currentUser.displayName || 'Nexus Player'}</p>
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

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setCurrentView('admin');
                            }}
                            className="w-full text-left px-2.5 py-2 font-bold text-amber-900 hover:bg-amber-50 rounded-xl flex items-center gap-2 bg-amber-50/50 my-1"
                          >
                            <Shield className="w-3.5 h-3.5 text-amber-600" />
                            Admin Console
                          </button>
                        )}

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
                  <UserIcon className="w-3 h-3 shrink-0" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Router */}
      {currentView === 'admin' ? (
        <AdminPanel
          currentUserProfile={currentUserProfile}
          users={allUsers}
          orders={orders}
          onGoHome={() => {
            setSelectedProduct(null);
            setCurrentView('catalog');
          }}
        />
      ) : currentView === 'detail' && selectedProduct ? (
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
          currentUserProfile={currentUserProfile}
          orders={orders}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onGoHome={() => {
            setSelectedProduct(null);
            setCurrentView('catalog');
          }}
          onGoTrackOrders={() => setCurrentView('track')}
          onGoAdminPanel={() => setCurrentView('admin')}
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
                  <span>Instant Game Direct Delivery • Realtime Database Sync</span>
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
                    bKash, Nagad, Rocket, UPI, Debit/Credit Cards & NEXUS Wallet with zero fee.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="px-3 py-1.5 bg-[#F9F9FB] rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 border border-gray-100">
                  <Smartphone className="w-3.5 h-3.5 text-pink-600" /> bKash / Nagad / Rocket
                </span>
                <span className="px-3 py-1.5 bg-[#F9F9FB] rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 border border-gray-100">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Cards & UPI
                </span>
                <span className="px-3 py-1.5 bg-[#F9F9FB] rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 border border-gray-100">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" /> NEXUS Wallet
                </span>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Hidden in Admin View) */}
      {currentView !== 'admin' && (
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
            <span>Add Money</span>
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
      )}

      {/* Auth Modal (Google Login / Email Sign In / Sign Up) */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        currentUser={currentUser}
        onLoginSuccess={async (user) => {
          try {
            const profile = await syncUserProfileOnLogin(user);
            if (profile) setCurrentUserProfile(profile);
          } catch (e) {
            console.error('Error on login success handler:', e);
          }
        }}
      />
    </div>
  );
}
