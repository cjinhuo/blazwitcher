# Chrome Web Store 发布环境配置

仅在**首次配置**或 **refresh_token 过期**时需要参考。日常发布见 [SKILL.md](./SKILL.md)。

## 参考值（blazwitcher 当前配置）

| 项           | 值                                            |
| ------------ | --------------------------------------------- |
| Extension ID | `fjgablnemienkegdnbihhemebmmonihg`            |
| Publisher ID | `d7edff7a-4f18-4cf9-9f3e-c794b3e89c03`        |
| GCP 项目     | `general`（ID: `gen-lang-client-0841458493`） |
| 发布者邮箱   | `qq1443970739@gmail.com`                      |

## 1. 安装 CLI

```bash
npm install -g chrome-webstore-upload-cli
```

## 2. Google Cloud Console 配置

地址：`https://console.cloud.google.com`（项目 `general`）

1. **启用 API**：API 和服务 → 库 → 搜索 "Chrome Web Store API" → 启用
2. **创建 OAuth 客户端**：API 和服务 → 凭证 → 创建凭证 → OAuth 客户端 ID
   - 应用类型：**桌面应用**（CLI 在本地终端运行，不是 Chrome 扩展类型）
   - 记录返回的 `client_id` 和 `client_secret`
3. **配置同意屏幕**：Google Auth Platform → 受众群体
   - 用户类型：External
   - 测试用户中添加发布者邮箱（应用处于"测试"状态时仅测试用户可授权）

## 3. 获取 refresh_token

浏览器访问以下 URL（替换 `<CLIENT_ID>`）完成授权：

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=<CLIENT_ID>&redirect_uri=http://localhost&response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&access_type=offline&prompt=consent
```

授权后跳转到 `http://localhost/?code=<AUTH_CODE>&scope=...`（页面无法加载属正常，从地址栏复制 `code` 参数）。用 code 换取 token：

```bash
curl -s -X POST https://oauth2.googleapis.com/token \
  -d "code=<AUTH_CODE>" \
  -d "client_id=<CLIENT_ID>" \
  -d "client_secret=<CLIENT_SECRET>" \
  -d "redirect_uri=http://localhost" \
  -d "grant_type=authorization_code"
```

返回 JSON 中的 `refresh_token` 即所需值。

## 4. 写入 .env

```env
EXTENSION_ID = fjgablnemienkegdnbihhemebmmonihg
CLIENT_ID = <client_id>
CLIENT_SECRET = <client_secret>
REFRESH_TOKEN = <refresh_token>
PUBLISHER_ID = d7edff7a-4f18-4cf9-9f3e-c794b3e89c03
```

> 变量名为 `chrome-webstore-upload-cli` 要求的固定名称，不可更改。

## 注意事项

- refresh_token 有效期约 7 天，过期需重新执行第 3 步
- 同意屏幕未发布到生产环境时，仅测试用户列表中的邮箱可授权
- 首次发布扩展须在 Developer Dashboard 手动完成，之后才能通过 API 更新
