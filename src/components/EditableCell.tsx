import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

  /** Optional deterministic spreadsheet navigation (preferred). */
  navScope?: string;
  navRow?: number;
  navCol?: number;
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
  validateFn,
  navScope,
  navRow,
  navCol,
}: EditableCellProps) => {
const safeValue = value ?? "";
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(safeValue.toString());
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
    const val = safeValue.toString();
    // If the value is "0" or empty, clear it when clicking to edit
    if (val === "0" || val === "" || parseFloat(val) === 0) {
      setTempValue("");
    } else {
      setTempValue(val);
    }
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const defer = (fn: () => void) => {
      // Double RAF = reliably after React commits + paints
      requestAnimationFrame(() => requestAnimationFrame(fn));
    };

    const isVisible = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && el.offsetParent !== null;
    };

    const getScope = (start: HTMLElement) => {
      // Pick the nearest ancestor that contains “enough” cells to navigate within.
      let node: HTMLElement | null = start;
      while (node) {
        const count = node.querySelectorAll('[data-editable-cell="display"]').length;
        if (count >= 8) return node;
        node = node.parentElement;
      }
      return document.body;
    };

    type NavDirection = "down" | "up" | "right" | "left";

    const getNavMeta = (start: HTMLElement) => {
      const holder =
        start.closest<HTMLElement>(
          "[data-nav-scope][data-nav-row][data-nav-col]"
        ) ?? start;

      const scope = holder.dataset.navScope;
      const row = holder.dataset.navRow ? Number(holder.dataset.navRow) : NaN;
      const col = holder.dataset.navCol ? Number(holder.dataset.navCol) : NaN;

      if (!scope) return null;
      if (!Number.isFinite(row) || !Number.isFinite(col)) return null;

      return { scope, row, col };
    };

    const findNextByNav = (direction: NavDirection) => {
      const start = e.currentTarget as HTMLElement;
      const meta = getNavMeta(start);
      if (!meta) return null;

      const { scope, row, col } = meta;

      const displays = Array.from(
        document.querySelectorAll<HTMLElement>(
          `[data-editable-cell="display"][data-nav-scope="${scope}"]`
        )
      ).filter(isVisible);

      if (!displays.length) return null;

      const cellByKey = new Map<string, HTMLElement>();
      const colsByRow = new Map<number, number[]>();

      for (const el of displays) {
        const r = el.dataset.navRow ? Number(el.dataset.navRow) : NaN;
        const c = el.dataset.navCol ? Number(el.dataset.navCol) : NaN;
        if (!Number.isFinite(r) || !Number.isFinite(c)) continue;

        cellByKey.set(`${r}:${c}`, el);
        const arr = colsByRow.get(r) ?? [];
        arr.push(c);
        colsByRow.set(r, arr);
      }

      // Normalize column lists per row
      for (const [r, arr] of colsByRow.entries()) {
        const uniqueSorted = Array.from(new Set(arr)).sort((a, b) => a - b);
        colsByRow.set(r, uniqueSorted);
      }

      const rows = Array.from(colsByRow.keys()).sort((a, b) => a - b);
      const rowIndex = rows.indexOf(row);
      if (rowIndex < 0) return null;

      const firstColInRow = (r: number) => colsByRow.get(r)?.[0] ?? null;
      const lastColInRow = (r: number) => {
        const cols = colsByRow.get(r);
        return cols?.[cols.length - 1] ?? null;
      };

      const getCell = (r: number, c: number) => cellByKey.get(`${r}:${c}`) ?? null;

      if (direction === "down" || direction === "up") {
        const step = direction === "down" ? 1 : -1;
        for (let i = rowIndex + step; i >= 0 && i < rows.length; i += step) {
          const r = rows[i];
          const exact = getCell(r, col);
          if (exact) return exact;

          const fallbackCol = firstColInRow(r);
          if (fallbackCol !== null) {
            const fallback = getCell(r, fallbackCol);
            if (fallback) return fallback;
          }
        }
        return null;
      }

      // right / left within row - use actual column value, not index in cols array
      // (current cell's display element is hidden when editing)
      if (direction === "right") {
        const cols = colsByRow.get(row) ?? [];
        for (const c of cols) {
          if (c > col) {
            const target = getCell(row, c);
            if (target) return target;
          }
        }
        // Wrap to next row, first column
        for (let i = rowIndex + 1; i < rows.length; i++) {
          const r = rows[i];
          const c = firstColInRow(r);
          if (c === null) continue;
          const target = getCell(r, c);
          if (target) return target;
        }
        return null;
      }

      if (direction === "left") {
        const cols = colsByRow.get(row) ?? [];
        for (let i = cols.length - 1; i >= 0; i--) {
          if (cols[i] < col) {
            const target = getCell(row, cols[i]);
            if (target) return target;
          }
        }
        // Wrap to prev row, last column
        for (let i = rowIndex - 1; i >= 0; i--) {
          const r = rows[i];
          const c = lastColInRow(r);
          if (c === null) continue;
          const target = getCell(r, c);
          if (target) return target;
        }
        return null;
      }

      return null;
    };

    const findNextInTable = (direction: "down" | "right") => {
      const start = e.currentTarget as HTMLElement;
      const td = start.closest<HTMLElement>("td,th");
      const tr = start.closest<HTMLTableRowElement>("tr");
      if (!td || !tr) return null;

      const getCells = (rowEl: Element) =>
        Array.from(rowEl.children).filter(
          (el) => el.tagName === "TD" || el.tagName === "TH"
        ) as HTMLElement[];

      const rowCells = getCells(tr);
      const colIndex = rowCells.indexOf(td);
      if (colIndex < 0) return null;

      const findEditableInCell = (cell: HTMLElement | undefined) => {
        if (!cell) return null;
        const target = cell.querySelector<HTMLElement>(
          '[data-editable-cell="display"]'
        );
        return target && isVisible(target) ? target : null;
      };

      if (direction === "down") {
        let next = tr.nextElementSibling;
        while (next) {
          if (next instanceof HTMLTableRowElement) {
            const nextCells = getCells(next);
            const target = findEditableInCell(nextCells[colIndex]);
            if (target) return target;
          }
          next = next.nextElementSibling;
        }
        return null;
      }

      // direction === "right" (Tab)
      for (let i = colIndex + 1; i < rowCells.length; i++) {
        const target = findEditableInCell(rowCells[i]);
        if (target) return target;
      }

      // Wrap: first editable cell of the next rows
      let next = tr.nextElementSibling;
      while (next) {
        if (next instanceof HTMLTableRowElement) {
          const nextCells = getCells(next);
          for (const cell of nextCells) {
            const target = findEditableInCell(cell);
            if (target) return target;
          }
        }
        next = next.nextElementSibling;
      }
      return null;
    };

    const findNextByGeometry = (direction: "down" | "right") => {
      const start = e.currentTarget as HTMLElement;
      const scope = getScope(start);
      const cells = Array.from(
        scope.querySelectorAll<HTMLElement>('[data-editable-cell="display"]')
      ).filter(isVisible);

      if (!cells.length) return null;

      const r = start.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const rowTol = Math.max(10, r.height * 0.6);
      const colTol = Math.max(16, r.width * 0.6);

      const scored = (el: HTMLElement) => {
        const b = el.getBoundingClientRect();
        const x = b.left + b.width / 2;
        const y = b.top + b.height / 2;
        return { el, x, y, dx: Math.abs(x - cx), dy: Math.abs(y - cy) };
      };

      if (direction === "down") {
        const candidates = cells
          .map(scored)
          .filter((c) => c.y > cy + 1 && c.dx <= colTol)
          .sort((a, b) => a.y - b.y || a.dx - b.dx);
        return candidates[0]?.el ?? null;
      }

      // direction === "right" (Tab)
      const right = cells
        .map(scored)
        .filter((c) => Math.abs(c.y - cy) <= rowTol && c.x > cx + 1)
        .sort((a, b) => a.x - b.x);
      if (right[0]) return right[0].el;

      // Wrap: first cell of the next row
      const nextRow = cells
        .map(scored)
        .filter((c) => c.y > cy + rowTol)
        .sort((a, b) => a.y - b.y || a.x - b.x);
      return nextRow[0]?.el ?? null;
    };

    const navigateAndCommit = (target: HTMLElement | null, fallback?: () => void) => {
      handleBlur();
      if (target) defer(() => target.click());
      else if (fallback) defer(fallback);
    };

    if (e.key === "Enter") {
      const dir: NavDirection = e.shiftKey ? "up" : "down";
      const navTarget = findNextByNav(dir);
      const fallbackTarget = !e.shiftKey
        ? findNextInTable("down") ?? findNextByGeometry("down")
        : null;

      e.preventDefault();
      navigateAndCommit(navTarget ?? fallbackTarget, onEnter);
      return;
    }

    if (e.key === "Tab") {
      const dir: NavDirection = e.shiftKey ? "left" : "right";
      const navTarget = findNextByNav(dir);
      const fallbackTarget = !e.shiftKey
        ? findNextInTable("right") ?? findNextByGeometry("right")
        : null;

      // Let the browser handle Shift+Tab when we don't have deterministic nav metadata.
      if (e.shiftKey && !navTarget) return;

      e.preventDefault();
      navigateAndCommit(navTarget ?? fallbackTarget, onTab);
      return;
    }
  };

  if (isEditing) {
    return (
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
          data-editable-cell="input"
          data-nav-scope={navScope}
          data-nav-row={navRow}
          data-nav-col={navCol}
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
    );
  }

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        data-field={dataField}
        data-editable-cell="display"
        data-nav-scope={navScope}
        data-nav-row={navRow}
        data-nav-col={navCol}
        className={`h-9 px-3 py-2 cursor-text hover:bg-muted/50 transition-colors ${error ? "border-l-2 border-l-destructive" : ""} ${className}`}
      >
        {formatValue(safeValue)}
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
  );
};
