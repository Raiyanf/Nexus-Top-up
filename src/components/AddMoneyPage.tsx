/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Wallet, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  PhoneCall, 
  ArrowRight,
  Info,
  Clock,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../firebase';

interface AddMoneyPageProps {
  currentUser: User | null;
  walletBalance: number;
  onBalanceUpdated: (newBalance: number) => void;
  onGoHome: () => void;
  onOpenAuthModal: () => void;
}

type MfsMethod = 'bkash' | 'nagad' | 'rocket';

interface MfsConfig {
  name: string;
  number: string;
  type: string;
  color: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  instructions: string[];
}

const MFS_CONFIGS: Record<MfsMethod, MfsConfig> = {
  bkash: {
    name: 'bKash (বিকাশ)',
    number: '01889543210',
    type: 'Personal (Send Money)',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    accentColor: 'bg-pink-600',
    instructions: [
      'আপনার bKash অ্যাপ অথবা *247# ডায়াল করে "Send Money" অপশনে যান।',
      'নিচে দেওয়া পার্সোনাল বিকাশ নম্বরে সঠিক টাকা সেন্ড মানি করুন।',
      'সেন্ড মানি সফল হলে ফিরতি SMS বা স্টেটমেন্ট থেকে প্রাপ্ত "TrxID" (যেমন: BLK893XZ2) কপি করুন।',
      'নিচের ঘরে TrxID বসিয়ে "Verify Payment" বাটনে ক্লিক করুন।'
    ]
  },
  nagad: {
    name: 'Nagad (নগদ)',
    number: '01712345678',
    type: 'Personal (Send Money)',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    accentColor: 'bg-orange-600',
    instructions: [
      'আপনার Nagad অ্যাপ অথবা *167# ডায়াল করে "Send Money" অপশনে যান।',
      'নিচে দেওয়া নগদ নম্বরে সঠিক অ্যামাউন্ট সেন্ড মানি করুন।',
      'ট্রানজেকশন সম্পন্ন হওয়ার পর Nagad TrxID (যেমন: 7HJK98MN) কপি করুন।',
      'নিচের ঘরে TrxID বসিয়ে ভেরিফাই করুন।'
    ]
  },
  rocket: {
    name: 'Rocket (রকেট)',
    number: '01987654321-4',
    type: 'Personal (Send Money)',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    accentColor: 'bg-purple-600',
    instructions: [
      'আপনার Rocket অ্যাপ অথবা *322# ডায়াল করে "Send Money" অপশনে যান।',
      'উপরে উল্লিখিত ১২ ডিজিটের রকেট নম্বরে টাকা সেন্ড মানি করুন।',
      'ট্রানজেকশন সফল হলে পাওয়া Transaction ID কপি করুন।',
      'নিচের ইনপুট বক্সে ট্রানজেকশন আইডি দিয়ে ভেরিফাই করুন।'
    ]
  }
};

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];

