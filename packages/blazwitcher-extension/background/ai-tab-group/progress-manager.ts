import type { AiGroupingProgress } from '~shared/types'

export class ProgressManager {
	progress: AiGroupingProgress
	private resetTimeoutId: NodeJS.Timeout | null
	private sendProgressUpdate: (progress: AiGroupingProgress) => void

	constructor(sendProgressUpdate: (progress: AiGroupingProgress) => void) {
		this.progress = this.createInitialProgress()
		// DI: sendMessage方法由外部提供
		this.sendProgressUpdate = sendProgressUpdate
	}

	getProgress(): AiGroupingProgress {
		return { ...this.progress }
	}

	// 开始 AI分组
	startProcessing() {
		this.progress.isProcessing = true
		this.notifyUpdate()
	}

	// 设置 totalOperations
	setTotalOperations(total: number) {
		this.progress.totalOperations = total
		this.notifyUpdate()

		if (total === 0) {
			this.complete()
		}
	}

	// 更新 completedOperations
	incrementCompleted() {
		this.progress.completedOperations++
		this.progress.percentage = Math.round((this.progress.completedOperations / this.progress.totalOperations) * 100)
		this.notifyUpdate()

		if (this.progress.completedOperations === this.progress.totalOperations) {
			this.complete()
		}
	}

	// 重置进度
	reset() {
		this.progress = this.createInitialProgress()
		this.notifyUpdate()
	}

	// 调度重置进度
	scheduleReset(delay = 2000) {
		if (this.resetTimeoutId) clearTimeout(this.resetTimeoutId)
		this.resetTimeoutId = setTimeout(() => {
			this.reset()
		}, delay)
	}

	// clean
	destroy() {
		if (this.resetTimeoutId) {
			clearTimeout(this.resetTimeoutId)
		}
		this.progress = this.createInitialProgress()
		this.sendProgressUpdate(this.progress)
	}

	// 结束分组
	private complete() {
		this.progress.isProcessing = false
		this.progress.completedOperations = this.progress.totalOperations
		this.progress.percentage = 100
		this.notifyUpdate()
		this.scheduleReset()
	}

	// 初始化分组进度
	private createInitialProgress(): AiGroupingProgress {
		return {
			isProcessing: false,
			totalOperations: 0,
			completedOperations: 0,
			percentage: 0,
		}
	}

	private notifyUpdate() {
		this.sendProgressUpdate(this.progress)
	}
}
