/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut, 
  onAuthStateChanged, 
  type User 
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  onValue, 
  off, 
  remove 
} from 'firebase/database';
import { UserProfile, OrderRecord, OrderStatus, AddMoneyRecord } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyDGqaMpgfaOwU2HUZJU_2vD7v5hV22czuw",
  authDomain: "mnsapp-5926d.firebaseapp.com",
  databaseURL: "https://mnsapp-5926d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mnsapp-5926d",
  storageBucket: "mnsapp-5926d.firebasestorage.app",
  messagingSenderId: "598844324022",
  appId: "1:598844324022:web:971c7ebb377d9b95ed0e17",
  measurementId: "G-YPMTDSQ5M6"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const ADMIN_EMAILS = [
  'raiyanxzyhi@gmail.com',
  'admin@nexusgaming.com'
];

/**
 * Saves or updates a user profile in Firebase Realtime Database upon authentication (Login or Register).
 * Default role is 'user', but automatically assigns 'admin' if email is in ADMIN_EMAILS or previously set to admin.
 */
export async function syncUserProfileOnLogin(user: User, customDisplayName?: string): Promise<UserProfile> {
  const userRef = ref(rtdb, `users/${user.uid}`);
  let existingProfile: Partial<UserProfile> | null = null;
  
  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      existingProfile = snapshot.val();
    }
  } catch (err) {
    console.warn('Realtime Database read warning, using local cache:', err);
  }

  const isDefaultAdmin = user.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;
  const resolvedRole: 'user' | 'admin' = existingProfile?.role || (isDefaultAdmin ? 'admin' : 'user');
  const now = new Date().toISOString();

  const profile: UserProfile = {
    uid: user.uid,
    displayName: customDisplayName || user.displayName || existingProfile?.displayName || user.email?.split('@')[0] || 'Player',
    email: user.email || '',
    photoURL: user.photoURL || existingProfile?.photoURL || '',
    role: resolvedRole,
    walletBalance: typeof existingProfile?.walletBalance === 'number' ? existingProfile.walletBalance : 0,
    totalSpent: typeof existingProfile?.totalSpent === 'number' ? existingProfile.totalSpent : 0,
    createdAt: existingProfile?.createdAt || now,
    lastLoginAt: now
  };

  try {
    await set(userRef, profile);
    console.log('User profile successfully saved in RTDB:', profile.uid);
  } catch (err) {
    console.error('Realtime Database write error for user profile:', err);
  }

  // Also cache locally for immediate offline/fast access
  try {
    localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(profile));
    localStorage.setItem('nexus_current_user_profile', JSON.stringify(profile));
  } catch {
    // Ignore storage quota error
  }

  return profile;
}

/**
 * Real-time listener for current user's profile
 */
export function listenUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  const userRef = ref(rtdb, `users/${uid}`);
  const listener = onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val() as UserProfile;
      callback(data);
      try {
        localStorage.setItem(`user_profile_${uid}`, JSON.stringify(data));
        localStorage.setItem('nexus_current_user_profile', JSON.stringify(data));
      } catch {}
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn('User profile listener error:', err);
    try {
      const saved = localStorage.getItem(`user_profile_${uid}`);
      if (saved) callback(JSON.parse(saved));
    } catch {}
  });

  return () => {
    off(userRef, 'value', listener);
  };
}

/**
 * Real-time listener for ALL users in the database (For Admin Panel)
 */
export function listenAllUsers(callback: (users: UserProfile[]) => void) {
  const usersRef = ref(rtdb, 'users');
  const listener = onValue(usersRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      const list: UserProfile[] = Object.values(val);
      callback(list);
      try {
        localStorage.setItem('nexus_all_users_cache', JSON.stringify(list));
      } catch {}
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Listen all users error:', err);
    try {
      const cached = localStorage.getItem('nexus_all_users_cache');
      if (cached) callback(JSON.parse(cached));
    } catch {}
  });

  return () => {
    off(usersRef, 'value', listener);
  };
}

/**
 * Update user role in Realtime Database
 */
export async function updateUserRoleInDb(uid: string, role: 'user' | 'admin'): Promise<void> {
  const userRef = ref(rtdb, `users/${uid}`);
  await update(userRef, { role });
}

/**
 * Update user wallet balance in Realtime Database
 */
export async function updateUserBalanceInDb(uid: string, walletBalance: number): Promise<void> {
  const userRef = ref(rtdb, `users/${uid}`);
  await update(userRef, { walletBalance });
}

/**
 * Create an order in Realtime Database under `orders/{orderId}`
 */
