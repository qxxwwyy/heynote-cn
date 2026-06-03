# heynote-cn 项目结构分析

## 1. 技术栈概述

| 层面 | 技术 |
|------|------|
| 框架 | Vue 3 + Pinia (状态管理) |
| 编辑器引擎 | CodeMirror 6 + Lezer (语法解析) |
| 桌面框架 | Electron 39 |
| 构建工具 | Vite 6 + vue-tsc |
| 语法高亮 | @codemirror/lang-* (支持 34 种语言) |
| 数学引擎 | math.js (public/math.js, ~635KB minified) |
| 数学语法解析 | heynote-lang-mathjs (npm 包, Lezer 语法) |
| UI 组件库 | PrimeVue 4 |
| CSS | Sass (embedded) |
| 测试 | Playwright (E2E) + Vitest (单元) |
| 包管理 | npm + patch-package |
| 特殊依赖 | pinyin-pro (中文文件名 slugify), fuzzysort (搜索) |

### 项目入口

- **桌面端**: `index.html` -> `src/main.js`
- **Web版**: `webapp/index.html` -> `webapp/main.js`
- **Electron主进程**: `electron/main/index.ts`
- **预加载**: `electron/preload/index.js`

## 2. i18n 文件清单与当前支持语言

**关键发现: 项目当前没有 i18n 框架。** 所有 UI 文本硬编码在 Vue 组件和 JS 文件中，仅支持英文。

### locale 相关文件

| 文件 | 用途 |
|------|------|
| `src/util/locale.js` | 将系统 locale 转为安全的 BCP 47 格式 (供 Intl API 使用) |
| `src/common/format-date.js` | 使用 `Intl.DateTimeFormat` 格式化日期 (跟随系统 locale) |
| `src/common/language-code/language-code.js` | ISO 639-1 语言代码映射 (用于显示语言名称) |
| `src/common/language-code/iso-639-1.json` | ISO 639-1 语言代码数据 |
| `src/editor/date-time.js` | 插入日期时间 (调用 format-date.js, 使用 systemLocale) |
| `src/stores/heynote-store.js` | `systemLocale` 状态字段, 在 `initHeynoteStore()` 中通过 `getSystemLocale()` IPC 获取 |
| `electron/preload/index.js` | 暴露 `getSystemLocale()` API |
| `electron/main/index.ts` | `GET_SYSTEM_LOCALE` IPC handler, 调用 `app.getSystemLocale()` |

### 中文适配已有改动

| 文件 | 改动 |
|------|------|
| `src/common/sanitize-filename.js` | 使用 `pinyin-pro` 将中文文件名转为拼音 slug |
| `package.json` | 添加 `pinyin-pro` 依赖 |
| `src/common/initial-content.js` | 欢迎文本仍为英文: "Welcome to Heynote!" |

### 硬编码 UI 文本所在文件 (需 i18n 化)

| 文件 | 内容 |
|------|------|
| `src/common/initial-content.js` | 欢迎文本、math 示例说明 |
| `src/components/settings/Settings.vue` | 设置面板所有标签 (General, Appearance 等) |
| `src/components/settings/TabListItem.vue` | 标签页名称 (通过 prop name) |
| `src/components/LanguageSelector.vue` | 语言选择器 (Auto-detect 等) |
| `src/components/StatusBar.vue` | 状态栏文本 |
| `src/components/BufferSelector.vue` | 缓冲区选择器文本 |
| `src/components/NewBuffer.vue` | 新建缓冲区对话框 |
| `src/components/EditBuffer.vue` | 编辑缓冲区对话框 |
| `src/components/ErrorMessages.vue` | 错误信息文本 |
| `src/components/LeftPanel.vue` | 左侧面板文本 |
| `src/editor/date-time.js` | "Yesterday" 硬编码 (在 format-date.js 中) |
| `src/editor/block/math.js` | "Copied!" 硬编码 |
| `src/common/format-date.js` | "Yesterday" 硬编码字符串 |
| `electron/main/menu.js` | 菜单项文本 |
| `electron/main/about.js` | 关于对话框 |

**说明**: 项目仅通过 `Intl` API 实现了日期/时间的 locale 感知格式化，不涉及 UI 文本翻译。要实现完整中文界面，需要引入 vue-i18n 或类似框架。

