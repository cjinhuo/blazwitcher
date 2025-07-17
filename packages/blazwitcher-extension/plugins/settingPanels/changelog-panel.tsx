import { IconPaperclip } from '@douyinfe/semi-icons'
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
  padding: 16px;
  background-color: var(--semi-color-fill-0);
  border-radius: 8px;
  border-left: 3px solid var(--semi-color-primary-light-default);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--semi-color-fill-1);
    border-left-color: var(--semi-color-primary);
    transform: translateX(2px);
  }
`

const ChangeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
`

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--semi-color-text-2);
`

const AuthorName = styled.span`
  font-weight: 600;
  color: var(--semi-color-primary);
  background-color: var(--semi-color-primary-light-hover);
  padding: 2px 6px;
  border-radius: 4px;
`

const DateText = styled.span`
  color: var(--semi-color-text-2);
`

const CommitLink = styled.a`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 6px 10px;
  background-color: var(--semi-color-primary-light-hover);
  color: var(--semi-color-primary);
  text-decoration: none;
  border-radius: 6px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  border: 1px solid var(--semi-color-primary-light-default);
  transition: all 0.2s ease;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: var(--semi-color-primary);
    color: var(--semi-color-bg-0);
    border-color: var(--semi-color-primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
`

const CommitId = styled.span`
  max-width: 68px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 2px;
`

const ChangeContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: var(--semi-color-text-0);
  margin-bottom: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const ChineseContent = styled(ChangeContent)`
  color: var(--semi-color-text-2);
  font-style: italic;
`

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--semi-color-border), transparent);
  margin: 24px 0;
`

/**
 * 处理变更内容，提取作者、日期和描述信息
 * @param text 原始文本
 * @returns 处理后的数据对象
 */
function parseChangeText(text: string) {
	// 匹配格式：feat: description @author · date · `[#commitId](url)`
	const match = text.match(
		/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert):\s*(.+?)\s*@([^·]+)·([^·]+)·\s*`\[#([^\]]+)\]\(([^)]+)\)`$/
	)

	if (match) {
		const [, , description, author, date, commitId, commitUrl] = match

		// 清理作者和日期的空白字符
		const cleanAuthor = author.trim()
		const cleanDate = date.trim()
		const cleanDescription = description.trim()
		const cleanCommitId = commitId.trim()
		const cleanCommitUrl = commitUrl.trim()

		return {
			author: cleanAuthor,
			date: cleanDate,
			description: cleanDescription,
			commitUrl: cleanCommitUrl,
			commitId: cleanCommitId,
		}
	}

	// 如果不匹配预期格式，简单移除 feat: 或 fix: 等前缀
	const simpleMatch = text.match(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert):\s*(.+)$/)
	if (simpleMatch) {
		return {
			description: simpleMatch[2].trim(),
			author: '',
			date: '',
			commitUrl: '',
			commitId: '',
		}
	}

	return {
		description: text,
		author: '',
		date: '',
		commitUrl: '',
		commitId: '',
	}
}

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
						{entry.changes.map((change, changeIndex) => {
							const enData = parseChangeText(change.en)
							const zhData = parseChangeText(change.zh)

							return (
								<ChangeItem key={`${entry.version}-${changeIndex}`}>
									<ChangeHeader>
										<AuthorInfo>
											{enData.author && <AuthorName>@{enData.author}</AuthorName>}
											{enData.date && <DateText>{enData.date}</DateText>}
										</AuthorInfo>
										{enData.commitUrl && (
											<CommitLink href={enData.commitUrl} target='_blank' rel='noopener noreferrer'>
												<IconPaperclip size='small' />
												<CommitId>{enData.commitId}</CommitId>
											</CommitLink>
										)}
									</ChangeHeader>

									<ChangeContent>{enData.description}</ChangeContent>

									<ChineseContent>{zhData.description}</ChineseContent>
								</ChangeItem>
							)
						})}
					</ChangeList>

					{index < changelog.length - 1 && <Divider />}
				</Fragment>
			))}
		</Container>
	)
}
