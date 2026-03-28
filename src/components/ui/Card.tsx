import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

/**
 * Card component variants defined with class-variance-authority.
 * Standardizing on Glassmorphism and modern flat/elevated patterns.
 */
const cardVariants = cva(
  "relative overflow-hidden transition-all duration-300 outline-none",
  {
    variants: {
      variant: {
        flat: "bg-white border border-slate-100 shadow-sm",
        elevated: "bg-white border border-slate-100 shadow-[0_20px_80px_-20px_rgb(0,0,0,0.05)]",
        glass: "bg-white/70 backdrop-blur-md border border-white/20 shadow-xl",
        outline: "bg-transparent border-2 border-slate-100",
      },
      radius: {
        default: "rounded-2xl",
        xl: "rounded-3xl",
        "2xl": "rounded-[40px]",
        none: "rounded-none",
      },
      hover: {
        true: "hover:shadow-2xl hover:border-primary/20",
        scale: "hover:scale-[1.01] hover:shadow-2xl",
        none: "",
      },
    },
    defaultVariants: {
      variant: "flat",
      radius: "default",
      hover: "none",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, radius, hover, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(cardVariants({ variant, radius, hover, className }))}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card, cardVariants };
