/**
 * 认证相关 API
 */
import { ElMessageBox } from 'element-plus'
import router from '@/router'
import { request } from '@/utils/request'

// 防止重复弹窗的标志
let isShowingForceLogoutDialog = false

/**
 * 处理强制退出登录（账号在其他地方登录）
 */
const handleForceLogout = async (message: string) => {
  // 防止重复弹窗
  if (isShowingForceLogoutDialog) {
    return
  }

  isShowingForceLogoutDialog = true

  try {
    await ElMessageBox.alert(
      message || '您的账号已在其他客户端登录，当前客户端已退出登录！',
      '提示',
      {
        confirmButtonText: '确认',
        type: 'warning',
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
      }
    )
  } catch (error) {
    // 用户关闭对话框
  } finally {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('rememberedUsername')

    // 跳转到登录页
    router.push('/login')

    // 重置标志
    isShowingForceLogoutDialog = false
  }
}

// MD5 加密函数已移除，jeecg-boot 后端会自动处理密码加密

// 已废弃：使用环境变量统一控制Mock数据
// const USE_MOCK_DATA = true

/**
 * 获取验证码图片
 * @param timestamp 时间戳，用于刷新验证码
 * @returns 验证码图片的 base64 数据
 */
export const getCaptchaImageApi = async (timestamp: number): Promise<string> => {
  const data = await request.get(`/sys/randomImage/${timestamp}`)

  // 根据后端返回的数据结构处理
  if (data.success && data.result) {
    return data.result
  } else {
    throw new Error(data.message || '获取验证码失败')
  }
}

/**
 * 登录接口
 */
export const loginApi = async (params: { 
  username: string
  password: string
  captcha?: string
  checkKey?: number
  rememberMe?: boolean
  forceLogin?: boolean 
}) => {
  // 真实登录逻辑 - 使用 jeecg-boot 接口格式
  const loginParams: any = {
    username: params.username,
    password: params.password, // jeecg-boot 后端会自动处理密码加密
    remember_me: params.rememberMe || false,
  }

  // 添加验证码参数
  if (params.captcha) {
    loginParams.captcha = params.captcha
  }
  if (params.checkKey) {
    loginParams.checkKey = params.checkKey.toString()
  }

  // 如果是强制登录，添加 forceLogin 参数
  if (params.forceLogin) {
    loginParams.forceLogin = '1'
  }

  const data = await request.post(`/sys/login`, loginParams)
  
  // jeecg-boot 返回格式：{ code: '200' | '400' | '412', message: string, result: any }
  // 检查是否是强制退出登录（1401）
  if (data.code === 1401 || data.code === '1401') {
    await handleForceLogout(data.message)
    throw new Error(data.message || '强制退出登录')
  }

  return data
}

/**
 * 登出接口
 */
export const logoutApi = async () => {
  const data = await request.post(`/sys/logout`)

  // 检查是否是强制退出登录（1401）
  if (data.code === 1401) {
    await handleForceLogout(data.message)
    throw new Error(data.message || '强制退出登录')
  }

  return data
}

/**
 * 获取用户信息接口
 */
export const getUserInfoApi = async () => {
  const data = await request.get(`/sys/userinfo`)

  // 检查是否是强制退出登录（1401）
  if (data.code === 1401) {
    await handleForceLogout(data.message)
    throw new Error(data.message || '强制退出登录')
  }

  return data
}

