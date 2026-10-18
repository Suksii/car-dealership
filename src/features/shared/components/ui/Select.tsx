"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useOutsideClick } from "@/lib/hooks/useOutsideClick";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Ime skrivenog polja, da vrijednost ode u FormData server akcije. */
  name?: string;
  id?: string;
  className?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  searchable?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Prazna opcija na vrhu liste (resetuje izbor). */
  clearable?: boolean;
}

const SIZE = { sm: "h-10 text-sm", md: "h-12 text-sm" } as const;

export default function Select({
  options,
  value,
  onChange,
  placeholder = "Izaberi",
  name,
  id,
  className,
  size = "md",
  disabled = false,
  searchable = false,
  required = false,
  invalid = false,
  clearable = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(0);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const visible = searchable && q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  useOutsideClick(containerRef, () => setOpen(false), open);

  useEffect(() => {
    if (!open) return;
    (listRef.current?.children[focused] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
  }, [focused, open]);

  useEffect(() => {
    if (open && searchable) inputRef.current?.focus();
  }, [open, searchable]);

  const openDropdown = () => {
    if (disabled) return;
    setQuery("");
    setFocused(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  };

  const select = (v: string) => {
    onChange(v);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocused((i) => Math.min(i + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocused((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || (e.key === " " && !searchable)) {
      e.preventDefault();
      if (visible[focused]) select(visible[focused].value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        onKeyDown={onKeyDown}
        className={cn(
          "focus-visible:border-foreground focus-visible:ring-accent/20 flex w-full items-center justify-between gap-2 rounded-xl border bg-white pr-3 pl-4 text-left transition-colors outline-none focus-visible:ring-2",
          SIZE[size],
          invalid ? "border-danger" : open ? "border-foreground" : "border-border hover:border-neutral-400",
          disabled && "cursor-not-allowed bg-neutral-50 opacity-60",
        )}
      >
        <span className={cn("truncate", !selected && "text-neutral-400")}>{selected?.label ?? placeholder}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn("flex-none text-neutral-400 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "border-border shadow-custom absolute top-full left-0 z-50 mt-1.5 w-full min-w-48 origin-top overflow-hidden rounded-xl border bg-white transition-[opacity,transform] duration-150",
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        {searchable && (
          <div className="border-border relative border-b">
            <Search
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setFocused(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Pretraži…"
              className="w-full bg-transparent py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
        )}
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="max-h-64 w-full scrollbar-thin overflow-x-hidden overflow-y-auto py-1.5"
        >
          {clearable && !q && (
            <li
              role="option"
              aria-selected={!value}
              onClick={() => select("")}
              onMouseEnter={() => setFocused(-1)}
              className="cursor-pointer px-4 py-2.5 text-sm text-neutral-400 hover:bg-neutral-100"
            >
              {placeholder}
            </li>
          )}
          {visible.length === 0 ? (
            <li className="px-4 py-2.5 text-center text-sm text-neutral-400">Nema rezultata</li>
          ) : (
            visible.map((o, i) => {
              const isSelected = o.value === value;
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(o.value)}
                  onMouseEnter={() => setFocused(i)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors",
                    isSelected && "font-semibold",
                    i === focused && "bg-neutral-100",
                  )}
                >
                  <span>{o.label}</span>
                  {isSelected && <Check size={14} strokeWidth={2.5} aria-hidden="true" className="flex-none" />}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
