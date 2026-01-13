'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { sendEmail, getInvoiceEmailTemplate, sendPasswordResetEmail } from "@/lib/email"
import { generatePasswordResetToken } from "@/lib/tokens"
import { v4 as uuidv4 } from "uuid"
import { passwordSchema } from "@/lib/validations"

const UserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: passwordSchema.optional(),
    roleId: z.string().min(1, "Role is required"),
    phone: z.string().optional(),
    phoneCountryCode: z.string().optional(),
    image: z.union([z.string(), z.any()]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
})

import { uploadFile } from "@/lib/upload";

export async function createUser(formData: FormData) {
    const data = Object.fromEntries(formData.entries())
    const validated = UserSchema.parse(data)

    let hashedPassword = "";
    if (validated.password) {
        hashedPassword = await bcrypt.hash(validated.password, 10)
    } else {
        // Generate random password for invite workflow
        const randomPassword = uuidv4();
        hashedPassword = await bcrypt.hash(randomPassword, 10);
    }

    let imageUrl = validated.image;
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
        imageUrl = await uploadFile(imageFile);
    }

    const user = await prisma.user.create({
        data: {
            name: validated.name,
            email: validated.email,
            password: hashedPassword,
            roleId: validated.roleId,
            phone: validated.phone,
            phoneCountryCode: validated.phoneCountryCode,
            image: imageUrl,
            status: validated.status,
        } as any,
        include: { role: true }
    })

    // If role is CLIENT, create a Client record
    if (user.role && user.role.code.toLowerCase() === 'client') {
        const count = await prisma.client.count()
        const clientCode = `CL-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`

        await prisma.client.create({
            data: {
                userId: user.id,
                clientCode,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone,
                billingAddress: 'Pending', // Placeholder until updated
                status: 'ACTIVE',
            }
        })
    }

    // Send Invite Email if no password was provided (Invite Flow)
    if (!validated.password) {
        if (user.email) {
            const token = await generatePasswordResetToken(user.email);
            // Fire and forget
            sendPasswordResetEmail(user.email, token.token);
        }
    }

    revalidatePath("/users")
    return { success: true, redirectUrl: "/users" }
}

export async function updateUser(id: string, formData: FormData) {
    const data = Object.fromEntries(formData.entries())
    // Remove empty password if not provided
    if (data.password === "") {
        delete data.password
    }

    const validated = UserSchema.partial().parse(data)

    const updateData: any = {
        name: validated.name,
        email: validated.email,
        roleId: validated.roleId,
        phone: validated.phone,
        phoneCountryCode: validated.phoneCountryCode,
        status: validated.status,
    }

    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
        updateData.image = await uploadFile(imageFile);
    } else if (validated.image) {
        updateData.image = validated.image;
    }

    if (validated.password) {
        updateData.password = await bcrypt.hash(validated.password, 10)
    }

    await prisma.user.update({
        where: { id },
        data: updateData,
    })

    revalidatePath("/users")
    return { success: true, redirectUrl: "/users" }
}

export async function deleteUser(id: string) {
    await prisma.user.delete({
        where: { id },
    })
    revalidatePath("/users")
}

const ClientSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    phoneCountryCode: z.string().optional(),
    companyName: z.string().optional(),
    companyLogo: z.union([z.string(), z.any()]).optional(),
    companyCode: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    zipcode: z.string().optional(),
    billingAddress: z.string().min(1, "Billing address is required"),
    taxId: z.string().optional(),
    currency: z.string().default("USD"),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
    notes: z.string().optional(),
})

export async function createClient(formData: FormData) {
    const data = Object.fromEntries(formData.entries())
    const validated = ClientSchema.parse(data)

    let imageUrl = typeof validated.companyLogo === 'string' ? validated.companyLogo : undefined;
    const imageFile = formData.get('companyLogo') as File;
    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
        imageUrl = await uploadFile(imageFile);
    }

    // Generate Client Code (e.g., CL-2024-001)
    const count = await prisma.client.count()
    const clientCode = `CL-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`

    await prisma.client.create({
        data: {
            clientCode,
            name: validated.name,
            email: validated.email,
            phone: validated.phone,
            phoneCountryCode: validated.phoneCountryCode,
            companyName: validated.companyName,
            companyLogo: imageUrl,
            companyCode: validated.companyCode,
            country: validated.country,
            state: validated.state,
            city: validated.city,
            zipcode: validated.zipcode,
            billingAddress: validated.billingAddress,
            taxId: validated.taxId,
            currency: validated.currency,
            status: validated.status,
            notes: validated.notes,
        } as any,
    })

    revalidatePath("/clients")
    return { success: true, redirectUrl: "/clients" }
}

export async function updateClient(id: string, formData: FormData) {
    const data = Object.fromEntries(formData.entries())
    const validated = ClientSchema.partial().parse(data)

    const updateData: any = {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        phoneCountryCode: validated.phoneCountryCode,
        companyName: validated.companyName,
        companyCode: validated.companyCode,
        country: validated.country,
        state: validated.state,
        city: validated.city,
        zipcode: validated.zipcode,
        billingAddress: validated.billingAddress,
        taxId: validated.taxId,
        currency: validated.currency,
        status: validated.status,
        notes: validated.notes,
    }

    const imageFile = formData.get('companyLogo') as File;
    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
        updateData.companyLogo = await uploadFile(imageFile);
    } else if (validated.companyLogo) {
        updateData.companyLogo = validated.companyLogo;
    }

    await prisma.client.update({
        where: { id },
        data: updateData,
    })

    revalidatePath("/clients")
    revalidatePath(`/clients/${id}`)
    return { success: true, redirectUrl: `/clients/${id}` }
}

