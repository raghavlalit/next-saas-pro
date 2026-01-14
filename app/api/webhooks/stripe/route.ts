import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { sendPaymentReceiptEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27-preview' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const invoiceId = paymentIntent.metadata.invoiceId;

        if (invoiceId) {
            const invoice = await prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    status: 'PAID',
                    paidAt: new Date(),
                },
                include: { client: true }
            });

            if (invoice.client && invoice.client.email) {
                const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoices/${invoice.id}`;
                // Fire and forget email
                await sendPaymentReceiptEmail(
                    invoice.client.email,
                    invoice.client.name,
                    invoice.invoiceNumber,
                    `${invoice.currency} ${invoice.amountTotal.toFixed(2)}`,
                    link
                );
            }
        }
    }

    if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const invoiceId = paymentIntent.metadata.invoiceId;

        if (invoiceId) {
            await prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    status: 'FAILED',
                },
            });
        }
    }

    return NextResponse.json({ received: true });
}
