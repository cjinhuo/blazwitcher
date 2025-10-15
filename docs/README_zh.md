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

<div align="center">
<p>一款可以全局搜索标签、书签和历史记录的 Chrome 浏览器扩展，支持拼音模糊搜索和 AI 标签分组</p>
</div>

# 概述
[Blazwitcher](https://blazwitcher.vercel.app/zh) 是一个[浏览器插件](https://chrome.google.com/webstore/detail/fjgablnemienkegdnbihhemebmmonihg)，用于搜索标签，书签和历史，支持模糊拼音搜索和 AI 标签分组。对于那些打开多个选项卡并希望切换正确的选项卡或从历史记录或书签中快速创建新选项卡而不想通过手动寻找的人来说，这也是一个完美的解决方案。

# 功能
## 模糊拼音搜索
支持中英文混合模糊搜索，对国人超级 Nice (依赖于[文本搜索算法](https://github.com/cjinhuo/text-search-engine))，最终搜索的结果按照返回的**权重值**(命中连续字符越多，权重越高)和最近使用的时间降序输出，更快定位目标，搜索能力：

- 首字母拼音搜索

![first_letter_match](./first_letter_match.gif)


- 域名搜索 & 空格分词搜索（分词后无需按顺序匹配）

![split_words_domain.gif](./split_words_domain.gif)


## AI 分组
对上次聚焦窗口中的所有标签页进行 AI 分组，根据域名、标题和现有分组情况增量分组，大大节省手动创建和更新标签分组的时间。当然，如果你不满意本次 AI 分组，也能在分组的 16 秒内返回到最初的快照状态

![ai_grouping](./ai_grouping.gif)



## 全局秒级搜索
搜索数据源包含：

- 所有已打开的标签页
- 所有书签记录
- 默认检索近 14 天内前 1000 条历史记录，可输入 `/s search` 进行配置修改

也支持定向搜索，如输入 `/t` 可单独搜索已打开的标签页，同理输入 `/b` 和 `/h` 可定向搜索书签和历史记录

![command_filter](./command_filter.gif)


## 全键盘操作
- 激活 Blazwitcher 扩展的默认快捷键是Mac上的`Command+Shift+K`，Windows上的`Ctrl+Shift+K`。当然，你输入 可输入 `/s keyboard` 进行自定义，或直接访问 [chrome://extensions/shortcuts](chrome://extensions/shortcuts) 来修改它以适应你的习惯。
- 通过上下键（↑↓）或 `Tab` 键选择标签内容，按下 `Enter` 键来切换或打开你想要的标签
- 通过 / 下的命令直接触发操作，比如输入 `/ai` 后 enter 就会触发 AI 标签分组
- 通过快捷键来 pin、unpin、打开历史记录、打开当前书签位置等等
- 输入 `/s` 进入设置页面，可自定义唤醒各个功能的快捷键

![setting.gif](./setting.gif)

# 快速安装
1.  访问 [Chrome 扩展商店](https://chrome.google.com/webstore/detail/ᾋfjgablnemienkegdnbihhemebmmonihg)
2.  将其添加到浏览器中


## 适用人群
那些追求快捷操作和速度的人群，如：
- 🧑‍💻 程序员 
- 💻 多任务并行人员
- 🏄🏻 冲浪 

# 贡献
请参考 [贡献指南](./CONTRIBUTING.md) 了解更多信息，感谢所有贡献者 [contributors](https://github.com/cjinhuo/blazwitcher/graphs/contributors) ❤️

[![Contributors](https://contrib.rocks/image?repo=cjinhuo/blazwitcher)](https://github.com/cjinhuo/blazwitcher/graphs/contributors)


# 📞 联系
欢迎提 issue，你可以加我微信或者邮件联系我，如果你有好的建议(备注: blazwitcher)
* wx：cjinhuo
* email: cjinhuo@qq.com