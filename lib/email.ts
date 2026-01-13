import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailPayload) => {
    // In demo/dev mode without real credentials, just log
    if (!process.env.EMAIL_SERVER_HOST) {
        console.log("================ EMAIL MOCK (SUCCESS) ================");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body (Full):`);
        console.log(html);
        console.log("======================================================");
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"NextInvoicer" <noreply@example.com>',
            to,
            subject,
            html,
        });
        console.log(`[Email] Successfully sent email to ${to}`);
    } catch (error) {
        console.error('[Email] Failed to send email:', error);
        // Re-throw if you want the caller to handle it, but for now we just log
    }
};

export const getInvoiceEmailTemplate = (clientName: string, invoiceNumber: string, amount: string, link: string) => {
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Invoice Received</h2>
            <p>Hi ${clientName},</p>
            <p>A new invoice <strong>${invoiceNumber}</strong> for <strong>${amount}</strong> has been generated for you.</p>
            <p>You can view and pay your invoice by clicking the button below:</p>
            <a href="${link}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Invoice</a>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">If the button doesn't work, copy this link: ${link}</p>
        </div>
    `;
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to NextInvoicer</h2>
            <p>An account has been created for you.</p>
            <p>Please click the button below to set your password and log in:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Set Password</a>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">If the button doesn't work, copy this link: ${resetLink}</p>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">This link will expire in 1 hour.</p>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: "Welcome! Set your password",
        html
    });
};

export const sendInvoiceDueReminderEmail = async (email: string, clientName: string, invoiceNumber: string, amount: string, dueDate: string, link: string) => {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Invoice Due Soon</h2>
            <p>Hi ${clientName},</p>
            <p>This is a reminder that invoice <strong>${invoiceNumber}</strong> for <strong>${amount}</strong> is due on <strong>${dueDate}</strong> (in 2 days).</p>
            <p>Please arrange for payment by the due date.</p>
            <a href="${link}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Pay Invoice</a>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: `Reminder: Invoice ${invoiceNumber} Due Soon`,
        html
    });
}

export const sendInvoiceOverdueEmail = async (email: string, clientName: string, invoiceNumber: string, amount: string, dueDate: string, link: string) => {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border-top: 4px solid #ef4444;">
            <h2 style="color: #ef4444;">URGENT: Invoice Overdue</h2>
            <p>Hi ${clientName},</p>
            <p>Our records show that invoice <strong>${invoiceNumber}</strong> for <strong>${amount}</strong> was due on <strong>${dueDate}</strong> and hasn't been paid yet.</p>
            <p>Please make the payment immediately to avoid service interruption.</p>
            <a href="${link}" style="display: inline-block; background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Pay Now</a>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: `OVERDUE: Invoice ${invoiceNumber}`,
        html
    });
}

export const sendPaymentReceiptEmail = async (email: string, clientName: string, invoiceNumber: string, amount: string, link: string) => {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border-top: 4px solid #10b981;">
            <h2 style="color: #10b981;">Payment Received</h2>
            <p>Hi ${clientName},</p>
            <p>Thank you! We have received your payment of <strong>${amount}</strong> for invoice <strong>${invoiceNumber}</strong>.</p>
            <p>You can view your receipt by clicking the button below:</p>
            <a href="${link}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Receipt</a>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: `Payment Receipt: Invoice ${invoiceNumber}`,
        html
    });
}
