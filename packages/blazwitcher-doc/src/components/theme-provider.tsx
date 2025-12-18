'use client'

import type { ThemeProviderProps } from 'next-themes'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * 主题提供者组件
 * @param {ThemeProviderProps} props - 主题配置属性
 * @returns 封装后的主题提供者组件
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
