import {API_URL} from './addresses'
import colors from './colors'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 4,
  },
  devtools: {
    enabled: true
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'nuxt3-notifications'
  ],
  app: {
    head: {
      link: [{
        rel: 'stylesheet',
        href: 'https://unpkg.com/boxicons@latest/css/boxicons.min.css'
      }, {
        rel: 'stylesheet',
        href: 'https://cdn.hugeicons.com/font/hgi-stroke-rounded.css'
      }]
    }
  },
  i18n: {
    defaultLocale: 'en',
    locales: [{
      code: 'en',
      name: 'English',
      file: 'en.json'
    }, {
      code: 'ru',
      name: 'Русский',
      file: 'ru.json'
    }]
  },
  css: [
    '~/assets/css/main.css'
  ],
  tailwindcss: {
    viewer: false,
    config: {
      theme: {
        extend: {
          colors
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      API_VERSION: "v1",
      API_URL: `${API_URL}/api`
    }
  }
})