export async function deleteClient(id: string) {
    // Check if client has invoices
    const invoiceCount = await prisma.invoice.count({
        where: { clientId: id }
    });

    if (invoiceCount > 0) {
        throw new Error("Cannot delete client with existing invoices. Disable them instead.");
    }

    // Soft delete
    await prisma.client.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'INACTIVE' },
    })
    revalidatePath("/clients")
}

const InvoiceItemSchema = z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0, "Unit price must be non-negative"),
})

const InvoiceSchema = z.object({
    clientId: z.string().min(1, "Client is required"),
    issuedDate: z.string().transform((str) => new Date(str)),
    dueDate: z.string().transform((str) => new Date(str)),
    currency: z.string().default("USD"),
    status: z.enum(["DRAFT", "PENDING", "PAID", "FAILED", "CANCELLED"]).default("DRAFT"),
    items: z.array(InvoiceItemSchema).min(1, "At least one item is required"),
})

export async function createInvoice(formData: FormData) {
    // Helper to parse nested array data from FormData
    const rawData: any = {
        clientId: formData.get('clientId'),
        issuedDate: formData.get('issuedDate'),
        dueDate: formData.get('dueDate'),
        currency: formData.get('currency'),
        status: formData.get('status') || 'DRAFT',
        items: []
    };

    // Parse items manually since FormData doesn't handle arrays well
    const descriptions = formData.getAll('items.description');
    const quantities = formData.getAll('items.quantity');
    const unitPrices = formData.getAll('items.unitPrice');

    for (let i = 0; i < descriptions.length; i++) {
        rawData.items.push({
            description: descriptions[i],
            quantity: quantities[i],
            unitPrice: unitPrices[i],
        });
    }

    const validated = InvoiceSchema.parse(rawData);

    // Calculate totals
    let amountSubtotal = 0;
    const itemsWithAmount = validated.items.map(item => {
        const amount = item.quantity * item.unitPrice;
        amountSubtotal += amount;
        return { ...item, amount };
    });

    const amountTax = 0; // Placeholder for tax logic
    const amountTotal = amountSubtotal + amountTax;

    // Generate Invoice Number (e.g., INV-2024-0001)
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber,
            clientId: validated.clientId,
            issuedDate: validated.issuedDate,
            dueDate: validated.dueDate,
            currency: validated.currency,
            status: validated.status as any,
            amountSubtotal,
            amountTax,
            amountTotal,
            items: {
                create: itemsWithAmount
            }
        },
        include: { client: true }
    });

    // Send Email Notification
    if (invoice.client && invoice.client.email) {
        const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoices/${invoice.id}`;
        const html = getInvoiceEmailTemplate(
            invoice.client.name, 
            invoice.invoiceNumber, 
            `${invoice.currency} ${invoice.amountTotal.toFixed(2)}`,
            link
        );
        
        // Fire and forget
        sendEmail({
            to: invoice.client.email,
            subject: `New Invoice ${invoice.invoiceNumber} from NextInvoicer`,
            html
        });
    }

    revalidatePath("/invoices");
    revalidatePath(`/clients/${validated.clientId}`);
    redirect("/invoices");
}

export async function deleteInvoice(id: string) {
    await prisma.invoice.delete({
        where: { id }
    });
    revalidatePath("/invoices");
}

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27-preview' as any,
});

export async function createPaymentIntent(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { client: true }
    });

    if (!invoice || invoice.status === 'PAID') {
        throw new Error("Invalid invoice or already paid");
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(invoice.amountTotal * 100),
        currency: invoice.currency.toLowerCase(),
        metadata: {
            invoiceId: invoice.id,
            clientId: invoice.clientId,
        },
        automatic_payment_methods: {
            enabled: true,
        },
    });

    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { stripePaymentIntentId: paymentIntent.id }
    });

    return { clientSecret: paymentIntent.client_secret };
}

export async function resetPassword(token: string, password: string) {
    const existingToken = await prisma.passwordResetToken.findUnique({
        where: { token }
    });

    if (!existingToken) {
        throw new Error("Invalid token");
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
        throw new Error("Token has expired");
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: existingToken.email }
    });

    if (!existingUser) {
        throw new Error("User does not exist");
    }

    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { id: existingUser.id },
        data: {
            password: hashedPassword,
        }
    });

    await prisma.passwordResetToken.delete({
        where: { id: existingToken.id }
    });
    return { success: true };
}

import { auth } from "@/lib/auth"

export async function updateInvoiceStatus(id: string, status: string) {
    const session = await auth();
    // Strict check for super_admin as requested, or at least invoice.edit permission
    // For now, enforcing super_admin role as per specific user request
    if (session?.user?.role !== 'super_admin') {
         throw new Error("Unauthorized");
    }

    await prisma.invoice.update({
        where: { id },
        data: { status: status as any }
    });
    
    revalidatePath("/invoices");
}

export async function updatePassword(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("Not authenticated");
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match");
    }

    // Check if new password is same as old password
    if (currentPassword === newPassword) {
         throw new Error("New password cannot be the same as the old password");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user || !user.password) {
        throw new Error("User not found");
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
        throw new Error("Incorrect current password");
    }

    const validation = passwordSchema.safeParse(newPassword);
    if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { email: session.user.email },
        data: { password: hashedPassword }
    });

    revalidatePath("/settings");
    return { success: true, message: "Password updated successfully" }
}

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("Not authenticated");
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const phoneCountryCode = formData.get("phoneCountryCode") as string;

    await prisma.user.update({
        where: { email: session.user.email },
        data: { 
            name,
            phone,
            phoneCountryCode
        } as any
    });
    revalidatePath("/settings");
    return { success: true, message: "Profile updated successfully" }
}


