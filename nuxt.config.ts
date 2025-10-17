export default defineNuxtConfig({
  // IMPORTANT: Disable SSR because map libraries rely on browser-specific APIs like `window`.
  ssr: false,

  // Add global CSS
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: '炒鸡Map - Nuxt Edition',
      htmlAttrs: {
        lang: 'zh-CN',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      script: [
        // AMap Security Config (must be loaded before the main map script)
        {
          innerHTML: `
            window._AMapSecurityConfig = {
              securityJsCode: '4bd78013b9b1e6d56bb8868748a7ed77',
            }
          `,
          type: 'text/javascript',
        },
        // AMap JS API with AutoComplete, PlaceSearch, and DistrictSearch plugins
        {
          src: `https://webapi.amap.com/maps?v=2.0&key=ce5fe3ad94d38363f962a5a02a3c8654&plugin=AMap.AutoComplete,AMap.PlaceSearch,AMap.DistrictSearch`,
          defer: true, 
        },
        // XLSX for Excel import/export
        {
          src: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
        },
        // html2canvas for image export
        {
          src: 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
        },
      ],
    },
  },

  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/supabase',
  ],

  supabase: {
    url: process.env.SUPABASE_URL, // 从环境变量中获取 Supabase URL
    key: process.env.SUPABASE_KEY, // 从环境变量中获取 Supabase anon public key
    redirectOptions: {
      login: '/login', // 未认证用户将被重定向到此页面
      callback: '/confirm', // Supabase 认证回调页面
      exclude: ['/register', '/share/**'], // 不需要认证即可访问的页面
    },
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 7, // 7天
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', // 生产环境下使用 secure cookie
    },
    clientOptions: {
      auth: {
        flowType: 'pkce', // 推荐的认证流程类型
      },
    },
  },
  compatibilityDate: '2025-09-25',
})