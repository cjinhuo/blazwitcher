import { Body, Controller, Post, Res } from '@nestjs/common'
import type { Response } from 'express'
import type { CategorizeTabsRequestDto } from './ark.dto'
import { ArkService } from './ark.service'
import { LLMResponseParser } from './parser'

// 修复 vercel 线上报错问题
type SSEResponse = Response & {
	setHeader(name: string, value: string): void
	write(chunk: string): boolean
	end(): void
	status(code: number): SSEResponse
}

@Controller('ark')
export class ArkController {
	constructor(private readonly arkService: ArkService) {}

	@Post('categorize-tabs')
	async categorizeTabs(
		@Body() body: CategorizeTabsRequestDto,
		@Res({ passthrough: false }) res: SSEResponse
	): Promise<void> {
		try {
			const { data } = body

			console.log('data', data)

			// 流式调用
			const response = await this.arkService.categorizeTabsStream(data)

			// 设置SSE响应头
			res.setHeader('Content-Type', 'text/event-stream')
			res.setHeader('Cache-Control', 'no-cache')
			res.setHeader('Connection', 'keep-alive')
			console.log('response', response)
			if (response.body) {
				const reader = response.body.getReader()
				const decoder = new TextDecoder()
				const parser = new LLMResponseParser()
				while (true) {
					const { done, value } = await reader.read()
					if (done) break

					const chunk = decoder.decode(value)

					const lines = chunk.split('\n').filter((line) => line.trim())

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const data = line.slice(6)

							if (data === '[DONE]') {
								const parsedData = parser.parse(data, true)
								res.write(`data: ${JSON.stringify({ content: parsedData, status: 'finished' })}\n\n`)
								parser.destroy()
								break
							}

							try {
								const parsed = JSON.parse(data)

								// 提取content和status
								const content = parsed.choices?.[0]?.delta?.content || ''
								const status = parsed.choices?.[0]?.finish_reason ? 'finished' : 'streaming'

								if (content) {
									const parsedData = parser.parse(content)
									if (parsedData) {
										res.write(`data: ${JSON.stringify({ content: parsedData, status })}\n\n`)
									}
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
