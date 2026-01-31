"use client"

import dynamic from "next/dynamic"
import { ApexOptions } from "apexcharts"
import { useEffect, useState } from "react"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface DashboardData {
    totalInvoices: number;
    paidAmount: number;
    pendingAmount: number;
    currency: string;
    monthlyData: { name: string; amount: number }[];
    statusData: { name: string; value: number; color: string }[];
}

/**
 * ClientDashboard Component
 * 
 * Customized dashboard for individual clients.
 * Shows:
 * - Total Invoices & Payment Status
 * - Monthly Expense Trends (Bar Chart)
 * - Invoice Status Breakdown (Donut Chart)
 * 
 * @param data - The client-specific dashboard data.
 */
export function ClientDashboard({ data }: { data: DashboardData }) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: data.currency
        }).format(amount);
    }

    // Bar Chart Options
    const barOptions: ApexOptions = {
        chart: {
            id: "monthly-expenses",
            toolbar: { show: false },
            fontFamily: "inherit",
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: "40%",
            }
        },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        grid: {
            borderColor: "#e5e7eb",
            strokeDashArray: 4,
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: data.monthlyData.map(d => d.name),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: { colors: "#9ca3af", fontSize: "12px" }
            }
        },
        yaxis: {
            labels: {
                style: { colors: "#9ca3af", fontSize: "12px" },
                formatter: (val) => formatCurrency(val)
            }
        },
        tooltip: {
            y: {
                formatter: (val) => formatCurrency(val)
            }
        },
        fill: {
            opacity: 1,
            colors: ["#4f46e5"]
        },
        colors: ["#4f46e5"]
    };

    const barSeries = [{
        name: "Amount",
        data: data.monthlyData.map(d => d.amount)
    }];

    // Pie Chart Options
    const pieOptions: ApexOptions = {
        chart: {
            id: "invoice-status",
            fontFamily: "inherit",
        },
        labels: data.statusData.map(d => d.name),
        colors: data.statusData.map(d => d.color),
        legend: {
            position: "bottom",
            labels: { colors: "#9ca3af" }
        },
        dataLabels: { enabled: false },
        tooltip: {
            y: {
                formatter: (val) => `${val} Invoices`
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%'
                }
            }
        }
    };

    const pieSeries = data.statusData.map(d => d.value);

    // Hydration check to prevent mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invoices</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{data.totalInvoices}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Paid</h3>
                    <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(data.paidAmount)}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pending</h3>
                    <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(data.pendingAmount)}</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Monthly Spending Bar Chart */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Monthly Expenses</h3>
                    <div className="h-[350px] w-full">
                        <Chart 
                            options={barOptions} 
                            series={barSeries} 
                            type="bar" 
                            width="100%" 
                            height="100%" 
                        />
                    </div>
                </div>

                {/* Status Pie Chart */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Invoice Status</h3>
                    <div className="h-[350px] w-full">
                        <Chart 
                            options={pieOptions} 
                            series={pieSeries} 
                            type="donut" 
                            width="100%" 
                            height="100%" 
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
