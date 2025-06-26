import { LanguageType } from '~shared/constants'

interface ChangelogItem {
	version: string
	features: {
		[lang in LanguageType]: string
	}[]
}

export const changelog: ChangelogItem[] = [
	{
		version: '0.5.4',
		features: [
			{
				[LanguageType.zh]: '新增严格搜索配置：搜索时可要求英文单词连续匹配',
				[LanguageType.en]: 'Added strict search configuration: Optional consecutive word matching for English',
			},
			{
				[LanguageType.zh]: '新增扩展更新提示',
				[LanguageType.en]: 'Display the update notification',
			},
		],
	},
	// Add more versions here
]
