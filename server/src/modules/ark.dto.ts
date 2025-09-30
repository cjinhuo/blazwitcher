export interface CategorizeTabsRequestDto {
	data: any
}
export interface AIGroupSummary {
	effectExistingGroups: number
	newGroups: number
}

export interface AIEffectExistingGroups {
	tabIds: number[]
	groupId: number
}

export interface AINewGroups {
	groupTitle: string
	groupColor: string
	tabIds: number[]
}
