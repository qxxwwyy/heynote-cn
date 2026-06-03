const { app, Menu } = require("electron")
import { OPEN_SETTINGS_EVENT, UNDO_EVENT, REDO_EVENT, MOVE_BLOCK_EVENT, DELETE_BLOCK_EVENT, CHANGE_BUFFER_EVENT, SELECT_ALL_EVENT, SCRATCH_FILE_NAME } from '@/src/common/constants'
import { openAboutWindow } from "./about";
import { quit } from "./index"

import { getLanguageName } from "@/src/common/language-code/language-code"
import { t, setMenuLocale } from "./menu-locales"

const isMac = process.platform === "darwin"

function getParentDirectory(path) {
    const separatorIndex = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"))
    if (separatorIndex === -1) {
        return ""
    }
    return path.slice(0, separatorIndex)
}


// Listen for locale changes from the renderer process
// The renderer sends 'menu:setLocale' when the i18n locale changes
export function initMenuIpc(win) {
    // Set initial locale from system
    const sysLocale = app.getSystemLocale()
    if (sysLocale && sysLocale.startsWith("zh")) {
        setMenuLocale("zh-CN")
    }
    // Rebuild menu when locale changes
    rebuildMenu()
}

let currentMenu = null

function buildMenuTemplate() {
    const undoMenuItem = {
        label: t('menu.undo'),
        accelerator: 'CommandOrControl+z',
        click: (menuItem, window, event) => {
            window?.webContents.send(UNDO_EVENT)
        },
    }

    const redoMenuItem = {
        label: t('menu.redo'),
        accelerator: 'CommandOrControl+Shift+z',
        click: (menuItem, window, event) => {
            window?.webContents.send(REDO_EVENT)
        },
    }

    const selectAllMenuItem = {
        label: t('menu.selectAll'),
        accelerator: 'CommandOrControl+a',
        click: (menuItem, window, event) => {
            window?.webContents.send(SELECT_ALL_EVENT)
        },
    }

    const deleteBlockMenuItem = {
        label: t('menu.deleteBlock'),
        accelerator: 'CommandOrControl+Shift+D',
        click: (menuItem, window, event) => {
            window?.webContents.send(DELETE_BLOCK_EVENT)
        },
    }

    const moveBlockMenuItem = {
        label: t('menu.moveBlockToAnotherBuffer'),
        accelerator: 'CommandOrControl+S',
        click: (menuItem, window, event) => {
            window?.webContents.send(MOVE_BLOCK_EVENT)
        },
    }

    const changeBufferMenuItem = {
        label: t('menu.switchBuffer'),
        accelerator: 'CommandOrControl+P',
        click: (menuItem, window, event) => {
            window?.webContents.send(CHANGE_BUFFER_EVENT)
        },
    }

    const template = [
        ...(isMac ? [{
            label: app.name,
            submenu: [
                {
                    label: t('menu.about'), 
                    click: (menuItem, window, event) => {
                        openAboutWindow()
                    },
                },
                { type: 'separator' },
                changeBufferMenuItem,
                {
                    label: t('menu.settings'),
                    click: (menuItem, window, event) => {
                        window?.webContents.send(OPEN_SETTINGS_EVENT)
                    },
                    accelerator: isMac ? 'Command+,': null,
                },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : [{
            role: 'fileMenu',
            submenu: [
                changeBufferMenuItem,
                {
                    label: t('menu.settings'),
                    click: (menuItem, window, event) => {
                        window?.webContents.send(OPEN_SETTINGS_EVENT)
                    },
                },
                {
                    label: t('menu.about'), 
                    click: (menuItem, window, event) => {
                        openAboutWindow()
                    },
                },
            ],
        }]),
        {
            label: t('menu.edit'),
            submenu: [
                undoMenuItem,
                redoMenuItem,
                { type: 'separator' },
                deleteBlockMenuItem,
                moveBlockMenuItem,
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    selectAllMenuItem,
                    { type: 'separator' },
                    {
                        label: t('menu.speech'),
                        submenu: [
                            { role: 'startSpeaking' },
                            { role: 'stopSpeaking' }
                        ]
                    }
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    selectAllMenuItem,
                ])
            ]
        },
        {
            label: t('menu.view'),
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                {
                    accelerator: 'CommandOrControl+=',
                    role: "zoomIn",
                    visible: false
                },
                {
                    accelerator: 'CmdOrCtrl+Plus',
                    role: "zoomIn",
                    visible: true
                },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: t('menu.window'),
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ] : [
                    { role: 'close' }
                ])
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: t('menu.documentation'),
                    click: async () => {
                        const { shell } = require('electron')
                        await shell.openExternal('https://heynote.com/docs/')
                    }
                },
                {
                    label: t('menu.website'),
                    click: async () => {
                        const { shell } = require('electron')
                        await shell.openExternal('https://heynote.com')
                    }
                }
            ]
        }
    ]

    return { template, undoMenuItem, redoMenuItem, selectAllMenuItem, deleteBlockMenuItem, moveBlockMenuItem, changeBufferMenuItem }
}

export function rebuildMenu() {
    const { template } = buildMenuTemplate()
    currentMenu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(currentMenu)
}

export const menu = (() => {
    const { template } = buildMenuTemplate()
    return Menu.buildFromTemplate(template)
})()

