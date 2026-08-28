/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Users, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Search, 
  DollarSign, 
  Wallet, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  Shield, 
  ExternalLink,
  Filter,
  UserCheck,
  Zap,
  TrendingUp,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderRecord, OrderStatus, UserProfile } from '../types';
import { 
  updateOrderStatusInDb, 
  updateUserRoleInDb, 
  updateUserBalanceInDb, 
  deleteOrderFromDb 
} from '../firebase';

interface AdminPanelProps {
  currentUserProfile: UserProfile | null;
  users: UserProfile[];
  orders: OrderRecord[];
  onGoHome: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUserProfile,
  users,
  orders,
  onGoHome
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');

  // Orders filters
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Users filters & edit modal
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editBalanceAmount, setEditBalanceAmount] = useState<string>('');
  const [balanceActionType, setBalanceActionType] = useState<'set' | 'add' | 'deduct'>('add');
  const [isSavingBalance, setIsSavingBalance] = useState(false);
  const [selectedUserOrders, setSelectedUserOrders] = useState<{ user: UserProfile; userOrders: OrderRecord[] } | null>(null);

  // Copy helper
  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  // Order status updater
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setActionLoadingId(orderId);
      await updateOrderStatusInDb(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Order deletion
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to remove this order record?')) return;
    try {
      setActionLoadingId(orderId);
      await deleteOrderFromDb(orderId);
    } catch (err) {
      console.error('Failed to delete order:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // User role toggle
  const handleToggleUserRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const confirmMsg = user.role === 'admin' 
      ? `Remove Admin privileges from ${user.displayName || user.email}?` 
      : `Promote ${user.displayName || user.email} to Admin?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateUserRoleInDb(user.uid, newRole);
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  // User balance update
  const handleSaveUserBalance = async () => {
    if (!editingUser) return;
    const amountNum = parseFloat(editBalanceAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      alert('Please enter a valid non-negative number.');
      return;
    }

    setIsSavingBalance(true);
    let finalBalance = editingUser.walletBalance || 0;
    if (balanceActionType === 'set') {
      finalBalance = amountNum;
    } else if (balanceActionType === 'add') {
      finalBalance += amountNum;
    } else if (balanceActionType === 'deduct') {
      finalBalance = Math.max(0, finalBalance - amountNum);
    }

    try {
      await updateUserBalanceInDb(editingUser.uid, finalBalance);
      setEditingUser(null);
      setEditBalanceAmount('');
    } catch (err) {
      console.error('Failed to update user balance:', err);
      alert('Failed to update balance. Please check your connection.');
    } finally {
      setIsSavingBalance(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.productName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.userGameId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.userDisplayName && o.userDisplayName.toLowerCase().includes(orderSearch.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered users
  const filteredUsers = users.filter(u => {
    return (
      (u.displayName && u.displayName.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      u.uid.toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  // Counts & Stats
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;
  const totalPlatformSpent = orders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalWalletBalances = users.reduce((sum, u) => sum + (u.walletBalance || 0), 0);

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-gray-900 pb-24">
      {/* Top Admin Navbar */}
      <header className="bg-black text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
            <div className="h-5 w-px bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold leading-tight flex items-center gap-2">
                  Admin Console
                  <span className="text-[10px] uppercase font-mono tracking-wider bg-amber-400 text-black px-2 py-0.5 rounded-md font-extrabold">
                    Realtime DB
                  </span>
                </h1>
                <p className="text-[11px] text-gray-400 hidden sm:block">
                  Live order processing & user database management
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-gray-300">Live Sync Active</span>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-gray-200 truncate max-w-[140px] sm:max-w-[200px]">
                {currentUserProfile?.displayName || 'Admin'}
              </div>
              <div className="text-[10px] text-amber-400 font-semibold">
                Super Admin
              </div>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="border-t border-white/10 bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-amber-400 text-amber-400 bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Real-Time Orders</span>
              {pendingOrdersCount > 0 && (
                <span className="bg-amber-400 text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'border-amber-400 text-amber-400 bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Accounts</span>
              <span className="bg-white/10 text-gray-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {users.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/5 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{orders.length}</div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
              <span className="text-amber-600 font-bold">{pendingOrdersCount} Pending</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/5 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Pending Orders</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-600">{pendingOrdersCount}</div>
            <div className="text-[11px] text-gray-500 mt-1">Requires delivery action</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/5 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Registered Users</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-[11px] text-gray-500 mt-1">Synced to Firebase DB</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/5 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Platform Volume</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600">
              ${totalPlatformSpent.toFixed(2)}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Wallet Total: ${totalWalletBalances.toFixed(2)}
            </div>
          </div>
        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-black/5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Player UID, or Email..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F6F8] rounded-xl border border-transparent focus:border-black/20 focus:bg-white text-xs sm:text-sm font-medium outline-none transition-all"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All ({orders.length})
                </button>

                <button
                  onClick={() => setStatusFilter('Pending')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'Pending'
                      ? 'bg-amber-500 text-black font-extrabold shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending ({pendingOrdersCount})</span>
                </button>

                <button
                  onClick={() => setStatusFilter('Completed')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'Completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed ({completedOrdersCount})</span>
                </button>

                <button
                  onClick={() => setStatusFilter('Cancelled')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'Cancelled'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancelled ({cancelledOrdersCount})</span>
                </button>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-black/5 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No Orders Found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {orderSearch || statusFilter !== 'all'
                    ? 'No orders match your active filter criteria. Try clearing search.'
                    : 'Incoming game top-up orders will automatically show up here in real time.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const isPending = order.status === 'Pending';
                  const isCompleted = order.status === 'Completed';
                  const isCancelled = order.status === 'Cancelled';
                  const isLoading = actionLoadingId === order.id;

                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs ${
                        isPending 
                          ? 'border-amber-300 ring-1 ring-amber-400/30' 
                          : 'border-black/5 hover:border-black/15'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        {/* Order info & Game Thumbnail */}
                        <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                          <img
                            src={order.productImage}
                            alt={order.productName}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-gray-100 border border-black/5 shrink-0 shadow-xs"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                #{order.id}
                              </span>

                              {/* Status Badge */}
                              {isPending && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                                  <Clock className="w-3 h-3" /> Pending Delivery
                                </span>
                              )}
                              {isCompleted && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" /> Completed
                                </span>
                              )}
                              {isCancelled && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                                  <XCircle className="w-3 h-3" /> Cancelled
                                </span>
                              )}

                              <span className="text-[11px] text-gray-400 font-medium ml-auto">
                                {order.timestamp}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-2">
                              <h4 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">
                                {order.productName}
                              </h4>
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                {order.amount}
                              </span>
                            </div>

                            {/* Customer details */}
                            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                              <span>Customer: <strong className="text-gray-700">{order.userDisplayName || 'Guest'}</strong></span>
                              {order.userEmail && <span>• {order.userEmail}</span>}
                              <span>• Method: <strong className="text-gray-700">{order.paymentCategory}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* PLAYER UID BOX (WITH 1-CLICK COPY) */}
                        <div className="w-full lg:w-auto bg-[#F6F6F8] rounded-2xl p-3 border border-black/5 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              Player ID / UID
                            </div>
                            <div className="font-mono text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
                              {order.userGameId}
                              {order.userZoneId && (
                                <span className="text-gray-500 ml-1 font-normal">
                                  ({order.userZoneId})
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleCopyUid(order.userGameId)}
                            title="Copy Player UID for top-up"
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                              copiedUid === order.userGameId
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-gray-800 hover:bg-gray-100 border border-black/10'
                            }`}
                          >
                            {copiedUid === order.userGameId ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy UID</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Price and Status Actions */}
                        <div className="w-full lg:w-auto flex items-center justify-between lg:flex-col lg:items-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                          <div className="text-right">
                            <div className="text-xs text-gray-400 font-medium">Price</div>
                            <div className="text-base sm:text-lg font-extrabold text-gray-900">
                              ${order.price.toFixed(2)}
                            </div>
                          </div>

                          {/* Quick Status Changers */}
                          <div className="flex items-center gap-1.5">
                            {order.status !== 'Completed' && (
                              <button
                                disabled={isLoading}
                                onClick={() => handleStatusChange(order.id, 'Completed')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Complete</span>
                              </button>
                            )}

                            {order.status !== 'Pending' && (
                              <button
                                disabled={isLoading}
                                onClick={() => handleStatusChange(order.id, 'Pending')}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pending</span>
                              </button>
                            )}

                            {order.status !== 'Cancelled' && (
                              <button
                                disabled={isLoading}
                                onClick={() => handleStatusChange(order.id, 'Cancelled')}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-200/60 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            )}

                            <button
                              disabled={isLoading}
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Delete Order Record"
                              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-black/5 shadow-xs flex items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or UID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F6F8] rounded-xl border border-transparent focus:border-black/20 focus:bg-white text-xs sm:text-sm font-medium outline-none transition-all"
                />
              </div>

              <div className="text-xs text-gray-500 font-semibold hidden sm:block">
                Showing {filteredUsers.length} of {users.length} Users
              </div>
            </div>

            {/* Users Table / Card Grid */}
            <div className="bg-white rounded-3xl border border-black/5 shadow-xs overflow-hidden">
              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">No Users Found</h3>
                  <p className="text-xs text-gray-500">
                    {userSearch ? 'No user matches the current search query.' : 'Users will populate automatically as they log in.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => {
                    const isAdmin = user.role === 'admin';
                    const userSpecificOrders = orders.filter(o => o.userId === user.uid || (user.email && o.userEmail === user.email));
                    const totalSpent = userSpecificOrders.reduce((sum, o) => sum + (o.price || 0), user.totalSpent || 0);

                    return (
                      <div
                        key={user.uid}
                        className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#FAFBFD] transition-colors"
                      >
                        {/* User Profile Info */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName}
                              className="w-12 h-12 rounded-2xl object-cover border border-black/10 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white font-bold flex items-center justify-center text-base shrink-0">
                              {(user.displayName || user.email || 'U')[0].toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">
                                {user.displayName || 'Player'}
                              </h4>

                              {/* Role Badge */}
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  isAdmin
                                    ? 'bg-amber-400 text-black'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {user.role || 'user'}
                              </span>
                            </div>

                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {user.email || 'No email associated'}
                            </div>

                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                              Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Financial Stats & Balances */}
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                          <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">
                              Wallet Balance
                            </div>
                            <div className="text-sm sm:text-base font-extrabold text-emerald-600 flex items-center gap-1">
                              <span>${(user.walletBalance || 0).toFixed(2)}</span>
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">
                              Total Spent
                            </div>
                            <div className="text-sm sm:text-base font-extrabold text-gray-900">
                              ${totalSpent.toFixed(2)}
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">
                              Orders
                            </div>
                            <button
                              onClick={() => setSelectedUserOrders({ user, userOrders: userSpecificOrders })}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            >
                              {userSpecificOrders.length} orders
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setEditBalanceAmount((user.walletBalance || 0).toString());
                                setBalanceActionType('set');
                              }}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Balance</span>
                            </button>

                            <button
                              onClick={() => handleToggleUserRole(user)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isAdmin
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                              }`}
                            >
                              {isAdmin ? 'Demote to User' : 'Make Admin'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* EDIT USER BALANCE MODAL */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Manage User Balance
                    </h3>
                    <p className="text-xs text-gray-500">
                      {editingUser.displayName || editingUser.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#F6F6F8] rounded-2xl p-4 mb-4 border border-black/5">
                <div className="text-xs text-gray-500 font-semibold mb-1">Current Balance</div>
                <div className="text-2xl font-extrabold text-gray-900">
                  ${(editingUser.walletBalance || 0).toFixed(2)}
                </div>
              </div>

              {/* Action type selection */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setBalanceActionType('add')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    balanceActionType === 'add'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  + Add Funds
                </button>
                <button
                  onClick={() => setBalanceActionType('deduct')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    balanceActionType === 'deduct'
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  - Deduct
                </button>
                <button
                  onClick={() => setBalanceActionType('set')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    balanceActionType === 'set'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Set Exact
                </button>
              </div>

              {/* Amount input */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {balanceActionType === 'add' && 'Amount to Add ($)'}
                  {balanceActionType === 'deduct' && 'Amount to Deduct ($)'}
                  {balanceActionType === 'set' && 'New Exact Balance ($)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={editBalanceAmount}
                    onChange={(e) => setEditBalanceAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-[#F6F6F8] rounded-xl border border-transparent focus:border-black/20 focus:bg-white text-base font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs sm:text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isSavingBalance}
                  onClick={handleSaveUserBalance}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingBalance ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Balance</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER ORDER HISTORY MODAL */}
      <AnimatePresence>
        {selectedUserOrders && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-black/10 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Order History for {selectedUserOrders.user.displayName || selectedUserOrders.user.email}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Total {selectedUserOrders.userOrders.length} purchases recorded
                  </p>
                </div>

                <button
                  onClick={() => setSelectedUserOrders(null)}
                  className="p-1.5 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-3 flex-1">
                {selectedUserOrders.userOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No orders placed by this user yet.
                  </div>
                ) : (
                  selectedUserOrders.userOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-black/5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={ord.productImage}
                          alt={ord.productName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-gray-900">
                            {ord.productName} — {ord.amount}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            UID: <span className="font-mono font-bold text-gray-800">{ord.userGameId}</span> • {ord.timestamp}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-extrabold text-gray-900">
                          ${ord.price.toFixed(2)}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            ord.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
