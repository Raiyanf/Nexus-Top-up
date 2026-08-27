/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: 'Games' | 'Mobile' | 'Gift Cards';
  image: string;
  description: string;
}

export interface TopupOption {
  id: string;
  amount: string;
  price: number;
  currency: string;
  bonus?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'ff',
    name: 'Free Fire',
    category: 'Games',
    image: 'https://picsum.photos/seed/freefire/400/400',
    description: 'Instant Diamond top-up for Garena Free Fire.'
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile',
    category: 'Games',
    image: 'https://picsum.photos/seed/pubg/400/400',
    description: 'UC top-up for PUBG Mobile Global.'
  },
  {
    id: 'mlbb',
    name: 'Mobile Legends',
    category: 'Games',
    image: 'https://picsum.photos/seed/mlbb/400/400',
    description: 'Diamonds for Mobile Legends: Bang Bang.'
  },
  {
    id: 'genshin',
    name: 'Genshin Impact',
    category: 'Games',
    image: 'https://picsum.photos/seed/genshin/400/400',
    description: 'Genesis Crystals for Genshin Impact.'
  },
  {
    id: 'valorant',
    name: 'Valorant',
    category: 'Games',
    image: 'https://picsum.photos/seed/valorant/400/400',
    description: 'Valorant Points for Riot Games.'
  },
  {
    id: 'steam',
    name: 'Steam Wallet',
    category: 'Gift Cards',
    image: 'https://picsum.photos/seed/steam/400/400',
    description: 'Steam Wallet Codes for global accounts.'
  }
];

export const TOPUP_OPTIONS: Record<string, TopupOption[]> = {
  ff: [
    { id: 'ff1', amount: '100 Diamonds', price: 1.00, currency: 'USD' },
    { id: 'ff2', amount: '310 Diamonds', price: 3.00, currency: 'USD', bonus: '31 Bonus' },
    { id: 'ff3', amount: '520 Diamonds', price: 5.00, currency: 'USD', bonus: '52 Bonus' },
    { id: 'ff4', amount: '1060 Diamonds', price: 10.00, currency: 'USD', bonus: '106 Bonus' },
  ],
  pubg: [
    { id: 'p1', amount: '60 UC', price: 0.99, currency: 'USD' },
    { id: 'p2', amount: '325 UC', price: 4.99, currency: 'USD' },
    { id: 'p3', amount: '660 UC', price: 9.99, currency: 'USD' },
  ],
  mlbb: [
    { id: 'm1', amount: '86 Diamonds', price: 1.50, currency: 'USD' },
    { id: 'm2', amount: '172 Diamonds', price: 3.00, currency: 'USD' },
    { id: 'm3', amount: '257 Diamonds', price: 4.50, currency: 'USD' },
  ]
};
