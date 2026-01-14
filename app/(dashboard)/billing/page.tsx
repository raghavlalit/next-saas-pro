import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation";
import { createCustomerPortal } from "@/lib/stripe";
// import { createCheckoutSession } from "@/lib/stripe";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default async function BillingPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        redirect("/login");
    }

    // eslint-disable-next-line react-hooks/purity
    const isPro = user.stripePriceId && user.stripeCurrentPeriodEnd && new Date(user.stripeCurrentPeriodEnd).getTime() > Date.now();

    // async function handleUpgrade() {
    //     "use server";
    //     // In a real app, you would create a customer if not exists, but for simplicity we assume logic handles it or we create it here.
    //     // For this starter, we'll just create a checkout session.
    //     // NOTE: You need to create a product in Stripe and get the Price ID.
    //     // We will use a dummy Price ID or env var.
    //     // const priceId = process.env.STRIPE_PRICE_ID || "price_dummy";
    //
    //     // We need a customer ID. If user doesn't have one, we should create one.
    //     // For now, let's assume we create one or pass email to checkout to create one.
    //     // Ideally, we should create a customer in Stripe when user registers or here.
    //
    //     // Simplified:
    //     // const stripeSession = await createCheckoutSession(priceId, user.stripeCustomerId!);
    //     // redirect(stripeSession.url!);
    // }

    async function handlePortal() {
        "use server";
        if (user?.stripeCustomerId) {
            const portalSession = await createCustomerPortal(user.stripeCustomerId);
            redirect(portalSession.url);
        }
    }

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Billing
            </h1>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Current Plan</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    You are currently on the <span className="font-bold text-indigo-600">{isPro ? "Pro Plan" : "Free Plan"}</span>.
                </p>

                <div className="mt-6">
                    {isPro ? (
                        <form action={handlePortal}>
                            <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                Manage Subscription
                            </button>
                        </form>
                    ) : (
                        <form>
                            {/* We need a client component for interactivity or Server Actions with a real Price ID */}
                            <button disabled className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                                Upgrade to Pro (Configure Stripe Price ID)
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Invoice History</h2>
                <div className="mt-4">
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Download</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                <tr>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Jan 1, 2024</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">$29.00</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">Paid</span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Download</a>
                                    </td>
                                </tr>
                                {/* Add more rows as needed */}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
