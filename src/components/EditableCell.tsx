import { useState } from "react";
import { Input } from "@/components/ui/input";

interface EditableCellProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "currency";
  className?: string;
  onEnter?: () => void;
  onTab?: () => void;
}

export const EditableCell = ({ value, onChange, type = "text", className = "", onEnter, onTab }: EditableCellProps) => {
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
      if (onEnter) onEnter();
    } else if (e.key === "Tab" && !e.shiftKey) {
      handleBlur();
      if (onTab) {
        e.preventDefault();
        onTab();
      }
    }
  };

  if (isEditing) {
    return (
      <Input
        type={type === "currency" || type === "number" ? "number" : "text"}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className={`h-9 border-primary ${className}`}
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`h-9 px-3 py-2 cursor-text hover:bg-muted/50 transition-colors ${className}`}
    >
      {formatValue(value)}
    </div>
  );
};
