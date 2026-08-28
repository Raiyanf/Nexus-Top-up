/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Copy, 
  Check, 
  AlertCircle, 
  Smartphone, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Info,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, TopupOption, PaymentCategory, PAYMENT_METHODS, TOPUP_OPTIONS, OrderRecord } from '../types';
import { User } from '../firebase';

interface ProductDetailPageProps {
  product: Product;
  currentUser: User | null;
  onBack: () => void;
  onOrderPlaced: (order: OrderRecord) => void;
  onOpenAuthModal: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  currentUser,
  onBack,
  onOrderPlaced,
  onOpenAuthModal
}) => {
  const options = TOPUP_OPTIONS[product.id] || TOPUP_OPTIONS.ff;
  
  // State
  const [selectedOption, setSelectedOption] = useState<TopupOption>(options[0]);
  const [userGameId, setUserGameId] = useState('');
  const [userZoneId, setUserZoneId] = useState('');
  const [paymentCategory, setPaymentCategory] = useState<PaymentCategory>('bkash');
  
  // Payment specifics
  const [bkashNumber, setBkashNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'custom'>('gpay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [walletEmail, setWalletEmail] = useState(currentUser?.email || '');

  // Process & status
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showIdGuide, setShowIdGuide] = useState(false);

  // Card formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  const handleCheckout = () => {
    if (!userGameId.trim()) {
      setErrorMessage(`Please enter your ${product.name} Player ID / UID to receive your top-up.`);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    if (product.id === 'mlbb' && !userZoneId.trim()) {
      setErrorMessage('Please enter your 4-digit Zone ID for Mobile Legends.');
      return;
    }

    if (paymentCategory === 'bkash' && !bkashNumber.trim()) {
      setErrorMessage('Please enter your bKash / Nagad mobile number.');
      return;
    }

    if (paymentCategory === 'upi' && selectedUpiApp === 'custom' && !upiId.trim()) {
      setErrorMessage('Please enter your UPI ID (e.g. yourname@upi).');
      return;
    }

    if (paymentCategory === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry.trim()) {
        setErrorMessage('Please enter card expiration date.');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('Please enter card CVV.');
        return;
      }
    }

    if (paymentCategory === 'wallet' && !walletEmail.trim()) {
      setErrorMessage('Please enter your wallet email address.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    const generatedId = 'NEX-' + Math.floor(100000 + Math.random() * 900000);

    // Simulate instant delivery on game server
    setTimeout(() => {
      setIsProcessing(false);
      setCompletedOrderId(generatedId);
      setOrderCompleted(true);

      const record: OrderRecord = {
        id: generatedId,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        userGameId: userGameId.trim(),
        userZoneId: userZoneId.trim() || undefined,
        amount: selectedOption.amount,
        price: selectedOption.price,
        paymentCategory: paymentCategory.toUpperCase(),
        status: 'Delivered',
        timestamp: new Date().toLocaleString(),
        userEmail: currentUser?.email || undefined,
        userDisplayName: currentUser?.displayName || undefined
      };

      onOrderPlaced(record);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1400);
  };

  const copyOrderId = () => {
    if (completedOrderId) {
      navigator.clipboard.writeText(completedOrderId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] pb-24">
      {/* Top Header Banner */}
      <div className="bg-white border-b border-black/5 sticky top-16 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-black transition-colors px-2 py-1 -ml-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Games</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> Direct Server Credit
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-4 sm:pt-6">
        {/* Game Title & Hero card */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-black/5 shadow-xs mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-md bg-gray-100">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">{product.name} Top-Up</h1>
              <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded-md uppercase">
                Official
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 max-w-xl leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Instant Delivery (30s)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Safe ID Only Topup
              </span>
            </div>
          </div>
        </div>

        {/* Success Screen if completed */}
        {orderCompleted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-md text-center max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">Top-Up Order Successful!</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Your credits have been sent directly to your <b className="text-gray-900">{product.name}</b> account.
            </p>

            {/* Receipt card */}
            <div className="bg-[#F9F9FB] rounded-2xl p-5 border border-black/5 text-left mb-6 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500">Order / Invoice ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-gray-900 text-sm">{completedOrderId}</span>
                  <button 
                    onClick={copyOrderId}
                    className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Game Item</span>
                <span className="font-bold text-emerald-600 text-sm">{selectedOption.amount}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Player UID</span>
                <span className="font-mono font-bold text-gray-900">{userGameId} {userZoneId ? `(${userZoneId})` : ''}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Channel</span>
                <span className="font-semibold uppercase text-gray-800">{paymentCategory} (0% Fee)</span>
              </div>

              {currentUser && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">User Account</span>
                  <span className="text-gray-700">{currentUser.email}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
                <span className="font-bold text-gray-800">Total Paid</span>
                <span className="font-bold text-black text-base">${selectedOption.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onBack}
                className="flex-1 bg-black text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-black/80 transition-all shadow-sm cursor-pointer"
              >
                Explore More Games
              </button>
              <button
                onClick={() => {
                  setOrderCompleted(false);
                  setUserGameId('');
                }}
                className="flex-1 bg-white text-gray-800 border border-gray-300 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all cursor-pointer"
              >
                Top-up Again
              </button>
            </div>
          </motion.div>
        ) : (
          /* Step-by-Step Checkout Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Steps Column (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Error banner */}
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-3 shadow-xs"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* STEP 1: Enter Player ID / Account Info */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900">Enter Game Account Info</h3>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => setShowIdGuide(!showIdGuide)}
                    className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>How to find ID?</span>
                  </button>
                </div>

                {/* ID Guide expandable */}
                {showIdGuide && (
                  <div className="mb-4 p-3 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed">
                    <p className="font-semibold mb-1">💡 Finding your {product.name} ID:</p>
                    <p className="text-[11px] text-blue-800">{product.idHelpText}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={product.id === 'mlbb' ? 'sm:col-span-2' : 'sm:col-span-3'}>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Player ID / User ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={product.idPlaceholder}
                      value={userGameId}
                      onChange={(e) => {
                        setUserGameId(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full px-4 py-3 bg-[#F8F8F9] rounded-xl border border-gray-200 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 outline-none text-xs sm:text-sm font-medium transition-all"
                    />
                  </div>

                  {product.id === 'mlbb' && (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Zone ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2041"
                        value={userZoneId}
                        onChange={(e) => {
                          setUserZoneId(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        className="w-full px-4 py-3 bg-[#F8F8F9] rounded-xl border border-gray-200 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5 outline-none text-xs sm:text-sm font-medium transition-all"
                      />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  No password or login required. Diamonds are credited directly to this Game ID safely.
                </p>
              </div>

              {/* STEP 2: Select Top-Up Amount */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900">Select Top-Up Amount</h3>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {options.length} Packages Available
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {options.map((opt) => {
                    const isSelected = selectedOption.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedOption(opt)}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden cursor-pointer ${
                          isSelected
                            ? 'border-black bg-black text-white shadow-md ring-2 ring-black/10 scale-[1.01]'
                            : 'border-gray-200 bg-[#FAFAFA] hover:border-gray-400 hover:bg-white text-gray-800'
                        }`}
                      >
                        {opt.tag && (
                          <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {opt.tag}
                          </span>
                        )}

                        <div>
                          <div className="font-bold text-xs sm:text-sm mb-1 leading-snug pr-8">
                            {opt.amount}
                          </div>
                          {opt.bonus && (
                            <div className={`text-[10px] font-semibold ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`}>
                              {opt.bonus}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-black/10 flex items-baseline justify-between">
                          <span className={`text-xs sm:text-sm font-extrabold ${isSelected ? 'text-white' : 'text-gray-950'}`}>
                            ${opt.price.toFixed(2)}
                          </span>
                          <span className={`text-[10px] ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                            ~ ৳{(opt.price * 125).toFixed(0)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: Payment Method Selection */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900">Select Payment Method</h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> 0% Extra Fee
                  </span>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-[#EEEEEE] rounded-2xl mb-4">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = paymentCategory === method.category;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setPaymentCategory(method.category);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-white text-black shadow-sm'
                            : 'text-gray-600 hover:text-black hover:bg-white/60'
                        }`}
                      >
                        {method.category === 'bkash' && <Smartphone className="w-3.5 h-3.5 text-pink-600" />}
                        {method.category === 'upi' && <QrCode className="w-3.5 h-3.5 text-purple-600" />}
                        {method.category === 'card' && <CreditCard className="w-3.5 h-3.5 text-blue-600" />}
                        {method.category === 'wallet' && <Wallet className="w-3.5 h-3.5 text-emerald-600" />}
                        <span className="truncate">{method.name.split('/')[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Payment Forms */}
                <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200">
                  {/* bKash / Nagad Form */}
                  {paymentCategory === 'bkash' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800">bKash / Nagad Instant Checkout</span>
                        <span className="text-emerald-600 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                          Auto Verification
                        </span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Enter bKash / Nagad Mobile Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 017XXXXXXXX or 018XXXXXXXX"
                          value={bkashNumber}
                          onChange={(e) => setBkashNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-xs font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">
                        You will receive an instant push notification on your mobile banking app to authorize the transaction.
                      </p>
                    </div>
                  )}

                  {/* UPI Form */}
                  {paymentCategory === 'upi' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800">UPI Instant Payment</span>
                        <span className="text-purple-600 font-bold text-[10px] bg-purple-100 px-2 py-0.5 rounded">
                          Instant QR
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {(['gpay', 'phonepe', 'paytm', 'custom'] as const).map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setSelectedUpiApp(app)}
                            className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold cursor-pointer ${
                              selectedUpiApp === app 
                                ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold' 
                                : 'border-gray-200 bg-white text-gray-600'
                            }`}
                          >
                            {app === 'gpay' ? 'Google Pay' : app === 'phonepe' ? 'PhonePe' : app === 'paytm' ? 'Paytm' : 'Custom UPI'}
                          </button>
                        ))}
                      </div>
                      {selectedUpiApp === 'custom' ? (
                        <div>
                          <input
                            type="text"
                            placeholder="username@okhdfcbank or mobile@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-purple-600 outline-none text-xs font-mono"
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-between text-xs">
                          <span className="text-gray-600">Dynamic Payment Link</span>
                          <span className="font-bold text-purple-700">Ready on Checkout</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Form */}
                  {paymentCategory === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="4532 0182 9384 8892"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-blue-600 outline-none text-xs font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="08/28"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-blue-600 outline-none text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">CVV</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-blue-600 outline-none text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wallet Form */}
                  {paymentCategory === 'wallet' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Wallet Email / ID</label>
                        <input
                          type="email"
                          placeholder="your-paypal-email@example.com"
                          value={walletEmail}
                          onChange={(e) => setWalletEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-emerald-600 outline-none text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Summary & Checkout Action (1 Col) */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/5 shadow-xs sticky top-32">
                <h3 className="font-bold text-sm sm:text-base text-gray-950 mb-4 pb-3 border-b border-gray-100">
                  Order Summary
                </h3>

                {/* Google Sync Status */}
                {currentUser ? (
                  <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <div className="font-bold truncate">{currentUser.displayName || 'Google User'}</div>
                      <div className="text-[10px] text-emerald-700 truncate">{currentUser.email}</div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="w-full mb-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl p-3 flex items-center justify-between text-xs text-blue-900 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span className="text-[11px] font-semibold">Sign in for Order History</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 underline">Login</span>
                  </button>
                )}

                {/* Line items */}
                <div className="space-y-2.5 text-xs text-gray-600 mb-5">
                  <div className="flex justify-between">
                    <span>Game</span>
                    <span className="font-semibold text-gray-900">{product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Package</span>
                    <span className="font-bold text-emerald-600">{selectedOption.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Player ID</span>
                    <span className="font-mono font-semibold text-gray-900 truncate max-w-[130px]">
                      {userGameId || 'Not Entered'} {userZoneId ? `(${userZoneId})` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Gateway</span>
                    <span className="font-semibold uppercase text-gray-900">{paymentCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee</span>
                    <span className="font-semibold text-emerald-600">FREE ($0.00)</span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                    <span className="font-bold text-gray-900 text-sm">Total Payable</span>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-black">${selectedOption.price.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-500">~ ৳{(selectedOption.price * 125).toFixed(0)} BDT</div>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-black hover:bg-black/85 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-75 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Processing Top-Up...</span>
                    </div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Order Now • ${selectedOption.price.toFixed(2)}</span>
                    </>
                  )}
                </button>

                <div className="mt-4 space-y-2 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Instant automatic server delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>256-Bit SSL Encrypted & Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