export async function createOrderInDb(order: OrderRecord): Promise<void> {
  const orderRef = ref(rtdb, `orders/${order.id}`);
  const payload: OrderRecord = {
    ...order,
    status: order.status || 'Pending'
  };

  try {
    await set(orderRef, payload);
    console.log('Order created in Realtime DB:', order.id);
  } catch (err) {
    console.error('Realtime DB order save error:', err);
  }

  // If userId is present, record in user's sub-collection & update total spent
  if (order.userId) {
    try {
      const userOrderRef = ref(rtdb, `user_orders/${order.userId}/${order.id}`);
      await set(userOrderRef, payload);

      const userRef = ref(rtdb, `users/${order.userId}`);
      const userSnap = await get(userRef);
      if (userSnap.exists()) {
        const u = userSnap.val() as UserProfile;
        const newTotalSpent = (u.totalSpent || 0) + (order.price || 0);
        let newWalletBal = u.walletBalance || 0;
        
        // If payment was made using wallet, deduct balance in DB
        if (order.paymentCategory?.toLowerCase() === 'wallet') {
          newWalletBal = Math.max(0, newWalletBal - (order.price || 0));
        }

        await update(userRef, { 
          totalSpent: newTotalSpent,
          walletBalance: newWalletBal 
        });
      }
    } catch (e) {
      console.warn('Failed to update user order stats in RTDB:', e);
    }
  }

  // Cache to local storage
  try {
    const existingStr = localStorage.getItem('nexus_orders_history');
    const existing: OrderRecord[] = existingStr ? JSON.parse(existingStr) : [];
    const updated = [payload, ...existing.filter(o => o.id !== payload.id)];
    localStorage.setItem('nexus_orders_history', JSON.stringify(updated));
    localStorage.setItem('nexus_orders_v2', JSON.stringify(updated));
  } catch {}
}

/**
 * Create an Add Money transaction record in Realtime Database
 */
export async function createAddMoneyRecordInDb(record: AddMoneyRecord): Promise<void> {
  const recordRef = ref(rtdb, `add_money_records/${record.id}`);
  try {
    await set(recordRef, record);
    console.log('Add money record created in RTDB:', record.id);
  } catch (err) {
    console.error('Failed to create add money record in RTDB:', err);
  }

  // Update user wallet balance in RTDB
  if (record.userId) {
    try {
      const userAddMoneyRef = ref(rtdb, `user_add_money/${record.userId}/${record.id}`);
      await set(userAddMoneyRef, record);

      const userRef = ref(rtdb, `users/${record.userId}`);
      const userSnap = await get(userRef);
      if (userSnap.exists()) {
        const u = userSnap.val() as UserProfile;
        const newBalance = (u.walletBalance || 0) + record.amount;
        await update(userRef, { walletBalance: newBalance });
        console.log(`Updated user ${record.userId} wallet balance to ${newBalance} in RTDB`);
      } else {
        await update(userRef, { 
          uid: record.userId,
          email: record.userEmail || '',
          displayName: record.userDisplayName || 'Player',
          walletBalance: record.amount 
        });
      }
    } catch (e) {
      console.warn('Failed to update user wallet balance in RTDB:', e);
    }
  }

  // Cache locally
  try {
    const cachedStr = localStorage.getItem('nexus_add_money_history');
    const cachedList: AddMoneyRecord[] = cachedStr ? JSON.parse(cachedStr) : [];
    const updatedList = [record, ...cachedList.filter(r => r.id !== record.id)];
    localStorage.setItem('nexus_add_money_history', JSON.stringify(updatedList));
  } catch {}
}

/**
 * Real-time listener for ALL orders across the system (For Admin Panel)
 */
export function listenAllOrdersInDb(callback: (orders: OrderRecord[]) => void) {
  const ordersRef = ref(rtdb, 'orders');
  const listener = onValue(ordersRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      const list: OrderRecord[] = Object.values(val);
      // Sort newest first
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() || b.id.localeCompare(a.id));
      callback(list);
      try {
        localStorage.setItem('nexus_orders_history', JSON.stringify(list));
        localStorage.setItem('nexus_orders_v2', JSON.stringify(list));
      } catch {}
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Listen all orders error:', err);
    try {
      const cached = localStorage.getItem('nexus_orders_history');
      if (cached) callback(JSON.parse(cached));
    } catch {}
  });

  return () => {
    off(ordersRef, 'value', listener);
  };
}

/**
 * Real-time listener for ALL Add Money transactions (For Admin Panel)
 */
export function listenAllAddMoneyInDb(callback: (records: AddMoneyRecord[]) => void) {
  const recordsRef = ref(rtdb, 'add_money_records');
  const listener = onValue(recordsRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      const list: AddMoneyRecord[] = Object.values(val);
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() || b.id.localeCompare(a.id));
      callback(list);
      try {
        localStorage.setItem('nexus_add_money_history', JSON.stringify(list));
      } catch {}
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('Listen all add money error:', err);
    try {
      const cached = localStorage.getItem('nexus_add_money_history');
      if (cached) callback(JSON.parse(cached));
    } catch {}
  });

  return () => {
    off(recordsRef, 'value', listener);
  };
}

/**
 * Update order status (Pending, Completed, Cancelled) in Realtime Database
 */
export async function updateOrderStatusInDb(orderId: string, status: OrderStatus): Promise<void> {
  const orderRef = ref(rtdb, `orders/${orderId}`);
  await update(orderRef, { status });
  
  // Also update local cache
  try {
    const existingStr = localStorage.getItem('nexus_orders_history');
    if (existingStr) {
      const existing: OrderRecord[] = JSON.parse(existingStr);
      const updated = existing.map(o => o.id === orderId ? { ...o, status } : o);
      localStorage.setItem('nexus_orders_history', JSON.stringify(updated));
      localStorage.setItem('nexus_orders_v2', JSON.stringify(updated));
    }
  } catch {}
}

/**
 * Delete order from database
 */
export async function deleteOrderFromDb(orderId: string): Promise<void> {
  const orderRef = ref(rtdb, `orders/${orderId}`);
  await remove(orderRef);
}

export { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  onAuthStateChanged 
};
export type { User };
