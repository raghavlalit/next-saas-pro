import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ClientDashboard } from "@/components/client-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { DateRangePicker } from "@/components/date-range-picker"

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
    const session = await auth();
    const isClient = session?.user?.role === 'client';
    const params = await searchParams;

    const dateFilter: Record<string, any> = {};
    if (params.from || params.to) {
        dateFilter.issuedDate = {};
        if (params.from) dateFilter.issuedDate.gte = new Date(params.from);
        if (params.to) dateFilter.issuedDate.lte = new Date(params.to);
    }

    // CLIENT DASHBOARD LOGIC
    if (isClient && session?.user?.id) {
        // Fetch Client Data
        const client = await prisma.client.findFirst({
            where: { userId: session.user.id }
        });

        if (client) {
            const invoices = await prisma.invoice.findMany({
                where: { 
                    clientId: client.id,
                    ...dateFilter
                }
            });

            // Calculate Stats
            const totalInvoices = invoices.length;
            const paidAmount = invoices
                .filter(inv => inv.status === 'PAID')
                .reduce((sum, inv) => sum + inv.amountTotal, 0);
            const pendingAmount = invoices
                .filter(inv => inv.status === 'PENDING')
                .reduce((sum, inv) => sum + inv.amountTotal, 0);

            // Calculate Status Distribution
            const statusCounts: Record<string, number> = invoices.reduce((acc: Record<string, number>, inv) => {
                const status = inv.status as string;
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});

            const statusData = [
                { name: 'Paid', value: statusCounts['PAID'] || 0, color: '#10b981' },
                { name: 'Pending', value: statusCounts['PENDING'] || 0, color: '#eab308' },
                { name: 'Draft', value: statusCounts['DRAFT'] || 0, color: '#9ca3af' },
                { name: 'Overdue', value: (statusCounts['FAILED'] || 0) + (statusCounts['CANCELLED'] || 0), color: '#ef4444' }
            ].filter(item => item.value > 0);

            // Calculate Monthly Spending (Last 6 months)
            const monthlySpending: Record<string, number> = {};
            invoices.forEach(inv => {
                const date = new Date(inv.issuedDate);
                const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
                monthlySpending[key] = (monthlySpending[key] || 0) + inv.amountTotal;
            });

            const monthlyData = Object.entries(monthlySpending).map(([name, amount]) => ({
                name,
                amount
            })).slice(-6);

            const dashboardData = {
                totalInvoices,
                paidAmount,
                pendingAmount,
                currency: client.currency || 'USD',
                monthlyData,
                statusData
            };

            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Client Dashboard</h1>
                        <DateRangePicker />
                    </div>
                    <ClientDashboard data={dashboardData} />
                </div>
            );
        }
    }

    // ADMIN DASHBOARD LOGIC (For non-client users)
    const [totalUsers, totalClients, totalInvoices, invoices] = await Promise.all([
        prisma.user.count(),
        prisma.client.count(),
        prisma.invoice.count(),
        prisma.invoice.findMany({
            where: dateFilter,
            include: { client: true },
            orderBy: { createdAt: 'desc' }
        })
    ]);

    const totalRevenue = invoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + inv.amountTotal, 0);
    
    const pendingRevenue = invoices
        .filter(inv => inv.status === 'PENDING')
        .reduce((sum, inv) => sum + inv.amountTotal, 0);

    // Status Distribution
    const statusCounts: Record<string, number> = invoices.reduce((acc: Record<string, number>, inv) => {
        const status = inv.status as string;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const statusData = [
        { name: 'Paid', value: statusCounts['PAID'] || 0, color: '#10b981' },
        { name: 'Pending', value: statusCounts['PENDING'] || 0, color: '#eab308' },
        { name: 'Draft', value: statusCounts['DRAFT'] || 0, color: '#9ca3af' },
        { name: 'Overdue', value: (statusCounts['FAILED'] || 0) + (statusCounts['CANCELLED'] || 0), color: '#ef4444' }
    ].filter(item => item.value > 0);

    // Revenue Trend (All time, grouped by month)
    const monthlyRevenue: Record<string, number> = {};
    invoices.forEach(inv => {
        if (inv.status === 'PAID') {
            const date = new Date(inv.issuedDate);
            const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyRevenue[key] = (monthlyRevenue[key] || 0) + inv.amountTotal;
        }
    });

    const revenueData = Object.entries(monthlyRevenue).map(([name, amount]) => ({
        name,
        amount
    })).slice(-6);

    const adminData = {
        totalUsers,
        totalClients,
        totalInvoices,
        totalRevenue,
        pendingRevenue,
        recentInvoices: invoices.slice(0, 5), // Top 5 recent
        revenueData,
        statusData
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Dashboard</h1>
                <DateRangePicker />
            </div>
            <AdminDashboard data={adminData} />
        </div>
    );
}
