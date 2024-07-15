import { IconSearch } from "@douyinfe/semi-icons"
import { Input } from "@douyinfe/semi-ui"
import { useState } from "react"
import styled from "styled-components"

const SearchContainer = styled.div`
  width: 100%;
  height: 100%;
`
const InputContainer = styled.div`
  padding: 4px;
`
const InputWrapper = styled(Input)`
  background-color: var(--color-linear-bg-start) !important;
  border: none;
`
const Divider = styled.div`
  width: 100%;
  height: 2px;
  background-color: var(--color-neutral-8);
`
interface SearchProps {
  onSearch: (value: string) => void
}
export default function Search({ onSearch }: SearchProps) {
  const [inputValue, setInputValue] = useState("")

  const handleInputChange = (value: string) => {
    setInputValue(value)

    onSearch(value)
  }

  return (
    <SearchContainer>
      <InputContainer>
        <InputWrapper
          prefix={<IconSearch />}
          autoFocus
          showClear
          size="large"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="input words to perform fuzzy search"></InputWrapper>
      </InputContainer>
      <Divider></Divider>
    </SearchContainer>
  )
}
