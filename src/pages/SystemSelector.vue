<template>
  <div class="system-selector">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-1"></div>
      <div class="decoration-2"></div>
      <div class="decoration-3"></div>
    </div>
    
    <!-- 用户信息区域 -->
    <div class="user-info-bar">
      <div class="user-info-content">
        <div class="user-info">
          <span class="user-label">用户：</span>
          <span class="user-name">{{ displayUsername }}</span>
        </div>
        <div class="tenant-info">
          <span class="tenant-label">权限：</span>
          <span class="tenant-name">{{ tenantName || '未设置' }}</span>
        </div>
        <el-button 
          type="danger" 
          size="small" 
          @click="handleLogout"
          :icon="SwitchButton"
          plain
        >
          退出登录
        </el-button>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="content-wrapper">
      <!-- 标题区域 -->
      <div class="title-section">
        <h1 class="main-title">鹤问湖水质净化厂</h1>
        <p class="sub-title">智慧运维管理系统</p>
      </div>
      
      <!-- 系统选择区域 -->
      <div class="system-cards">
        <!-- 光伏系统卡片 -->
        <div class="system-card pv-system" @click="selectSystem('pv')">
          <div class="card-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 太阳能板图标 -->
              <rect x="20" y="25" width="40" height="30" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
              <line x1="25" y1="30" x2="55" y2="30" stroke="currentColor" stroke-width="1"/>
              <line x1="25" y1="35" x2="55" y2="35" stroke="currentColor" stroke-width="1"/>
              <line x1="25" y1="40" x2="55" y2="40" stroke="currentColor" stroke-width="1"/>
              <line x1="25" y1="45" x2="55" y2="45" stroke="currentColor" stroke-width="1"/>
              <line x1="25" y1="50" x2="55" y2="50" stroke="currentColor" stroke-width="1"/>
              <!-- 太阳 -->
              <circle cx="65" cy="15" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
              <line x1="65" y1="3" x2="65" y2="7" stroke="currentColor" stroke-width="2"/>
              <line x1="77" y1="15" x2="73" y2="15" stroke="currentColor" stroke-width="2"/>
              <line x1="65" y1="27" x2="65" y2="23" stroke="currentColor" stroke-width="2"/>
              <line x1="53" y1="15" x2="57" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h2 class="card-title">鹤问湖一期工厂</h2>
          <p class="card-description">一期水质净化工程综合管理系统</p>
          <div class="card-features">
            <span class="feature-tag">工艺监控</span>
            <span class="feature-tag">告警分析</span>
            <span class="feature-tag">报表查询</span>
          </div>
        </div>
        
        <!-- 储能系统卡片 -->
        <div class="system-card es-system" @click="selectSystem('es')">
          <div class="card-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 电池图标 -->
              <rect x="25" y="20" width="30" height="40" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>
              <rect x="35" y="15" width="10" height="5" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
              <!-- 电量指示 -->
              <rect x="30" y="25" width="20" height="6" rx="1" fill="currentColor"/>
              <rect x="30" y="35" width="20" height="6" rx="1" fill="currentColor"/>
              <rect x="30" y="45" width="15" height="6" rx="1" fill="currentColor" opacity="0.7"/>
              <rect x="30" y="55" width="10" height="6" rx="1" fill="currentColor" opacity="0.4"/>
              <!-- 闪电符号 -->
              <path d="M60 35 L68 35 L62 45 L70 45 L60 55 L55 45 L60 40 Z" fill="currentColor"/>
            </svg>
          </div>
          <h2 class="card-title">鹤问湖二期工厂</h2>
          <p class="card-description">二期水质净化工程综合管理系统</p>
          <div class="card-features">
            <span class="feature-tag">工艺监控</span>
            <span class="feature-tag">告警分析</span>
            <span class="feature-tag">智能运维</span>
          </div>
        </div>
      </div>
      
      <!-- 底部信息 -->
      <div class="footer-info">
        <p class="copyright">© 2025 鹤问湖水质净化厂. All rights reserved.</p>
        <p class="version">Version 1.0.0</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSystemStore } from '@/stores/system'
import { useUserStore } from '@/stores/user'
import { useTenantStore } from '@/stores/tenant'
import { ElMessageBox } from 'element-plus'
import { SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const systemStore = useSystemStore()
const userStore = useUserStore()
const tenantStore = useTenantStore()

// 显示用户名（优先显示昵称，没有则显示用户名）
const displayUsername = computed(() => {
  if (userStore.nickname) {
    return userStore.nickname
  }
  if (userStore.username) {
    return userStore.username
  }
  // 从 localStorage 读取
  const savedUserInfo = localStorage.getItem('userInfo')
  if (savedUserInfo) {
    try {
      const userInfo = JSON.parse(savedUserInfo)
      return userInfo.nickname || userInfo.username || '未知用户'
    } catch (e) {
      return localStorage.getItem('username') || '未知用户'
    }
  }
  return localStorage.getItem('username') || '未知用户'
})

// 租户名称
const tenantName = computed(() => {
  return tenantStore.currentTenantName || localStorage.getItem('tenant_name') || ''
})

/**
 * 处理退出登录
 */
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 调用退出登录
    await userStore.logout()
  } catch (error) {
    // 用户取消操作
    if (error !== 'cancel') {
      console.error('Logout error:', error)
    }
  }
}

