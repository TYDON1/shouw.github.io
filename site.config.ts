import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://shouw.blog/',
  lang: 'zh-CN',
  title: 'shouwのblog',
  subtitle: '一个用于记录成长历程的blog',
  author: {
    name: 'shouw',
    avatar: 'https://shouw.blog/public/avatar.jpg',
  },
  description: '欢迎来到我的个人blog',
  social: [
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
    {
      name: 'QQ',
      link: 'https://shouw.blog/public/QQ.png',
      icon: 'i-ri-qq-line',
      color: '#12B7F5',
    },
    {
      name: 'GitHub',
      link: 'https://github.com/TYDON1',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: '哔哩哔哩',
      link: 'https://space.bilibili.com/1777771249',
      icon: 'i-ri-bilibili-line',
      color: '#FF8EB3',
    },
    {
      name: 'E-Mail',
      link: 'mailto:kijinseija@shouw.blog',
      icon: 'i-ri-mail-line',
      color: '#8E71C1',
    },
  ],

  search: {
    enable: true,
  },

  sponsor: {
    enable: true,
    title: '如果我的内容对你有帮助的话可以赞助我一杯咖啡',
    methods: [
      {
        name: '支付宝',
        url: 'https://shouw.blog/public/ZFB.jpg',
        color: '#00A3EE',
        icon: 'i-ri-alipay-line',
      },
      {
        name: '微信支付',
        url: 'https://shouw.blog/public/WX.jpg',
        color: '#2DC100',
        icon: 'i-ri-wechat-pay-line',
      },
    ],
  },
})
