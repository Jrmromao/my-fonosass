'use client'

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

// Define button variants using class-variance-authority
const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    {
        variants: {
            variant: {
                default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
                gradient: "bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-200",
                outline: "border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100",
                ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100",
                link: "bg-transparent underline-offset-4 hover:underline text-blue-600 dark:text-blue-400 hover:bg-transparent",
                secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
                destructive: "bg-red-500 text-white hover:bg-red-600",
                success: "bg-green-500 text-white hover:bg-green-600",
                warning: "bg-amber-500 text-white hover:bg-amber-600",
                // Special gradient styles
                blueGradient: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md",
                tealGradient: "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-md",
            },
            size: {
                default: "h-10 py-2 px-4",
                sm: "h-9 px-3 text-xs",
                lg: "h-12 px-6 text-base",
                icon: "h-10 w-10 p-2",
                iconSm: "h-8 w-8 p-1.5",
            },
            isFullWidth: {
                true: "w-full",
                false: "",
            },
            hasRightIcon: {
                true: "pr-3",
                false: "",
            },
            hasLeftIcon: {
                true: "pl-3",
                false: "",
            },
            isRounded: {
                true: "rounded-full",
                false: "rounded-md",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            isFullWidth: false,
            hasRightIcon: false,
            hasLeftIcon: false,
            isRounded: false,
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    isLoading?: boolean;
    loadingText?: string;
}

const CustomButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
         className,
         variant,
         size,
         isFullWidth,
         isRounded,
         leftIcon,
         rightIcon,
         children,
         isLoading = false,
         loadingText,
         hasLeftIcon,
         hasRightIcon,
         ...props
     }, ref) => {
        // Auto-detect icon presence if not explicitly set
        const hasLeftIconValue = hasLeftIcon || !!leftIcon;
        const hasRightIconValue = hasRightIcon || !!rightIcon;

        return (
            <button
                className={cn(
                    buttonVariants({
                        variant,
                        size,
                        isFullWidth,
                        hasLeftIcon: hasLeftIconValue,
                        hasRightIcon: hasRightIconValue,
                        isRounded,
                        className
                    })
                )}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        {loadingText || children}
                    </>
                ) : (
                    <>
                        {leftIcon && <span className="mr-2">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="ml-2">{rightIcon}</span>}
                    </>
                )}
            </button>
        );
    }
);

CustomButton.displayName = "CustomButton";

export { CustomButton, buttonVariants };