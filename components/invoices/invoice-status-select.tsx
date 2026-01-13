"use client"

import * as React from "react"
import { updateInvoiceStatus } from "@/app/actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InvoiceStatusSelectProps {
  invoiceId: string
  currentStatus: string
  readonly?: boolean
}

export function InvoiceStatusSelect({
  invoiceId,
  currentStatus,
  readonly = false
}: InvoiceStatusSelectProps) {
  const [isPending, startTransition] = React.useTransition()

  const handleValueChange = (value: string) => {
    startTransition(async () => {
      try {
        await updateInvoiceStatus(invoiceId, value)
      } catch (error) {
        console.error("Failed to update status", error)
      }
    })
  }

  // Base badge styles for read-only View
  const getBadgeStyles = (status: string) => {
      switch (status) {
          case 'PAID':
              return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
          case 'PENDING':
              return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
          default:
              return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      }
  };

  if (readonly) {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeStyles(currentStatus)}`}>
          {currentStatus}
      </span>
    )
  }

  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={handleValueChange}
      disabled={isPending}
    >
      <SelectTrigger className={`h-8 w-[130px] text-xs ${getBadgeStyles(currentStatus)} border-0`}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DRAFT">DRAFT</SelectItem>
        <SelectItem value="PENDING">PENDING</SelectItem>
        <SelectItem value="PAID">PAID</SelectItem>
        <SelectItem value="FAILED">FAILED</SelectItem>
        <SelectItem value="CANCELLED">CANCELLED</SelectItem>
      </SelectContent>
    </Select>
  )
}