export const AddMoneyPage: React.FC<AddMoneyPageProps> = ({
  currentUser,
  walletBalance,
  onBalanceUpdated,
  onGoHome,
  onOpenAuthModal
}) => {
  // Step State: 1 = Enter Amount, 2 = Choose MFS & Enter TrxID, 3 = Success Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amountInput, setAmountInput] = useState<string>('500');
  const [selectedMethod, setSelectedMethod] = useState<MfsMethod>('bkash');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedTrxExample, setCopiedTrxExample] = useState(false);
  
  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifiedAmount, setVerifiedAmount] = useState<number>(0);
  const [lastTrxId, setLastTrxId] = useState('');

  const numAmount = parseFloat(amountInput) || 0;
  const currentConfig = MFS_CONFIGS[selectedMethod];

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(currentConfig.number);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleContinueToPayment = () => {
    if (numAmount < 10) {
      setErrorMsg('সর্বনিম্ন ১০ টাকা অ্যাড করা যাবে।');
      return;
    }
    setErrorMsg(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerifyTrx = () => {
    if (!trxId.trim()) {
      setErrorMsg('অনুগ্রহ করে সেন্ড মানি করার পর পাওয়া ট্রানজেকশন আইডি (TrxID) লিখুন।');
      return;
    }

    if (trxId.trim().length < 6) {
      setErrorMsg('অনুগ্রহ করে সঠিক ফরম্যাটের TrxID (কমপক্ষে ৬ সংখ্যার) লিখুন।');
      return;
    }

    setErrorMsg(null);
    setIsVerifying(true);

    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false);
      const newBal = walletBalance + numAmount;
      setVerifiedAmount(numAmount);
      setLastTrxId(trxId.trim().toUpperCase());
      onBalanceUpdated(newBal);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] pb-24">
      {/* Top Bar */}
      <div className="bg-white border-b border-black/5 sticky top-16 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={step === 2 ? () => setStep(1) : onGoHome}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-black transition-colors px-2 py-1 -ml-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 2 ? 'অ্যামাউন্ট পরিবর্তন করুন' : 'হোম পেজে ফিরে যান'}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" />
              <span>ব্যালেন্স: ৳{walletBalance.toFixed(2)}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-5 sm:pt-8">
        {/* Wallet Balance Hero Card */}
        <div className="bg-gradient-to-br from-gray-950 to-gray-800 text-white rounded-3xl p-6 sm:p-7 shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-300 font-medium mb-1">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>NEXUS Wallet (ওয়ালেট পে)</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                ৳{walletBalance.toFixed(2)} <span className="text-xs font-normal text-gray-400">BDT</span>
              </div>
              {currentUser && (
                <p className="text-[11px] text-gray-400 mt-1 font-medium">
                  অ্যাকাউন্ট: {currentUser.displayName || currentUser.email}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>০% অতিরিক্ত চার্জ</span>
              </span>
            </div>
          </div>
        </div>

        {/* STEP 1: Enter Amount */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xs"
          >
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                ওয়ালেটে টাকা যোগ করুন (Add Money)
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                কত টাকা ওয়ালেটে জমা করতে চান তা লিখুন অথবা কুইক সিলেক্টর থেকে নির্বাচন করুন।
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Amount input */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                টাকার পরিমাণ লিখুন (BDT)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">
                  ৳
                </span>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full pl-10 pr-4 py-4 bg-[#F8F9FA] rounded-2xl border-2 border-gray-200 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 outline-none text-2xl font-extrabold text-gray-900 transition-all"
                  placeholder="500"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                সর্বনিম্ন ১০ টাকা এবং সর্বোচ্চ ৫০,০০০ টাকা একবারে যোগ করা যাবে।
              </p>
            </div>

            {/* Quick Amount Pills */}
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2.5">
                কুইক অ্যামাউন্ট
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmountInput(amt.toString());
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      amountInput === amt.toString()
                        ? 'border-black bg-black text-white shadow-xs'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleContinueToPayment}
              className="w-full bg-black hover:bg-black/85 text-white py-4 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] cursor-pointer"
            >
              <span>কন্টিনিউ করুন (৳{numAmount || 0})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* STEP 2: Choose Method (bKash / Nagad / Rocket), Send Money & Enter TrxID */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header / Selected Amount summary */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-medium">যোগ করার অ্যামাউন্ট</span>
                <div className="text-2xl font-extrabold text-gray-900">৳{numAmount.toFixed(2)}</div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                অ্যামাউন্ট পরিবর্তন
              </button>
            </div>

            {/* 3 MFS Tabs */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xs">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                পেমেন্ট মেথড নির্বাচন করুন
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                যেকোনো একটি মেথড সিলেক্ট করে নিচে দেওয়া নাম্বারে সেন্ড মানি করুন।
              </p>

              {/* Tabs */}
              <div className="grid grid-cols-3 gap-2.5 p-1.5 bg-[#EEEEEE] rounded-2xl mb-6">
                {(['bkash', 'nagad', 'rocket'] as const).map((method) => {
                  const cfg = MFS_CONFIGS[method];
                  const isSelected = selectedMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        setSelectedMethod(method);
                        setTrxId('');
                        if (errorMsg) setErrorMsg(null);
                      }}
                      className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-white text-gray-900 shadow-md ring-2 ring-black/5'
                          : 'text-gray-600 hover:text-black hover:bg-white/50'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${cfg.accentColor}`} />
                      <span className="truncate">{cfg.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Send Money Number Card */}
              <div className={`${currentConfig.bgColor} border-2 ${currentConfig.borderColor} rounded-2xl p-5 mb-6`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-black/5">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-gray-500">
                      {currentConfig.name} {currentConfig.type} নাম্বার
                    </span>
                    <div className="text-2xl sm:text-3xl font-mono font-extrabold text-gray-950 mt-0.5 tracking-wider">
                      {currentConfig.number}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    {copiedNumber ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">নাম্বার কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>নাম্বার কপি করুন</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Step-by-step instructions */}
                <div className="space-y-2 text-xs text-gray-700">
                  <p className="font-bold text-gray-900">কিভাবে টাকা পাঠাবেন:</p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed text-[11px] sm:text-xs">
                    {currentConfig.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* TrxID Input & Verification */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    ট্রানজেকশন আইডি লিখুন (TrxID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: BLK987654X অথবা 7HJK98MN"
                    value={trxId}
                    onChange={(e) => {
                      setTrxId(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className="w-full px-4 py-3.5 bg-[#F8F9FA] rounded-2xl border-2 border-gray-200 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 outline-none text-sm sm:text-base font-mono font-bold uppercase transition-all"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    টাকা পাঠানোর পর বিকাশ/নগদ/রকেট থেকে এসএমএস-এ আসা TrxID দিন।
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyTrx}
                  disabled={isVerifying}
                  className="w-full bg-black hover:bg-black/85 text-white py-4 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] disabled:opacity-75 cursor-pointer"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>ভেরিফাই করা হচ্ছে...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>পেমেন্ট ভেরিফাই করুন (Verify Payment)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Verification Success Receipt */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-md text-center max-w-xl mx-auto"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              টাকা সফলভাবে যোগ হয়েছে!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              আপনার ওয়ালেটে ৳{verifiedAmount.toFixed(2)} টাকা সাথে সাথে যুক্ত করে দেওয়া হয়েছে।
            </p>

            {/* Receipt Summary */}
            <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-black/5 text-left mb-6 space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-400">নতুন ব্যালেন্স</span>
                <span className="text-base font-extrabold text-emerald-600">৳{walletBalance.toFixed(2)} BDT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">যোগকৃত টাকা</span>
                <span className="font-bold text-gray-900">৳{verifiedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">মেথড</span>
                <span className="font-semibold text-gray-900 uppercase">{selectedMethod} Send Money</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">TrxID</span>
                <span className="font-mono font-bold text-gray-900">{lastTrxId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">স্ট্যাটাস</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Verified & Credited
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onGoHome}
                className="flex-1 bg-black text-white py-3.5 rounded-2xl font-bold text-xs sm:text-sm hover:bg-black/85 transition-all shadow-xs cursor-pointer"
              >
                গেম টপ-আপ করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setTrxId('');
                }}
                className="flex-1 bg-gray-100 text-gray-800 py-3.5 rounded-2xl font-bold text-xs sm:text-sm hover:bg-gray-200 transition-all cursor-pointer"
              >
                আরও টাকা যোগ করুন
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
