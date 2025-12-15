import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EditableCellProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "currency" | "percentage" | "interestRate" | "termMonths" | "periodMonths";
  className?: string;
  onEnter?: () => void;
  onTab?: () => void;
  dataField?: string;
  min?: number;
  max?: number;
  required?: boolean;
  validateFn?: (value: string) => string | null;
}

export const EditableCell = ({ 
  value, 
  onChange, 
  type = "text", 
  className = "", 
  onEnter, 
  onTab, 
  dataField,
  min,
  max,
  required = false,
  validateFn
}: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());
  const [error, setError] = useState<string | null>(null);

  const formatValue = (val: string | number) => {
    if (type === "currency") {
      const num = typeof val === "string" ? parseFloat(val) || 0 : val;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
    }
    if (type === "percentage" || type === "interestRate") {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(Number(num)) ? val : `${num}%`;
    }
    return val;
  };

  const validateValue = (val: string): string | null => {
    if (required && !val) {
      return "Required";
    }

    // Special validation types
    if (type === "interestRate" || type === "percentage") {
      const numValue = parseFloat(val);
      if (val && isNaN(numValue)) {
        return "Invalid number";
      }
      if (numValue < 0 || numValue > 100) {
        return "Must be 0-100%";
      }
    } else if (type === "termMonths") {
      const numValue = parseFloat(val);
      if (val && isNaN(numValue)) {
        return "Invalid number";
      }
      if (numValue < 1 || numValue > 600) {
        return "Must be 1-600";
      }
    } else if (type === "periodMonths") {
      const numValue = parseFloat(val);
      if (val && isNaN(numValue)) {
        return "Invalid number";
      }
      if (numValue < 1 || numValue > 12) {
        return "Must be 1-12";
      }
    } else if ((type === "number" || type === "currency") && val) {
      const numValue = parseFloat(val);
      if (isNaN(numValue)) {
        return "Invalid number";
      }
      if (min !== undefined && numValue < min) {
        return `Min: ${min}`;
      }
      if (max !== undefined && numValue > max) {
        return `Max: ${max}`;
      }
    }
    
    if (validateFn) {
      return validateFn(val);
    }
    
    return null;
  };

  const handleBlur = () => {
    const validationError = validateValue(tempValue);
    setError(validationError);
    setIsEditing(false);
    onChange(tempValue);
  };

  const handleClick = () => {
    const val = value.toString();
    // If the value is "0" or empty, clear it when clicking to edit
    if (val === "0" || val === "" || parseFloat(val) === 0) {
      setTempValue("");
    } else {
      setTempValue(val);
    }
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
      onEnter?.();
      return;
    }

    if (e.key === "Tab" && !e.shiftKey && onTab) {
      e.preventDefault();
      handleBlur();
      onTab();
    }
  };

  if (isEditing) {
    return (
      <TooltipProvider>
        <div className="relative">
          <Input
            type={type === "currency" || type === "number" || type === "percentage" || type === "interestRate" || type === "termMonths" || type === "periodMonths" ? "number" : "text"}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className={`h-9 ${error ? "border-destructive" : "border-primary"} ${className}`}
            data-field={dataField}
            aria-invalid={!!error}
          />
          {error && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-3 w-3 text-destructive absolute right-2 top-1/2 -translate-y-1/2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{error}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative">
        <div
          onClick={handleClick}
          data-field={dataField}
          className={`h-9 px-3 py-2 cursor-text hover:bg-muted/50 transition-colors ${error ? "border-l-2 border-l-destructive" : ""} ${className}`}
        >
          {formatValue(value)}
        </div>
        {error && (
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-3 w-3 text-destructive absolute right-2 top-1/2 -translate-y-1/2 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{error}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
