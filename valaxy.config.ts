import type { UserThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({

  // site config see site.config.ts

  theme: 'yun',

  themeConfig: {
  bg_image: {
    enable: true,
    url: 'https://shouw.blog/bg.png',
    opacity: 0.8,
  },
    banner: {
      enable: true,
      title: ['shouw', 'の', 'blog'],
    },

    pages: [
      {
        name: '我的小伙伴们',
        url: '/links/',
        icon: 'i-ri-genderless-line',
        color: 'dodgerblue',
      }
    ],

    footer: {
      since: 2025,
      beian: {
        enable: false,
        icp: '苏ICP备17038157号',
      },
    },
  },

  unocss: { safelist },
})
