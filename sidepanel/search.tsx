import { IconSearch } from '@douyinfe/semi-icons'
import { Input } from '@douyinfe/semi-ui'
import { useState, useRef } from 'react'
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
  const isCompisingRef = useRef(false)

  const handleCompositionStart = () => {
    isCompisingRef.current = true
  }

  const handleCompositionEnd = () => {
    isCompisingRef.current = false
  }

	const handleInputChange = (value: string) => {
		setInputValue(value)
    if (isCompisingRef.current) {
      const searchTerms = value.split("'").filter((term) => term.trim())
      const fornattedValue = searchTerms.length > 1 ? searchTerms.join(' ') : value
      onSearch(fornattedValue.toLowerCase())
    } else {
      onSearch(value.toLowerCase())
    }
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
