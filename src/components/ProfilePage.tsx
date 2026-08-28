/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Mail, 
  Key, 
  LogOut, 
  History, 
  Zap, 
  Copy, 
  Check, 
  ArrowLeft, 
  Gamepad2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, signOut, auth } from '../firebase';
import { OrderRecord } from '../types';

interface ProfilePageProps {
  currentUser: User | null;
  orders: OrderRecord[];
  walletBalance: number;
  onOpenAuthModal: () => void;
  onGoHome: () => void;
  onGoTrackOrders: () => void;
  onGoAddMoney: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  orders,
  walletBalance,
  onOpenAuthModal,
  onGoHome,
  onGoTrackOrders,
  onGoAddMoney
}) => {
  const totalSpent = orders.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out error', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-black/5 sticky top-16 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-black transition-colors px-2 py-1 -ml-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
              Account Hub
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6">
        {currentUser ? (
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User Avatar'}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-emerald-100 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold border-4 border-emerald-100">
                    {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
                    {currentUser.displayName || 'Google User'}
                  </h2>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Google Account
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 font-medium mb-3 flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {currentUser.email}
                </p>

                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold border border-emerald-200/60">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Delivery Active</span>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-200 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Wallet Banner Card */}
            <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15">
                  <Sparkles className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-semibold mb-0.5">Nexus Wallet Balance</div>
                  <div className="text-3xl font-extrabold tracking-tight">৳{walletBalance.toFixed(2)} BDT</div>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <Check className="w-3 h-3" /> Ready for 1-click game top-ups
                  </p>
                </div>
              </div>

              <button
                onClick={onGoAddMoney}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Add Money (টাকা রিচার্জ)</span>
              </button>
            </div>

            {/* Account Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-xs">
                <div className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-600" /> Total Orders
                </div>
                <div className="text-2xl font-extrabold text-gray-900">{orders.length}</div>
                <p className="text-[10px] text-gray-400 mt-0.5">Top-up transactions</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-xs">
                <div className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Total Spent
                </div>
                <div className="text-2xl font-extrabold text-emerald-600">${totalSpent.toFixed(2)}</div>
                <p className="text-[10px] text-gray-400 mt-0.5">~ ৳{(totalSpent * 125).toFixed(0)} BDT</p>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white p-5 rounded-3xl border border-black/5 shadow-xs">
                <div className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Delivery Tier
                </div>
                <div className="text-xl font-bold text-gray-900">VIP Instant</div>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Zero Queuing Active</p>
              </div>
            </div>

            {/* Quick Actions / Shortcuts */}
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Account Actions</h3>

              <button
                onClick={onGoTrackOrders}
                className="w-full p-3.5 bg-[#F9F9FB] hover:bg-[#F0F0F5] rounded-2xl flex items-center justify-between transition-colors border border-black/5 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-gray-900">View All Order Receipts</div>
                    <div className="text-[11px] text-gray-500">Track {orders.length} past top-ups and copy invoice codes</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={onGoHome}
                className="w-full p-3.5 bg-[#F9F9FB] hover:bg-[#F0F0F5] rounded-2xl flex items-center justify-between transition-colors border border-black/5 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-gray-900">Top-Up Games & Diamonds</div>
                    <div className="text-[11px] text-gray-500">Free Fire, PUBG Mobile, MLBB, Valorant & Steam</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        ) : (
          /* Guest / Not logged in state */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/5 text-center shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <UserIcon className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Sign In with Google
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
              Log in to your account to view your past top-up receipts, save your game Player IDs, and enjoy 1-click checkout.
            </p>

            <button
              type="button"
              onClick={onOpenAuthModal}
              className="w-full bg-white text-gray-800 border-2 border-gray-200 hover:border-black py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
