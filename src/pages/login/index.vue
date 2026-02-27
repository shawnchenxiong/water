<template>
  <div class="login-container">
    <!-- 中间标题横条 -->
    <div class="title-bar">
      <div class="title-cn">鹤问湖水质净化厂综合管理系统</div>
      <div class="title-en">Hewenhu Water Purification Plant Management System</div>
    </div>

    <!-- 右侧：登录表单 -->
    <div class="login-box">
      <h2 class="login-title">用户登录</h2>
      
      
      <div class="demo-login-wrapper">
        <el-button type="primary" class="login-btn" size="large" @click="handleDemoLogin('engineer')">
          工程师 (Engineer)
        </el-button>
        <el-button type="success" class="login-btn" size="large" style="background-color: #67c23a; margin-top: 20px" @click="handleDemoLogin('user')">
          用 户 (User)
        </el-button>
        <el-button type="info" class="login-btn" size="large" style="background-color: #909399; margin-top: 20px" @click="handleDemoLogin('guest')">
          访 客 (Guest)
        </el-button>
      </div>

    </div>

    <!-- 页脚 -->
    <div class="footer">
      <p class="footer-links">
        <span class="link">隐私政策</span>
        <span class="separator">｜</span>
        <span class="link">服务协议</span>
      </p>
      <p class="footer-tip">
        推荐使用Chrome 79及其以上版本浏览器，最优分辨率1920*1080像素
      </p>
    </div>

    <!-- 租户选择对话框 -->
    <LoginSelectTenant ref="loginSelectRef" @success="handleTenantSelectSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { User, Lock, Warning, Picture, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElIcon } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { loginApi, getCaptchaImageApi } from '@/api'
import LoginSelectTenant from '@/components/common/LoginSelectTenant.vue'
import { useTenantStore } from '@/stores/tenant'
import type { LoginResponse } from '@/types/user'

// Router
const router = useRouter()
const route = useRoute()

// Store
const tenantStore = useTenantStore()

// 响应式数据
const loading = ref(false)
const formRef = ref<FormInstance>()
const requestCodeSuccess = ref(false)
const captchaImage = ref('')
const checkKey = ref<number>(0)
const loginSelectRef = ref<InstanceType<typeof LoginSelectTenant>>()
const currentLoginResponse = ref<LoginResponse | null>(null)

// 登录表单数据
const loginForm = reactive({
  username: localStorage.getItem('rememberedUsername') || '',
  password: '',
  captcha: '',
  rememberMe: !!localStorage.getItem('rememberedUsername'),
})

// 邮箱格式验证
const validateUsernameOrEmail = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入用户名或邮箱'))
    return
  }
  // 邮箱格式验证
  const emailRegex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
  if (emailRegex.test(value)) {
    callback()
  } else {
    // 用户名验证
    if (value.length < 2 || value.length > 50) {
      callback(new Error('用户名长度应为 2-50 个字符'))
    } else {
      callback()
    }
  }
}

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { validator: validateUsernameOrEmail, trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度应为 6-32 个字符', trigger: 'blur' },
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
}

/**
 * 刷新验证码
 */
const handleChangeCheckCode = async () => {
  try {
    checkKey.value = new Date().getTime()
    loginForm.captcha = ''
    const imageData = await getCaptchaImageApi(checkKey.value)
    captchaImage.value = imageData
    requestCodeSuccess.value = true
  } catch (error: any) {
    console.error('获取验证码失败:', error)
    ElMessage.error(error.message || '获取验证码失败')
    requestCodeSuccess.value = false
    captchaImage.value = ''
  }
}

/**
 * 处理登录成功后的逻辑（保存token和用户信息）
 */

const handleDemoLogin = (role: string) => {
  const roleMap: Record<string, { username: string, realname: string, tenantName: string }> = {
    engineer: { username: 'admin', realname: '工程师', tenantName: '高级权限' },
    user: { username: 'user', realname: '用户', tenantName: '标准权限' },
    guest: { username: 'guest', realname: '访客', tenantName: '只读权限' }
  }
  
  const mockUserInfo = roleMap[role];
  
  localStorage.setItem('token', 'demo-token-' + role)
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('userInfo', JSON.stringify(mockUserInfo))
  localStorage.setItem('username', mockUserInfo.username)
  
  tenantStore.saveTenant(role === 'engineer' ? 1 : role === 'user' ? 2 : 3, mockUserInfo.tenantName)
  
  ElMessage.success('欢迎体验：' + mockUserInfo.realname)
  
  const redirectPath = (route.query.redirect as string) || '/pv/dashboard'
  setTimeout(() => {
    router.push(redirectPath)
  }, 300)
}
</script>


