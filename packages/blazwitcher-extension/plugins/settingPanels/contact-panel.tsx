import qrcode from 'raw:~assets/wx_code.png'
import { Typography } from '@douyinfe/semi-ui'
import { useAtomValue } from 'jotai'
import styled from 'styled-components'
import { BLOG_URL, EMAIL_URL, PERSONAL_GITHUB_URL } from '~shared/constants'
import { createTabWithUrl } from '~shared/utils'
import { i18nAtom } from '~sidepanel/atom'

const { Text } = Typography

const handleLinkClick = (url: string) => {
	createTabWithUrl(url)
}

const UrlItemContainer = styled.div`
	display: flex;
	gap: 8px;
`

const ItemContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`

const UrlItem = ({ label, url }: { label: string; url: string }) => {
	return (
		<UrlItemContainer>
			<Text>{label}:</Text>
			<Text link onClick={() => handleLinkClick(url)}>
				{url}
			</Text>
		</UrlItemContainer>
	)
}

const ImgItem = ({ label, imgUrl, value }: { label: string; imgUrl: string; value: string }) => {
	return (
		<ItemContainer>
			<UrlItemContainer>
				<Text>{label}:</Text>
				<Text>{value}</Text>
			</UrlItemContainer>
			<img src={imgUrl} alt={label} width={200} height={200} />
		</ItemContainer>
	)
}
export function ContactPanel() {
	const i18n = useAtomValue(i18nAtom)

	const data = [
		{
			type: 'url',
			label: 'Blog',
			url: BLOG_URL,
		},
		{
			type: 'url',
			label: 'GitHub',
			url: PERSONAL_GITHUB_URL,
		},
		{
			type: 'url',
			label: 'Email',
			url: `mailto:${EMAIL_URL}`,
		},
		{
			type: 'img',
			label: i18n('WeChatWithRemark'),
			value: 'cjinhuo',
			imgUrl: qrcode,
		},
	]
	return (
		<ItemContainer>
			{data.map((item) => {
				if (item.type === 'url') {
					return <UrlItem key={item.label} label={item.label} url={item.url} />
				}
				if (item.type === 'img') {
					return <ImgItem key={item.label} label={item.label} value={item.value} imgUrl={item.imgUrl} />
				}
				return null
			})}
		</ItemContainer>
	)
}
