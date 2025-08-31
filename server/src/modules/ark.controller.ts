import { Body, Controller, Post, Res } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import type { Response } from 'express'
import { ArkService } from './ark.service'

interface CategorizeTabsRequestDto {
	data: any
	language?: string
}

@Controller('ark')
@Throttle({ default: { ttl: 60 * 60 * 1000, limit: 1 } })
export class ArkController {
	constructor(private readonly arkService: ArkService) {}

	@Post('categorize-tabs')
	async categorizeTabs(@Body() body: CategorizeTabsRequestDto, @Res() res: Response) {
		try {
			const { data, language = 'zh' } = body
			
			// 流式调用
			const response = await this.arkService.categorizeTabsStream(data, language)

			// 设置SSE响应头
			res.setHeader('Content-Type', 'text/event-stream')
			res.setHeader('Cache-Control', 'no-cache')
			res.setHeader('Connection', 'keep-alive')

			// 直接透传response body
			if (response.body) {
				const reader = response.body.getReader()
				const decoder = new TextDecoder()
				
				while (true) {
					const { done, value } = await reader.read()
					if (done) break
					
					const chunk = decoder.decode(value)
					res.write(chunk)
				}
				res.end()
			} else {
				res.end()
			}
		} catch (error) {
			res.status(500).write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
			res.end()
		}
	}
}
