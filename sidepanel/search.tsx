import { IconSearch } from "@douyinfe/semi-icons"
import { Input } from "@douyinfe/semi-ui"
import { useState } from "react"
import styled from "styled-components"

const InputWrapper = styled.input`
  width: 100%;
  height: 40px;
  outline: none;
  border: none;
  border-radius: 8px;
`

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #ccc;
  margin: 10px 0;
`

interface SearchProps {
  onSearch: (value: string) => void
}
export default function Search({ onSearch }: SearchProps) {
  const [inputValue, setInputValue] = useState("")

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value)
    onSearch(e.target.value)
  }

  return (
    <SearchContainer>
      <Input
        prefix={<IconSearch />}
        showClear
        value={inputValue}
        onChange={handleInputChange}
        placeholder="input words to perform fuzzy search"></Input>
      {/* <Divider></Divider> */}
    </SearchContainer>
  )
}