## 3. 数学引擎入口文件和变量名正则表达式位置

### 数学引擎架构

```
public/math.js                 <- math.js 库 (全局 window.math)
    |
    v
src/editor/block/math.js       <- 入口: CodeMirror ViewPlugin, 调用 math.evaluate()
    |
    v
src/editor/languages.js       <- 注册 "math" 语言, 使用 mathjsLanguage.parser
    |
    v
node_modules/heynote-lang-mathjs/  <- Lezer 语法 (定义数学表达式的 token/解析规则)
```

### 关键文件

| 文件 | 角色 |
|------|------|
| `public/math.js` | math.js 运行时库, 在 `index.html` 中以 `<script>` 加载, 挂载到 `window.math` |
| `src/editor/block/math.js` | **数学计算核心**: CodeMirror ViewPlugin, 逐行调用 `parser.evaluate(line.text)` |
| `src/editor/languages.js` | 将 "math" 注册为语言 token, parser 来自 `heynote-lang-mathjs` |
| `src/editor/lang-heynote/heynote.grammar` | 定义区块分隔符中 `math` 为合法语言 token |

### 变量名解析逻辑

**math.js 内部处理变量名**, 项目代码中不包含独立的变量名正则。变量名规则由 math.js 库自身定义:

1. **区块识别**: `src/editor/block/block.js` 中的 `delimiterRegex` 匹配区块分隔符:
   ```javascript
   export const delimiterRegex = /^\n∞∞∞[a-z]+(-a)?(?:;[^\n]+)*\n$/
   ```
   `src/editor/block/block-parsing.js` 中的 `BLOCK_DELIMITER_REGEX`:
   ```javascript
   const BLOCK_DELIMITER_REGEX = new RegExp(`\\n∞∞∞(${languageTokensMatcher})(-a)?(?:;[^\\n]+)*\\n`, "g")
   ```
   其中 `languageTokensMatcher` 由所有语言 token 拼接而成 (text|math|javascript|typescript|...).

2. **math.js 内部变量名规则** (在 `public/math.js` 中, minified):
   - math.js 支持的变量/函数名遵循标准数学表达式规则
   - 标识符: `[A-Za-z_$][A-Za-z0-9_$]*`
   - 内置常量: `PI`, `E`, `Infinity`, `i` (虚数)
   - 内置函数: `sin`, `cos`, `tan`, `sqrt`, `log`, `abs`, `round`, `floor`, `ceil`, `pow`, `format` 等
   - 变量赋值: `variableName = expression` (在 `math.js` 中通过 `parser.set()` 实现)

3. **`math.js` 的 `prev` 变量**: `src/editor/block/math.js` 第 64-68 行:
   ```javascript
   parser.set("prev", prev)
   result = parser.evaluate(line.text)
   if (result !== undefined) {
       mathParsers.set(block, {parser, prev:result})
   }
   ```
   每次计算后, 结果会存入 `prev` 变量, 下一行可通过 `prev` 引用上一行结果。

4. **math.js 中的单位转换**: 支持 `13 inches in cm` 等自然语言单位转换和汇率转换, 在 `src/common/currency-request.js` 和 `src/currency.js` 中加载汇率数据。

5. **heynote-lang-mathjs 包** (未安装到 node_modules): 该包提供 Lezer 语法定义, 用于 CodeMirror 的语法高亮和嵌套解析。由于 `npm install` 未执行, 其内部 identifier 规则需在安装后查看 `node_modules/heynote-lang-mathjs/` 目录。

### Block 分隔符中的 Identifier 规则

`src/editor/lang-heynote/heynote.grammar` 中, 语言标识符为精确匹配 (非正则):
```
NoteLanguage {
    "text" | "math" | "javascript" | "typescript" | ...
}
```

这意味着用户无法自定义区块语言名称, 只能使用预定义的 34 种语言 token。

## 4. 需要修改的文件清单

