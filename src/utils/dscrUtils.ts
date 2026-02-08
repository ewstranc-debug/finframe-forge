/**
 * Centralized DSCR Status Utilities
 * Standardizes DSCR color thresholds across all components
 * 
 * SBA Guidelines:
 * - Red: < 1.15 (Below SBA minimum threshold)
 * - Yellow: 1.15 - 1.25 (Acceptable but marginal)
 * - Green: >= 1.25 (Strong coverage)
 */

export interface DSCRStatus {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  isAcceptable: boolean;
}

/**
 * Get standardized DSCR status with consistent color coding
 * Uses SBA 1.15 minimum threshold standard
 */
export const getDSCRStatus = (dscr: number): DSCRStatus => {
  if (dscr >= 1.25) {
    return {
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-500',
      label: 'Strong',
      isAcceptable: true,
    };
  }
  
  if (dscr >= 1.15) {
    return {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      borderColor: 'border-yellow-500',
      label: 'Acceptable',
      isAcceptable: true,
    };
  }
  
  return {
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-500',
    label: 'Below Threshold',
    isAcceptable: false,
  };
};

/**
 * Get DSCR color class for inline text styling
 */
export const getDSCRColorClass = (dscr: number): string => {
  if (dscr >= 1.25) return 'text-green-600';
  if (dscr >= 1.15) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Format DSCR status text for display
 */
export const getDSCRStatusText = (dscr: number): string => {
  if (dscr >= 1.25) return '✓ Strong (≥1.25)';
  if (dscr >= 1.15) return '⚠ Acceptable (≥1.15)';
  return '✗ Below Threshold (<1.15)';
};

/**
 * DSCR thresholds as constants for consistent use
 */
export const DSCR_THRESHOLDS = {
  STRONG: 1.25,
  MINIMUM: 1.15,
} as const;
