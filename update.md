# Heynote 中文版 — 改动总结 (v2.9.0 Fork)

> 记录基于上游 Heynote v2.9.0 的所有改动，按功能模块分开说明。
> 官方后续计划支持多语言后，汉化部分可直接替换为 upstream 方案；Math 优化为独立改动，需长期保留。

---

## 一、界面中文汉化

> **可废弃性**: 当上游官方支持多语言后，此部分可整体替换。独立文件见 AGENTS.md 索引。

### 改动范围

**前端 UI（vue-i18n，23 个组件文件）**

- 设置面板全部标签（通用/编辑/外观/快捷键/更新）
- 状态栏、缓冲区选择器、语言选择器
- 新建/编辑缓冲区对话框
- 错误提示信息
- 左侧面板
- 更新状态提示
- 键盘绑定页面

**Electron 主进程（独立翻译，不用 vue-i18n）**

- 菜单栏全部项（文件/编辑/视图/窗口/帮助）
- 右键上下文菜单（编辑器/标签/缓冲区树/拼写检查）
- 关于对话框标题
- 命令面板分类和描述

**内容翻译**

- 初始欢迎区块（Welcome to Heynote）
- Math 区块说明文字
- 日期格式化（"昨天"）
- Math.js "已复制!" 反馈

**翻译规则**

- 品牌名 "Heynote" 保持原文
- 编程语言名称保持英文
- 代码区块内容不翻译
- 未覆盖的 key 自动 fallback 到英文

### 技术实现

- **框架**: vue-i18n 11.x，legacy=false（Composition API 模式）
- **Locale 检测**: `navigator.language`（renderer）/ `Intl.DateTimeFormat`（主进程），`zh*` → zh-CN，其余 → en
- **主进程菜单**: `menu-locales.js` 手写翻译表，通过 IPC `menu:setLocale` 与 renderer 同步 locale
- **文件**: `src/i18n/` 目录下 index.js + zh-CN.json + en.json

### 修改文件清单

```
src/i18n/index.js                           [新增] i18n 框架
src/i18n/locales/en.json                    [新增] 英文翻译
src/i18n/locales/zh-CN.json                 [新增] 中文翻译
src/common/format-date.js                   [修改] Yesterday → 昨天
src/common/initial-content.js               [修改] i18n 注入模式
src/main.js                                 [修改] 挂载 i18n 插件
electron/main/menu-locales.js               [新增] 主进程翻译表
electron/main/menu.js                       [修改] 调用 t() 翻译
electron/main/about.js                      [修改] 关于对话框标题
electron/main/index.ts                      [修改] IPC handler、locale 同步
src/components/App.vue                       [修改]
src/components/BufferSelector.vue            [修改]
src/components/EditBuffer.vue               [修改]
src/components/ErrorMessages.vue             [修改]
src/components/LanguageSelector.vue         [修改]
src/components/LeftPanel.vue                [修改]
src/components/NewBuffer.vue                [修改]
src/components/StatusBar.vue                [修改]
src/components/UpdateStatusItem.vue         [修改]
src/components/settings/KeyboardBindings.vue[修改]
src/components/settings/Settings.vue        [修改]
src/editor/block/math.js                    [修改] "已复制" 翻译
src/editor/commands.js                      [修改]
index.html                                  [修改] lang 属性
webapp/index.html                           [修改]
webapp/main.js                              [修改]
```

---

## 二、Math 区块支持中文变量

> **长期保留**: 此改动独立于汉化，上游未计划支持 CJK 变量名。

### 改动内容

Math.js 使用 `isValidLatinOrGreek` 正则验证变量名中的字符是否为字母。原正则只覆盖拉丁字母和希腊字母，CJK 汉字不在范围内，导致 `价格 = 29.9` 这样的表达式报错。

修改 `public/math.js` 中的 `isValidLatinOrGreek` 函数，扩展 CJK Unicode 范围：

| 范围 | Unicode | 说明 |
|------|---------|------|
| CJK 扩展 A | U+3400 - U+4DBF | 罕用汉字 |
| CJK 统一汉字 | U+4E00 - U+9FFF | 常用汉字（价格、数量等） |
| CJK 兼容汉字 | U+F900 - U+FAFF | 兼容区汉字 |

注意：tokenizer 的 identifier 正则本身已包含宽泛的 Unicode 范围，阻断点仅在于 `isAlpha` 验证层。只需修改验证层即可。

### 使用示例

```
价格 = 29.9
数量 = 3
总价 = 价格 * 数量    // 89.7

半径 = 5
面积 = 半径^2 * PI   // 78.54
```

### 修改文件

```
public/math.js                            [修改] CJK 正则扩展
tests/main/chinese-variables.test.js      [新增] 30 个测试用例
ANALYSIS.md                                [新增] 改动分析文档
```

---

## 三、构建与打包修复

### 问题 1: Cannot find module 'vue'

- **原因**: `initial-content.js` 直接 `import i18n from 'vue-i18n'`，通过 `file-library.js → initial-content.ts` 被主进程引入，Vite 将 vue-i18n 打包进主进程 bundle，但 vue 是 devDependency 不在 asar 中
- **修复**: `initial-content.js` 改用 `_setI18n()` 延迟注入，主进程走英文硬编码 fallback
- **commit**: `2ffbcd0`

### 问题 2: app.getSystemLocale() can only be called after app is ready

- **原因**: `menu.js` 的 `initMenuIpc()` 在 `index.ts` 模块顶层被调用（app.ready 之前），内部使用了 `app.getSystemLocale()`
- **修复**: 改用 `Intl.DateTimeFormat().resolvedOptions().locale`，无需等待 app.ready
- **commit**: `21173eb`

### CI 配置

- `build.yml`: 仅 Windows x64，条件 `#build` 或 `v` tag 触发
- 跳过代码签名（个人 Fork 无证书）
- Node.js 18 + `johannesjo/action-electron-builder@v1`
- 产物: NSIS 安装包

---

## 四、上游合并注意事项

当需要从 upstream `heyman/heynote` 同步新版本时：

1. **汉化部分**: 重点关注上游是否引入了新的 UI 字符串，需补充到 `zh-CN.json`
2. **initial-content.js**: `_setI18n` 注入模式可能与上游改动冲突，merge 时重点检查
3. **Math 中文变量**: `public/math.js` 是上游文件，merge 时需手动保留 CJK 正则修改（可能产生冲突）
4. **menu-locales.js**: 如果上游改了菜单结构，需同步更新翻译表
5. **vite.config.mjs**: 主进程 `external` 配置依赖 `dependencies` 字段，上游增减 dependencies 时自动适应
