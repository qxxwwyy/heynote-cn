# Heynote 中文版

> Heynote 的中文本地化 Fork，基于 [Heynote v2.9.0](https://github.com/heyman/heynote)。

## 改动

### 界面中文汉化

完整的简体中文本地化，覆盖所有 UI 元素：

- **应用界面**：设置面板、状态栏、缓冲区选择器、语言选择器、新建/编辑缓冲区对话框、错误提示、左侧面板
- **Electron 菜单**：菜单栏、右键上下文菜单、关于对话框、命令面板
- **内容翻译**：初始欢迎内容、Math 区块描述、"已复制"反馈、日期格式化
- **语言自动检测**：根据系统语言自动切换中文/英文，支持运行时动态切换
- 品牌名 "Heynote"、编程语言名称、代码内容保持原文不翻译

### Math 区块支持中文变量

扩展了 Math.js 的标识符验证，支持 CJK 统一汉字作为变量名：

```
价格 = 29.9
数量 = 3
总价 = 价格 * 数量    // 89.7
```

涵盖 CJK 扩展 A（U+3400-U+4DBF）、CJK 统一汉字（U+4E00-U+9FFF）、CJK 兼容汉字（U+F900-U+FAFF）。

### 仅提供 Windows 构建

本 Fork 仅构建 Windows（x64）安装包，不含 Mac/Linux。CI 使用 GitHub Actions，commit message 含 `#build` 或推送 `v` 标签时触发构建。

---

## General Information

- [Website](https://heynote.com)
- [Documentation](https://heynote.com/docs/)
- [Changelog](https://heynote.com/docs/changelog/)

Heynote is a scratchpad and note-taking app for developers and power users. It functions as a large persistent text buffer where you can write down anything you like. Works great for that Slack message you don't want to accidentally send, a JSON response from an API you're working with, notes from a meeting, your daily to-do list, etc. 

Heynote buffers are divided into blocks, and each block can have its own Language set (e.g. JavaScript, JSON, Markdown, etc.). This gives you syntax highlighting and lets you auto-format that JSON response. Just hit `Ctrl/Cmd + Enter` to create a new block.

Available for Mac, Windows, and Linux.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://heynote.com/img/dark/screenshot3.png">
  <img src="https://heynote.com/img/light/screenshot3.png" width="851" alt="New sidebar buffer tree feature">
</picture>

## Features

-   Persistent text buffers
-   Block-based
-   Inline images
-   Multiple buffers in tabs
-   Search (single and multi buffer)
-   Math/Calculator mode
-   Currency conversion
-   Syntax highlighting:

    C++, C#, Clojure, CSS, Elixir, Erlang, Dart, Go, Groovy, HTML, Java, JavaScript, JSX, Kotlin, TypeScript, TOML, TSX, JSON, Lezer, Markdown, Mermaid, PHP, Python, Ruby, Rust, Scala, Shell, SQL, Swift, Vue, XML, YAML
    
-   Language auto-detection
-   Auto-formatting
-   Multi-cursor editing
-   Dark & Light themes
-   Option to set a global hotkey to show/hide the app
-   Default, Emacs-like or custom key bindings
-   Spellchecking


## Documentation

[Documentation](https://heynote.com/docs/) is available on the Heynote website.

## Development

To develop Heynote you need Node.js and you should (hopefully) just need to check out the code and then run:

```
> npm install
> npm run dev
```

### Run Tests

To run the tests:

```
> npm run test
```

To run the tests in the Playwright UI:

```
> npm run test:ui
```


### Contributions

I'm happy to merge contributions that fit my vision for the app. Bug fixes are always welcome. 


## FAQ

### Where is the buffer data stored?

See the [documentation](https://heynote.com/docs/#user-content-the-notes-library).

### Can you make a mobile app?

No, at the moment this is out of scope, sorry.

### What are the default keyboard shortcuts?

See the [documentation](https://heynote.com/docs/#user-content-default-key-bindings).


## Thanks!

Heynote is built upon [CodeMirror](https://codemirror.net/), [Vue](https://vuejs.org/), [Electron](https://www.electronjs.org/), [Math.js](https://mathjs.org/), [Prettier](https://prettier.io/) and other great open-source projects.

