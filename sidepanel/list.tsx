import { List as ListComponent } from "@douyinfe/semi-ui"

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
        renderItem={(item) => (
          <ListComponent.Item
            header={<>header</>}
            main={
              <div>
                <span
                  style={{
                    color: "var(--semi-color-text-0)",
                    fontWeight: 500
                  }}>
                  示例标题
                </span>
              </div>
            }
            extra={<>extra</>}
          />
        )}
      />
    </div>
  )
}
