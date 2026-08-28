/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  ExternalLink,
  LogOut,
  Copy,
  Check,
  Globe,
  ArrowRight,
  Info
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut, type User } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess?: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseProjectUrl = "https://console.firebase.google.com/project/mnsapp-5926d/authentication/settings";

  const handleCopyDomain = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorType(null);
    setErrorMsg(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setAuthSuccess(true);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      setTimeout(() => {
        setIsLoading(false);
        setAuthSuccess(false);
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Google Sign-in Error:', error);
      setIsLoading(false);

      if (error.code === 'auth/unauthorized-domain') {
        setErrorType('unauthorized-domain');
        setErrorMsg('ডোমেইনটি এখনও Firebase Authentication-এর Authorized domains-এ যুক্ত করা হয়নি। নিচের ধাপগুলো অনুসরণ করে মাত্র ১ ক্লিকে ডোমেইনটি যুক্ত করে নিন:');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setErrorType('cancelled');
        setErrorMsg('Sign-in cancelled by user. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setErrorType('blocked');
        setErrorMsg('Popup was blocked by browser. Please allow popups or open the app in a new browser tab.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setErrorType('cancelled');
        setErrorMsg('Another popup is already open. Please check your browser tabs.');
      } else {
        setErrorType('other');
        setErrorMsg(error.message || 'Failed to sign in with Google. Please check your connection.');
      }
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setIsLoading(false);
      onClose();
    } catch (error: any) {
      console.error('Sign Out Error:', error);
      setIsLoading(false);
      setErrorMsg('Failed to sign out. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-black/5 z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors z-20"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {currentUser ? (
            /* User already signed in view */
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User Avatar'}
                      className="w-20 h-20 rounded-full border-4 border-emerald-100 object-cover shadow-sm mx-auto"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold mx-auto border-4 border-emerald-100">
                      {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{currentUser.displayName || 'Google User'}</h3>
                <p className="text-sm text-gray-500 font-medium">{currentUser.email}</p>
                <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated via Google
                </div>
              </div>

              <div className="bg-[#F8F8F8] rounded-2xl p-4 border border-black/5 mb-6 space-y-2.5 text-xs text-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account Type</span>
                  <span className="font-semibold text-gray-800">Google Verified</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Security</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> End-to-end Encrypted
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Top-up Status</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Ready for Instant Checkout
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={onClose}
                  className="w-full bg-black text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-black/85 transition-all shadow-md cursor-pointer"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-2xl font-semibold text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoading ? 'Signing out...' : 'Sign Out of Account'}
                </button>
              </div>
            </div>
          ) : (
            /* Sign In / Sign Up View */
            <div className="p-7 sm:p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-md">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                  Google Sign In / Sign Up
                </h2>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Sign in instantly with your Google Account for safe top-ups and order tracking.
                </p>
              </div>

              {/* Error Box for Unauthorized Domain */}
              {errorType === 'unauthorized-domain' ? (
                <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-amber-950 text-xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm mb-1">ডোমেইন অথোরাইজেশন প্রয়োজন (১ মিনিটের কাজ)</h4>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Firebase Authentication সুরক্ষার জন্য এই অ্যাপের লাইভ ডোমেইনটি Firebase Console-এ যোগ করতে হবে।
                      </p>
                    </div>
                  </div>

                  {/* Step 1: Copy Domain */}
                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
                      <span>১. আপনার বর্তমান অ্যাপ ডোমেইন কপি করুন:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 font-mono text-[11px] px-3 py-2 rounded-lg truncate border border-gray-200 text-gray-800">
                        {currentHostname}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyDomain}
                        className="px-3 py-2 bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 hover:bg-black/80 transition-all cursor-pointer"
                      >
                        {copiedDomain ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>কপি হয়েছে!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Open Firebase Console */}
                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                    <p className="text-[11px] text-gray-700 leading-relaxed">
                      <b>২.</b> নিচের বাটনে ক্লিক করে <b>Firebase Settings &gt; Authorized domains</b>-এ যান এবং <b>"Add domain"</b>-এ ক্লিক করে উপরের ডোমেইনটি পেস্ট করুন:
                    </p>
                    <a
                      href={firebaseProjectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Firebase Authorized Domains Settings
                    </a>
                  </div>

                  <p className="text-[10px] text-amber-800 text-center font-medium">
                    ডোমেইন যোগ করার পর পুনরায় নিচের <b>"Continue with Google"</b> বাটনে চাপুন।
                  </p>
                </div>
              ) : errorMsg ? (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold mb-0.5">Authentication Notice</p>
                    <p className="text-[11px] leading-relaxed">{errorMsg}</p>
                  </div>
                </div>
              ) : null}

              {/* Success Notification */}
              {authSuccess && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span className="font-semibold">Signed in successfully! Redirecting...</span>
                </div>
              )}

              {/* Google Sign In Button */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || authSuccess}
                  className="w-full bg-white text-gray-800 border-2 border-gray-200 hover:border-black hover:bg-gray-50/50 py-3.5 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                      <span>Connecting Google Account...</span>
                    </div>
                  ) : (
                    <>
                      {/* Official Google SVG Logo */}
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="font-bold text-gray-800">Continue with Google</span>
                    </>
                  )}
                </button>

                {/* Domain Quick Info Pill */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate max-w-[210px]">{currentHostname}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleCopyDomain}
                    className="text-black font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedDomain ? 'Copied' : 'Copy Domain'}
                  </button>
                </div>

                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-black/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>One-Click Login & Automatic Sign Up</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed pl-6">
                    No passwords needed. Your game player IDs and order receipts will be securely synced with your Google account.
                  </p>
                </div>
              </div>

              {/* Footer text */}
              <p className="text-[10px] text-center text-gray-400 mt-5 leading-relaxed">
                By continuing with Google, you agree to NEXUS Topup Terms of Service and Privacy Policy.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
