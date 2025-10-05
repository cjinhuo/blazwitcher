import type { AIGroupSummary, AINewGroups } from './ark.dto'

import type { AIEffectExistingGroups } from './ark.dto'

type TagHandler<T> = (data: any) => T

export class LLMResponseParser {
	private progress = 0
	private summary: AIGroupSummary = {
		effectExistingGroups: 0,
		newGroups: 0,
	}
	private newGroups: AINewGroups[] = []
	private effectExistingGroups: AIEffectExistingGroups[] = []
	// 大模型返回的累加值
	private accumulator = ''

	//  解析 LLM 响应，并将解析结果存储到类的属性中
	public parse(llmResponse: string, complete = false) {
		// 将新的响应内容添加到累加器中
		this.accumulator += llmResponse

		// 解析完整的 XML
		if (this.parseCompleteTags() || complete) {
			return this.getStatus()
		}

		return undefined
	}

	private parseCompleteTags() {
		// 解析 summary 标签
		const hasSummary = this.parseXMLTags('summary', (data) => {
			this.summary = {
				effectExistingGroups: data.effectExistingGroups || 0,
				newGroups: data.newGroups || 0,
			}
		})

		// 解析 e_g 标签
		const hasEG = this.parseXMLTags('e_g', (data) => {
			data.groupId &&
				data.tabIds &&
				data.tabIds.length > 0 &&
				this.effectExistingGroups.push({
					tabIds: data.tabIds || [],
					groupId: data.groupId,
				})
		})

		// 解析 n_g 标签
		const hasNG = this.parseXMLTags('n_g', (data) => {
			data.groupTitle &&
				data.tabIds &&
				data.tabIds.length > 0 &&
				this.newGroups.push({
					groupTitle: data.groupTitle,
					groupColor: data.groupColor || 'deepskyblue',
					tabIds: data.tabIds || [],
				})
		})
		if (hasSummary || hasEG || hasNG) {
			this.updateProgress()
			return true
		}
		return false
	}

	/**
	 * 通用的 XML 标签解析方法
	 * @param tagName 标签名称
	 * @param tagsToRemove 需要移除的标签列表
	 * @param handler 数据处理函数
	 */
	private parseXMLTags<T>(tagName: string, handler: TagHandler<T>) {
		const regex = new RegExp(`<${tagName}>\\s*({[\\s\\S]*?})\\s*<\\/${tagName}>`, 'g')
		let match: RegExpExecArray | null

		while ((match = regex.exec(this.accumulator)) !== null) {
			try {
				const data = JSON.parse(match[1])
				console.log('tagName', tagName, 'data', data)
				handler(data)
				this.accumulator = ''
				return true
			} catch (error) {
				console.error(`解析 ${tagName} 标签失败:`, error)
				return false
			}
		}
	}

	private updateProgress() {
		// 如果已经解析到 summary，说明开始处理
		if (this.summary.effectExistingGroups > 0 || this.summary.newGroups > 0) {
			const totalExpected = this.summary.effectExistingGroups + this.summary.newGroups
			const currentParsed = this.effectExistingGroups.length + this.newGroups.length

			if (totalExpected > 0) {
				this.progress = Math.min(100, Math.round((currentParsed / totalExpected) * 100))
			}
		}
	}

	public getStatus() {
		return {
			progress: this.progress,
			newGroups: this.newGroups,
			effectExistingGroups: this.effectExistingGroups,
		}
	}

	// 重置解析器状态
	public destroy() {
		this.progress = 0
		this.summary = {
			effectExistingGroups: 0,
			newGroups: 0,
		}
		this.newGroups = []
		this.effectExistingGroups = []
		this.accumulator = ''
	}
}