// Store menu item builders for context menus (they need fresh translations on rebuild)
function buildContextMenus() {
    const { undoMenuItem, redoMenuItem, selectAllMenuItem, deleteBlockMenuItem, moveBlockMenuItem } = buildMenuTemplate()
    return { undoMenuItem, redoMenuItem, selectAllMenuItem, deleteBlockMenuItem, moveBlockMenuItem }
}

export function getTrayMenu(win, showWindow) {
    const { template } = buildMenuTemplate()
    return Menu.buildFromTemplate([
        {
            label: t('menu.openHeynote'),
            click: () => {
                showWindow()
            },
        },
        { type: 'separator' },
        ...template,
        { type: 'separator' },
        {
            label: t('menu.quit'),
            click: () => {
                quit()
            },
        },
    ])
}

export function getEditorContextMenu(win) {
    const { undoMenuItem, redoMenuItem, selectAllMenuItem, deleteBlockMenuItem, moveBlockMenuItem } = buildContextMenus()
    return Menu.buildFromTemplate([
        undoMenuItem,
        redoMenuItem,
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {type: 'separator'},
        selectAllMenuItem,
        {type: 'separator'},
        deleteBlockMenuItem,
        moveBlockMenuItem,
    ])
}

export function getTabContextMenu(win, tabPath) {
    const isScratchFile = tabPath === SCRATCH_FILE_NAME
    
    const menuItems = []
    
    if (isScratchFile) {
        menuItems.push({
            label: t('menu.archive'),
            click: () => {
                win?.webContents.send('tab:archiveScratch')
            },
        })
    } else {
        menuItems.push(
            {
                label: t('menu.editBuffer'),
                click: () => {
                    win?.webContents.send('tab:editBuffer', tabPath)
                },
            },
            {
                label: t('menu.deleteBuffer'),
                click: () => {
                    win?.webContents.send('tab:deleteBuffer', tabPath)
                },
            }
        )
    }

    menuItems.push(
        {
            label: t('menu.openBuffer'),
            click: () => {
                win?.webContents.send('tab:openNew')
            },
        },
        {
            label: t('menu.newBuffer'),
            click: () => {
                win?.webContents.send('tab:openNew', getParentDirectory(tabPath))
            },
        },
        {type: 'separator'},
        {
            label: t('menu.closeTab'),
            click: () => {
                win?.webContents.send('tab:close', tabPath)
            },
        },
    )
    
    return Menu.buildFromTemplate(menuItems)
}

export function getBufferTreeContextMenu(win, bufferPath) {
    const isScratchFile = bufferPath === SCRATCH_FILE_NAME
    const parentDirectory = getParentDirectory(bufferPath)
    const menuItems = []

    if (isScratchFile) {
        menuItems.push({
            label: t('menu.archive'),
            click: () => {
                win?.webContents.send('tab:archiveScratch')
            },
        })
    } else {
        menuItems.push(
            {
                label: t('menu.editBuffer'),
                click: () => {
                    win?.webContents.send('tab:editBuffer', bufferPath)
                },
            },
            {
                label: t('menu.deleteBuffer'),
                click: () => {
                    win?.webContents.send('tab:deleteBuffer', bufferPath)
                },
            }
        )
    }

    menuItems.push(
        { type: 'separator' },
        {
            label: t('menu.newBuffer'),
            click: () => {
                win?.webContents.send('tab:openNew', parentDirectory)
            },
        },
        {
            label: t('menu.newFolder'),
            click: () => {
                win?.webContents.send('bufferTree:createFolder', parentDirectory)
            },
        }
    )

    return Menu.buildFromTemplate(menuItems)
}

export function getBufferTreeDirectoryContextMenu(win, directoryPath, isEmptyDirectory) {
    return Menu.buildFromTemplate([
        {
            label: t('menu.newBuffer'),
            click: () => {
                win?.webContents.send('tab:openNew', directoryPath || "")
            },
        },
        {
            label: t('menu.newFolder'),
            click: () => {
                win?.webContents.send('bufferTree:createFolder', directoryPath || "")
            },
        },
        {
            label: t('menu.deleteFolder'),
            enabled: isEmptyDirectory,
            click: () => {
                win?.webContents.send('bufferTree:deleteDirectory', directoryPath)
            },
        },
    ])
}

export function getBufferTreeBackgroundContextMenu(win) {
    return Menu.buildFromTemplate([
        {
            label: t('menu.newBuffer'),
            click: () => {
                win?.webContents.send("tab:openNew", "")
            },
        },
        {
            label: t('menu.newFolder'),
            click: () => {
                win?.webContents.send("bufferTree:createFolder", "")
            },
        },
    ])
}


export function getSpellcheckingContextMenu(win) {
    const languages = win.webContents.session.availableSpellCheckerLanguages
    const selectedLanguages = win.webContents.session.getSpellCheckerLanguages()

    const menuItems = []
    for (const lang of languages) {
        menuItems.push({
            label: getLanguageName(lang),
            type: 'checkbox',
            checked: selectedLanguages.includes(lang),
            click: () => {
                if (selectedLanguages.includes(lang)) {
                    win.webContents.session.setSpellCheckerLanguages(selectedLanguages.filter(l => l !== lang))
                } else {
                    win.webContents.session.setSpellCheckerLanguages([...selectedLanguages, lang])
                }
            },
        })
    }

    return Menu.buildFromTemplate(menuItems)
}
