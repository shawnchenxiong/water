/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginParams } from '@/types/user'
import { loginApi, logoutApi, getUserInfoApi } from '@/api/authApi'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')
  const refreshToken = ref<string>(localStorage.getItem('refreshToken') || '')

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const nickname = computed(() => userInfo.value?.nickname || '')
  const roles = computed(() => userInfo.value?.roles || [])
  const permissions = computed(() => userInfo.value?.permissions || [])

  // Actions

  /**
   * 用户登录
   */
  async function login(loginParams: LoginParams) {
    try {
      const response = await loginApi(loginParams)

      // 保存 Token
      token.value = response.token
      refreshToken.value = response.refreshToken
      localStorage.setItem('token', response.token)
      localStorage.setItem('refreshToken', response.refreshToken)

      // 保存用户信息
      userInfo.value = response.userInfo

      // 记住密码
      if (loginParams.rememberMe) {
        localStorage.setItem('rememberedUsername', loginParams.username)
      } else {
        localStorage.removeItem('rememberedUsername')
      }

      ElMessage.success('登录成功')

      // 跳转到首页
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  /**
   * 用户登出
   */
  async function logout() {
    try {
      await logoutApi()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 清除所有本地数据
      token.value = ''
      refreshToken.value = ''
      userInfo.value = null
      
      // 清除所有 localStorage 中的用户相关数据
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('username')
      localStorage.removeItem('rememberedUsername')

      ElMessage.success('退出登录成功')

      // 延迟一下让消息显示出来，然后跳转
      setTimeout(() => {
        // 使用 window.location 进行硬跳转，确保路由守卫能正确读取清除后的 localStorage
        window.location.href = '/#/login'
      }, 500)
    }
  }

  /**
   * 获取用户信息
   */
  async function fetchUserInfo() {
    try {
      const info = await getUserInfoApi()
      userInfo.value = info
    } catch (error) {
      console.error('Failed to get user info:', error)
      throw error
    }
  }

  /**
   * 检查用户权限
   */
  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  /**
   * 检查用户角色
   */
  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  return {
    // State
    userInfo,
    token,
    refreshToken,

    // Getters
    isLoggedIn,
    username,
    nickname,
    roles,
    permissions,

    // Actions
    login,
    logout,
    fetchUserInfo,
    hasPermission,
    hasRole,
  }
})

