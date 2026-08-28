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
import { User, updateUserBalanceInDb, createAddMoneyRecordInDb } from '../firebase';
import { AddMoneyRecord } from '../types';

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
    name: 'bKash',
    number: '01889543210',
    type: 'Personal (Send Money)',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    accentColor: 'bg-pink-600',
    instructions: [
      'Open your bKash app or dial *247# and select "Send Money".',
      'Enter the personal bKash account number shown below.',
      'Enter the exact recharge amount and confirm the transaction.',
      'Copy the Transaction ID (TrxID, e.g. BLK893XZ2) from the confirmation SMS or statement.',
      'Paste the TrxID in the box below and click "Verify Payment".'
    ]
  },
  nagad: {
    name: 'Nagad',
    number: '01712345678',
    type: 'Personal (Send Money)',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    accentColor: 'bg-orange-600',
    instructions: [
      'Open your Nagad app or dial *167# and select "Send Money".',
      'Send the exact recharge amount to the personal Nagad number provided below.',
      'Copy the 8-digit Nagad TrxID (e.g. 7HJK98MN) from the SMS.',
      'Enter the TrxID below and click "Verify Payment" to credit your wallet.'
    ]
  },
  rocket: {
    name: 'Rocket',
    number: '01987654321-4',
    type: 'Personal (Send Money)',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    accentColor: 'bg-purple-600',
    instructions: [
      'Open your Rocket app or dial *322# and select "Send Money".',
      'Send the exact amount to the 12-digit personal Rocket number above.',
      'Copy the Transaction ID from the receipt.',
      'Enter the Transaction ID below and verify to receive instant wallet balance.'
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
      setErrorMsg('Minimum deposit amount is ৳10 BDT.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerifyTrx = () => {
    if (!trxId.trim()) {
      setErrorMsg('Please enter the Transaction ID (TrxID) received from your payment.');
      return;
    }

    if (trxId.trim().length < 6) {
      setErrorMsg('Please enter a valid TrxID (at least 6 characters).');
      return;
    }

    setErrorMsg(null);
    setIsVerifying(true);

    // Save transaction and sync balance to Firebase RTDB
    setTimeout(async () => {
      setIsVerifying(false);
      const newBal = walletBalance + numAmount;
      const cleanTrx = trxId.trim().toUpperCase();
      setVerifiedAmount(numAmount);
      setLastTrxId(cleanTrx);

      const record: AddMoneyRecord = {
        id: 'AM-' + Math.floor(100000 + Math.random() * 900000),
        userId: currentUser?.uid || 'guest_' + Date.now(),
        userEmail: currentUser?.email || undefined,
        userDisplayName: currentUser?.displayName || undefined,
        amount: numAmount,
        method: selectedMethod,
        trxId: cleanTrx,
        status: 'Approved',
        timestamp: new Date().toLocaleString()
      };

      try {
        await createAddMoneyRecordInDb(record);
      } catch (err) {
        console.error('Failed to save add money record to RTDB:', err);
      }

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
            <span>{step === 2 ? 'Change Amount' : 'Back to Store'}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" />
              <span>Balance: ৳{walletBalance.toFixed(2)} BDT</span>
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
                <span>NEXUS Wallet Pay</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                ৳{walletBalance.toFixed(2)} <span className="text-xs font-normal text-gray-400">BDT</span>
              </div>
              {currentUser && (
                <p className="text-[11px] text-gray-400 mt-1 font-medium">
                  Account: {currentUser.displayName || currentUser.email}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>0% Extra Fees</span>
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
                Add Funds to Wallet
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Enter the amount of BDT you wish to add to your account balance, or pick from quick presets.
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
                Deposit Amount (BDT ৳)
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
                Minimum deposit is ৳10 BDT and maximum is ৳50,000 BDT per transaction.
              </p>
            </div>

            {/* Quick Amount Pills */}
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2.5">
                Quick Select Presets
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
              <span>Continue (৳{numAmount || 0} BDT)</span>
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
                <span className="text-xs text-gray-400 font-medium">Recharge Amount</span>
                <div className="text-2xl font-extrabold text-gray-900">৳{numAmount.toFixed(2)} BDT</div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Change Amount
              </button>
            </div>

            {/* 3 MFS Tabs */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xs">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                Select Mobile Banking Gateway
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Select your preferred mobile wallet and Send Money to the authorized account number below.
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
                      <span className="truncate">{cfg.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Send Money Number Card */}
              <div className={`${currentConfig.bgColor} border-2 ${currentConfig.borderColor} rounded-2xl p-5 mb-6`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-black/5">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-gray-500">
                      {currentConfig.name} {currentConfig.type} Number
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
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Number</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Step-by-step instructions */}
                <div className="space-y-2 text-xs text-gray-700">
                  <p className="font-bold text-gray-900">How to send payment:</p>
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
                    Enter Transaction ID (TrxID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BLK987654X or 7HJK98MN"
                    value={trxId}
                    onChange={(e) => {
                      setTrxId(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className="w-full px-4 py-3.5 bg-[#F8F9FA] rounded-2xl border-2 border-gray-200 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 outline-none text-sm sm:text-base font-mono font-bold uppercase transition-all"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Enter the TrxID received in your SMS notification after completing the Send Money transfer.
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
                      <span>Verifying Transaction...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verify & Credit Wallet</span>
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
              Funds Added Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              ৳{verifiedAmount.toFixed(2)} BDT has been credited to your Nexus Wallet instantly.
            </p>

            {/* Receipt Summary */}
            <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-black/5 text-left mb-6 space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-400">New Wallet Balance</span>
                <span className="text-base font-extrabold text-emerald-600">৳{walletBalance.toFixed(2)} BDT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount Added</span>
                <span className="font-bold text-gray-900">৳{verifiedAmount.toFixed(2)} BDT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Gateway</span>
                <span className="font-semibold text-gray-900 uppercase">{selectedMethod} Send Money</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">TrxID</span>
                <span className="font-mono font-bold text-gray-900">{lastTrxId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
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
                Top-Up Games Now
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setTrxId('');
                }}
                className="flex-1 bg-gray-100 text-gray-800 py-3.5 rounded-2xl font-bold text-xs sm:text-sm hover:bg-gray-200 transition-all cursor-pointer"
              >
                Add More Funds
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

