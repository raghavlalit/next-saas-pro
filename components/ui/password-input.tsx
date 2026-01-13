"use client"

import * as React from "react"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = true, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [strength, setStrength] = React.useState(0)
    const [value, setValue] = React.useState("")

    const requirements = [
        { label: "At least 8 characters", regex: /.{8,}/ },
        { label: "One uppercase letter", regex: /[A-Z]/ },
        { label: "One lowercase letter", regex: /[a-z]/ },
        { label: "One number", regex: /[0-9]/ },
        { label: "One special character", regex: /[^A-Za-z0-9]/ },
    ];

    const calculateStrength = (val: string) => {
        let score = 0;
        requirements.forEach(req => {
            if (req.regex.test(val)) score++;
        });
        return (score / requirements.length) * 100;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue(val);
        setStrength(calculateStrength(val));
        if (onChange) onChange(e);
    };

    const getStrengthColor = (score: number) => {
        if (score <= 20) return "bg-red-500";
        if (score <= 40) return "bg-orange-500";
        if (score <= 60) return "bg-yellow-500";
        if (score <= 80) return "bg-blue-500";
        return "bg-green-500";
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className={cn(
              "flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-indigo-600",
              className
            )}
            ref={ref}
            onChange={handleChange}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </button>
        </div>

        {showStrength && value && (
            <div className="space-y-2">
                <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor(strength)}`}
                        style={{ width: `${strength}%` }}
                    />
                </div>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {requirements.map((req, index) => {
                        const isMet = req.regex.test(value);
                        return (
                            <div key={index} className="flex items-center space-x-2 text-xs">
                                {isMet ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <X className="h-3 w-3 text-gray-400" />
                                )}
                                <span className={isMet ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
                                    {req.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"
