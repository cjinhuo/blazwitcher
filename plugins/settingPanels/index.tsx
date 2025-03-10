import { IconDesktop, IconKey, IconSearch } from '@douyinfe/semi-icons'
import { Layout, Nav } from '@douyinfe/semi-ui'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import styled from 'styled-components'
import { i18nAtom } from '~sidepanel/atom'
import { AppearancePanel } from './appearance-panel'
import { KeyboardPanel } from './keyboard-panel'
import { SearchPanel } from './search-panel'

interface MenuItem {
	itemKey: string
	icon: React.ReactNode
	text: string
}

const { Sider, Content } = Layout

const styles = {
	layout: styled(Layout)`
		height: 100%;
    display: flex;
    flex-direction: row;
  `,
	content: styled(Content)`
    flex: 1;
    padding: 12px;
    display: flex;
    justify-content: center;
    overflow: auto;
  `,
	wrapper: styled.div`
    width: 100%;
    min-width: 320px;
    margin: 0 auto;
  `,
}

export const SettingPanels: React.FC = () => {
	const i18n = useAtomValue(i18nAtom)
	const [activeKey, setActiveKey] = useState<string>('appearance')

	const menuItems: MenuItem[] = [
		{
			itemKey: 'appearance',
			icon: <IconDesktop />,
			text: i18n('appearance'),
		},
		{
			itemKey: 'keyboard',
			icon: <IconKey />,
			text: i18n('keyboard'),
		},
		{
			itemKey: 'search',
			icon: <IconSearch />,
			text: i18n('search'),
		},
	]

	const renderPanel = () => {
		switch (activeKey) {
			case 'appearance':
				return <AppearancePanel />
			case 'keyboard':
				return <KeyboardPanel />
			case 'search':
				return <SearchPanel />
			default:
				return null
		}
	}

	return (
		<styles.layout>
			<Sider>
				<Nav
					style={{ width: 160, height: '100%' }}
					items={menuItems}
					selectedKeys={[activeKey]}
					onSelect={(data) => setActiveKey(data.itemKey as string)}
				/>
			</Sider>
			<styles.content>
				<styles.wrapper>{renderPanel()}</styles.wrapper>
			</styles.content>
		</styles.layout>
	)
}
