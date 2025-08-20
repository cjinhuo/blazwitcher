import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
import { DEFAULT_RATE_LIMIT_CONFIG, RateLimitConfig } from './rate-limit.config'

interface RateLimitEntry {
	count: number
	firstRequestTime: number
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
		private readonly rateLimitMap = new Map<string, RateLimitEntry>()
		private readonly config: RateLimitConfig

		constructor() {
			this.config = DEFAULT_RATE_LIMIT_CONFIG
		}

		use(req: Request, res: Response, next: NextFunction) {
			const clientIP = this.getClientIP(req)
			const now = Date.now()

			// 获取或创建该 IP 的限流记录
			let entry = this.rateLimitMap.get(clientIP)

			if (!entry) {
				// 首次请求
				entry = {
					count: 1,
					firstRequestTime: now,
				}
				this.rateLimitMap.set(clientIP, entry)
			} else {
				// 检查是否在时间窗口内
				const timeElapsed = now - entry.firstRequestTime

				if (timeElapsed < this.config.windowSize) {
					// 在时间窗口内，增加计数
					entry.count++

					if (entry.count > this.config.maxRequests) {
						// 超过限制
						const remainingTime = Math.ceil((this.config.windowSize - timeElapsed) / 1000 / 60) // 剩余分钟数
						throw new HttpException(
							{
								error: 'Rate limit exceeded',
								message: this.config.message || `请求过于频繁，请 ${remainingTime} 分钟后再试`,
								remainingTime,
								limit: this.config.maxRequests,
								window: `${this.config.windowSize / 1000 / 60 / 60} hour`,
							},
							HttpStatus.TOO_MANY_REQUESTS
						)
					}
				} else {
					// 超出时间窗口，重置计数
					entry.count = 1
					entry.firstRequestTime = now
				}
			}

			// 添加限流信息到响应头
			if (this.config.headers) {
				res.setHeader('X-RateLimit-Limit', this.config.maxRequests)
				res.setHeader('X-RateLimit-Remaining', this.config.maxRequests - entry.count)
				res.setHeader('X-RateLimit-Reset', new Date(entry.firstRequestTime + this.config.windowSize).toISOString())
			}

			next()
		}

		private getClientIP(req: Request): string {
			// 获取真实 IP 地址，考虑代理情况
			const xForwardedFor = req.headers['x-forwarded-for'] as string
			const xRealIP = req.headers['x-real-ip'] as string
			const xClientIP = req.headers['x-client-ip'] as string

			if (xForwardedFor) {
				// x-forwarded-for 可能包含多个 IP，取第一个
				return xForwardedFor.split(',')[0].trim()
			}

			if (xRealIP) {
				return xRealIP
			}

			if (xClientIP) {
				return xClientIP
			}

			// 回退到连接 IP
			return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown'
		}

		// 清理过期记录的辅助方法（可选，用于内存管理）
		private cleanupExpiredEntries() {
			const now = Date.now()
			for (const [ip, entry] of this.rateLimitMap.entries()) {
				if (now - entry.firstRequestTime > this.config.windowSize) {
					this.rateLimitMap.delete(ip)
				}
			}
		}

		// 启动定期清理任务
		startCleanupTask() {
			setInterval(
				() => {
					this.cleanupExpiredEntries()
				},
				5 * 60 * 1000
			) // 每5分钟清理一次
		}
	}
