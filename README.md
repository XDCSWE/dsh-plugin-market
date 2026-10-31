# DSH 社区精选 · 插件市场索引

一个自建的 DeepSeek Harness 插件市场索引（format 1）：18 个社区组合包，全部核对过在当前 DSH
`0.2.1-rc.5` 上可安装（`engines.dsh` / `@deepseek-ai/dsh-*` peer 依赖都满足，校验用
`includePrerelease: true`，与 DSH 自身的检查一致）。

索引已用官方校验器 `@deepseek-ai/dsh-plugin-market-index` 的 `parseMarketIndex` 验证通过。

```
index.json          索引本体（18 个插件、6 个分类、2 个标签）
icons/*.svg         每个插件的图标（64×64，相对路径引用）
tools/_fetch.mjs    从 npm registry 拉取每个包的最新版本、发布时间、作者、仓库
tools/_build.mjs    收录清单 + 双语文案 → 生成 index.json 和 icons/
tools/_validate.mjs 用官方校验器复验，并打印每个条目的安装 spec
tools/_serve.mjs    本地静态服务（DSH 只接受 http/https，file:// 不行）
tools/_meta.json    抓取结果缓存
```

## 在 DSH 里添加

1. 打开 **插件** → **发现** → **添加索引源**。
2. 填入地址：

   ```
   http://127.0.0.1:8788/index.json
   ```

   该地址由 `tools/_serve.mjs` 提供，只在那个进程活着时可用：

   ```powershell
   node tools/_serve.mjs 8788
   ```

3. 添加后可搜索、按分类/标签筛选，点卡片进详情页安装。

## 长期使用：换成固定地址

本地服务关掉索引源就会报错。要长期可用，把 `index.json` 和 `icons/` 一起传到任意静态主机
（GitHub Pages、对象存储、内网 nginx 都行），然后把这个 URL 填进去即可：

- 必须是 `http:` 或 `https:`，不能带用户名密码和 `#` 片段；
- 不能经过重定向（指向最终地址）；
- 图标是按相对索引 URL 解析的，所以 `icons/` 必须和 `index.json` 保持同级目录一起发布。

例如 GitHub Pages 上放在 `https://<user>.github.io/dsh-market/`，索引地址就是
`https://<user>.github.io/dsh-market/index.json`。

## 增删条目

改 `tools/_build.mjs` 里的 `picks` 数组（每项含 `name`、`slug`、`glyph`、`color`、`category`、
`labels` 和双语 `title`/`description`），把新增的包名也加进 `tools/_fetch.mjs` 的 `names`，
然后：

```powershell
node tools/_fetch.mjs
node tools/_build.mjs
node tools/_validate.mjs
```

换版本时重跑前两步即可；`_fetch.mjs` 总是取 npm 上的 `latest`。

## 注意

- 这些全是 **第三方包**。DSH 只校验索引格式，不核验标题、作者和来源声明；索引里的
  `source` 指向 npm 上的真实包，安装前请自己在插件详情页核对仓库和版本。
- 本地服务用的是 `http://127.0.0.1`，只在本机可见，不经过网络；放到公网时请用 `https:`。
- 索引里每个插件只列了一个版本（npm 最新）。需要保留旧版本时，在 `versions` 里追加即可，
  DSH 会按 SemVer 降序展示，并标记推荐/不兼容的版本。
