# Heynote 中文版 (heynote-cn) 工作索引

> 基于 [Heynote v2.9.0](https://github.com/heyman/heynote)，Fork 仓库：`qxxwwyy/heynote-cn`

## 项目状态
- **当前版本**: v2.9.0（基于上游 tag）
- **分支**: main（单分支，无 feature 分支）
- **构建平台**: 仅 Windows x64（GitHub Actions CI）
- **构建触发**: commit message 含 `#build` 或推送 `v` tag

## 变更记录

### update.md — 本次改动总结（汉化 + Math 优化 + 打包修复）

## 关键文件索引

### 汉化相关
| 文件 | 用途 |
|------|------|
| `src/i18n/index.js` | i18n 框架入口，vue-i18n 初始化 + locale 自动检测 |
| `src/i18n/locales/zh-CN.json` | 简体中文翻译（282 条） |
| `src/i18n/locales/en.json` | 英文翻译（282 条） |
| `electron/main/menu-locales.js` | 主进程菜单独立翻译（不用 vue-i18n） |
| `electron/main/menu.js` | 菜单构建，调用 menu-locales 的 t() 函数 |
| `src/common/format-date.js` | 日期格式化（"昨天"等） |
| `src/common/initial-content.js` | 初始欢迎内容（支持运行时 i18n 注入） |

### Math 中文变量支持
| 文件 | 用途 |
|------|------|
| `public/math.js` | Math.js 核心文件，CJK 正则在此修改 |
| `tests/main/chinese-variables.test.js` | 中文变量测试用例（30 个） |

### 构建/CI
| 文件 | 用途 |
|------|------|
| `.github/workflows/build.yml` | Windows 构建工作流（#build 或 v tag 触发） |
| `electron-builder.json5` | electron-builder 配置（files、asar、win/nsis） |
| `vite.config.mjs` | Vite 构建配置，含主进程 external 配置 |

## 技术决策与经验教训

### Electron 主进程不能直接使用 vue-i18n
- **问题**: `vue-i18n` 依赖 `vue`（devDependency），被打包进主进程 bundle 后运行时找不到 vue 模块
- **注入链**: `index.ts → file-library.js → initial-content.ts → initial-content.js → import vue-i18n`
- **解决**: `initial-content.js` 改用 `_setI18n()` 延迟注入模式，主进程走英文 fallback，renderer 通过 `i18n/index.js` 注入实例
- **教训**: Electron 主进程和 renderer 共享代码时要警惕依赖泄漏，devDependencies 不会被打包进 asar

### app.getSystemLocale() 要求 app.ready
- **问题**: `initMenuIpc()` 在模块顶层（app.ready 之前）调用了 `app.getSystemLocale()`
- **解决**: 改用 `Intl.DateTimeFormat().resolvedOptions().locale`，无需 app.ready
- **教训**: Electron API 调用要注意生命周期，模块顶层代码 ≈ app 启动最早阶段

### 主进程菜单翻译需独立实现
- **原因**: 主进程无法使用 vue-i18n（没有 vue runtime）
- **方案**: `menu-locales.js` 手写翻译映射表，通过 IPC `menu:setLocale` 接收 renderer 的 locale 变更

### upstream merge 策略
- 官方计划支持多语言后，汉化相关代码（i18n 框架、locale 文件、menu-locales）可整体替换为 upstream 方案
- Math 中文变量支持是独立改动，不受 upstream 多语言计划影响，需长期保留
- merge 时注意 `initial-content.js` 的 `_setI18n` 注入模式是否与 upstream 冲突
