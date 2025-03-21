import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 类名合并工具函数
 * 结合 clsx 和 tailwind-merge 的功能，用于安全地合并和优化类名
 *
 * @param {...ClassValue[]} inputs - 需要合并的类名参数，可以是字符串、数组或对象
 * @returns {string} 合并并优化后的类名字符串
 *
 * @example
 * cn('text-red-500', 'hover:text-red-600') // 返回合并后的类名字符串
 * cn({ 'bg-blue-500': true, 'text-white': false }) // 条件类名处理
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
