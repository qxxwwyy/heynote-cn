import { keyHelpStr } from "../../shared-utils/key-helper.ts"

// English fallback translations for use in Electron main process (no vue-i18n runtime)
const fallbackT = (key) => ({
    'initialContent.welcome': 'Welcome to Heynote! 👋',
    'initialContent.readDocs': 'Read full documentation at https://heynote.com/docs',
    'initialContent.mathBlockDescription': 'This is a Math block. Here, rows are evaluated as math expressions.',
    'initialContent.unitConversion': 'It also supports some basic unit conversions, including currencies:',
    'initialContent.markdownCheckboxes': 'In Markdown blocks, lists with [x] and [ ] are rendered as checkboxes:',
    'initialContent.downloadHeynote': '- [x] Download Heynote',
    'initialContent.tryOutHeynote': '- [ ] Try out Heynote',
}[key] || key)

// Lazy-loaded i18n reference (renderer process only). Using a mutable let so the
// i18n module can set it after initialization without creating a circular dependency
// or pulling vue-i18n into the Electron main process bundle.
let _i18n = null
export function _setI18n(i18nInstance) { _i18n = i18nInstance }

export function getPlatformIdFromHeynotePlatform(platform) {
    if (platform?.isWindows) {
        return "win32"
    }
    if (platform?.isLinux) {
        return "linux"
    }
    return "darwin"
}

export function getInitialContent(platform, includeDevContent = false, tFn) {
    const created = (new Date()).toISOString()
    const t = tFn || (_i18n ? _i18n.global.t.bind(_i18n.global) : fallbackT)

    const initialContent = `
{"formatVersion":"2.0.0","name":"Scratch"}
∞∞∞text;created=${created}
${t('initialContent.welcome')}

${keyHelpStr(platform)}
∞∞∞markdown;created=${created}
${t('initialContent.readDocs')}
∞∞∞math;created=${created}
${t('initialContent.mathBlockDescription')}

radius = 5
area = radius^2 * PI
sqrt(9)

${t('initialContent.unitConversion')}

13 inches in cm
time = 3900 seconds to minutes
time * 2

1 EUR in USD
∞∞∞markdown;created=${created}
${t('initialContent.markdownCheckboxes')}

${t('initialContent.downloadHeynote')}
${t('initialContent.tryOutHeynote')}
∞∞∞text-a;created=${created}
`

    if (!includeDevContent) {
        return initialContent
    }

    return initialContent + `
∞∞∞python-a;created=2022-12-15T11:57:40.988Z
# hmm
def my_func():
  print("hejsan")

∞∞∞javascript-a;created=2025-12-15T11:57:40.988Z
import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {javascript} from "@codemirror/lang-javascript"
import {indentWithTab, insertTab, indentLess, indentMore} from "@codemirror/commands"
import {nord} from "./nord.mjs"

let editor = new EditorView({
  //extensions: [basicSetup, javascript()],
  extensions: [
    basicSetup, 
    javascript(), 
    //keymap.of([indentWithTab]),
    keymap.of([
      {
          key: 'Tab',
          preventDefault: true,
          //run: insertTab,
          run: indentMore,
      },
      {
          key: 'Shift-Tab',
          preventDefault: true,
          run: indentLess,
      },
    ]),
    nord,
  ],
  parent: document.getElementById("editor"),
})
∞∞∞json
{
    "name": "heynote-codemirror",
    "type": "module",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "test": "echo \\"Error: no test specified\\" && exit 1",
        "build": "rollup -c"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "dependencies": {
        "@codemirror/commands": "^6.1.2",
        "@codemirror/lang-javascript": "^6.1.2",
        "@codemirror/lang-json": "^6.0.1",
        "@codemirror/lang-python": "^6.1.1",
        "@rollup/plugin-node-resolve": "^15.0.1",
        "codemirror": "^6.0.1",
        "i": "^0.3.7",
        "npm": "^9.2.0",
        "rollup": "^3.8.1",
        "rollup-plugin-typescript2": "^0.34.1",
        "typescript": "^4.9.4"
    }
}
∞∞∞html
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        <h1>Test</h1>
        <script>
            console.log("hej")
        </script>
    </body>
</html>
∞∞∞sql;created=${created}
SELECT * FROM table WHERE id = 1;
∞∞∞text;created=${created}
Shopping list:

- Milk
- Eggs
- Bread
- Cheese`
}
