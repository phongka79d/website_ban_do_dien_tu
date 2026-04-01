import React from "react";
import { formatCompactNumber, formatCurrency } from "@/utils/format";

interface CompactNumberProps {
  value: number | string;
  className?: string;
  showFullOnHover?: boolean;
}

/**
 * CompactNumber Component
 * Rút gọn con số lớn cho giao diện Dashboard Premium.
 */
export const CompactNumber: React.FC<CompactNumberProps> = ({ 
  value, 
  className = "", 
  showFullOnHover = true 
}) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return <span className={className}>{value}</span>;

  const compactValue = formatCompactNumber(numValue);
  const fullValue = formatCurrency(numValue);

  return (
    <span 
      className={`inline-block transition-all ${className}`} 
      title={showFullOnHover ? fullValue : undefined}
    >
      {compactValue}
    </span>
  );
};
