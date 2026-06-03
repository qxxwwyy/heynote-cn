import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'
import { _setI18n } from '@/src/common/initial-content.js'

function getDefaultLocale() {
    // Use system locale if available, otherwise default to English
    const systemLocale = navigator?.language || 'en'
    if (systemLocale.startsWith('zh')) {
        return 'zh-CN'
    }
    return 'en'
}

const i18n = createI18n({
    legacy: false,
    locale: getDefaultLocale(),
    fallbackLocale: 'en',
    messages: {
        'en': en,
        'zh-CN': zhCN,
    },
})

// Make i18n instance available to initial-content without circular vue-i18n import in main process
_setI18n(i18n)

// Update HTML lang attribute when locale changes
function updateHtmlLang(locale) {
    const htmlEl = document.documentElement
    if (htmlEl) {
        htmlEl.setAttribute('lang', locale === 'zh-CN' ? 'zh-CN' : 'en')
    }
}

// Set initial locale
updateHtmlLang(i18n.global.locale.value)

export function setLocale(locale) {
    i18n.global.locale.value = locale
    updateHtmlLang(locale)
}

export default i18n
