"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useOutsideClick } from "@/lib/hooks/useOutsideClick";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { useIsClient } from "@/lib/hooks/useIsClient";
import { BREAKPOINTS } from "@/lib/breakpoints";
import { fadeIn } from "@/lib/motion/variants";

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
  /** Dugme × u polju koje briše izbor. */
  clearable?: boolean;
}

const SIZE = { sm: "h-10 text-sm", md: "h-12 text-sm" } as const;
const SHEET_QUERY = `(max-width: ${BREAKPOINTS.md - 1}px)`;

/**
 * Custom select: na desktopu padajući panel ispod polja, na telefonu donji „sheet"
 * preko cijelog ekrana (velike stavke, pretraga na vrhu). Tastatura: strelice, Enter, Esc, Tab.
 */
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
  const isSheet = useMediaQuery(SHEET_QUERY);
  const isClient = useIsClient();

  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const visible = searchable && q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  useOutsideClick(containerRef, () => setOpen(false), open && !isSheet);
  useBodyScrollLock(open && isSheet);

  useEffect(() => {
    if (!open) return;
    (listRef.current?.children[focused] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
  }, [focused, open]);

  useEffect(() => {
    if (open && searchable && !isSheet) inputRef.current?.focus();
  }, [open, searchable, isSheet]);

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

  const searchBox = searchable && (
    <div className="relative">
      <Search
        size={15}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-neutral-400"
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
        aria-label="Pretraži opcije"
        className="focus:ring-accent/30 h-10 w-full rounded-lg bg-neutral-100 pr-3 pl-10 text-sm outline-none placeholder:text-neutral-400 focus:bg-neutral-100 focus:ring-2"
      />
    </div>
  );

  const list = (
    <ul
      ref={listRef}
      id={listId}
      role="listbox"
      className={cn("scrollbar-thin overflow-x-hidden overflow-y-auto", isSheet ? "sheet-list px-2 pb-4" : "max-h-64")}
    >
      {visible.length === 0 ? (
        <li className="px-3 py-3 text-center text-sm text-neutral-400">Nema rezultata</li>
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
                "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 transition-colors",
                isSheet ? "py-3.5 text-base" : "py-2.5 text-sm",
                i === focused && !isSheet && "bg-neutral-100",
                isSelected && "text-accent font-semibold",
              )}
            >
              <span className="truncate">{o.label}</span>
              {isSelected && <Check size={16} strokeWidth={2.5} aria-hidden="true" className="flex-none" />}
            </li>
          );
        })
      )}
    </ul>
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={value} />}
      <div className="relative">
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
            selected && clearable && "pr-16",
            invalid ? "border-danger" : open ? "border-foreground" : "border-border hover:border-neutral-400",
            disabled && "cursor-not-allowed bg-neutral-50 opacity-60",
          )}
        >
          <span className={cn("truncate", selected ? "font-medium" : "text-neutral-400")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              "flex-none transition-transform duration-200",
              open ? "text-foreground rotate-180" : "text-neutral-400",
            )}
          />
        </button>
        {selected && clearable && !disabled && (
          <button
            type="button"
            aria-label="Obriši izbor"
            onClick={(e) => {
              e.stopPropagation();
              select("");
            }}
            className="hover:text-foreground absolute top-1/2 right-9 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {!isSheet && (
        <div
          className={cn(
            "shadow-custom ring-border absolute top-full left-0 z-50 mt-1.5 w-full min-w-56 rounded-2xl bg-white p-1.5 ring-1 transition-[opacity,transform] duration-150",
            open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
          )}
        >
          {searchBox && <div className="mb-1.5">{searchBox}</div>}
          {list}
        </div>
      )}

      {isSheet &&
        isClient &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  key="backdrop"
                  aria-hidden="true"
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-70 bg-black/40"
                  {...fadeIn}
                />
                <motion.div
                  key="sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-label={placeholder}
                  className="sheet fixed inset-x-0 bottom-0 z-80 flex flex-col rounded-t-3xl bg-white shadow-2xl"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 420, damping: 40 }}
                >
                  <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-neutral-300" aria-hidden="true" />
                  <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-2">
                    <p className="text-base font-bold">{placeholder}</p>
                    <button
                      type="button"
                      aria-label="Zatvori"
                      onClick={() => setOpen(false)}
                      className="-m-2 p-2 text-neutral-500"
                    >
                      <X size={20} aria-hidden="true" />
                    </button>
                  </div>
                  {searchBox && <div className="px-4 pb-2">{searchBox}</div>}
                  {list}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
