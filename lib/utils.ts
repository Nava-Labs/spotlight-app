import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const truncateAddress = (address: string, digit: number) => {
  return address.slice(0, digit) + "••••" + address.slice(44 - digit, 44);
};

export { cn, truncateAddress };
