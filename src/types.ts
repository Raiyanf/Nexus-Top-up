/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: 'Games' | 'Mobile' | 'Gift Cards';
  image: string;
  bannerImage: string;
  description: string;
  idPlaceholder: string;
  idHelpText: string;
  currencyLabel: string;
  popular?: boolean;
}

export interface TopupOption {
  id: string;
  amount: string;
  price: number;
  currency: string;
  bonus?: string;
  tag?: string;
}

export type PaymentCategory = 'bkash' | 'nagad' | 'upi' | 'card' | 'wallet';

export interface PaymentMethodOption {
  id: PaymentCategory;
  name: string;
  category: PaymentCategory;
  description: string;
  badge?: string;
  fee?: number;
  iconName: string;
}

export interface OrderRecord {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  userGameId: string;
  userZoneId?: string;
  amount: string;
  price: number;
  paymentCategory: string;
  status: 'Delivered' | 'Processing' | 'Completed';
  timestamp: string;
  userEmail?: string;
  userDisplayName?: string;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'bkash',
    name: 'bKash / Nagad',
    category: 'bkash',
    description: 'Instant Mobile Banking with 0% extra gateway fee',
    badge: 'Popular',
    fee: 0,
    iconName: 'Smartphone'
  },
  {
    id: 'upi',
    name: 'UPI / QR Code',
    category: 'upi',
    description: 'Instant pay via Google Pay, PhonePe, Paytm or any UPI app',
    badge: 'Fastest',
    fee: 0,
    iconName: 'QrCode'
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    category: 'card',
    description: 'Visa, Mastercard, RuPay, Amex with 3D Secure protection',
    badge: 'Secure',
    fee: 0,
    iconName: 'CreditCard'
  },
  {
    id: 'wallet',
    name: 'Digital E-Wallets',
    category: 'wallet',
    description: 'PayPal, Apple Pay, Binance Pay & global wallets',
    badge: 'Global',
    fee: 0,
    iconName: 'Wallet'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'ff',
    name: 'Free Fire',
    category: 'Games',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    description: 'Instant Diamond top-up directly to your Garena Free Fire Player ID.',
    idPlaceholder: 'e.g. 1928472910',
    idHelpText: 'To find your Free Fire UID: Open the game, click your profile in the top-left corner, and copy your numerical UID.',
    currencyLabel: 'Diamonds',
    popular: true
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile',
    category: 'Games',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80',
    description: 'Unknown Cash (UC) top-up for PUBG Mobile Global & BGMI.',
    idPlaceholder: 'e.g. 5124892019',
    idHelpText: 'To find your Character ID: Open PUBG Mobile, tap your avatar icon, and copy the numerical Character ID.',
    currencyLabel: 'UC',
    popular: true
  },
  {
    id: 'mlbb',
    name: 'Mobile Legends',
    category: 'Games',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
    description: 'Instant Diamonds for Mobile Legends: Bang Bang (MLBB).',
    idPlaceholder: 'e.g. 12345678 (2041)',
    idHelpText: 'Enter your User ID and 4-digit Zone ID inside parenthesis from your in-game MLBB profile.',
    currencyLabel: 'Diamonds',
    popular: true
  },
  {
    id: 'genshin',
    name: 'Genshin Impact',
    category: 'Games',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80',
    description: 'Genesis Crystals and Blessing of the Welkin Moon.',
    idPlaceholder: 'e.g. 700192841 (Asia/Europe/America)',
    idHelpText: 'Your Genshin UID is displayed on the bottom right corner of your game screen.',
    currencyLabel: 'Genesis Crystals',
    popular: false
  },
  {
    id: 'valorant',
    name: 'Valorant',
    category: 'Games',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    description: 'Riot Points (VP) for weapon skins, battle passes, and agents.',
    idPlaceholder: 'e.g. PlayerName#NA1',
    idHelpText: 'Enter your full Riot ID including the hashtag (#) and tag line.',
    currencyLabel: 'Valorant Points',
    popular: true
  },
  {
    id: 'steam',
    name: 'Steam Wallet',
    category: 'Gift Cards',
    image: 'https://images.unsplash.com/photo-1612287233215-620478051877?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1612287233215-620478051877?w=1200&auto=format&fit=crop&q=80',
    description: 'Digital Steam Gift Card codes delivered immediately to your email.',
    idPlaceholder: 'Enter your Email address',
    idHelpText: 'The Steam Wallet activation code will be instantly shown and sent to this email.',
    currencyLabel: 'USD Code',
    popular: false
  },
  {
    id: 'codm',
    name: 'Call of Duty: Mobile',
    category: 'Games',
    image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1200&auto=format&fit=crop&q=80',
    description: 'CP (COD Points) top-up for Call of Duty: Mobile.',
    idPlaceholder: 'e.g. 6749102849182',
    idHelpText: 'Find your OpenID in CODM Settings > Legal and Privacy tab.',
    currencyLabel: 'CP',
    popular: false
  },
  {
    id: 'roblox',
    name: 'Roblox Robux',
    category: 'Gift Cards',
    image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=1200&auto=format&fit=crop&q=80',
    description: 'Robux digital gift vouchers for Roblox games & avatars.',
    idPlaceholder: 'Enter Roblox Username or Email',
    idHelpText: 'Voucher code or direct account credit will be delivered instantly.',
    currencyLabel: 'Robux',
    popular: false
  }
];

