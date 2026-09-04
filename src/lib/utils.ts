import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function rsToPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paisaToRs(paisa: number): number {
  return paisa / 100;
}

export function formatRs(paisa: number): string {
  return `Rs. ${paisaToRs(paisa).toLocaleString("en-IN")}`;
}
