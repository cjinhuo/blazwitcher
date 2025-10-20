import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
	// SEO 优化配置
	poweredByHeader: false,
	compress: true,

	// 图片优化
	images: {
		formats: ['image/webp', 'image/avif'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},

	// 实验性功能
	experimental: {
		optimizePackageImports: ['lucide-react'],
	},

	// 重定向配置
	async redirects() {
		return [
			{
				source: '/home',
				destination: '/',
				permanent: true,
			},
		]
	},

	// Headers 配置
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
					{
						key: 'Referrer-Policy',
						value: 'origin-when-cross-origin',
					},
				],
			},
		]
	},
}

export default withNextIntl(nextConfig)
