# 文件类型图标设计文档（.bpmn / .dmn）

> 本文档记录 .bpmn / .dmn 文件类型图标的最终设计方案、设计参数和重新生成流程，方便下次修改时直接复用，无需重新摸索。

## 最终效果

Office 风格文件图标：白色文档造型（右上折角）+ 中心品牌色符号 + 左下角 App 徽标（紫粉渐变 K）。

```
┌─────────────────────┐
│                ▐▌   │  ← 右上折角（淡渐变）
│                     │
│      ╭───╮          │
│      │⚙️ │  蓝齿轮    │  ← BPMN（#165DFF）/ DMN 用紫表格（#8b5cf6）
│      ╰───╯          │
│                     │
│ ┌────┐              │  ← 左下角 App 徽标
│ │░░K░│              │     紫粉渐变 #4519C3→#9C41CD→#F369D7
│ └────┘              │     与文档左下角顶点重合，opacity 0.80
└─────────────────────┘
```

## 设计参数（viewBox 0 0 1024 1024）

### 文档主体

- 路径：`M180 90 L660 90 L860 290 L860 930 Q860 960 830 960 L210 960 Q180 960 180 930 Z`
- 左上角 (180,90)，右下角圆弧顶点 (180,960)，折角斜线从 (660,90)→(860,290)
- **背景渐变**（顶亮底深，3D 感）：
  - BPMN: `#ffffff`(0%) → `#f5f9ff`(15%) → `#e0eafa`(50%) → `#c4d6f0`(85%) → `#a8c0e8`(100%)
  - DMN: `#ffffff`(0%) → `#faf6ff`(15%) → `#ece0f8`(50%) → `#d0bdec`(85%) → `#b89ee0`(100%)
- **无描边、无径向高光、无边缘亮线/暗线**（纯靠 5 段垂直渐变模拟凸起弧面 3D 感）
- 柔和投影：`#000` opacity 0.08，偏移 (6,10)

### 右上折角（3D 但柔和）

- 路径：`M660 90 L860 290 L710 290 Q660 290 660 240 Z`
- **折角渐变**（对角，浅→深）：
  - BPMN: `#eef4fc` → `#aebbdb`
  - DMN: `#f4edfb` → `#c9b1de`
- 边框：1.5px，BPMN `#dce6f3` / DMN `#e4d9f0`
- ⚠️ **无内侧阴影线**（之前加过阴影线效果太重，已移除）

### 中心符号

- BPMN 齿轮：`transform="translate(312 322) scale(16.5)"`，fill `#165DFF`
- DMN 表格：`transform="translate(342 342) scale(16)"`，fill `#8b5cf6`

### 左下角 App 徽标

- 圆角矩形：`x=180 y=760 width=200 height=200 rx=44`
- **与文档左下角顶点 (180,960) 完全重合**（徽标左下角 = 文档左下角）
- **整体 opacity=1.0**（完全明亮，紫粉渐变饱和鲜明）
- 紫粉渐变：`#4519C3` → `#9C41CD`(0.7) → `#F369D7`，方向 (180,960)→(380,760)
- 白色 K 路径：`transform="translate(180 760) scale(0.0045662)"`，原始路径来自 `src-tauri/app-icon.svg`
- 阴影：rect 偏移 (3,5)，opacity 0.08

## 文件清单

源文件位于 `src-tauri/icons/filetype/`：

| 文件 | 用途 |
| --- | --- |
| `bpmn.svg` / `dmn.svg` | **SVG 源文件（修改设计的入口）** |
| `bpmn-1024.png` / `dmn-1024.png` | 1024×1024 高清 PNG（生成其他格式的基底） |
| `bpmn.icns` / `dmn.icns` | macOS 文件类型图标 |
| `bpmn.ico` / `dmn.ico` | Windows 文件类型图标（含 16/32/48/256） |
| `bpmn-{16,22,24,32,48,64,128,256,512}.png` | Linux hicolor + 多尺寸 |
| `bpmn.iconset/` / `dmn.iconset/` | iconutil 生成 icns 的中间产物 |

## 修改设计后的重新生成流程

### 1. 编辑 SVG 源文件

修改 `bpmn.svg` 和/或 `dmn.svg`。

### 2. 渲染所有尺寸 PNG + icns

```bash
cd src-tauri/icons/filetype

# 用 Node + resvg-js 批量渲染（快，推荐）
node -e "
const fs=require('fs'),path=require('path');
const {Resvg}=require('@resvg/resvg-js');
const DIR='.';
function render(svg,size){return new Resvg(svg,{fitTo:{mode:'width',value:size}}).render().asPng();}
for(const t of ['bpmn','dmn']){
  const svg=fs.readFileSync(t+'.svg','utf-8');
  const isDir=t+'.iconset';
  fs.rmSync(isDir,{recursive:true,force:true});fs.mkdirSync(isDir,{recursive:true});
  for(const s of [16,32,128,256,512]){
    fs.writeFileSync(isDir+'/icon_'+s+'x'+s+'.png',render(svg,s));
    fs.writeFileSync(isDir+'/icon_'+s+'x'+s+'@2x.png',render(svg,s*2));
  }
  for(const s of [16,22,24,32,48,64,128,256,512]){fs.writeFileSync(t+'-'+s+'.png',render(svg,s));}
  fs.writeFileSync(t+'-1024.png',render(svg,1024));
}
"
iconutil -c icns bpmn.iconset
iconutil -c icns dmn.iconset
```

### 3. 生成 ICO（Windows）

```bash
node -e "
const fs=require('fs');
const pngToIco=require('png-to-ico').default;
(async()=>{
  for(const t of ['bpmn','dmn']){
    const buf=await pngToIco([16,32,48,256].map(s=>fs.readFileSync(t+'-'+s+'.png')));
    fs.writeFileSync(t+'.ico',buf);
  }
})();
"
```

### 4. 重新 build dmg（正式发布）

```bash
pnpm tauri build
```

新 icns 会自动打包进 `.app/Contents/Resources/`。

### 5. 即时验证（不 rebuild，注入到已安装 app）

```bash
APP="/Applications/Kunpeng Modeler.app"
cp bpmn.icns dmn.icns "$APP/Contents/Resources/"
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP"
killall Finder Dock
```

## 配色速查

| 元素             | BPMN                      | DMN             |
| ---------------- | ------------------------- | --------------- |
| 中心符号         | `#165DFF`（品牌蓝）       | `#8b5cf6`（紫） |
| 文档底色（最深） | `#a8c0e8`                 | `#b89ee0`       |
| 折角深色         | `#aebbdb`                 | `#c9b1de`       |
| App 徽标渐变     | `#4519C3→#9C41CD→#F369D7` | 同左            |

## 设计历史要点

- 折角阴影线效果（内侧 path + opacity）实测太重，已移除，只保留淡渐变
- App 徽标 opacity 经过多次调试：0.58 太灰蒙蒙 → 0.66 偏淡 → 0.80 饱和不抢眼 → **1.0 完全明亮**（最终采用，紫粉渐变饱和鲜明）
- App 徽标必须与文档左下角顶点重合（左下角对齐），不能悬空在内侧
- **边缘立体感**：曾尝试硬边框、模糊亮线/暗线、feGaussianBlur 滤镜——都不理想（太硬或 resvg 不支持）。最终方案是**纯 5 段垂直渐变**（顶白→底深，大跨度柔和过渡），无任何描边/高光层，靠渐变本身的明暗跨度模拟凸起弧面 3D 感
