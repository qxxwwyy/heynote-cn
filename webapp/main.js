import '../src/css/application.sass'
import '../assets/font/open-sans/open-sans.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';

import App from '../src/components/App.vue'
import { loadCurrencies } from '../src/currency'
import { initHeynoteStore } from '../src/stores/heynote-store'
import i18n from '../src/i18n/index.js'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(PrimeVue)
app.use(i18n)
app.mount('#app')
//console.log("test:", app.hej.test)

initHeynoteStore()

// load math.js currencies
loadCurrencies()
setInterval(loadCurrencies, 1000 * 3600 * 4)
