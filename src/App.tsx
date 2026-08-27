/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Gamepad2, 
  Smartphone, 
  CreditCard, 
  Search, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Headset,
  X,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS, TOPUP_OPTIONS, Product, TopupOption } from './types';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Games' | 'Mobile' | 'Gift Cards'>('All');

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#1A1A1A]">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">NEXUS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#666]">
            <a href="#" className="hover:text-black transition-colors">Home</a>
            <a href="#" className="hover:text-black transition-colors">Track Order</a>
            <a href="#" className="hover:text-black transition-colors">Support</a>
          </div>

          <button className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-black/80 transition-all shadow-sm">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white border-b border-black/5 pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] mb-6"
            >
              LEVEL UP YOUR <br />
              <span className="text-[#666]">GAMING EXPERIENCE.</span>
            </motion.h1>
            <p className="text-lg text-[#666] mb-8 max-w-md">
              Instant delivery, secure payments, and 24/7 support for all your favorite games and services.
            </p>
            
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999] w-5 h-5" />
              <input 
                type="text"
                placeholder="Search for a game or service..."
                className="w-full pl-12 pr-4 py-4 bg-[#F5F5F5] rounded-2xl border-none focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
          {(['All', 'Games', 'Mobile', 'Gift Cards'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === cat 
                ? 'bg-black text-white shadow-md' 
                : 'bg-white text-[#666] border border-black/5 hover:border-black/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {filteredProducts.map((product, idx) => (
            <motion.div
              layoutId={product.id}
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedProduct(product)}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-3xl p-3 border border-black/5 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-[#F5F5F5]">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-bold text-sm mb-1">{product.name}</h3>
                <p className="text-[10px] text-[#999] uppercase tracking-wider font-semibold">{product.category}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <section className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-black/5">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="text-emerald-600 w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg mb-2">Secure Payments</h4>
            <p className="text-sm text-[#666]">Your transactions are protected by industry-leading encryption and security protocols.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-black/5">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="text-blue-600 w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg mb-2">Instant Delivery</h4>
            <p className="text-sm text-[#666]">Receive your credits or codes instantly after a successful payment, 24/7.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-black/5">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
              <Headset className="text-purple-600 w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg mb-2">24/7 Support</h4>
            <p className="text-sm text-[#666]">Our dedicated support team is always here to help you with any issues or questions.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span className="font-bold text-lg">NEXUS</span>
          </div>
          <div className="flex gap-8 text-sm text-[#666]">
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Refund Policy</a>
            <a href="#" className="hover:text-black">Contact</a>
          </div>
          <p className="text-xs text-[#999]">© 2026 Nexus Topup. All rights reserved.</p>
        </div>
      </footer>

      {/* Topup Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              layoutId={selectedProduct.id}
              className="relative bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Side - Info */}
              <div className="md:w-2/5 bg-[#F5F5F5] p-8 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-lg mb-6">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                <p className="text-sm text-[#666] mb-6">{selectedProduct.description}</p>
                
                <div className="mt-auto flex flex-col gap-3 w-full">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    Official Partner
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                    <Zap className="w-4 h-4" />
                    Instant Delivery
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="md:w-3/5 p-8 max-h-[80vh] overflow-y-auto">
                <div className="mb-8">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#999] mb-3">
                    1. Enter User ID
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. 123456789 (0001)"
                    className="w-full px-4 py-3 bg-[#F5F5F5] rounded-xl border-none focus:ring-2 focus:ring-black/5 outline-none text-sm"
                  />
                  <p className="text-[10px] text-[#999] mt-2">To find your User ID, tap on your avatar in the top-left corner of the main game screen.</p>
                </div>

                <div className="mb-8">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#999] mb-3">
                    2. Select Amount
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(TOPUP_OPTIONS[selectedProduct.id] || TOPUP_OPTIONS.ff).map((option) => (
                      <button 
                        key={option.id}
                        className="p-4 rounded-2xl border border-black/5 hover:border-black hover:bg-black hover:text-white transition-all text-left group"
                      >
                        <div className="font-bold text-sm mb-1">{option.amount}</div>
                        <div className="text-xs opacity-60 group-hover:opacity-100">${option.price.toFixed(2)}</div>
                        {option.bonus && (
                          <div className="mt-2 text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md inline-block group-hover:bg-white/20 group-hover:text-white">
                            {option.bonus}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-all shadow-lg">
                  Buy Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
