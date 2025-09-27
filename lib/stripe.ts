// lib/stripe.ts
import Stripe from 'stripe';

// Make sure this is your SECRET key, not your publishable key
const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2025-08-27.basil', // Use the latest API version
  appInfo: {
    name: 'Almanaque da Fala',
  },
});
