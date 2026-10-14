# 发布 @kunpeng-js/* 包到 npm

`packages/` 下的三个目录(`bpm`、`bpmn`、`dmn`)共 **25 个 `@kunpeng-js/*` 包**需要发布到 npmjs.com。根目录 `package.json` 已提供相关命令:

| 命令 | 作用 |
| --- | --- |
| `pnpm build:packages` | 按依赖拓扑顺序构建全部 25 个包 |
| `pnpm publish:npm` | 构建 + 发布全部 25 个包到 npm |
| `pnpm publish:npm:dry` | 演练模式(走完整流程但不真正上传) |

## 一次性准备

1. **注册 npm 账号**:在 [npmjs.com](https://www.npmjs.com/signup) 注册。
2. **创建名为 `kunpeng-js` 的 Organization**:头像 → Add Organization → 名称填 `kunpeng-js`(免费方案即可,公共包不收费)。发布 `@kunpeng-js/*` 包必须拥有这个 scope。该组织已创建,归属 npm 账号 `anyilanxinadmin`。注意:npm 的用户名/组织名共用命名空间,删除账号或组织后名字基本不会释放,选名需慎重。
3. **登录**:

   ```bash
   npm login
   npm whoami   # 确认登录成功
   ```

4. **(推荐)配置免 OTP 的发布凭证**:如果账号开启了 2FA,逐个发布 25 个包会反复要求输入动态口令。两种方式任选其一:

   **方式 A(优先确认):网页上把 2FA 切为 auth-only(仅登录验证)**

   登录 npmjs.com 打开 Settings → Two-Factor Authentication(`https://www.npmjs.com/settings/<用户名>/tfa`),若提供"仅登录验证 / login only"之类的模式选项则切换之;之后现有登录 token 即可直接发布。注意:CLI 命令 `npm profile enable-2fa auth-only` 走的是已被 npm 移除的 TOTP 注册接口,对已有 TOTP 的账号会报 404("Adding a new TOTP 2FA is no longer supported"),此路不通,只能看网页设置。

   **方式 B(随时可用,不改动账号设置):OTP 直发脚本**

   ```bash
   pnpm publish:npm:otp                # 先构建全部产物,再提示输入当前动态口令
   SKIP_BUILD=1 pnpm publish:npm:otp   # 若中途口令过期,输新口令续传(自动跳过已发布的包)
   ```

   **方式 C(临时方案,2027 年 1 月失效):Granular Access Token(Bypass 2FA)**

   1. npmjs.com → 头像 → **Access Tokens** → Generate New Token → Granular Access Token
   2. Permissions 选 **Read and write**,范围限定 **@kunpeng-js** scope(org 必须已创建,否则列表里选不到)
   3. 拉到底,把 **Bypass 2FA** 开关打开(默认关闭;不开则发布时照样要 OTP)。注意:npm 创建页已提示该直发模式将于 2027 年 1 月移除,官方建议改用 stage-only(上传暂存 + 网页 2FA 批准的两步发布);单人本地批量发 25 个包用 stage-only 每次都要去网页逐个批准,不划算
   4. 生成后立即复制 `npm_` 开头的 token(只显示一次),然后:

      ```bash
      npm config set //registry.npmjs.org/:_authToken <你的token>
      ```

   方式 A/C 涉及 token 时,建议统一 registry 为官方 `.org` 拼写并验证(若 `~/.npmrc` 里 registry 是 `registry.npmjs.com`,发布请求会经重定向打到 `.org`,可能与 `.com` 下的旧 token 错配导致 403/401):

   ```bash
   npm config set registry https://registry.npmjs.org/
   npm whoami   # 必须能打印用户名
   ```

   token 只写入全局 `~/.npmrc`,**不要**放进仓库的 `.npmrc`(会随 git 提交泄露)。什么都不配置也可以发布,只是中途可能多次要求输入 OTP。

## 日常发布流程

```bash
# 1. 修改要发布的包的 version 字段(package.json),然后 commit 并 push。
#    pnpm 的 git 检查要求:当前分支为 main、工作区干净、与远端同步。

# 2. 预检:完整走一遍打包(会执行各包构建钩子并列出 tarball 内容),不上传。
pnpm publish:npm:dry

# 3. 正式发布
pnpm publish:npm
```

## 机制说明(为什么这样设计)

- **只发这 25 个包**:命令通过 `-F './packages/bpm/*'` 等三个过滤器精确框定范围。`internal/`、`scripts/`、`dist/`(Tauri 应用)里的包全部是 `private: true`,不会被发布。
- **`workspace:*` 和 `catalog:` 依赖自动替换**:pnpm publish 打包时会把包内依赖里的 `workspace:*` 换成对应包的实际版本、`catalog:` 换成解析出的 semver 区间(已在本仓库 pnpm 10.34.5 上实测验证)。
- **按拓扑顺序发布**:依赖包先发、被依赖包后发,`workspace:*` 替换后引用的都是刚发布的新版本。
- **构建会自动执行**:`pnpm publish` 会运行各包的 `prepare` / `prepublishOnly` 钩子(如 `rimraf dist && vite build`;`@kunpeng-js/dmn-js` 还会构建 distro UMD 产物)。`publish:npm` 里先跑 `build:packages` 是为了把构建失败挡在真正上传之前,避免发到一半中断。发布流程不跑测试;karma 时代的 distro 测试已随 vitest 迁移移除。
- **`--access public`**:scoped 包默认 restricted(收费),必须显式声明 public。
- **`--publish-branch main`**:pnpm 默认只允许从 `master` 发布,本仓库主分支是 `main`。
- **vendored preact 不会单独发布**:`packages/bpm/properties-panel/preact/` 不在 workspace 范围内,它作为 `@kunpeng-js/properties-panel` 的 `files: ["preact", ...]` 内容随包一起分发。

## 注意事项

- **版本号已存在会报错**(EPUBLISHCONFLICT):改过代码必须先升版本号再发布。不要用 `--force` 覆盖已发布版本。
- **预发布版本与 latest tag**:部分包当前是 `2026.0.0-alpha1` 这类预发布版本,首次发布会成为 `latest`。之后若希望 alpha 版本不占用 latest,单独发这些包时加 `--tag alpha`:`pnpm -F @kunpeng-js/bpmn-moddle publish --access public --tag alpha --publish-branch main`。
- **改过 `@kunpeng-js/linting` 后**:它的 `lib/compiled-config.js` 是提交进仓库的产物,改了规则配置先执行 `pnpm -F @kunpeng-js/linting run compile-config` 并提交,再发布。
- **绕过 git 检查**(仅限临时救急,不建议):给 `publish:npm` 追加 `--no-git-checks`。
- 仓库根目录虽有 `changeset` / `version` 脚本,但 `.changeset/` 目录未初始化,目前不可用;版本号目前靠手动修改。如需自动化版本与 CHANGELOG,后续可 `pnpm exec changeset init` 引入。