### i18n 中文化 (如果要添加中文 UI)

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `package.json` | 添加依赖 | vue-i18n |
| `src/main.js` | 引入 i18n | 创建 i18n 实例并挂载 |
| `webapp/main.js` | 引入 i18n | 同上 |
| `src/common/initial-content.js` | 翻译 | 欢迎文本中文化 |
| `src/common/format-date.js` | 翻译 | "Yesterday" 中文化 |
| `src/editor/block/math.js` | 翻译 | "Copied!" 中文化 |
| `src/components/settings/Settings.vue` | 翻译 | 设置面板所有文本 |
| `src/components/LanguageSelector.vue` | 翻译 | "Auto-detect" |
| `src/components/StatusBar.vue` | 翻译 | 状态栏文本 |
| `src/components/BufferSelector.vue` | 翻译 | 缓冲区选择器 |
| `src/components/NewBuffer.vue` | 翻译 | 新建对话框 |
| `src/components/EditBuffer.vue` | 翻译 | 编辑对话框 |
| `src/components/ErrorMessages.vue` | 翻译 | 错误信息 |
| `src/components/App.vue` | 翻译 | 确认对话框等 |
| `electron/main/menu.js` | 翻译 | 菜单项 |
| `electron/main/about.js` | 翻译 | 关于对话框 |
| `index.html` | 修改 | `<html lang="en">` 改为动态设置 |
| `webapp/index.html` | 修改 | 同上 |

### 数学引擎相关 (如果要扩展变量名支持中文)

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `public/math.js` | 替换/修改 | math.js 库本身, 需修改其 identifier lexer 规则以支持中文变量名 |
| `src/editor/block/math.js` | 可能修改 | 如果需要额外的变量名预处理 |

### 项目结构概览

```
heynote-cn/
├── electron/               # Electron 主进程
│   ├── main/
│   │   ├── index.ts        # 主入口, IPC handlers
│   │   ├── menu.js         # 菜单 (硬编码英文)
│   │   ├── about.js        # 关于对话框
│   │   ├── window-bounds.ts
│   │   ├── auto-update.js
│   │   ├── cors.ts
│   │   ├── file-library.js
│   │   ├── protocol.js
│   │   ├── ripgrep.js
│   │   └── version.js
│   ├── preload/
│   │   ├── index.js        # contextBridge (暴露 heynote API)
│   │   ├── currency.ts
│   │   └── theme-mode.ts
│   ├── config.js
│   └── detect-platform.ts
├── src/
│   ├── main.js             # Vue 应用入口
│   ├── components/         # Vue 组件 (UI 文本在此)
│   │   ├── App.vue
│   │   ├── Editor.vue
│   │   ├── Settings.vue (settings/)
│   │   ├── LanguageSelector.vue
│   │   ├── StatusBar.vue
│   │   └── ...
│   ├── editor/             # CodeMirror 编辑器逻辑
│   │   ├── block/
│   │   │   ├── block.js        # 区块状态管理, delimiterRegex
│   │   │   ├── block-parsing.js # 区块解析 (字符串/syntaxTree)
│   │   │   ├── math.js         # **数学引擎入口**
│   │   │   └── commands.js
│   │   ├── lang-heynote/
│   │   │   ├── heynote.grammar  # Lezer 语法 (语言 token 精确匹配)
│   │   │   ├── parser.js        # 生成的 parser
│   │   │   └── nested-parser.js
│   │   ├── languages.js      # 34 种语言注册表
│   │   ├── language-detection/
│   │   │   └── autodetect.js  # 自动语言检测 (guesslang)
│   │   └── ...
│   ├── stores/             # Pinia 状态管理
│   │   ├── heynote-store.js  # 主 store, systemLocale
│   │   └── settings-store.js
│   ├── common/             # 工具函数
│   │   ├── format-date.js    # 日期格式化 (Intl)
│   │   ├── sanitize-filename.js # 中文拼音 slugify
│   │   ├── initial-content.js  # 欢迎内容 (英文硬编码)
│   │   ├── language-code/   # ISO 639-1 映射
│   │   └── ...
│   └── util/
│       └── locale.js       # locale 安全转换
├── webapp/                 # Web 版入口
├── public/
│   ├── math.js             # math.js 库 (635KB)
│   ├── guesslang.min.js    # 语言猜测库
│   └── langdetect-worker.js
├── tests/
│   ├── main/               # Vitest 单元测试
│   └── playwright/         # Playwright E2E 测试
├── index.html              # 桌面端 HTML 入口
├── package.json            # v2.9.0
└── vite.config.*           # Vite 配置
```
