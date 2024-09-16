import { IconSearch } from '@douyinfe/semi-icons'
import { Input } from '@douyinfe/semi-ui'
import { useRef, useState } from 'react'
import styled from 'styled-components'

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
export default function Search({ onSearch }: SearchProps) {
	const [inputValue, setInputValue] = useState('')
	const isCompositionRef = useRef(false)

	const handleCompositionStart = () => {
		isCompositionRef.current = true
	}

	const handleCompositionEnd = () => {
		isCompositionRef.current = false
	}

	const handleInputChange = (value: string) => {
		setInputValue(value)
		const formattedValue = isCompositionRef.current
			? value
					.split("'")
					.filter((item) => item.trim())
					.join('')
			: value
		onSearch(formattedValue.toLowerCase())
	}

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
				placeholder='Type to search'
			/>
			<Divider />
		</SearchContainer>
	)
}
