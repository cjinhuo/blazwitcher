<div align="center">
    <a href="#" target="_blank">
      <img src="./docs/1.0-english-880x440-radius.png" alt="logo" height="200">
    </a>
</div>

<div align="center">
<a href="https://chromewebstore.google.com/detail/blazwitcher-fuzzy-pinyin/fjgablnemienkegdnbihhemebmmonihg" target="_blank">
<img src="https://img.shields.io/badge/chrome-extension?style=flat&label=extension&color=deepskyblue" alt="chrome-extension">
</a>
<a href="https://github.com/cjinhuo/blazwitcher/releases" target="_blank">
<img src="https://img.shields.io/github/v/release/cjinhuo/blazwitcher?style=flat&label=release&color=green" alt="github-release">
</a>
</div>

<div align="center">
<p>A Chrome Extension to blaze through your tabs, bookmarks, and history — with powerful fuzzy Pinyin search and grouping tabs by AI</p>
</div>


# Overview
[中文 README](./docs/README_zh.md)

[Blazwitcher](https://blazwitcher.vercel.app/) is a local [Chrome Extension](https://chromewebstore.google.com/detail/blazwitcher-search-and-sw/fjgablnemienkegdnbihhemebmmonihg?hl=en-US) for searching tabs, bookmarks, and history, with support for fuzzy **Pinyin** search. It is also the perfect solution for those who work with multiple tabs open and want to switch the correct tab or create a new tab from history or bookmarks quickly without the hassle of manually operation.

## Features
- Fuzzy Pinyin Search: Supports Chinese and English mixed fuzzy search, Chinese-friendly (powered by [text-search-engine](https://github.com/cjinhuo/text-search-engine))
  - Initial Pinyin search
  - Domain name search
  - Space-separated word search
- Intuitive Ordering: The search results are sorted by the weight value returned by the [text-search-engine](https://github.com/cjinhuo/text-search-engine) and the last time it was used in descending order, allowing you to locate your target faster
- Search Data Sources:
  - Tab Search: Search across all Chrome tabs you opened
  - Bookmark Search: Search across all your bookmarks
  - History Search: Search the last 1000 history items within 14 days by default, you can type `/s search` to modify the configuration
  - Targeted Search: Type `/t` to search only opened tabs, `/b` to search only bookmarks, `/h` to search only history
- Full Keyboard Operation
  - Default activation via `Command+Shift+K` (Windows: `Ctrl+Shift+K`), you can type `/s keyboard` to customize
  - Use arrow keys (↑↓) or Tab key to select content, press Enter to switch or open the desired tab
  - Also supports shortcuts to pin/unpin, open history, open current bookmark location, etc.
- AI Tab Grouping: Intelligently group all tabs in the last focused window based on domain names, titles, and existing grouping situations with incremental smart grouping

![landing](./docs/landing.png)

## Ideal For
Those people who are looking for quick action and speed, like:
- 🧑‍💻 Developers
- 💻 Multitaskers
- 🏄🏻 Surfers


# Quick Start
## Install Instruction
**Google Chrome**
1.  visit [Chrome Extension Store](https://chromewebstore.google.com/detail/blazwitcher-search-and-sw/fjgablnemienkegdnbihhemebmmonihg?hl=en-US)
2.  Add it to your browser


## Shortcut
The default **shortcut key** to activate Blazwitcher Extension is `Command+Shift+K` on Mac, and `Ctrl+Shift+K` on Windows. Of course, you can type `/s keyboard` to customize it, or directly visit [chrome://extensions/shortcuts](chrome://extensions/shortcuts) to modify it to suit your habits.

# Contributing
Please see the [contributing guidelines](./CONTRIBUTING.md) to learn more.

A big thanks to all of our amazing [contributors](https://github.com/cjinhuo/blazwitcher/graphs/contributors) ❤️

Feel free to join the fun and send a PR!

[![Contributors](https://contrib.rocks/image?repo=cjinhuo/blazwitcher)](https://github.com/cjinhuo/blazwitcher/graphs/contributors)



# 📞 Contact
Welcome to raise issues. You can contact me via WeChat or email if you have good suggestions (note: Blazwitcher)
* wx: cjinhuo
* email: cjinhuo@qq.com