"use strict";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import React from "react";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends React.ComponentProps<typeof PhoneInput> {
    className?: string;
    error?: string;
}

export function CustomPhoneInput({ className, error, ...props }: PhoneInputProps) {
    return (
        <div className={cn("relative", className)}>
            <PhoneInput
                {...props}
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-red-500 focus-visible:ring-red-500",
                    "[&>.PhoneInputCountry]:mr-2 [&>.PhoneInputCountry]:flex [&>.PhoneInputCountry]:items-center",
                    "[&>.PhoneInputCountrySelect]:flex [&>.PhoneInputCountrySelect]:h-full [&>.PhoneInputCountrySelect]:w-full [&>.PhoneInputCountrySelect]:opacity-0",
                    "[&>.PhoneInputCountryIcon]:h-4 [&>.PhoneInputCountryIcon]:w-6 [&>.PhoneInputCountryIcon]:overflow-hidden [&>.PhoneInputCountryIcon]:rounded-sm [&>.PhoneInputCountryIcon]:object-cover",
                    "[&>.PhoneInputInput]:flex-1 [&>.PhoneInputInput]:bg-transparent [&>.PhoneInputInput]:outline-none"
                )}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
