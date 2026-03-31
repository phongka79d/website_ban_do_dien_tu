import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

/**
 * Button component variants defined with class-variance-authority.
 * Standardizing on Indigo/Black/Slate theme for Antigravity Store.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-black ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer tracking-tight uppercase",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/40",
        secondary:
          "bg-secondary text-white shadow-xl shadow-secondary/30 hover:bg-secondary/90 hover:shadow-secondary/40",
        soft:
          "bg-indigo-50 text-indigo-600 hover:bg-secondary hover:text-white dark:bg-slate-800 dark:text-slate-100/90",
        outline:
          "border-2 border-slate-200 bg-transparent text-slate-700 hover:border-primary hover:text-primary transition-colors",
        danger:
          "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600",
        ghost: "hover:bg-slate-100 text-slate-600 hover:text-primary transition-colors",
        light: "bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors",
        lightDanger: "bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        full: "rounded-full",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      radius: "2xl",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: any;
  href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, radius, fullWidth, isLoading, leftIcon, rightIcon, children, as: Component = "button", ...props }, ref) => {
    return (
      <Component
        className={cn(buttonVariants({ variant, size, radius, fullWidth, className }))}
        ref={ref}
        disabled={isLoading || (props as any).disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span className={cn(isLoading && "opacity-0")}>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </Component>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
