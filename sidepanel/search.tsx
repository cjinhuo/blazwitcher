import { IconSearch } from '@douyinfe/semi-icons'
import { Input } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue } from 'jotai'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { i18nAtom } from '~sidepanel/atom'
import { CompositionAtom, SearchValueAtom } from './atom'

const SearchContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 6px;
`
const InputWrapper = styled(Input)`
  background-color: var(--color-linear-bg-start) !important;
  border: none;
`
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(--color-neutral-8);
`
interface SearchProps {
	onSearch: (value: string) => void
}
function Search({ onSearch }: SearchProps) {
	const [inputValue, setInputValue] = useState('')
	const [isComposition, setIsComposition] = useAtom(CompositionAtom)
	const searchValue = useAtomValue(SearchValueAtom)
	const i18n = useAtomValue(i18nAtom)

	const handleCompositionStart = () => {
		setIsComposition(true)
	}

	const handleCompositionEnd = () => {
		setIsComposition(false)
	}

	const handleInputChange = useCallback(
		(value: string) => {
			setInputValue(value)
			const formattedValue = isComposition
				? value
						.split("'")
						.filter((item) => item.trim())
						.join('')
				: value
			onSearch(formattedValue.toLowerCase())
		},
		[isComposition, onSearch]
	)

	useEffect(() => {
		setInputValue(searchValue.value)
		onSearch(searchValue.value.toLowerCase())
	}, [searchValue, onSearch])

	return (
		<SearchContainer>
			<InputWrapper
				prefix={<IconSearch />}
				autoFocus
				showClear
				size='large'
				value={inputValue}
				onChange={handleInputChange}
				onCompositionStart={handleCompositionStart}
				onCompositionEnd={handleCompositionEnd}
				placeholder={i18n('placeholder')}
			/>
			<Divider />
		</SearchContainer>
	)
}

export default memo(Search)
