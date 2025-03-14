import { IconDesktop, IconKey, IconSearch } from '@douyinfe/semi-icons'
import { Layout, Nav } from '@douyinfe/semi-ui'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { i18nAtom } from '~sidepanel/atom'
import { useTheme } from '~sidepanel/hooks/useTheme'
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
	useTheme()
	const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

	// Track window resize for responsive design
	useEffect(() => {
		const handleResize = () => {
			setWindowWidth(window.innerWidth)
		}

		window.addEventListener('resize', handleResize)
		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	// Memoize responsive values
	const { navWidth, isCollapsed } = useMemo(() => {
		const isSmallScreen = windowWidth < 600
		return {
			isSmallScreen,
			navWidth: isSmallScreen ? 60 : 160,
			isCollapsed: isSmallScreen,
		}
	}, [windowWidth])

	const menuItems: MenuItem[] = [
		{
			itemKey: 'appearance',
			icon: <IconDesktop />,
			text: i18n('appearance'),
		},
		{
			itemKey: 'search',
			icon: <IconSearch />,
			text: i18n('search'),
		},
		{
			itemKey: 'keyboard',
			icon: <IconKey />,
			text: i18n('keyboard'),
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
					style={{ width: navWidth, height: '100%' }}
					items={menuItems}
					selectedKeys={[activeKey]}
					onSelect={(data) => setActiveKey(data.itemKey as string)}
					defaultIsCollapsed={isCollapsed}
				/>
			</Sider>
			<styles.content>
				<styles.wrapper>{renderPanel()}</styles.wrapper>
			</styles.content>
		</styles.layout>
	)
}
