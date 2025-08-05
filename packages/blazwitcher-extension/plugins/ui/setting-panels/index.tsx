import { IconCustomerSupport, IconDesktop, IconHistory, IconKey, IconSearch } from '@douyinfe/semi-icons'
import { Layout, Nav } from '@douyinfe/semi-ui'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { SettingPanelKey } from '~shared/constants'
import { i18nAtom, searchValueAtom } from '~sidepanel/atom'
import { useTheme } from '~sidepanel/hooks/useTheme'
import { AppearancePanel } from './appearance'
import { ChangelogPanel } from './changelog'
import { ContactPanel } from './contact'
import { KeyboardPanel } from './keyboard'
import { SearchPanel } from './search'

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

interface SettingPanelsProps {
	initialPanel?: SettingPanelKey
}

export const SettingPanels: React.FC<SettingPanelsProps> = ({ initialPanel }) => {
	const i18n = useAtomValue(i18nAtom)
	const setSearchValue = useSetAtom(searchValueAtom)
	const [activeKey, setActiveKey] = useState<SettingPanelKey>(initialPanel || SettingPanelKey.APPEARANCE)
	useTheme()
	const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

	// 监听 initialPanel 变化，更新 activeKey
	useEffect(() => {
		if (initialPanel) {
			setActiveKey(initialPanel)
		}
	}, [initialPanel])

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

	const menuItems: MenuItem[] = useMemo(
		() => [
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
		],
		[i18n]
	)

	// 键盘导航功能
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const currentIndex = menuItems.findIndex((item) => item.itemKey === activeKey)
			if (currentIndex === -1) return

			let nextIndex = currentIndex

			switch (event.key) {
				case 'ArrowUp':
					event.preventDefault()
					nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1
					break
				case 'ArrowDown':
					event.preventDefault()
					nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0
					break
				default:
					return
			}

			const nextItem = menuItems[nextIndex]
			if (nextItem) {
				setActiveKey(nextItem.itemKey)
				setSearchValue({ value: `/s ${nextItem.itemKey}` })
			}
		}

		// 添加键盘事件监听器
		window.addEventListener('keydown', handleKeyDown)

		// 清理事件监听器
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [activeKey, menuItems, setSearchValue])

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

	const handleNavSelect = (data) => {
		setActiveKey(data.itemKey as SettingPanelKey)
		setSearchValue({ value: `/s ${data.itemKey}` })
	}

	return (
		<styles.layout>
			<Sider>
				<Nav
					style={{ width: navWidth, height: '100%' }}
					items={menuItems}
					selectedKeys={[activeKey]}
					onSelect={(data) => handleNavSelect(data)}
					defaultIsCollapsed={isCollapsed}
				/>
			</Sider>
			<styles.content $disableScroll={activeKey === SettingPanelKey.CHANGELOG}>
				<styles.wrapper>{renderPanel()}</styles.wrapper>
			</styles.content>
		</styles.layout>
	)
}
