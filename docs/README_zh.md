<div align="center">
    <a href="#" target="_blank">
    <img src="./1.0-english-880x440-radius.png" alt="logo" height="200">
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

<p>一款可以全局搜索标签、书签和历史记录的 Chrome 浏览器扩展，支持拼音模糊搜索和 AI 标签分组</p>
</div>

# 概述
[Blazwitcher](https://blazwitcher.vercel.app/zh) 是一个[浏览器插件](https://chrome.google.com/webstore/detail/fjgablnemienkegdnbihhemebmmonihg)，用于搜索标签，书签和历史，支持模糊拼音搜索和 AI 标签分组。对于那些打开多个选项卡并希望切换正确的选项卡或从历史记录或书签中快速创建新选项卡而不想通过手动寻找的人来说，这也是一个完美的解决方案。

# 功能
- 模糊拼音搜索: 支持中英文混合模糊搜索，对国人友好(依赖于[文本搜索引擎](https://github.com/cjinhuo/text-search-engine))
  - 首字母拼音搜索
  - 域名搜索
  - 空格分词搜索
- 直观排序: 搜索结果按照[文本搜索引擎](https://github.com/cjinhuo/text-search-engine)返回的权重值和最近使用的时间降序，更快定位目标
- 搜索数据源：
  - 标签搜索: 搜索你打开的所有Chrome标签
  - 书签搜索: 搜索你所有的书签
  - 历史查询: 默认检索近 14 天内 1000 条历史记录，可输入 `/s search` 进行配置修改
  - 定向搜索：输入 `/t` 可单独搜索已打开的标签页、输入 `/b` 可单独搜索书签、输入 `/h` 可单独搜索历史记录
- 全键盘操作
  - 默认通过 `Command+Shift+K`(Window 系统`Ctrl+Shift+K`) 唤醒插件，可输入 `/s keyboard` 进行自定义
  - 通过上下键（↑↓）或 Tab 键选择标签内容，按下 enter 键来切换或打开你想要的标签
  - 也通过快捷键来 pin、unpin、打开历史记录、打开当前书签位置等等
- AI 标签分组：对上次聚焦窗口下的所有标签页进行智能分组，根据域名、标题名和现有分组情况进行增量智能分组

![landing](./landing.png)

## 适用人群
那些追求快捷操作和速度的人群，如：
- 🧑‍💻 程序员 
- 💻 多任务并行人员
- 🏄🏻 冲浪 


# 快速安装
**谷歌浏览器**
1.  访问[Chrome 扩展商店](https://chrome.google.com/webstore/detail/ᾋfjgablnemienkegdnbihhemebmmonihg)
2.  将其添加到浏览器中


## 快捷唤醒
激活 Blazwitcher 扩展的默认快捷键是Mac上的`Command+Shift+K`，Windows上的`Ctrl+Shift+K`。当然，你输入 可输入 `/s keyboard` 进行自定义，或直接访问 [chrome://extensions/shortcuts](chrome://extensions/shortcuts) 来修改它以适应你的习惯。


# 贡献
请参考 [贡献指南](./CONTRIBUTING.md) 了解更多信息，感谢所有贡献者 [contributors](https://github.com/cjinhuo/blazwitcher/graphs/contributors) ❤️

[![Contributors](https://contrib.rocks/image?repo=cjinhuo/blazwitcher)](https://github.com/cjinhuo/blazwitcher/graphs/contributors)


# 📞 联系
欢迎提 issue，你可以加我微信或者邮件联系我，如果你有好的建议(备注: blazwitcher)
* wx：cjinhuo
* email: cjinhuo@qq.com