/**
 * 初始化用户信息
 */
onMounted(async () => {
  // 如果用户信息不存在，尝试从 localStorage 恢复
  if (!userStore.userInfo) {
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      try {
        const userInfo = JSON.parse(savedUserInfo)
        userStore.userInfo = userInfo
      } catch (e) {
        console.error('Failed to parse userInfo from localStorage:', e)
      }
    }
  }
})

/**
 * 选择系统
 */
const selectSystem = (systemType: 'pv' | 'es') => {
  // 设置当前系统类型
  systemStore.setCurrentSystem(systemType)
  
  // 跳转到对应系统
  router.push(`/${systemType}`)
}
</script>

<style scoped lang="scss">
.system-selector {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a1628 0%, #1e3a8a 50%, #0f172a 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    overflow-y: auto;
    overflow-x: hidden;
    align-items: flex-start;
  }
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;

  .decoration-1,
  .decoration-2,
  .decoration-3 {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(45deg, rgba(0, 212, 255, 0.1), rgba(59, 130, 246, 0.1));
    animation: float 6s ease-in-out infinite;
  }

  .decoration-1 {
    width: 300px;
    height: 300px;
    top: 10%;
    right: 10%;
    animation-delay: 0s;
  }

  .decoration-2 {
    width: 200px;
    height: 200px;
    bottom: 20%;
    left: 5%;
    animation-delay: 2s;
  }

  .decoration-3 {
    width: 150px;
    height: 150px;
    top: 50%;
    left: 80%;
    animation-delay: 4s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.user-info-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 24, 45, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 24px;

  .user-info-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 24px;
    flex-wrap: wrap;

    .user-info,
    .tenant-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.9);

      .user-label,
      .tenant-label {
        color: rgba(255, 255, 255, 0.6);
      }

      .user-name,
      .tenant-name {
        color: #00d4ff;
        font-weight: 500;
      }
    }

    :deep(.el-button) {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;

      &:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: #ef4444;
        color: #ffffff;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 10px 16px;

    .user-info-content {
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;

      .user-info,
      .tenant-info {
        font-size: 0.85rem;
        white-space: nowrap;
      }
    }
  }

  @media (max-width: 480px) {
    padding: 8px 12px;

    .user-info-content {
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;

      .user-info,
      .tenant-info {
        font-size: 0.8rem;
        white-space: nowrap;
      }

      :deep(.el-button) {
        font-size: 0.75rem;
        padding: 6px 12px;
      }
    }
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 1200px;
  width: 100%;
  padding: 40px 20px;
  margin-top: 60px;

  @media (max-width: 768px) {
    margin-top: 50px;
  }

  @media (max-width: 480px) {
    margin-top: 45px;
  }
}

.title-section {
  margin-bottom: 60px;

  .main-title {
    font-size: 4rem;
    font-weight: 700;
    color: #00d4ff;
    margin: 0 0 16px 0;
    text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
    letter-spacing: 0.1em;
  }

  .sub-title {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-weight: 300;
  }
}

.system-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
  justify-items: center;
}

.system-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px 30px;
  width: 100%;
  max-width: 400px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, var(--card-color), transparent);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  &.pv-system {
    --card-color: #fbbf24;
    
    &:hover {
      background: rgba(251, 191, 36, 0.1);
      border-color: rgba(251, 191, 36, 0.3);
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(251, 191, 36, 0.2);
    }
  }

  &.es-system {
    --card-color: #00d4ff;
    
    &:hover {
      background: rgba(0, 212, 255, 0.1);
      border-color: rgba(0, 212, 255, 0.3);
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0, 212, 255, 0.2);
    }
  }

  &:hover::before {
    transform: translateX(100%);
  }

  .card-icon {
    color: var(--card-color);
    margin-bottom: 24px;
    
    svg {
      filter: drop-shadow(0 0 10px rgba(var(--card-color), 0.3));
    }
  }

  .card-title {
    font-size: 1.8rem;
    color: #ffffff;
    margin: 0 0 12px 0;
    font-weight: 600;
  }

  .card-description {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 24px 0;
    line-height: 1.5;
  }

  .card-features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;

    .feature-tag {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 0.8rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  }
}

.footer-info {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  
  .copyright {
    margin: 0 0 8px 0;
  }
  
  .version {
    margin: 0;
    font-size: 0.8rem;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px 16px;
  }

  .title-section {
    margin-bottom: 40px;

    .main-title {
      font-size: 2.5rem;
    }

    .sub-title {
      font-size: 1.2rem;
    }
  }

  .system-cards {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 40px;
  }

  .system-card {
    max-width: none;
    padding: 30px 20px;

    .card-title {
      font-size: 1.5rem;
    }

    .card-icon svg {
      width: 60px;
      height: 60px;
    }
  }

  .background-decoration {
    .decoration-1,
    .decoration-2,
    .decoration-3 {
      display: none; // 移动端隐藏装饰元素
    }
  }
}

@media (max-width: 480px) {
  .title-section .main-title {
    font-size: 2rem;
  }

  .system-card {
    padding: 24px 16px;
    
    .card-title {
      font-size: 1.3rem;
    }
  }
}
</style>
