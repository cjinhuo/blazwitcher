import GithubSvg from "react:~assets/github.svg"
import styled from "styled-components"

import { GITHUB_URL } from "~shared/constants"

const FooterContainer = styled.div`
  flex: 0 0 20px;
  background-color: var(--color-neutral-8);
  border-top: 1px solid var(--color-neutral-7);
  padding: 0 12px;
  align-items: center;
  display: flex;
  justify-content: flex-end;
`
const SvgContainer = styled.div`
  cursor: pointer;
  height: 16px;
  > svg {
    stroke: var(--color-neutral-5);
    stroke-width: 3px;
  }
  &:hover {
    > svg {
      stroke: var(--color-neutral-2);
    }
  }
`
export default function Footer() {
  return (
    <FooterContainer>
      <SvgContainer onClick={() => window.open(GITHUB_URL)}>
        <GithubSvg style={{ width: "16px", height: "16px" }}></GithubSvg>
      </SvgContainer>
    </FooterContainer>
  )
}
