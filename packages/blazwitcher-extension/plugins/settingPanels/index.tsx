import { IconCustomerSupport, IconDesktop, IconHistory, IconKey, IconSearch } from '@douyinfe/semi-icons'
import { Layout, Nav } from '@douyinfe/semi-ui'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { i18nAtom } from '~sidepanel/atom'
import { useTheme } from '~sidepanel/hooks/useTheme'
import { AppearancePanel } from './appearance-panel'
import { ChangelogPanel } from './changelog-panel'
import { ContactPanel } from './contact-panel'
import { KeyboardPanel } from './keyboard-panel'
import { SearchPanel } from './search-panel'

enum SettingPanelKey {
	APPEARANCE = 'appearance',
	KEYBOARD = 'keyboard',
	SEARCH = 'search',
	CHANGELOG = 'changelog',
	CONTACT = 'contact',
}

interface MenuItem {
	itemKey: SettingPanelKey
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
	content: styled(Content)<{ $disableScroll?: boolean }>`
    flex: 1;
    padding: 12px;
    display: flex;
    justify-content: center;
    overflow: ${(props) => (props.$disableScroll ? 'hidden' : 'auto')};
  `,
	wrapper: styled.div`
    width: 100%;
    min-width: 320px;
    margin: 0 auto;
  `,
}

export const SettingPanels: React.FC = () => {
	const i18n = useAtomValue(i18nAtom)
	const [activeKey, setActiveKey] = useState<SettingPanelKey>(SettingPanelKey.APPEARANCE)
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
			itemKey: SettingPanelKey.APPEARANCE,
			icon: <IconDesktop />,
			text: i18n(SettingPanelKey.APPEARANCE),
		},
		{
			itemKey: SettingPanelKey.SEARCH,
			icon: <IconSearch />,
			text: i18n(SettingPanelKey.SEARCH),
		},
		{
			itemKey: SettingPanelKey.KEYBOARD,
			icon: <IconKey />,
			text: i18n(SettingPanelKey.KEYBOARD),
		},
		{
			itemKey: SettingPanelKey.CHANGELOG,
			icon: <IconHistory />,
			text: i18n(SettingPanelKey.CHANGELOG),
		},
		{
			itemKey: SettingPanelKey.CONTACT,
			icon: <IconCustomerSupport />,
			text: i18n(SettingPanelKey.CONTACT),
		},
	]

	const renderPanel = () => {
		switch (activeKey) {
			case SettingPanelKey.APPEARANCE:
				return <AppearancePanel />
			case SettingPanelKey.KEYBOARD:
				return <KeyboardPanel />
			case SettingPanelKey.SEARCH:
				return <SearchPanel />
			case SettingPanelKey.CHANGELOG:
				return <ChangelogPanel />
			case SettingPanelKey.CONTACT:
				return <ContactPanel />
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
					onSelect={(data) => setActiveKey(data.itemKey as SettingPanelKey)}
					defaultIsCollapsed={isCollapsed}
				/>
			</Sider>
			<styles.content $disableScroll={activeKey === SettingPanelKey.CHANGELOG}>
				<styles.wrapper>{renderPanel()}</styles.wrapper>
			</styles.content>
		</styles.layout>
	)
}
