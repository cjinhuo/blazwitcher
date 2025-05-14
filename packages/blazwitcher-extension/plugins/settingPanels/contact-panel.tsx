import qrcode from 'raw:~assets/wx_code.png'
import { Typography } from '@douyinfe/semi-ui'
import styled from 'styled-components'
import { BLOG_URL, EMAIL_URL, PERSONAL_GITHUB_URL } from '~shared/constants'
import { createTabWithUrl } from '~shared/utils'

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
		label: 'WeChat',
		imgUrl: qrcode,
	},
]
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

const ImgItem = ({ label, imgUrl }: { label: string; imgUrl: string }) => {
	return (
		<UrlItemContainer>
			<Text>{label}:</Text>
			<img src={imgUrl} alt={label} width={200} height={200} />
		</UrlItemContainer>
	)
}
export function ContactPanel() {
	return (
		<ItemContainer>
			{data.map((item) => {
				if (item.type === 'url') {
					return <UrlItem key={item.label} label={item.label} url={item.url} />
				}
				if (item.type === 'img') {
					return <ImgItem key={item.label} label={item.label} imgUrl={item.imgUrl} />
				}
				return null
			})}
		</ItemContainer>
	)
}
