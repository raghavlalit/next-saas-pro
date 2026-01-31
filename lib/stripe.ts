import Stripe from 'stripe';

/**
 * Stripe client instance initialized with the secret key.
 * Ensure STRIPE_SECRET_KEY is set in your .env file.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
    apiVersion: '2025-01-27-preview' as any,
    typescript: true,
});

/**
 * Creates a Stripe Checkout Session for a subscription.
 * 
 * @param priceId - The Stripe Price ID for the subscription.
 * @param customerId - The Stripe Customer ID of the user.
 * @returns The created checkout session object.
 */
export async function createCheckoutSession(priceId: string, customerId: string) {
    return await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    });
}

/**
 * Creates a Stripe Customer Portal session.
 * This allows users to manage their subscriptions, payment methods, and billing details.
 * 
 * @param customerId - The Stripe Customer ID of the user.
 * @returns The created portal session object.
 */
export async function createCustomerPortal(customerId: string) {
    return await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });
}
