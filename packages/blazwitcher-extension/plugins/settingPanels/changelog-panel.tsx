import { Fragment } from 'react'
import styled from 'styled-components'
import changelog from '~shared/changelog.json'

type ChangelogEntry = {
	version: string
	type: 'minor' | 'patch'
	changes: { en: string; zh: string }[]
}

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`

const VersionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
`

const Version = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--semi-color-text-0);
`

const TypeBadge = styled.span<{ type: 'minor' | 'patch' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  background-color: ${(props) => (props.type === 'minor' ? 'var(--semi-color-primary)' : 'var(--semi-color-success)')};
  color: var(--semi-color-bg-0);
`

const ChangeList = styled.div`
  margin-bottom: 32px;
`

const ChangeItem = styled.div`
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: var(--semi-color-fill-0);
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--semi-color-fill-1);
  }
`

const EnglishText = styled.div`
  font-size: 14px;
  color: var(--semi-color-text-0);
  margin-bottom: 4px;
`

const ChineseText = styled.div`
  font-size: 14px;
  color: var(--semi-color-text-2);
`

const Divider = styled.div`
  height: 1px;
  background-color: var(--semi-color-border);
  margin: 24px 0;
`

export function ChangelogPanel() {
	return (
		<Container>
			{(changelog as ChangelogEntry[]).map((entry, index) => (
				<Fragment key={entry.version}>
					<VersionHeader>
						<Version>v{entry.version}</Version>
						<TypeBadge type={entry.type}>{entry.type}</TypeBadge>
					</VersionHeader>

					<ChangeList>
						{entry.changes.map((change) => (
							<ChangeItem key={`${entry.version}-${change.en}`}>
								<EnglishText>{change.en}</EnglishText>
								<ChineseText>{change.zh}</ChineseText>
							</ChangeItem>
						))}
					</ChangeList>

					{index < changelog.length - 1 && <Divider />}
				</Fragment>
			))}
		</Container>
	)
}
