import './sidepanel.css'

import { Layout } from '@douyinfe/semi-ui'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { MAIN_CONTENT_CLASS } from '~shared/constants'
import { orderList, searchWithList, setDarkTheme } from '~shared/utils'

import Footer from './footer'
import useOriginalList from './hooks/useOriginalList'
import List from './list'
import { RenderItem } from './list-item'
import Search from './search'

const { Header, Content } = Layout
const Container = styled(Layout)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`
const ContentWrapper = styled(Content)`
  flex: 1;
  overflow-y: scroll;
  padding: 0;
`

export default function SidePanel() {
	const originalList = useOriginalList()
	const [searchValue, setSearchValue] = useState('')

	useEffect(() => {
		setDarkTheme()
	}, [])

	const RenderList = useMemo(() => {
		let filteredList = originalList
		if (searchValue.trim() !== '') {
			filteredList = searchWithList(originalList, searchValue)
		}
		// use plugin 后，这里的 prop 时需要被替换掉
		return <List list={orderList(filteredList)} RenderItem={RenderItem}></List>
	}, [searchValue, originalList])

	const handleSearch = (value: string) => setSearchValue(value)

	return (
		<Container>
			<Header style={{ flex: '0 0 50px' }}>
				<Search onSearch={handleSearch}></Search>
			</Header>
			<ContentWrapper className={MAIN_CONTENT_CLASS}>{RenderList}</ContentWrapper>
			<Footer />
		</Container>
	)
}
