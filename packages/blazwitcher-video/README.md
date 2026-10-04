# Blazwitcher 首页宣传视频

28 秒、1920 × 1080、30 fps、中英文产品视频，两版使用相同分镜、动画和原创背景音乐。视觉沿用官网的浅色背景、紫粉渐变和项目 Logo，并参考 docs 宣传图的粉色到暖黄色背景。

Manim 负责透明的标签卡片动画，Remotion 负责产品演示、文字、时间线、音乐和最终合成。官网只加载导出的 MP4 和海报，无需运行这两个制作工具。

## 制作流程

```text
manim/scenes.py → 透明 WebM → public/generated/
                                     ↓
src/HeroVideo.tsx → Remotion 时间线 → out/MP4 + 海报
                                     ↓
                      blazwitcher-doc/public/video/
```

先在仓库根目录安装 Node 依赖。Python 依赖由 uv 管理，使用 Python 3.12；Manim 还需要 Cairo、Pango 和 pkg-config。macOS 可通过 `brew install cairo pango pkg-config` 安装缺失的系统依赖。音乐生成还需要 FFmpeg（`brew install ffmpeg`）。这里不用 LaTeX。

```bash
pnpm install
pnpm --filter blazwitcher-video assets
pnpm --filter blazwitcher-video dev
```

Studio 中的 `BlazwitcherHero`（中文）和 `BlazwitcherHeroEn`（英文）可以拖动时间线预览。导出和更新官网：

```bash
pnpm --filter blazwitcher-video check
pnpm --filter blazwitcher-video render
pnpm --filter blazwitcher-video poster
pnpm --filter blazwitcher-video export:site
```

`render` 和 `poster` 默认生成两种语言；只修改一版时，可以运行 `render:zh` / `render:en`、`poster:zh` / `poster:en`。宣传文案统一在 `src/video-copy.ts` 中修改，字幕源文件在 `captions/zh.vtt` 和 `captions/en.vtt` 中维护。改文案或界面后运行对应导出命令和 `export:site`，后者将两版 MP4、海报和字幕复制到官网。修改卡片动画后先运行 `assets`。Manim 素材与依赖环境忽略入库，可由源码重新生成；官网 MP4、海报和字幕入库。

## 分镜

| 时间 | 内容 | 制作工具 |
| --- | --- | --- |
| 0–3.5 秒 | 标签太多、目标难找 | Manim 卡片 + Remotion 文案 |
| 3.5–11 秒 | `pinyin` → 拼音 / Pinyin，Enter 直达 | 产品截图 + Remotion 输入动画 |
| 11–16 秒 | 标签、书签、历史；`/t`、`/b`、`/h` 命令 | 产品截图 + Remotion 提示 |
| 16–20 秒 | `/s` 外观和 `/s search` 搜索设置 | 两张设置截图交叉淡入 |
| 20–25 秒 | `/ai`，标签自动归类 | Manim 卡片 + Remotion 文案 |
| 25–28 秒 | 品牌与 Chrome 安装提示 | Remotion |

产品界面直接使用用户提供的截图，原图保存在 `docs/video-references/`，通过 `scripts/prepare-assets.mjs` 复制到渲染目录。`src/ProductWindow.tsx` 负责镜头和叠加层，输入与命令重点提示由帧数驱动。窗口标题层隐藏旧版版本号，保留截图中的真实产品内容。英文版保留拼音匹配中的中文网页标题，展示跨语言检索；宣传标题、说明和提示均为英文，设置和命令界面本身使用英文。AI 动画表示整理能力，动画时长不代表实际 AI 服务响应时间。脚本没有运行真实搜索或调用 AI 服务。

功能依据：项目 README、`plugins/commands/filters.tsx` 和 `plugins/commands/actions.tsx`。视觉参考：`docs/1.0-english-880x440-radius.png` 和用户提供的四张窗口截图。本片按所选参考使用完整窗口展示。

官网 `/zh` 展示中文版，`/en` 展示英文版。点击网站语言切换器时，视频组件按 locale 重新挂载，同时切换 MP4、海报、WebVTT 字幕和音乐按钮文案，旧播放器停止播放，新版从头开始且默认静音。进入视区时循环播放，离开视区或隐藏页面时暂停，遵循“减少动态效果”偏好，并保留手动播放控件。网站仅加载当前语言的视频。

## 背景音乐

`Find Your Flow` 是为此片编排的 28 秒原创器乐：柔和电钢琴、拨弦音色、暖和弦与轻打击乐，96 BPM，D 大调。第 25 秒回到主和弦，配合品牌收尾，并在结尾淡出；没有口播。音符和声音均由 `scripts/compose-music.py` 合成，没有使用外部歌曲、录音或采样。NumPy/SciPy 由已有 Manim 环境提供，随机种子固定，能够重新生成相同编排。

`pnpm --filter blazwitcher-video music` 可单独生成 `public/generated/find-your-flow.wav`；`assets` 和 `render` 也会自动生成。FFmpeg 将混音控制在约 -21 LUFS，并限制峰值；Remotion 的 `Html5Audio` 将音乐嵌入 MP4，导出为 AAC 192 kbps 立体声。首页默认静音，用户通过“开启音乐”按钮或播放器的声音控件开启音乐；按钮状态同步播放器的原生静音控制。

## 关键约定

- 两个工具统一 30 fps；总时间线 840 帧。
- Manim 用 `-t --format=webm` 输出透明素材；Remotion 用 `OffthreadVideo transparent` 保留 alpha。
- 所有运动由时间线帧数驱动，不依赖 CSS animation 或现实时间。
- 最终发布格式为 H.264 + AAC MP4，透明层已合并到浅色背景。
- 产品输入框加载扩展自带的 SourceCodePro 字体，渲染等待字体加载完成。宣传文案使用系统中文字体，跨系统制作时应安装一致且允许使用的中文字体。
- 修改分镜时，同步更新 `captions/` 中的两版 WebVTT 字幕，再运行 `export:site`。

参考：[Manim 透明输出](https://docs.manim.community/en/stable/faq/general.html#can-manim-render-a-video-with-transparent-background)、[Remotion Sequence](https://www.remotion.dev/docs/sequence)、[透明视频图层](https://www.remotion.dev/docs/offthreadvideo#transparent)、[视频导出](https://www.remotion.dev/docs/render)。

音轨接入：[Remotion Html5Audio](https://www.remotion.dev/docs/html5-audio)。
