import { MAIN_WINDOW } from '~shared/constants'
import { appendContextMenus } from '~shared/context-menu'
import { dataProcessing } from '~shared/data-processing'
import { setupOmnibox } from '~shared/omnibox'
import { wakeUpWindowIfActiveByUser } from '~shared/open-window'
import { closeCurrentWindowAndClearStorage } from '~shared/utils'

async function main() {
	wakeUpWindowIfActiveByUser()
	appendContextMenus()
	// It can not be an sync calculation, since maybe the bookmarks data of user is way too large.
	const getProcessedData = await dataProcessing()
	setupOmnibox(getProcessedData)
	chrome.runtime.onConnect.addListener(async (port) => {
		if (port.name === MAIN_WINDOW) {
			// 第一版简单点，background 实时计算 tabs 和 bookmarks 数据，在用户打开 window 时，同步发送过去
			port.postMessage(await getProcessedData())
			port.onMessage.addListener((message) => {
				if (message.type === 'close') {
					closeCurrentWindowAndClearStorage()
				}
			})
		}
	})
}

main()
