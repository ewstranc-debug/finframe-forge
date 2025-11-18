import { useState } from "react";
import { Input } from "@/components/ui/input";

interface EditableCellProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "currency";
  className?: string;
}

export const EditableCell = ({ value, onChange, type = "text", className = "" }: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  const formatValue = (val: string | number) => {
    if (type === "currency") {
      const num = typeof val === "string" ? parseFloat(val) || 0 : val;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    }
    return val;
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(tempValue);
  };

  if (isEditing) {
    return (
      <Input
        type={type === "currency" || type === "number" ? "number" : "text"}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === "Enter" && handleBlur()}
        autoFocus
        className={`h-9 border-primary ${className}`}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`h-9 px-3 py-2 cursor-text hover:bg-muted/50 transition-colors ${className}`}
    >
      {formatValue(value)}
    </div>
  );
};
