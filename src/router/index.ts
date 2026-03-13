import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { pvRouter } from './pv-router'
import { esRouter } from './es-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/pv/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue'),
    meta: {
      title: '用户登录',
      requiresAuth: false,
    },
  },
  pvRouter,
  esRouter,
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/pages/404.vue'),
    meta: {
      title: '页面未找到',
      requiresAuth: false,
    },
  },
  {
    path: '/scada/editor',
    name: 'ScadaEditor',
    component: () => import('@/pages/scada/editor/index.vue'),
    meta: {
      title: 'Scada编辑器',
      requiresAuth: false,
    },
  },
  {
    path: '/scada/preview',
    name: 'ScadaPreview',
    component: () => import('@/pages/scada/preview/index.vue'),
    meta: {
      title: 'Scada预览器',
      requiresAuth: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '鹤问湖水质净化厂'} - 鹤问湖水质净化厂`

  // 权限验证（使用 localStorage 的登录标记或 token）
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || !!localStorage.getItem('token')
  // requiresAuth 默认为 true，只有明确设置为 false 时才不需要登录
  const requiresAuth = to.meta.requiresAuth !== false

  // 白名单：不需要登录的页面
  const whiteList = ['/login', '/404', '/scada/editor', '/scada/preview']

  if (whiteList.includes(to.path)) {
    // 白名单页面，直接通过
    if (to.path === '/login' && isLoggedIn) {
      // 已登录用户访问登录页，跳转到首页
      const redirect = (_from.query?.redirect as string) || '/pv/dashboard'
      next(redirect)
    } else {
      next()
    }
  } else if (requiresAuth && !isLoggedIn) {
    // 需要登录但未登录，跳转到登录页，并保存原始路径用于登录后跳转
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

// 处理路由懒加载错误
router.onError((error) => {
  console.error('Router error:', error)
  // 如果是动态导入模块失败，尝试刷新页面
  if (error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('error loading dynamically imported module')) {
    window.location.reload()
  }
})

export default router