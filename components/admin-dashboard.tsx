"use client"

import dynamic from "next/dynamic"
import { ApexOptions } from "apexcharts"
import { useEffect, useState } from "react"
import { Users, Building2, FileText, DollarSign, Clock } from "lucide-react"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface AdminDashboardData {
    totalUsers: number;
    totalClients: number;
    totalInvoices: number;
    totalRevenue: number;
    pendingRevenue: number;
    /** Array of recent invoices to display in the table */
    recentInvoices: any[];
    /** Data for the revenue trend chart */
    revenueData: { name: string; amount: number }[];
    /** Data for the invoice status distribution chart */
    statusData: { name: string; value: number; color: string }[];
}

/**
 * AdminDashboard Component
 * 
 * Displays key metrics and charts for the SaaS administrator.
 * Includes:
 * - Revenue Trends (Area Chart)
 * - Invoice Status Distribution (Donut Chart)
 * - Quick Stats Cards (Total Users, Revenue, etc.)
 * - Recent Invoices Table
 * 
 * @param data - The dashboard data fetched from the server.
 */
export function AdminDashboard({ data }: { data: AdminDashboardData }) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Area Chart - Revenue Trend
    const areaOptions: ApexOptions = {
        chart: {
            id: "revenue-trend",
            toolbar: { show: false },
            fontFamily: "inherit",
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            categories: data.revenueData.map(d => d.name),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: "#9ca3af" } }
        },
        yaxis: {
            labels: {
                style: { colors: "#9ca3af" },
                formatter: (val) => formatCurrency(val)
            }
        },
        grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
        colors: ["#6366f1"],
        tooltip: {
            y: { formatter: (val) => formatCurrency(val) }
        }
    };

    const areaSeries = [{
        name: "Revenue",
        data: data.revenueData.map(d => d.amount)
    }];

    // Donut Chart - Invoice Status
    const donutOptions: ApexOptions = {
        chart: {
            id: "status-distribution",
            fontFamily: "inherit",
        },
        labels: data.statusData.map(d => d.name),
        colors: data.statusData.map(d => d.color),
        legend: { position: "bottom", labels: { colors: "#9ca3af" } },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: { size: '70%' }
            }
        },
        tooltip: {
            y: { formatter: (val) => `${val} Invoices` }
        }
    };

    const donutSeries = data.statusData.map(d => d.value);

    if (!mounted) return null;

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/50">
                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalUsers}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-900/50">
                            <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clients</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalClients}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-900/50">
                            <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Invoices</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalInvoices}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/50">
                            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.totalRevenue)}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-yellow-50 p-2 dark:bg-yellow-900/50">
                            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.pendingRevenue)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue Trend */}
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <h3 className="mb-6 text-base font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
                    <div className="h-[350px]">
                        <Chart options={areaOptions} series={areaSeries} type="area" height="100%" />
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                    <h3 className="mb-6 text-base font-semibold text-gray-900 dark:text-white">Invoice Status</h3>
                    <div className="h-[350px]">
                        <Chart options={donutOptions} series={donutSeries} type="donut" height="100%" />
                    </div>
                </div>
            </div>

            {/* Recent Invoices Table */}
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-gray-700">
                <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3 font-medium">Invoice #</th>
                                <th className="px-6 py-3 font-medium">Client</th>
                                <th className="px-6 py-3 font-medium">Amount</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {data.recentInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{inv.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4">{inv.client?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{formatCurrency(inv.amountTotal)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                            ${inv.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                                              inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(inv.issuedDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
