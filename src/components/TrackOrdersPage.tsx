/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  History, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  PackageCheck, 
  AlertCircle,
  Zap,
  ArrowLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { OrderRecord } from '../types';
import { User } from '../firebase';

interface TrackOrdersPageProps {
  orders: OrderRecord[];
  currentUser: User | null;
  onGoHome: () => void;
  onSelectGame: (productId: string) => void;
}

export const TrackOrdersPage: React.FC<TrackOrdersPageProps> = ({
  orders,
  currentUser,
  onGoHome,
  onSelectGame
}) => {
  const [searchId, setSearchId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(orders[0] || null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchId.toLowerCase()) ||
    o.productName.toLowerCase().includes(searchId.toLowerCase()) ||
    o.userGameId.toLowerCase().includes(searchId.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F7F8] pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-black/5 sticky top-16 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-black transition-colors px-2 py-1 -ml-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> Live Delivery Tracker
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-4 sm:pt-6">
        {/* Title and Search */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-black/5 shadow-xs mb-6">
          <div className="max-w-2xl">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
              Track Your Top-Up Orders
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mb-5 leading-relaxed">
              Check real-time delivery status and transaction receipts for all game diamond and UC purchases.
            </p>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Order ID (e.g. NEX-194820) or Player UID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] rounded-xl border border-transparent focus:border-black/20 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none text-xs sm:text-sm font-medium transition-all"
              />
            </div>
          </div>
        </div>

        {/* Orders Content */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-black/5 text-center shadow-xs">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
            <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
              You have not placed any top-up orders yet. Select your favorite game to get started!
            </p>
            <button
              onClick={onGoHome}
              className="bg-black text-white px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold hover:bg-black/85 transition-all shadow-sm cursor-pointer"
            >
              Browse Games Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List (Left) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Order History ({filteredOrders.length})
                </span>
                {currentUser && (
                  <span className="text-[11px] text-gray-500">
                    Synced with <b className="text-gray-800">{currentUser.email}</b>
                  </span>
                )}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center text-xs text-gray-500 border border-black/5">
                  No orders match your search query "{searchId}".
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <motion.div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      whileHover={{ scale: 1.005 }}
                      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs ${
                        isSelected 
                          ? 'border-black ring-2 ring-black/5' 
                          : 'border-black/5 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={order.productImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100'} 
                            alt={order.productName}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-xs"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-bold text-sm text-gray-900">{order.productName}</h4>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-md">
                                {order.amount}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-2 font-medium">
                              <span>Player ID: <b className="font-mono text-gray-800">{order.userGameId}</b></span>
                              <span>•</span>
                              <span>{order.timestamp}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                          <div className="text-left sm:text-right">
                            <div className="font-mono font-bold text-xs text-gray-800">{order.id}</div>
                            <div className="text-emerald-600 font-bold text-xs">${order.price.toFixed(2)}</div>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Delivered
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Selected Order Receipt Panel (Right) */}
            <div>
              {selectedOrder && (
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/5 shadow-xs sticky top-32">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                    <h3 className="font-bold text-sm text-gray-900">Receipt Details</h3>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Auto-Credited
                    </span>
                  </div>

                  <div className="text-center pb-4 mb-4 border-b border-gray-100">
                    <img 
                      src={selectedOrder.productImage} 
                      alt={selectedOrder.productName} 
                      className="w-16 h-16 rounded-2xl object-cover mx-auto mb-2 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <h4 className="font-bold text-base text-gray-900">{selectedOrder.productName}</h4>
                    <p className="text-xs font-bold text-emerald-600">{selectedOrder.amount}</p>
                  </div>

                  <div className="space-y-3 text-xs text-gray-600 mb-5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Order ID</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-gray-900">{selectedOrder.id}</span>
                        <button 
                          onClick={() => handleCopy(selectedOrder.id)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500"
                        >
                          {copiedId === selectedOrder.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Player UID</span>
                      <span className="font-mono font-semibold text-gray-900">
                        {selectedOrder.userGameId} {selectedOrder.userZoneId ? `(${selectedOrder.userZoneId})` : ''}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Payment Gateway</span>
                      <span className="font-semibold uppercase text-gray-900">{selectedOrder.paymentCategory}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Delivery Speed</span>
                      <span className="text-emerald-600 font-semibold">Instant (~15 seconds)</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Date & Time</span>
                      <span className="font-medium text-gray-700 text-[11px]">{selectedOrder.timestamp}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                      <span className="font-bold text-gray-900 text-sm">Amount Paid</span>
                      <span className="font-extrabold text-black text-lg">${selectedOrder.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectGame(selectedOrder.productId || 'ff')}
                    className="w-full bg-black hover:bg-black/85 text-white py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Order Again for {selectedOrder.productName}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
