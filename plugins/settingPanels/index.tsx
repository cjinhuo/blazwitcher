import { IconDesktop, IconKey, IconSearch } from '@douyinfe/semi-icons'
import { Layout, Nav } from '@douyinfe/semi-ui'
import { useState } from 'react'
import styled from 'styled-components'
import { t } from '~shared/utils'
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
    height: 100vh;
    display: flex;
    flex-direction: row;
  `,
	content: styled(Content)`
    flex: 1;
    padding: 24px;
    display: flex;
    justify-content: center;
    overflow: auto;
  `,
	wrapper: styled.div`
    width: 100%;
    max-width: 480px;
    min-width: 320px;
    margin: 0 auto;
  `,
}

export const SettingPanels: React.FC = () => {
	const [activeKey, setActiveKey] = useState<string>('appearance')

	const menuItems: MenuItem[] = [
		{
			itemKey: 'appearance',
			icon: <IconDesktop />,
			text: t('appearance'),
		},
		{
			itemKey: 'keyboard',
			icon: <IconKey />,
			text: t('keyboard'),
		},
		{
			itemKey: 'search',
			icon: <IconSearch />,
			text: t('search'),
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
					style={{ width: 150, height: '100%' }}
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
