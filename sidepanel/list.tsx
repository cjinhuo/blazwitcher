import { IconArrowRight } from "@douyinfe/semi-icons"
import { Button, List as ListComponent } from "@douyinfe/semi-ui"

import type {
  BookmarkItemType,
  HistoryItemType,
  ItemType,
  TabItemType
} from "./types"

export interface ListItemType<T = ItemType> {
  itemType: T
  data: T extends ItemType.Bookmark
    ? BookmarkItemType
    : T extends ItemType.Tab
      ? TabItemType
      : HistoryItemType
}
export default function List({ list }: { list: ListItemType[] }) {
  return (
    <div>
      <ListComponent
        dataSource={list}
        renderItem={({ itemType, data }) => (
          <ListComponent.Item
            header={<>header</>}
            main={
              <div>
                <span
                  style={{
                    color: "var(--semi-color-text-0)",
                    fontWeight: 500
                  }}>
                  {data.title}
                </span>
              </div>
            }
            extra={
              <Button
                onClick={() => {
                  chrome.tabs.update((data as TabItemType).id, {
                    active: true
                  })
                  chrome.storage.session.get("selfWindowId", (result) => {
                    const selfWindowId = result.selfWindowId
                    chrome.windows.remove(selfWindowId)
                  })
                }}>
                <IconArrowRight />
              </Button>
            }
          />
        )}
      />
    </div>
  )
}
