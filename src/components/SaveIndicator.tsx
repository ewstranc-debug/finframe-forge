import { Check, Loader2, AlertCircle } from "lucide-react";

interface SaveIndicatorProps {
  status: 'saved' | 'saving' | 'error';
}

export const SaveIndicator = ({ status }: SaveIndicatorProps) => {
  if (status === 'saved') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4 text-green-600" />
        <span>All changes saved</span>
      </div>
    );
  }

  if (status === 'saving') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span>Error saving</span>
    </div>
  );
};
