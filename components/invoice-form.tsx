'use client';

import { useState, useEffect } from 'react';
import { createInvoice } from '@/app/actions';
import { Plus, Trash } from 'lucide-react';

export function InvoiceForm({ clients }: { clients: any[] }) {
    const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);
    const [issuedDate, setIssuedDate] = useState("");
    const [dueDate, setDueDate] = useState("");

    // Initialize dates on client only to avoid hydration mismatch
    useEffect(() => {
        setTimeout(() => {
            setIssuedDate(new Date().toISOString().split('T')[0]);
            setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        }, 0);
    }, []);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    return (
        <form action={createInvoice} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
                    <select
                        name="clientId"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                        <option value="">Select a client</option>
                        {clients.map((client: any) => (
                            <option key={client.id} value={client.id}>
                                {client.name} ({client.clientCode})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                    <select
                        name="currency"
                        defaultValue="USD"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issued Date</label>
                    <input
                        type="date"
                        name="issuedDate"
                        required
                        value={issuedDate}
                        onChange={(e) => setIssuedDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                    <input
                        type="date"
                        name="dueDate"
                        required
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select
                        name="status"
                        defaultValue="PENDING"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Items</h3>
                    <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                        <Plus className="h-4 w-4" />
                        Add Item
                    </button>
                </div>

                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                    {items.map((item, index) => (
                        <div key={index} className="mb-4 grid grid-cols-12 gap-4 last:mb-0">
                            <div className="col-span-6">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Description</label>
                                <input
                                    type="text"
                                    name="items.description"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Qty</label>
                                <input
                                    type="number"
                                    name="items.quantity"
                                    min="1"
                                    required
                                    defaultValue={1}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[index].quantity = parseInt(e.target.value) || 0;
                                        setItems(newItems);
                                    }}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                                />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Price</label>
                                <input
                                    type="number"
                                    name="items.unitPrice"
                                    min="0"
                                    step="0.01"
                                    required
                                    defaultValue={0}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[index].unitPrice = parseFloat(e.target.value) || 0;
                                        setItems(newItems);
                                    }}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                                />
                            </div>
                            <div className="col-span-1 flex items-end justify-center pb-2">
                                {items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="text-red-600 hover:text-red-500 dark:text-red-400"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <div className="w-48 space-y-2">
                        <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
                            <span>Total</span>
                            <span>{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    Create Invoice
                </button>
            </div>
        </form>
    );
}
