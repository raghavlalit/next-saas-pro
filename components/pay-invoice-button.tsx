'use client';

import { useState } from 'react';
import { createPaymentIntent } from '@/app/actions';
import { StripeCheckout } from './stripe-checkout';

export function PayInvoiceButton({ invoiceId }: { invoiceId: string }) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        setLoading(true);
        try {
            const res = await createPaymentIntent(invoiceId);
            setClientSecret(res.clientSecret);
        } catch (error) {
            console.error(error);
            alert("Failed to initialize payment");
        } finally {
            setLoading(false);
        }
    };

    if (clientSecret) {
        return (
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-medium text-foreground">Complete Payment</h3>
                <StripeCheckout clientSecret={clientSecret} invoiceId={invoiceId} />
            </div>
        );
    }

    return (
        <button
            onClick={handlePay}
            disabled={loading}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
            {loading ? "Initializing..." : "Pay Now"}
        </button>
    );
}
