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
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  syncUserProfileOnLogin,
  type User 
} from '../firebase';

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
  const [authTab, setAuthTab] = useState<'google' | 'email-signin' | 'email-signup'>('google');
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Email/Password Form States
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      
      // Save/Sync user profile immediately to Firebase Realtime Database
      await syncUserProfileOnLogin(user);

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
        setErrorMsg('Domain needs to be authorized in Firebase Authentication settings.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setErrorType('cancelled');
        setErrorMsg('Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setErrorType('blocked');
        setErrorMsg('Popup was blocked by your browser. Please allow popups or use Email sign in.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setErrorType('cancelled');
        setErrorMsg('Another login popup is already active. Please check your browser tabs.');
      } else {
        setErrorType('other');
        setErrorMsg(error.message || 'Failed to sign in with Google. You can also sign up with Email below.');
      }
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setErrorType(null);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;

      if (displayName.trim()) {
        try {
          await updateProfile(user, { displayName: displayName.trim() });
        } catch (e) {
          console.warn('Failed to update display name on user', e);
        }
      }

      // Sync user profile to Realtime Database
      await syncUserProfileOnLogin(user, displayName.trim());

      setAuthSuccess(true);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      setTimeout(() => {
        setIsLoading(false);
        setAuthSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Sign Up Error:', err);
      setIsLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please sign in instead.');
        setAuthTab('email-signin');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Failed to create account.');
      }
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setErrorType(null);

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;

      // Sync to Firebase Realtime Database
      await syncUserProfileOnLogin(user);

      setAuthSuccess(true);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      setTimeout(() => {
        setIsLoading(false);
        setAuthSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Sign In Error:', err);
      setIsLoading(false);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. Please verify and try again.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Invalid email address format.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in.');
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
            className="absolute top-5 right-5 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors z-20 cursor-pointer"
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
                <h3 className="text-xl font-bold text-gray-900">{currentUser.displayName || 'Nexus Player'}</h3>
                <p className="text-sm text-gray-500 font-medium">{currentUser.email}</p>
                <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Synchronized with Realtime Database
                </div>
              </div>

              <div className="bg-[#F8F8F8] rounded-2xl p-4 border border-black/5 mb-6 space-y-2.5 text-xs text-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account UID</span>
                  <span className="font-mono text-[11px] text-gray-800 truncate max-w-[200px]">{currentUser.uid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Database Status</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Realtime Database Active
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
                  Nexus Account Access
                </h2>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Sign in or register to sync your wallet balance and order history with Firebase Realtime Database.
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex p-1 bg-gray-100 rounded-2xl mb-6 border border-gray-200/60">
                <button
                  type="button"
                  onClick={() => { setAuthTab('google'); setErrorMsg(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    authTab === 'google' 
                      ? 'bg-white text-black shadow-xs' 
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('email-signin'); setErrorMsg(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    authTab === 'email-signin' 
                      ? 'bg-white text-black shadow-xs' 
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('email-signup'); setErrorMsg(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    authTab === 'email-signup' 
                      ? 'bg-white text-black shadow-xs' 
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Error Box */}
              {errorType === 'unauthorized-domain' ? (
                <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-amber-950 text-xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm mb-1">Domain Authorization Notice</h4>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        To enable Google popup login on this preview container, add this domain to Firebase Authorized Domains (or switch to the <b>Sign In / Register</b> tab to sign in with Email & Password instantly):
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
                      <span>1. Copy domain:</span>
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
                            <span>Copied!</span>
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

                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                    <p className="text-[11px] text-gray-700 leading-relaxed">
                      <b>2.</b> Click below to open <b>Firebase Settings &gt; Authorized domains</b> and paste the domain:
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
                </div>
              ) : errorMsg ? (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold mb-0.5">Notice</p>
                    <p className="text-[11px] leading-relaxed">{errorMsg}</p>
                  </div>
                </div>
              ) : null}

              {/* Success Notification */}
              {authSuccess && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span className="font-semibold">Successfully connected! Syncing database...</span>
                </div>
              )}

              {/* TAB 1: Google Sign In */}
              {authTab === 'google' && (
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
                      <span>One-Click Sync to Realtime Database</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed pl-6">
                      Your profile, wallet balance, and top-up orders will be saved automatically to Firebase.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: Email Sign In */}
              {authTab === 'email-signin' && (
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="player@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || authSuccess}
                    className="w-full bg-black text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-black/85 transition-all shadow-md active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 3: Email Sign Up / Register */}
              {authTab === 'email-signup' && (
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Display Name / Gamertag
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. ProGamer99"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="player@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || authSuccess}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Account & Register</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Footer text */}
              <p className="text-[10px] text-center text-gray-400 mt-5 leading-relaxed">
                By continuing, you agree to NEXUS Topup Terms of Service and Privacy Policy. All profile and order data is synced in real time.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
