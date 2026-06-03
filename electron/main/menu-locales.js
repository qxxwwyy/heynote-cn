// Standalone translations for Electron main process menus.
// This is a simplified version of the i18n locale files, since the main process
// cannot use vue-i18n. The locale is obtained via IPC from the renderer.

const zhCN = {
    menu: {
        undo: "撤销",
        redo: "重做",
        selectAll: "全选",
        deleteBlock: "删除区块",
        moveBlockToAnotherBuffer: "将区块移动到其他缓冲区…",
        switchBuffer: "切换缓冲区…",
        settings: "设置",
        about: "关于",
        edit: "编辑",
        view: "视图",
        window: "窗口",
        speech: "语音",
        documentation: "文档",
        website: "网站",
        openHeynote: "打开 Heynote",
        quit: "退出",
        archive: "归档...",
        editBuffer: "编辑缓冲区…",
        deleteBuffer: "删除缓冲区",
        openBuffer: "打开缓冲区…",
        newBuffer: "新建缓冲区…",
        closeTab: "关闭标签页",
        newFolder: "新建文件夹…",
        deleteFolder: "删除文件夹",
    },
    about: {
        title: "关于 Heynote"
    },
}

const en = {
    menu: {
        undo: "Undo",
        redo: "Redo",
        selectAll: "Select All",
        deleteBlock: "Delete block",
        moveBlockToAnotherBuffer: "Move block to another buffer…",
        switchBuffer: "Switch buffer…",
        settings: "Settings",
        about: "About",
        edit: "Edit",
        view: "View",
        window: "Window",
        speech: "Speech",
        documentation: "Documentation",
        website: "Website",
        openHeynote: "Open Heynote",
        quit: "Quit",
        archive: "Archive...",
        editBuffer: "Edit Buffer…",
        deleteBuffer: "Delete Buffer",
        openBuffer: "Open Buffer…",
        newBuffer: "New Buffer…",
        closeTab: "Close Tab",
        newFolder: "New Folder…",
        deleteFolder: "Delete Folder",
    },
    about: {
        title: "About Heynote"
    },
}

const locales = { "zh-CN": zhCN, "en": en }

let currentLocale = "en"

export function setMenuLocale(locale) {
    if (locales[locale]) {
        currentLocale = locale
    }
}

function t(key) {
    const keys = key.split(".")
    let value = locales[currentLocale]
    for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
            value = value[k]
        } else {
            // fallback to English
            let fallback = locales["en"]
            for (const fk of keys) {
                if (fallback && typeof fallback === "object" && fk in fallback) {
                    fallback = fallback[fk]
                } else {
                    return key // return key path if not found
                }
            }
            return typeof fallback === "string" ? fallback : key
        }
    }
    return typeof value === "string" ? value : key
}

export { t }
