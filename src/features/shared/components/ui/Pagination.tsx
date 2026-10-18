import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  /** Šablon sa `{page}`, npr. "/automobili?marka=bmw&page={page}" */
  hrefTemplate: string;
  className?: string;
}

const btn = "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white transition-colors";

export default function Pagination({ currentPage, lastPage, hrefTemplate, className }: PaginationProps) {
  if (lastPage <= 1) return null;
  const href = (p: number) => hrefTemplate.replace("{page}", String(p));

  const pages: (number | "...")[] = [];
  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(lastPage - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < lastPage - 2) pages.push("...");
    pages.push(lastPage);
  }

  return (
    <nav className={cn("flex items-center justify-center gap-1.5", className)} aria-label="Stranice">
      {currentPage > 1
        ? <Link href={href(currentPage - 1)} className={cn(btn, "hover:border-foreground")} aria-label="Prethodna"><ChevronLeft size={16} /></Link>
        : <span className={cn(btn, "opacity-40")}><ChevronLeft size={16} /></span>}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} className="px-1 text-muted">…</span>
        ) : (
          <Link key={p} href={href(p)} aria-current={p === currentPage ? "page" : undefined}
            className={cn(btn, "text-sm font-medium", p === currentPage ? "border-foreground bg-foreground text-white" : "hover:border-foreground")}>
            {p}
          </Link>
        ),
      )}
      {currentPage < lastPage
        ? <Link href={href(currentPage + 1)} className={cn(btn, "hover:border-foreground")} aria-label="Sljedeća"><ChevronRight size={16} /></Link>
        : <span className={cn(btn, "opacity-40")}><ChevronRight size={16} /></span>}
    </nav>
  );
}
