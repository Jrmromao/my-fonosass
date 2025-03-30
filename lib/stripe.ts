// lib/stripe.ts
import Stripe from 'stripe';

// Make sure this is your SECRET key, not your publishable key
const secretKey = "sk_test_51PifCH2N5SBY44N5QTQZWyJn8oxmCVaYkWDUWXGmr5Yp2fmlwWo4SUKtpai2tC2ku8TkJ9Y3FBrLyeMQM7ufS8pE00rJwIf2bW";

if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia', // Use the latest API version
    appInfo: {
        name: 'FonoSaaS',
    },
});