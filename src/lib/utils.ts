import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(eur: number): string {
  return new Intl.NumberFormat("sr-Latn-ME", { maximumFractionDigits: 0 }).format(eur) + " €";
}

export function formatKm(km: number): string {
  return new Intl.NumberFormat("sr-Latn-ME").format(km) + " km";
}

export function slugify(str: string): string {
  return str
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
