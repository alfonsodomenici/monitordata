import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Lara from '@primevue/themes/lara'
import App from './App.vue'
import 'primeicons/primeicons.css'
import './style.css'

const app = createApp(App)

app.use(PrimeVue, {
	theme: {
		preset: Lara,
		options: {
			darkModeSelector: false,
		},
	},
})

app.mount('#app')
