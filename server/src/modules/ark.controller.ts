import { Body, Controller, Post, Res } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import type { Response } from 'express'
import { ArkService } from './ark.service'

interface CategorizeTabsRequestDto {
	data: any
	language?: string
}

@Controller('ark')
@Throttle({ default: { ttl: 60 * 60 * 1000, limit: 10 } })
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

			if (response.body) {
				const reader = response.body.getReader()
				const decoder = new TextDecoder()
				
				while (true) {
					const { done, value } = await reader.read()
					if (done) break
					
					const chunk = decoder.decode(value)
					
					const lines = chunk.split('\n').filter((line) => line.trim())
					
					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const data = line.slice(6)
							
							if (data === '[DONE]') {
								res.write(`data: ${JSON.stringify({ status: 'finished' })}\n\n`)
								break
							}
							
							try {
								const parsed = JSON.parse(data)
								
								// 提取content和status
								const content = parsed.choices?.[0]?.delta?.content || ''
								const status = parsed.choices?.[0]?.finish_reason ? 'finished' : 'streaming'
								
								if (content) {
									res.write(`data: ${JSON.stringify({ content, status })}\n\n`)
								}
							} catch (e) {
								console.log('解析chunk失败:', line, e.message)
							}
						}
					}
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
