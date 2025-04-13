import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 将多个类名合并成一个字符串，用于在React组件中动态应用类名
 * 使用clsx处理条件类名，使用tailwind-merge合并tailwind类
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
} 