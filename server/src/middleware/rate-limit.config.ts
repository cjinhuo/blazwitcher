export interface RateLimitConfig {
	windowSize: number // 时间窗口大小（毫秒）
	maxRequests: number // 最大请求次数
	message?: string // 自定义错误消息
	headers?: boolean // 是否添加限流信息到响应头
}

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
	windowSize: 60 * 60 * 1000, // 1小时
	maxRequests: 3, // 每小时最多3次
	message: '请求过于频繁，请稍后再试',
	headers: true,
}
