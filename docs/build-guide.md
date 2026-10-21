# 打包构建指南

本文档说明如何在 macOS 上打包三个平台的安装包：Apple 芯片 DMG、Intel 芯片 DMG、Windows NSIS 安装包。

## 前置要求

### 1. Rust 工具链

确认已安装以下 target（`rustup target list --installed` 查看）：

```bash
# macOS Apple 芯片
rustup target add aarch64-apple-darwin

# macOS Intel 芯片
rustup target add x86_64-apple-darwin

# Windows（交叉编译）
rustup target add x86_64-pc-windows-msvc
```

三个 target 装好后，**在同一台 Mac 上即可打包全部三个平台的安装包**，无需切换机器。

### 2. Node 依赖

```bash
cd dists/kunpeng-modeler
pnpm install
```

### 3. Windows 交叉编译工具（仅打 exe 需要）

在 macOS 上交叉编译 Windows 需要以下工具：

#### 3.1 安装 LLD 链接器

```bash
brew install llvm
```

安装后确认 `lld` 在 PATH 中：

```bash
which lld
# 应输出类似 /usr/local/bin/lld 或 /opt/homebrew/bin/lld
```

#### 3.2 安装 xwin（Windows SDK/CRT 交叉库）

```bash
cargo install xwin
```

#### 3.3 初始化 Windows SDK/CRT

```bash
xwin --accept-license splat --output ~/.xwin
```

执行后会在 `~/.xwin/` 下生成 `crt/` 和 `sdk/` 目录。

#### 3.4 配置 Cargo linker

在 `src-tauri/.cargo/config.toml` 中配置（已配置）：

```toml
[target.x86_64-pc-windows-msvc]
linker = "lld"
rustflags = [
  "-Lnative=/Users/<你的用户名>/.xwin/crt/lib/x86_64",
  "-Lnative=/Users/<你的用户名>/.xwin/sdk/lib/um/x86_64",
  "-Lnative=/Users/<你的用户名>/.xwin/sdk/lib/ucrt/x86_64"
]
```

> 注意：把路径中的 `<你的用户名>` 改成你实际的 macOS 用户名。

---

## 打包命令

所有命令在 `dists/kunpeng-modeler/` 目录下执行。

### 打包 Apple 芯片 DMG（M1/M2/M3/M4）

```bash
npm run build:dmg-arm
```

- Target: `aarch64-apple-darwin`
- 产物: `src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/Kunpeng Modeler_0.1.0_aarch64.dmg`
- 适用: 所有 Apple 芯片 Mac

### 打包 Intel 芯片 DMG

```bash
npm run build:dmg-intel
```

- Target: `x86_64-apple-darwin`
- 产物: `src-tauri/target/x86_64-apple-darwin/release/bundle/dmg/Kunpeng Modeler_0.1.0_x64.dmg`
- 适用: 所有 Intel 芯片 Mac（2020 年前机型）

### 打包 Windows NSIS 安装包

```bash
npm run build:exe
```

- Target: `x86_64-pc-windows-msvc`
- Bundler: `nsis`
- 产物: `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/Kunpeng Modeler_0.1.0_x64-setup.exe`
- 适用: Windows 10/11 (64 位)

### 快捷命令

| 命令                | 说明                               |
| ------------------- | ---------------------------------- |
| `npm run build:dmg` | 打包当前机器架构的 DMG（开发自用） |
| `npm run build:all` | 依次打包当前架构 DMG + Windows exe |

---

## 产物汇总

```
src-tauri/target/
├── aarch64-apple-darwin/release/bundle/dmg/
│   └── Kunpeng Modeler_0.1.0_aarch64.dmg        # Apple 芯片
├── x86_64-apple-darwin/release/bundle/dmg/
│   └── Kunpeng Modeler_0.1.0_x64.dmg             # Intel 芯片
└── x86_64-pc-windows-msvc/release/bundle/nsis/
    └── Kunpeng Modeler_0.1.0_x64-setup.exe       # Windows 安装包
```

---

## 常见问题

### Q: Apple 芯片 Mac 上能打 Intel 包吗？

可以。Rust 原生支持交叉编译，`rustup target add x86_64-apple-darwin` 后即可在任何 Mac 上打 Intel 包，反之亦然。

### Q: Intel Mac 上能打 Apple 芯片包吗？

可以。同样通过交叉编译，不需要 Apple 芯片机器。

### Q: 打 exe 报错 `lld: command not found`

安装 LLVM：`brew install llvm`，然后确认 `/usr/local/bin/lld`（Intel）或 `/opt/homebrew/bin/lld`（Apple 芯片）在 PATH 中。

### Q: 打 exe 报链接错误（找不到 `*.lib`）

确认 `xwin` 已初始化：`xwin --accept-license splat --output ~/.xwin`，并检查 `.cargo/config.toml` 中的路径是否正确。

### Q: 清除编译缓存重新打包

```bash
cd src-tauri && cargo clean    # 清除全部 Rust 编译缓存（约 6GB+）
```

### Q: 打包时间参考

- DMG（单架构）：约 2-8 分钟（取决于缓存命中）
- Windows exe（交叉编译）：约 5-10 分钟
- 全量从零编译（cargo clean 后）：约 8-15 分钟