<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background: url('/images/login-bg.png') no-repeat center center;
  background-size: 100% 100%;
  position: relative;
  overflow: hidden;
}

/* 中间标题横条 */
.title-bar {
  position: absolute;
  top: 316px;
  left: 0;
  width: 100%;
  height: 263px;
  background: rgba(37, 157, 241, 0.5);
  z-index: 1;
}

.title-cn {
  position: absolute;
  top: 0;
  left: 190px;
  font-size: 57px;
  font-weight: 400;
  color: #ffffff;
  line-height: 1.2;
  white-space: nowrap;
}

.title-en {
  position: absolute;
  top: 105px;
  left: 189px;
  font-size: 27px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
  line-height: 1.5;
  white-space: nowrap;
}

/* 登录框 */
.login-box {
  position: absolute;
  top: 200px;
  right: 50px;
  width: 561px;
  height: 562px;
  background: url('/images/login-user.png') no-repeat center center;
  background-size: 100% 100%;
  padding: 80px 76px;
  z-index: 2;
}

.login-title {
  text-align: center;
  font-size: 28px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 50px 0;
}

.login-form {
  width: 100%;
}

/* Element Plus 样式覆盖 */
:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: none;
  border-radius: 0;
  transition: all 0.3s;
  padding: 8px 0;
}

:deep(.el-input__wrapper:hover) {
  border-bottom-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.12);
}

:deep(.el-input__wrapper.is-focus) {
  border-bottom-color: #00d4ff;
  background: rgba(255, 255, 255, 0.12);
}

:deep(.el-input__inner) {
  color: #ffffff;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4);
}

:deep(.el-input__prefix) {
  color: rgba(255, 255, 255, 0.6);
}

:deep(.el-icon) {
  font-size: 18px;
}

/* 验证码容器 */
.captcha-container {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.captcha-input {
  flex: 1;
  min-width: 0; /* 防止 flex 子元素溢出 */
  max-width: calc(100% - 130px); /* 固定最大宽度，减去验证码图片宽度和间距 */
}

.captcha-input :deep(.el-input__wrapper) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.captcha-input :deep(.el-input__inner) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.captcha-image-wrapper {
  width: 120px;
  height: 40px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0; /* 防止被压缩 */
}

.captcha-image-wrapper:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.captcha-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
}

.captcha-placeholder .el-icon {
  font-size: 20px;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 50px;
  background: #259df1;
  border: none;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 2px;
  transition: all 0.3s;
  margin-top: 10px;
}

.login-btn:hover {
  background: #1a8dd9;
  box-shadow: 0 6px 16px rgba(37, 157, 241, 0.4);
}

.login-btn:active {
  transform: translateY(1px);
}

/* 记住密码 */
.remember-item {
  margin-bottom: 0;
  margin-top: 10px;
}

:deep(.remember-item .el-form-item__content) {
  justify-content: center;
}

:deep(.el-checkbox__label) {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

:deep(.el-checkbox__inner) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #259df1;
  border-color: #259df1;
}

/* 页脚 */
.footer {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 1;
}

.footer-links {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.link {
  cursor: pointer;
  transition: color 0.3s;
}

.link:hover {
  color: #00d4ff;
}

.separator {
  margin: 0 10px;
}

.footer-tip {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .title-bar {
    padding-left: 60px;
  }
  
  .title-cn {
    font-size: 48px;
  }
  
  .title-en {
    font-size: 24px;
  }
  
  .login-box {
    right: 60px;
  }
}

@media (max-width: 1024px) {
  .title-bar {
    position: static;
    transform: none;
    height: auto;
    padding: 60px 30px;
    text-align: center;
  }
  
  .title-cn {
    font-size: 36px;
  }
  
  .title-en {
    font-size: 18px;
  }
  
  .login-box {
    position: static;
    transform: none;
    margin: 40px auto;
    right: auto;
  }
}

@media (max-width: 768px) {
  .top-toolbar {
    top: 20px;
    right: 20px;
    gap: 15px;
  }
  
  .trial-button {
    display: none;
  }
  
  .title-cn {
    font-size: 28px;
  }
  
  .title-en {
    font-size: 16px;
  }
  
  .login-box {
    width: 90%;
    max-width: 400px;
    height: auto;
    padding: 50px 40px;
    background-size: contain;
  }
  
  .login-title {
    font-size: 24px;
    margin-bottom: 30px;
  }
}
</style>
