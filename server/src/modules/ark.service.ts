import { Injectable } from '@nestjs/common'

const fs = require('node:fs')
const path = require('node:path')

@Injectable()
export class ArkService {
	private readonly arkApiKey: string
	private readonly arkApiUrl: string
	private readonly arkApiModel: string

	constructor() {
		this.arkApiKey = process.env.ARK_API_KEY
		this.arkApiUrl = process.env.ARK_API_URL
		this.arkApiModel = process.env.ARK_API_MODEL
	}

	// 流式标签页分类专用方法
	async categorizeTabsStream(data: any, language: string) {
		const promptFilePath = path.join(process.cwd(), 'prompts', `ai-grouping-prompt-${language}.txt`)

		try {
			const systemPrompt = fs.readFileSync(promptFilePath, 'utf-8')
			const messages = [
				{
					role: 'system',
					content: systemPrompt,
				},
				{
					role: 'user',
					content: JSON.stringify(data),
				},
			]

			console.log('📤 准备发送到 ARK API, 用户数据长度:', JSON.stringify(data).length, '字符')
			return this.stream(messages)
		} catch (error) {}
	}

	// 流式调用
	async stream(messages: any[], modelConfigs: any = {}) {
		try {
			console.log('开始流式调用 ARK API...')

			if (!this.arkApiKey || !this.arkApiUrl || !this.arkApiModel) {
				throw new Error('环境变量未设置')
			}

			const requestBody = {
				model: modelConfigs.model || this.arkApiModel,
				stream: true,
				messages,
				// 禁用thinking
				thinking: {
					type: 'disabled',
				},
				...modelConfigs,
			}

			const response = await fetch(this.arkApiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.arkApiKey}`,
				},
				body: JSON.stringify(requestBody),
			})

			if (!response.ok) {
				throw new Error(`ARK API 流式请求失败: ${response.status} ${response.statusText}`)
			}

			console.log('✅ ARK API 流式请求成功，开始返回响应流')
			// 在客户端进一步处理流式数据
			return response
		} catch (error) {
			console.error('ARK API 流式调用失败:', error)
			throw error
		}
	}
}