export const TOPUP_OPTIONS: Record<string, TopupOption[]> = {
  ff: [
    { id: 'ff1', amount: '25 Diamonds', price: 0.35, currency: 'USD', tag: 'Starter' },
    { id: 'ff2', amount: '50 Diamonds', price: 0.65, currency: 'USD' },
    { id: 'ff3', amount: '115 Diamonds', price: 1.20, currency: 'USD', bonus: '+15 Bonus' },
    { id: 'ff4', amount: '240 Diamonds', price: 2.40, currency: 'USD', bonus: '+25 Bonus' },
    { id: 'ff5', amount: '355 Diamonds', price: 3.50, currency: 'USD', bonus: '+45 Bonus', tag: 'Best Value' },
    { id: 'ff6', amount: '610 Diamonds', price: 5.80, currency: 'USD', bonus: '+90 Bonus' },
    { id: 'ff7', amount: '1240 Diamonds', price: 11.50, currency: 'USD', bonus: '+200 Bonus', tag: 'Popular' },
    { id: 'ff8', amount: '2530 Diamonds', price: 22.90, currency: 'USD', bonus: '+450 Bonus' },
    { id: 'ff_weekly', amount: 'Weekly Membership', price: 2.10, currency: 'USD', tag: 'VIP Pass' },
    { id: 'ff_monthly', amount: 'Monthly Membership', price: 8.50, currency: 'USD', tag: 'Mega VIP' },
  ],
  pubg: [
    { id: 'p1', amount: '60 UC', price: 0.99, currency: 'USD' },
    { id: 'p2', amount: '325 UC', price: 4.99, currency: 'USD', bonus: '+25 Bonus', tag: 'Popular' },
    { id: 'p3', amount: '660 UC', price: 9.99, currency: 'USD', bonus: '+60 Bonus', tag: 'Royale Pass' },
    { id: 'p4', amount: '1800 UC', price: 24.99, currency: 'USD', bonus: '+300 Bonus' },
    { id: 'p5', amount: '3850 UC', price: 49.99, currency: 'USD', bonus: '+850 Bonus', tag: 'Mega Pack' },
    { id: 'p6', amount: '8100 UC', price: 99.99, currency: 'USD', bonus: '+2100 Bonus' },
  ],
  mlbb: [
    { id: 'm1', amount: '86 Diamonds', price: 1.50, currency: 'USD' },
    { id: 'm2', amount: '172 Diamonds', price: 2.95, currency: 'USD', bonus: '+16 Bonus' },
    { id: 'm3', amount: '257 Diamonds', price: 4.40, currency: 'USD', bonus: '+25 Bonus', tag: 'Popular' },
    { id: 'm4', amount: '706 Diamonds', price: 11.80, currency: 'USD', bonus: '+80 Bonus' },
    { id: 'm5', amount: '2195 Diamonds', price: 34.90, currency: 'USD', bonus: '+300 Bonus' },
    { id: 'm_weekly', amount: 'Weekly Diamond Pass', price: 2.20, currency: 'USD', tag: 'Best Value' },
  ],
  genshin: [
    { id: 'g1', amount: '60 Genesis Crystals', price: 0.99, currency: 'USD' },
    { id: 'g2', amount: '300+30 Crystals', price: 4.99, currency: 'USD', bonus: '+30 Bonus' },
    { id: 'g3', amount: '980+110 Crystals', price: 14.99, currency: 'USD', bonus: '+110 Bonus', tag: 'Popular' },
    { id: 'g4', amount: '1980+260 Crystals', price: 29.99, currency: 'USD', bonus: '+260 Bonus' },
    { id: 'g_welkin', amount: 'Blessing of Welkin Moon', price: 4.99, currency: 'USD', tag: 'Best Deal' },
  ],
  valorant: [
    { id: 'v1', amount: '475 VP', price: 4.99, currency: 'USD' },
    { id: 'v2', amount: '1000 VP', price: 9.99, currency: 'USD', tag: 'Battlepass' },
    { id: 'v3', amount: '2050 VP', price: 19.99, currency: 'USD', bonus: '+100 Bonus', tag: 'Popular' },
    { id: 'v4', amount: '5350 VP', price: 49.99, currency: 'USD', bonus: '+400 Bonus' },
  ],
  steam: [
    { id: 's1', amount: '$5 Steam Card', price: 5.00, currency: 'USD' },
    { id: 's2', amount: '$10 Steam Card', price: 10.00, currency: 'USD', tag: 'Popular' },
    { id: 's3', amount: '$20 Steam Card', price: 20.00, currency: 'USD' },
    { id: 's4', amount: '$50 Steam Card', price: 50.00, currency: 'USD', tag: 'Best Value' },
  ],
  codm: [
    { id: 'c1', amount: '80 CP', price: 0.99, currency: 'USD' },
    { id: 'c2', amount: '420 CP', price: 4.99, currency: 'USD', bonus: '+20 Bonus' },
    { id: 'c3', amount: '880 CP', price: 9.99, currency: 'USD', bonus: '+80 Bonus', tag: 'Battlepass' },
    { id: 'c4', amount: '2400 CP', price: 24.99, currency: 'USD', bonus: '+200 Bonus' },
  ],
  roblox: [
    { id: 'r1', amount: '400 Robux', price: 4.99, currency: 'USD' },
    { id: 'r2', amount: '800 Robux', price: 9.99, currency: 'USD', tag: 'Popular' },
    { id: 'r3', amount: '2000 Robux', price: 24.99, currency: 'USD', bonus: '+300 Bonus' },
  ]
};
