import { Button, Modal, Typography } from '@douyinfe/semi-ui'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import type { GitHubRelease } from '~scripts/common'
import { PopoverWrapper } from '~shared/common-styles'
import releases from '~shared/releases.json'
import { createTabWithUrl } from '~shared/utils'
import { i18nAtom, lastSeenVersionAtom } from '../atom'
import { useVersionCheck } from '../hooks/useVersionCheck'

const { Text, Paragraph } = Typography

const UpdateButton = styled.button`
  cursor: pointer;
  display: flex;
  padding: 3px 4px;
  border-radius: 4px;
  border: none;
  background: transparent;
  position: relative;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: var(--semi-color-fill-0);
  }
  
  &:active {
    background-color: var(--semi-color-fill-1);
  }
`

const UpdateIcon = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid var(--semi-color-primary);
  border-radius: 50%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    background-color: var(--semi-color-primary);
    border-radius: 50%;
  }
`

const NewVersionBadge = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: var(--semi-color-danger);
  border-radius: 50%;
  border: 1px solid var(--color-neutral-8);
`

const ModalContent = styled.div`
  max-height: 400px;
  overflow-y: auto;
`

const ReleaseContent = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background-color: var(--semi-color-fill-0);
  border-radius: 6px;
`

export default function UpdateNotification() {
	const i18n = useAtomValue(i18nAtom)
	const [lastSeenVersion, setLastSeenVersion] = useAtom(lastSeenVersionAtom)
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [hasNewVersion, setHasNewVersion] = useState(false)

	const { getLatestRelease, compareVersions } = useVersionCheck()
	const typedReleases = releases as GitHubRelease[]
	const latestRelease = getLatestRelease()

	useEffect(() => {
		if (latestRelease && compareVersions(latestRelease.tag_name, lastSeenVersion) > 0) {
			setHasNewVersion(true)
		} else {
			setHasNewVersion(false)
		}
	}, [latestRelease, lastSeenVersion, compareVersions])

	const handleShowModal = () => {
		setIsModalVisible(true)
	}

	const handleCloseModal = () => {
		setIsModalVisible(false)
	}

	const handleMarkAsRead = () => {
		if (latestRelease) {
			setLastSeenVersion(latestRelease.tag_name)
			setHasNewVersion(false)
			setIsModalVisible(false)
		}
	}

	const handleViewDetails = () => {
		if (latestRelease) {
			createTabWithUrl(latestRelease.html_url)
		}
	}

	// 获取最近的几个版本
	const recentReleases = typedReleases.slice(0, 3)

	if (!latestRelease) {
		return null
	}

	return (
		<>
			<PopoverWrapper content={i18n('updateNotificationTooltip')} position='top'>
				<UpdateButton onClick={handleShowModal}>
					<UpdateIcon />
					{hasNewVersion && <NewVersionBadge />}
				</UpdateButton>
			</PopoverWrapper>

			<Modal
				title={hasNewVersion ? i18n('newVersionAvailable') : i18n('latestUpdates')}
				visible={isModalVisible}
				onCancel={handleCloseModal}
				footer={
					<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
						<Button onClick={handleViewDetails}>{i18n('viewDetails')}</Button>
						{hasNewVersion && (
							<Button type='primary' onClick={handleMarkAsRead}>
								{i18n('markAsRead')}
							</Button>
						)}
					</div>
				}
				width={600}
			>
				<ModalContent>
					{recentReleases.map((release) => {
						const isNew = compareVersions(release.tag_name, lastSeenVersion) > 0
						return (
							<ReleaseContent key={release.id}>
								<div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
									<Text strong style={{ fontSize: '16px' }}>
										{release.name || release.tag_name}
									</Text>
									{isNew && (
										<span
											style={{
												marginLeft: '8px',
												padding: '2px 6px',
												background: 'var(--semi-color-danger)',
												color: 'white',
												borderRadius: '4px',
												fontSize: '12px',
											}}
										>
											NEW
										</span>
									)}
								</div>
								<Text type='quaternary' size='small' style={{ marginBottom: '8px', display: 'block' }}>
									{new Date(release.published_at).toLocaleDateString()}
								</Text>
								<Paragraph
									style={{
										whiteSpace: 'pre-wrap',
										marginBottom: 0,
										fontSize: '14px',
										lineHeight: '1.5',
									}}
								>
									{release.body || 'No description available.'}
								</Paragraph>
							</ReleaseContent>
						)
					})}
				</ModalContent>
			</Modal>
		</>
	)
}
