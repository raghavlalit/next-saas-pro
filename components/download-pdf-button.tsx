"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Download, FileText } from "lucide-react"

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

interface Invoice {
    id: string;
    invoiceNumber: string;
    issuedDate: Date | string;
    dueDate: Date | string;
    currency: string;
    amountTotal: number;
    status: string;
    client: {
        name: string;
        email: string;
        billingAddress: string;
        phone?: string | null;
    };
    items: InvoiceItem[];
}

export function DownloadPDFButton({ invoice }: { invoice: Invoice }) {
    
    const generatePDF = () => {
        const doc = new jsPDF()

        // Company Logo/Header (Placeholder for now)
        doc.setFontSize(22)
        doc.text("INVOICE", 14, 20)
        
        doc.setFontSize(10)
        doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30)
        doc.text(`Status: ${invoice.status}`, 14, 35)
        
        // Right Side Header (Dates)
        const dateX = 140
        doc.text(`Issued: ${new Date(invoice.issuedDate).toLocaleDateString()}`, dateX, 30)
        doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, dateX, 35)

        // Bill To
        doc.setFontSize(14)
        doc.text("Bill To:", 14, 55)
        doc.setFontSize(10)
        doc.text(invoice.client.name, 14, 62)
        doc.text(invoice.client.email, 14, 67)
        if (invoice.client.phone) doc.text(invoice.client.phone, 14, 72)
        
        // Split address lines for multiline support
        const splitAddress = doc.splitTextToSize(invoice.client.billingAddress, 80)
        doc.text(splitAddress, 14, invoice.client.phone ? 77 : 72)

        // Items Table
        const tableStartY = 100
        const tableData = invoice.items.map(item => [
            item.description,
            item.quantity.toString(),
            `${invoice.currency} ${item.unitPrice.toFixed(2)}`,
            `${invoice.currency} ${item.amount.toFixed(2)}`
        ])

        autoTable(doc, {
            startY: tableStartY,
            head: [['Description', 'Qty', 'Unit Price', 'Amount']],
            body: tableData,
            foot: [['', '', 'Total', `${invoice.currency} ${invoice.amountTotal.toFixed(2)}`]],
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        })

        // Footer
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(10)
        doc.setTextColor(150)
        doc.text("Thank you for your business!", 14, finalY)

        // Save
        doc.save(`Invoice-${invoice.invoiceNumber}.pdf`)
    }

    return (
        <button
            onClick={generatePDF}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
            <Download className="h-4 w-4" />
            Download PDF
        </button>
    )
}
