import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendInvoiceDueReminderEmail, sendInvoiceOverdueEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Basic authorization for cron job
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();
        
        // 1. Check for invoices due in 2 days
        const twoDaysFromNowStart = new Date(now);
        twoDaysFromNowStart.setDate(now.getDate() + 2);
        twoDaysFromNowStart.setHours(0, 0, 0, 0);
        
        const twoDaysFromNowEnd = new Date(twoDaysFromNowStart);
        twoDaysFromNowEnd.setHours(23, 59, 59, 999);

        const dueSoonInvoices = await prisma.invoice.findMany({
            where: {
                status: 'PENDING',
                dueDate: {
                    gte: twoDaysFromNowStart,
                    lte: twoDaysFromNowEnd
                }
            },
            include: { client: true }
        });

        for (const invoice of dueSoonInvoices) {
            if (invoice.client.email) {
                const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoices/${invoice.id}`;
                await sendInvoiceDueReminderEmail(
                    invoice.client.email,
                    invoice.client.name,
                    invoice.invoiceNumber,
                    `${invoice.currency} ${invoice.amountTotal.toFixed(2)}`,
                    new Date(invoice.dueDate).toLocaleDateString(),
                    link
                );
            }
        }

        // 2. Check for invoices overdue (Due date was yesterday)
        // This ensures we only notify ONCE the day after it becomes overdue
        const yesterdayStart = new Date(now);
        yesterdayStart.setDate(now.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date(yesterdayStart);
        yesterdayEnd.setHours(23, 59, 59, 999);

        const overdueInvoices = await prisma.invoice.findMany({
            where: {
                status: 'PENDING',
                dueDate: {
                    gte: yesterdayStart,
                    lte: yesterdayEnd
                }
            },
            include: { client: true }
        });

        for (const invoice of overdueInvoices) {
            if (invoice.client.email) {
                const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoices/${invoice.id}`;
                await sendInvoiceOverdueEmail(
                    invoice.client.email,
                    invoice.client.name,
                    invoice.invoiceNumber,
                    `${invoice.currency} ${invoice.amountTotal.toFixed(2)}`,
                    new Date(invoice.dueDate).toLocaleDateString(),
                    link
                );
            }
        }

        return NextResponse.json({
            success: true,
            remindersSent: dueSoonInvoices.length,
            overdueSent: overdueInvoices.length
        });

    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
