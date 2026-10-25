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
    banner: {
      enable: true,
      title: ['shouw', 'の', 'blog'],
    },

    pages: [
      {
        name: '友情链接',
        url: '/links/',
        icon: 'i-ri-genderless-line',
        color: 'dodgerblue',
      }
    ],

    footer: {
      since: 2077,
      beian: {
        enable: true,
        icp: '下北泽ICP备114514号',
      },
    },
  },

  unocss: { safelist },
})
