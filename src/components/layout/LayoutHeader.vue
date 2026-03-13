<template>
  <header class="layout-header">
    <!-- 顶部导航栏 -->
    <div class="header-top">
    <div class="header-content">
        <!-- Logo & 系统标题 -->
        <div class="sys-info">
          <!-- PC端Logo系统切换下拉菜单 -->
          <div v-if="!isMobile" class="logo-dropdown-wrapper">
            <el-dropdown 
              @command="handleSystemSwitch"
              trigger="hover"
              class="logo-system-dropdown"
              popper-class="new-dropdown-popper"
              placement="bottom-end"
              :show-timeout="100"
              :hide-timeout="200"
              :hide-on-click="false"
            >
              <button class="logo-btn">
                <img src="/images/layout/logo.svg" alt="logo" class="logo-icon" />
              </button>
              <template #dropdown>
                <el-dropdown-menu class="new-dropdown-menu">
                  <div class="drop-menu-top"></div>
                  <div class="drop-menu-center">
                    <el-dropdown-item 
                      command="pv" 
                      :class="{ 'is-active': systemStore.isPVSystem }"
                    >
                      <div class="el-dropdown-item-inner">
                        <span class="menu-name">鹤问湖一期工厂</span>
                      </div>
                    </el-dropdown-item>
                    <el-dropdown-item 
                      command="es" 
                      :class="{ 'is-active': systemStore.isESSystem }"
                    >
                      <div class="el-dropdown-item-inner">
                        <span class="menu-name">鹤问湖二期工厂</span>
                      </div>
                    </el-dropdown-item>
                  </div>
                  <div class="drop-menu-bottom"></div>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <!-- 移动端Logo系统切换下拉菜单 -->
          <div v-if="isMobile" class="mobile-logo-dropdown-wrapper">
            <el-dropdown 
              @command="handleSystemSwitch"
              trigger="click"
              class="mobile-logo-system-dropdown"
              popper-class="new-dropdown-popper"
              :show-timeout="50"
              :hide-timeout="200"
              :hide-on-click="true"
              placement="bottom-end"
            >
              <button class="mobile-logo-btn">
                <img src="/images/layout/logo.svg" alt="logo" class="logo-icon" />
              </button>
              <template #dropdown>
                <el-dropdown-menu class="new-dropdown-menu">
                  <div class="drop-menu-top"></div>
                  <div class="drop-menu-center">
                    <el-dropdown-item 
                      command="pv" 
                      :class="{ 'is-active': systemStore.isPVSystem }"
                    >
                      <div class="el-dropdown-item-inner">
                        <span class="menu-name">鹤问湖一期工厂</span>
                      </div>
                    </el-dropdown-item>
                    <el-dropdown-item 
                      command="es" 
                      :class="{ 'is-active': systemStore.isESSystem }"
                    >
                      <div class="el-dropdown-item-inner">
                        <span class="menu-name">鹤问湖二期工厂</span>
                      </div>
                    </el-dropdown-item>
                  </div>
                  <div class="drop-menu-bottom"></div>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <div class="system-title" :class="{ 'mobile-title': isMobile }" style="display: flex; align-items: center; gap: 12px;">
            <img src="/images/layout/hewenhu_logo.png" alt="logo" style="height: 1.5em; width: auto; object-fit: contain; display: block;" />
            {{ getSystemTitle() }}
          </div>
        </div>

        <!-- 移动端汉堡菜单按钮 -->
        <div class="mobile-menu-toggle" v-if="isMobile" @click="toggleMobileMenu">
          <el-icon :size="24" class="menu-icon">
            <MenuIcon v-if="!mobileMenuVisible" />
            <Close v-else />
          </el-icon>
        </div>

        <!-- 桌面端一级菜单 -->
        <div class="menu-content" v-show="!isMobile">
          <div class="menu-wrapper">
            <div class="new-menu-list">
              <div 
                v-for="menu in menuList" 
                :key="menu.id"
                class="new-menu cp"
              >
                <el-dropdown 
                  trigger="hover"
                  @command="handleCommand"
                  class="menu-el-dropdown"
                  popper-class="new-dropdown-popper"
                  :show-timeout="50"
                  :hide-timeout="300"
                  :hide-on-click="false"
                >
                  <div 
                    class="new-menu-item el-dropdown-selfdefine"
                    :class="{ active: activeMenu === menu.id }"
                    @click="handleMenuClick(menu)"
                  >
                    {{ menu.name }}
                  </div>
                  <template #dropdown v-if="menu.children">
                    <el-dropdown-menu class="new-dropdown-menu">
                      <div class="drop-menu-top"></div>
                      <div class="drop-menu-center">
                        <template v-for="child in menu.children" :key="child.id">
                          <!-- 没有三级菜单的项目 -->
                          <el-dropdown-item 
                            v-if="!child.children"
                            :command="child.path"
                            :class="{ 'is-active': isActivePath(child.path) }"
                          >
                            <div class="el-dropdown-item-inner">
                              <span class="menu-name" :title="child.name">{{ child.name }}</span>
                            </div>
                          </el-dropdown-item>
                          <!-- 如果有三级菜单，使用手动控制的方式 -->
                          <div 
                            v-else 
                            class="nested-dropdown-wrapper"
                            :ref="el => setWrapperRef(child.id, el)"
                            @mouseenter="handleShowNestedMenu(child.id)"
                            @mouseleave="handleHideNestedMenu"
                          >
                            <div 
                              class="submenu-trigger" 
                              :class="{ 'is-active': isActiveGroup(child) }"
                              @click="handleSecondMenuWithChildrenClick(child)"
                            >
                              <span class="menu-name" :title="child.name">{{ child.name }}</span>
                              <el-icon class="arrow-right-icon">
                                <ArrowRight />
                              </el-icon>
                            </div>
                            <!-- 三级菜单 -->
                            <Transition name="el-zoom-in-left">
                              <div 
                                v-show="visibleThirdMenu === child.id"
                                class="manual-third-menu"
                                :style="thirdMenuPosition"
                                @mouseenter="handleCancelHideNestedMenu"
                                @mouseleave="handleHideNestedMenu"
                              >
                                <div class="new-dropdown-menu">
                                  <div class="drop-menu-top"></div>
                                  <div class="drop-menu-center">
                                    <div 
                                      v-for="grandChild in child.children"
                                      :key="grandChild.id"
                                      class="manual-menu-item"
                                      :class="{ 'is-active': isActivePath(grandChild.path) }"
                                      @click="handleCommand(grandChild.path)"
                                    >
                                      <span class="menu-name" :title="grandChild.name">{{ grandChild.name }}</span>
                                    </div>
                                  </div>
                                  <div class="drop-menu-bottom"></div>
                                </div>
                              </div>
                            </Transition>
                          </div>
                        </template>
                      </div>
                      <div class="drop-menu-bottom"></div>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧工具栏 -->
        <div class="top-opt-content">
          <el-tooltip content="综合信息" placement="bottom" :show-after="500">
            <div class="opt-item-div cp" @click="goHome">
              <el-icon class="toolbar-icon home-icon" :size="18">
                <HomeFilled />
              </el-icon>
            </div>
          </el-tooltip>
           <!-- 消息中心 -->
           <el-tooltip content="消息中心" placement="bottom" :show-after="500">
             <div class="opt-item-div cp message-center-btn" @click="handleMessageCenterClick">
              <el-badge :value="unreadMessageCount" :hidden="unreadMessageCount === 0" :max="99">
                <el-icon class="message-icon" :size="18">
                  <Message />
                </el-icon>
              </el-badge>
            </div>
          </el-tooltip>
          <el-tooltip content="系统设置" placement="bottom" :show-after="500">
            <div class="opt-item-div cp" @click="handleSystemSettingsClick">
              <el-icon class="toolbar-icon setting-icon" :size="18">
                <Setting />
              </el-icon>
            </div>
          </el-tooltip>
          <el-tooltip content="通知" placement="bottom" :show-after="500">
            <div class="opt-item-div cp">
              <el-icon class="toolbar-icon bell-icon" :size="18">
                <Bell />
              </el-icon>
            </div>
          </el-tooltip>

         
          
          <!-- 用户下拉菜单 -->
          <div class="opt-item-div logout">
            <el-dropdown @command="handleCommand" class="logout-drop">
              <div class="avatar-wrapper el-dropdown-selfdefine">
                <el-avatar 
                  size="small" 
                  class="el-avatar"
                  :src="userInfo?.avatar"
                >
                  {{ userDisplayName }}
                </el-avatar>
                <span class="username-text" v-if="!isMobile">{{ userDisplayName }}</span>
                <el-icon class="dropdown-arrow" :size="12" style="margin-left: 5px;">
                  <ArrowDown />
                </el-icon>
          </div>
          <template #dropdown>
                <el-dropdown-menu class="user-dropdown">
                  <div class="user-info-header">
                    <div class="user-info-text">
                      <div class="user-name">{{ userInfo?.realname || userInfo?.username || '用户' }}</div>
                      <div class="user-username" v-if="userInfo?.username && userInfo?.realname">{{ userInfo.username }}</div>
                      <div class="user-tenant" v-if="tenantName">
                        <el-icon size="12" style="margin-right: 4px;"><Setting /></el-icon>
                        <span>{{ tenantName }}</span>
                      </div>
                    </div>
                  </div>
                  <el-divider style="margin: 8px 0;" />
                  <el-dropdown-item command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 面包屑 + 三级菜单 -->
    <div class="child-menu" v-if="!isMobile || showThirdMenu">
      <div class="submenu-content">
        <!-- 面包屑区域 -->
        <div class="menu-crumbs">
          <span class="sub-menu-flag"></span>
          <span class="sub-menu-name" :title="breadcrumbText">{{ breadcrumbText }}</span>
          
          <!-- 移动端三级菜单下拉选择器 -->
          <el-select 
            v-if="isMobile && showThirdMenu && thirdMenuItems.length > 3"
            v-model="activeThirdMenu"
            @change="handleThirdMenuChange"
            class="mobile-third-menu-select"
            placeholder="选择菜单"
            size="small"
          >
            <el-option
              v-for="item in thirdMenuItems"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </div>
        
        <!-- 桌面端/移动端少量三级菜单 -->
        <div class="third-menu" v-if="showThirdMenu && (!isMobile || thirdMenuItems.length <= 3)">
          <div 
            v-for="item in thirdMenuItems" 
            :key="item.id"
            :class="['third-menu-item', { active: item.id === activeThirdMenu }]"
            @click="handleThirdMenuClick(item.id)"
          >
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端侧边抽屉菜单 -->
    <el-drawer
      v-model="mobileMenuVisible"
      title="导航菜单"
      direction="ltr"
      :modal="true"
      :size="280"
      class="mobile-drawer"
      @close="closeMobileMenu"
    >
      <div class="mobile-menu-content">
        <div 
          v-for="menu in menuList" 
          :key="menu.id" 
          class="mobile-menu-group"
        >
          <!-- 一级菜单 -->
          <div 
            class="mobile-menu-item level-1"
            :class="{ active: activeMenu === menu.id, expanded: isMenuExpanded(menu.id) }"
            @click="handleMobileMenuClick(menu)"
          >
            <span class="menu-text">{{ menu.name }}</span>
            <el-icon v-if="menu.children" class="expand-icon" :class="{ rotated: isMenuExpanded(menu.id) }">
              <ArrowRight />
            </el-icon>
          </div>
          
          <!-- 二级菜单 -->
          <Transition name="menu-expand">
            <div v-if="menu.children && isMenuExpanded(menu.id)" class="mobile-submenu">
              <template v-for="child in menu.children" :key="child.id">
                <div 
                  class="mobile-menu-item level-2"
                  :class="{ active: activeSecondMenu === child.id, expanded: isMenuExpanded(child.id) }"
                  @click="handleMobileSecondMenuClick(child)"
                >
                  <span class="menu-text">{{ child.name }}</span>
                  <el-icon v-if="child.children" class="expand-icon" :class="{ rotated: isMenuExpanded(child.id) }">
                    <ArrowRight />
                  </el-icon>
                </div>
                
                <!-- 三级菜单 -->
                <Transition name="menu-expand">
                  <div v-if="child.children && isMenuExpanded(child.id)" class="mobile-submenu level-3">
                    <div 
                      v-for="grandChild in child.children"
                      :key="grandChild.id"
                      class="mobile-menu-item level-3"
                      :class="{ active: activeThirdMenu === grandChild.id }"
                      @click="handleCommand(grandChild.path); closeMobileMenu()"
                    >
                      <span class="menu-text">{{ grandChild.name }}</span>
                    </div>
                  </div>
                </Transition>
              </template>
            </div>
          </Transition>
        </div>
      </div>
    </el-drawer>

    <!-- 消息中心弹窗 -->
    <MessageCenter v-model="messageCenterVisible" />
    
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useSystemStore } from '@/stores/system'
import { useTenantStore } from '@/stores/tenant'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Message, ArrowRight, HomeFilled, Setting, Bell, ArrowDown, Menu as MenuIcon, Close, SwitchButton, OfficeBuilding } from '@element-plus/icons-vue'
import MessageCenter from '@/components/common/MessageCenter.vue'
import { getMessageStatistics } from '@/api/common/messageCenterApi'
import { getScadaList } from '@/api/scadaApi'
import { pvMenuList, esMenuList } from './menu'
import { getAllMonitorList, transformToMenuItems, type ProcessMenuItem } from '@/api/monitorApi'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const systemStore = useSystemStore()
const tenantStore = useTenantStore()

// 用户信息
const userInfo = computed(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr)
    } catch (e) {
      return null
    }
  }
  return null
})

// 用户显示名称（用于头像）
const userDisplayName = computed(() => {
  if (userInfo.value?.realname) {
    return userInfo.value.realname.charAt(0)
  }
  if (userInfo.value?.username) {
    return userInfo.value.username.charAt(0).toUpperCase()
  }
  return 'U'
})

// 租户名称
const tenantName = computed(() => tenantStore.currentTenantName)

const activeMenu = ref('') // 当前激活的一级菜单
const activeSecondMenu = ref('') // 当前激活的二级菜单
const activeThirdMenu = ref('') // 当前激活的三级菜单
const visibleThirdMenu = ref<string | null>(null) // 当前显示的三级菜单ID
const thirdMenuPosition = ref({}) // 三级菜单位置
let thirdMenuTimer: ReturnType<typeof setTimeout> | null = null
const wrapperRefs = new Map<string, HTMLElement>()

// 消息中心相关
const messageCenterVisible = ref(false)
const unreadMessageCount = ref(0)
let refreshMessageCountTimer: ReturnType<typeof setInterval> | null = null

// 移动端相关状态
const isMobile = ref(false)
const mobileMenuVisible = ref(false)
const expandedMenus = ref<Set<string>>(new Set()) // 跟踪展开的菜单项

// 响应式检测
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
  // 当从移动端切换到桌面端时，关闭移动菜单
  if (!isMobile.value && mobileMenuVisible.value) {
    mobileMenuVisible.value = false
  }
}

// 保存wrapper元素引用
const setWrapperRef = (id: string, el: any) => {
  if (el) {
    wrapperRefs.set(id, el)
  }
}

// 获取服务器组态列表（一期 SCADA 菜单）
const scadaMenus = ref<any[]>([])
const fetchScadaList = async () => {
  try {
    const res = await getScadaList()
    if (res.data && (res.data.code === 0 || res.data.code === 200 || res.data.success)) {
      scadaMenus.value = res.data.data || res.data.result || []
    }
  } catch (error) {
    console.error('获取组态列表失败:', error)
  }
}

// ==================== 二期工艺流程动态菜单 ====================
/** 后端返回的二期工艺流程菜单项 */
const esMonitorMenus = ref<ProcessMenuItem[]>([])

/**
 * 从后端加载二期工艺流程菜单
 * 调用 getAllMonitorList 接口获取树形数据，转换为菜单项
 */
const fetchEsMonitorMenu = async () => {
  try {
    const treeData = await getAllMonitorList()
    esMonitorMenus.value = transformToMenuItems(treeData)
    console.log('[LayoutHeader] 二期工艺流程菜单加载完成:', esMonitorMenus.value.length, '个一级菜单')
  } catch (error) {
    console.error('[LayoutHeader] 加载二期工艺流程菜单失败:', error)
  }
}

// 菜单结构 - 根据当前系统类型选择菜单
const menuList = computed(() => {
  let baseList: any[] = []
  if (systemStore.isPVSystem) {
    baseList = pvMenuList
  } else if (systemStore.isESSystem) {
    baseList = esMenuList
  } else {
    // 默认返回一期系统菜单
    baseList = pvMenuList
  }
  
  // 深拷贝，避免修改原始数据
  const finalMenu = JSON.parse(JSON.stringify(baseList))
  
  // === 二期系统：注入后端返回的工艺流程动态菜单 ===
  if (systemStore.isESSystem && esMonitorMenus.value.length > 0) {
    for (const menu of finalMenu) {
      if (menu.id === 'es-monitor') {
        // 用后端数据替换空的 children
        menu.children = JSON.parse(JSON.stringify(esMonitorMenus.value))
        break
      }
    }
  }
  
  // === 一期系统：追加 SCADA 组态菜单（逻辑不变） ===
  if (systemStore.isPVSystem && scadaMenus.value.length > 0) {
    for (const menu of finalMenu) {
      if (menu.id === 'pv-monitor') {
        if (!menu.children) menu.children = []
        scadaMenus.value.forEach((scada: any) => {
          menu.children.push({
            id: `scada-${scada.id}`,
            name: scada.name,
            path: `/pv/monitor/scada/${scada.id}?templeteId=${scada.templeteId || ''}`
          })
        })
        break
      }
    }
  }
  
  // removed scada addition for es system
  
  return finalMenu
})

// 动态计算第三级菜单
const showThirdMenu = computed(() => {
  return thirdMenuItems.value.length > 0
})

const thirdMenuItems = computed(() => {
  // 根据当前路由找到对应的二级菜单，返回其三级子菜单
  const currentPath = route.path
  for (const topMenu of menuList.value) {
    if (topMenu.children) {
      for (const secondMenu of topMenu.children) {
        if (secondMenu.children) {
          // 检查当前路由是否属于这个二级菜单的三级菜单
          const matchedThird = secondMenu.children.find((third: any) => third.path === currentPath)
          if (matchedThird) {
            return secondMenu.children.map((item: any) => ({
              id: item.id,
              label: item.name,
              path: item.path
            }))
          }
        }
      }
    }
  }
  return []
})

// 动态面包屑文本：一级/二级
const breadcrumbText = computed(() => {
  const breadcrumb = route.meta.breadcrumb as string[] | undefined
  if (breadcrumb && breadcrumb.length >= 2) {
    return breadcrumb.slice(0, 2).join('/')
  }
  return '综合信息'
})

/**
 * 获取系统标题
 */
const getSystemTitle = () => {
  if (isMobile.value) {
    // 移动端显示简短标题
    if (systemStore.isPVSystem) return '鹤问湖一期'
    if (systemStore.isESSystem) return '鹤问湖二期'
    return '鹤问湖水质净化厂'
  } else {
    // PC端显示完整标题
    return systemStore.currentSystemTitle
  }
}


/**
 * 处理系统切换
 */
const handleSystemSwitch = (systemType: 'pv' | 'es') => {
  if (systemType === systemStore.currentSystemType) return
  
  systemStore.setCurrentSystem(systemType)
  
  // 根据系统类型跳转到对应的首页
  const homePath = systemType === 'pv' ? '/pv/dashboard' : '/es/dashboard'
  router.push(homePath)
}


// 根据当前路由更新菜单激活状态
const updateMenuState = () => {
  const currentPath = route.path

  // 同步系统状态（根据路径自动切换一期/二期）
  if (currentPath.startsWith('/pv') && !systemStore.isPVSystem) {
    systemStore.setCurrentSystem('pv')
  } else if (currentPath.startsWith('/es') && !systemStore.isESSystem) {
    systemStore.setCurrentSystem('es')
  }
  
  // 特殊处理综合信息
  if (currentPath.includes('/dashboard')) {
    activeMenu.value = currentPath.includes('pv') ? 'pv-dashboard' : 'es-dashboard'
    activeSecondMenu.value = ''
    activeThirdMenu.value = ''
    return
  }
  
  // 更新一级菜单激活状态
  for (const topMenu of menuList.value) {
    if (topMenu.path && currentPath.startsWith(topMenu.path)) {
      activeMenu.value = topMenu.id
      break
    }
    if (topMenu.id !== 'pv-dashboard' && topMenu.id !== 'es-dashboard' && currentPath.includes(topMenu.id.split('-')[1])) {
      activeMenu.value = topMenu.id
      break
    }
  }
  
  // 更新二级和三级菜单激活状态
  for (const topMenu of menuList.value) {
    if (topMenu.children) {
      for (const secondMenu of topMenu.children) {
        // 检查二级菜单（忽略 query 比较）
        // 注意：动态菜单中的分组节点可能没有 path
        if (secondMenu.path) {
          try {
            const pathObj = new URL('http://dummy' + secondMenu.path)
            if (pathObj.pathname === currentPath) {
              activeSecondMenu.value = secondMenu.id
              activeThirdMenu.value = ''
              return
            }
          } catch {
            // path 格式异常时直接字符串比较
            if (secondMenu.path === currentPath) {
              activeSecondMenu.value = secondMenu.id
              activeThirdMenu.value = ''
              return
            }
          }
        }
        
        // 检查三级菜单
        if (secondMenu.children) {
          for (const thirdMenu of secondMenu.children) {
            if (thirdMenu.path) {
              try {
                const pathObj = new URL('http://dummy' + thirdMenu.path)
                if (pathObj.pathname === currentPath) {
                  activeSecondMenu.value = secondMenu.id
                  activeThirdMenu.value = thirdMenu.id
                  return
                }
              } catch {
                if (thirdMenu.path === currentPath) {
                  activeSecondMenu.value = secondMenu.id
                  activeThirdMenu.value = thirdMenu.id
                  return
                }
              }
            }
          }
        }
      }
    }
  }
}

// 一级菜单点击
const handleMenuClick = (menu: any) => {
  activeMenu.value = menu.id
  // 如果有直接路径且没有子菜单，直接跳转
  if (menu.path && !menu.children) {
    router.push(menu.path)
  } else if (menu.children && menu.children.length > 0) {
    // 如果有子菜单，跳转到第一个子菜单
    const firstChild = menu.children[0]
    if (firstChild.path) {
      router.push(firstChild.path)
    } else if (firstChild.children && firstChild.children[0]) {
      router.push(firstChild.children[0].path)
    }
  }
}

// 第三级菜单点击
const handleThirdMenuClick = (menuId: string) => {
  const targetItem = thirdMenuItems.value.find((item: any) => item.id === menuId)
  if (targetItem && targetItem.path) {
    router.push(targetItem.path)
  }
}

// 移动端三级菜单下拉选择变化
const handleThirdMenuChange = (menuId: string) => {
  handleThirdMenuClick(menuId)
}

// 有子菜单的二级菜单项点击（如"智能告警"）
const handleSecondMenuWithChildrenClick = (menu: any) => {
  if (menu.children && menu.children.length > 0) {
    // 跳转到第一个子菜单
    const firstChild = menu.children[0]
    if (firstChild.path) {
      router.push(firstChild.path)
    }
  }
}

// 下拉菜单命令处理
const handleCommand = (command: string) => {
  if (command === 'logout') {
    logout()
  } else {
    // command 可能带 query，直接 push
    router.push(command)
  }
}

// 判断路径是否激活（忽略 query 比较）
const isActivePath = (path?: string) => {
  if (!path) return false
  const pathObj = new URL('http://dummy' + path)
  return route.path === pathObj.pathname
}

// 判断分组是否激活
const isActiveGroup = (group: any) => {
  if (!group || !group.children) return false
  return group.children.some((g: any) => {
    if (!g.path) return false
    try {
      const pathObj = new URL('http://dummy' + g.path)
      return pathObj.pathname === route.path
    } catch {
      return g.path === route.path
    }
  })
}

// 回到首页
const goHome = () => {
  router.push('/')
}

// 消息中心点击
const handleMessageCenterClick = () => {
  messageCenterVisible.value = true
}

// 系统设置点击
const handleSystemSettingsClick = () => {
  // 获取 token
  const token = localStorage.getItem('token') || userStore.token || ''
  // 获取 tenantId
  const tenantId = tenantStore.currentTenantId || localStorage.getItem('tenant_id') || '1'
  // 获取 userInfo
  const userInfoStr = localStorage.getItem('userInfo')
  
  if (!token) {
    ElMessage.warning('未找到登录凭证，请重新登录')
    return
  }
  
  // 构建跳转链接
  let systemSettingsUrl = `https://ypt.ccswkj.cn/#/dashboard/analysis?token=${token}&tenantId=${tenantId}`
  
  // 如果有用户信息，添加到URL参数中
  if (userInfoStr) {
    systemSettingsUrl += `&userInfo=${userInfoStr}`
  }
  
  // 在新窗口中打开链接
  window.open(systemSettingsUrl, '_blank')
}

// 移动端菜单控制
const toggleMobileMenu = () => {
  mobileMenuVisible.value = !mobileMenuVisible.value
}

const closeMobileMenu = () => {
  mobileMenuVisible.value = false
}

// 移动端菜单项点击处理
const handleMobileMenuClick = (menu: any) => {
  if (menu.children) {
    // 如果有子菜单，切换展开状态
    toggleMenuExpansion(menu.id)
  } else {
    // 没有子菜单，直接跳转并关闭菜单
    handleMenuClick(menu)
    closeMobileMenu()
  }
}

// 移动端二级菜单点击处理
const handleMobileSecondMenuClick = (child: any) => {
  if (child.children) {
    // 如果有三级菜单，切换展开状态
    toggleMenuExpansion(child.id)
  } else {
    // 没有子菜单，直接跳转并关闭菜单
    router.push(child.path)
    closeMobileMenu()
  }
}

// 切换菜单展开状态
const toggleMenuExpansion = (menuId: string) => {
  if (expandedMenus.value.has(menuId)) {
    expandedMenus.value.delete(menuId)
  } else {
    expandedMenus.value.add(menuId)
  }
}

// 检查菜单是否展开
const isMenuExpanded = (menuId: string) => {
  return expandedMenus.value.has(menuId)
}

// 加载未读消息数量
const loadUnreadMessageCount = async () => {
  try {
    const stats = await getMessageStatistics()
    unreadMessageCount.value = stats.unreadCount
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

// 退出登录
const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    // userStore.logout() 已经包含了清除 isLoggedIn 和跳转逻辑
    await userStore.logout()
  } catch (error) {
    // 用户取消退出登录
    if (error !== 'cancel') {
      console.error('退出登录失败', error)
    }
  }
}

// 监听路由变化
watch(() => route.path, () => {
  updateMenuState()
}, { immediate: true })

// 显示嵌套三级菜单
const handleShowNestedMenu = (menuId: string) => {
  if (thirdMenuTimer) {
    clearTimeout(thirdMenuTimer)
    thirdMenuTimer = null
  }
  
  // 计算三级菜单位置
  const wrapper = wrapperRefs.get(menuId)
  if (wrapper) {
    const rect = wrapper.getBoundingClientRect()
    // 获取父级菜单的rect来更精确地定位
    const parentMenu = wrapper.closest('.new-dropdown-menu')
    const parentRect = parentMenu?.getBoundingClientRect()
    
    thirdMenuPosition.value = {
      left: parentRect ? `${parentRect.right}px` : `${rect.right}px`,
      top: `${rect.top}px`
    }
  }
  
  visibleThirdMenu.value = menuId
}

// 隐藏嵌套三级菜单
const handleHideNestedMenu = () => {
  thirdMenuTimer = setTimeout(() => {
    visibleThirdMenu.value = null
  }, 300)
}

// 取消隐藏嵌套三级菜单
const handleCancelHideNestedMenu = () => {
  if (thirdMenuTimer) {
    clearTimeout(thirdMenuTimer)
    thirdMenuTimer = null
  }
}

// 组件挂载时初始化
onMounted(() => {
  // 从存储恢复系统设置
  systemStore.restoreFromStorage()
  
  fetchScadaList()
  fetchEsMonitorMenu() // 加载二期工艺流程动态菜单
  updateMenuState()
  loadUnreadMessageCount()
  
  // 初始化响应式检测
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  
  // 定期刷新未读消息数量（每5分钟）
  refreshMessageCountTimer = setInterval(loadUnreadMessageCount, 5 * 60 * 1000)
})

// 组件卸载时清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
  if (refreshMessageCountTimer) {
    clearInterval(refreshMessageCountTimer)
  }
})
</script>

<style scoped lang="scss">
.layout-header {
  width: 100%;
  background-color: transparent;
  position: relative;
  z-index: 1;
}

/* 顶部导航栏 */
.header-top {
  height: 62px;
  background: url('/images/layout/top-container.png');
  background-size: 100% 100%;
  background-repeat: repeat;
  background-position: 0 0;
  position: relative;
}

.header-content {
  height: 100%;
  padding: 0 0 0 50px;
  display: flex;
  align-items: normal;
  justify-content: normal;
  flex-direction: row;
}

/* Logo 区域 */
.sys-info {
  color: hsla(0, 0%, 100%, 0.85);
  width: clamp(487.34896px, 35.67708vw, 35.67708vw);
  display: flex;
  font-size: clamp(22.76667px, 1.66667vw, 1.66667vw);
  font-family: Microsoft YaHei;
  font-weight: 600;
  line-height: clamp(56.88889px, 7.40741vh, 7.40741vh);
}


.logo-icon {
  width: clamp(28px, 2.05vw, 2.05vw); // 稍大于字体，确保视觉对齐
  height: clamp(28px, 2.05vw, 2.05vw);
  object-fit: contain;
  filter: drop-shadow(0 0 4px rgba(0, 212, 255, 0.5));
}

.system-title {
  font-size: 24.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.5px;
  flex: 0 1 auto;
  margin: 0;
  line-height: 62px;
}

/* Logo系统切换下拉菜单样式 */
.logo-dropdown-wrapper {
  display: flex;
  align-items: center;
}

.logo-system-dropdown {
  display: flex;
  align-items: center;
}

.logo-btn {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: block;
  flex: 0 1 auto;
  margin: 7.7px 3.56px 0 0;
  position: relative;
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.8));
  }
}


/* 移动端Logo系统切换下拉菜单 */
.mobile-logo-dropdown-wrapper {
  display: flex;
  align-items: center;
}

.mobile-logo-system-dropdown {
  display: flex;
  align-items: center;
}

.mobile-logo-btn {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  margin: 7.7px 8px 0 0;
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.6));
  }
  
  &:active {
    transform: scale(0.98);
  }
}



/* 一级菜单 */
.menu-content {
  display: block;
  flex: 1 1 0%;
  text-align: center;
  padding: 0;
  margin: 0;
  margin-left: 10px;
}

.menu-wrapper {
  display: flex;
  justify-content: normal;
  align-items: normal;
  text-align: center;
  padding: 0;
  margin: 0;
}

.new-menu-list {
  display: flex;
  justify-content: normal;
  align-items: normal;
  text-align: center;
  padding: 9.25px 0 0 0;
  margin: 0;
}

.new-menu {
  display: inline-block;
  position: relative;
  vertical-align: baseline;
  margin: 0;
}

.cp {
  cursor: pointer;
}

.menu-el-dropdown {
  width: 100%;
  height: 100%;
  position: relative;
}

.new-menu-item {
  display: block;
  width: 119px;
  height: 42px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 16px;
  line-height: 42px;
  text-align: center;
  cursor: pointer;
  background: url('/images/layout/menu.png') no-repeat center center;
  background-size: 100% 100%;
  transition: all 0.3s;
  position: static;
  padding: 0;
  margin: 0;
}

.new-menu-item.active {
  background-image: url('/images/layout/menu-active.png');
  color: #00d4ff;
}

/* 右侧工具栏 */
.top-opt-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 1 auto;
  justify-content: flex-end;
  padding: 0;
  margin-right: 20px;
}

.opt-item-div {
  display: inline-block;
}

.img-opt {
  width: 16px;
  height: 16px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.img-opt:hover {
  opacity: 1;
}

.sys-img {
  width: 24px;
  height: 24px;
}

/* 工具栏图标通用样式 */
.toolbar-icon {
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    color: #00d4ff;
    transform: scale(1.1);
  }
}

/* 特定图标样式 */
.home-icon {
  &:hover {
    color: #00d4ff;
    filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.6));
  }
}

.setting-icon {
  &:hover {
    color: #00d4ff;
    transform: scale(1.1) rotate(90deg);
  }
}

.bell-icon {
  &:hover {
    color: #00d4ff;
    filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.6));
    animation: bell-shake 0.5s ease-in-out;
  }
}

/* 铃铛摇晃动画 */
@keyframes bell-shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

/* 下拉箭头样式 */
.dropdown-arrow {
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s;
  
  &:hover {
    color: #00d4ff;
  }
}

.message-center-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  
  .message-icon {
    color: rgba(255, 255, 255, 0.8);
    transition: color 0.3s;
    
    &:hover {
      color: #00d4ff;
    }
  }
  
  :deep(.el-badge__content) {
    background-color: #ff4757;
    border-color: #ff4757;
    font-size: 10px;
    min-width: 16px;
    height: 16px;
    line-height: 16px;
  }
}

.logout {
  cursor: pointer;
}

.logout-drop {
  width: 100%;
  height: 100%;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
}

.username-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-avatar {
  background-color: #00d4ff;
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;
}

/* 用户下拉菜单样式 */
.user-dropdown {
  min-width: 180px;
}

.user-info-header {
  padding: 12px 16px;
}

.user-info-text {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-username {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-tenant {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: rgba(0, 212, 255, 0.9);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  .el-icon {
    flex-shrink: 0;
  }
  
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* 用户下拉菜单样式 */
.user-dropdown {
  min-width: 180px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.user-dropdown :deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  
  &:hover {
    background: rgba(0, 212, 255, 0.2);
    color: #00d4ff;
  }
  
  .el-icon {
    font-size: 16px;
  }
}

.user-dropdown :deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .el-icon {
    font-size: 16px;
  }
}

/* 面包屑 + 三级菜单 */
.child-menu {
  background: url('/images/layout/third_menu_back.png');
  background-size: 100% 100%; /* 完全拉伸填充 */
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  min-height: 42px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
}

.submenu-content {
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 50px;
}

/* 面包屑 */
.menu-crumbs {
  font-size: 16px;
  font-weight: 400;
  color: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
}

.sub-menu-flag {
  display: inline-block;
  width: 12px;
  height: 12px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='M2 4 L8 2 L14 4 L14 8 L8 14 L2 8 Z' fill='none' stroke='%2300D4FF' stroke-width='1.5'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  margin-right: 8px;
}

.sub-menu-name {
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 400;
}

/* 三级菜单 */
.third-menu {
  display: flex;
  gap: 0;
  align-items: center;
  margin-left: clamp(24.9px, 1.823vw, 1.823vw);
}

.third-menu-item {
  height: 38px;
  line-height: clamp(32px, 2.344vw, 2.344vw);
  padding: 0 clamp(14.23px, 1.042vw, 1.042vw) 0 clamp(10.67px, 0.781vw, 0.781vw);
  color: #fff;
  font-size: clamp(12.81px, 0.938vw, 0.938vw);
  font-family: 'Microsoft YaHei', sans-serif;
  font-weight: 400;
  opacity: 0.8;
  cursor: pointer;
  border-radius: 0;
  border: none;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  position: relative;
  background: none; /* 默认无背景 */
  white-space: nowrap;
  display: flex;
}

.third-menu-item:hover {
  opacity: 1;
}

.third-menu-item.active {
  opacity: 1;
  border-bottom: 3px solid #00d5ff;
  background: linear-gradient(0deg, rgba(46, 184, 255, 0.53), rgba(0, 123, 208, 0.01) 98%);
  transform: skewX(-30deg);
}

.third-menu-item.active span {
  transform: skewX(30deg); /* 反向倾斜文字，保持文字正常 */
  display: inline-block;
}

/* 嵌套下拉菜单的包装器 */
.nested-dropdown-wrapper {
  width: 100%;
  padding: 0;
  margin: 0;
  display: block;
  position: relative;
}

/* 三级菜单触发器样式 */
.submenu-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 36px; /* 固定高度，与el-dropdown-item-inner的line-height一致 */
  line-height: 36px; /* 与el-dropdown-item-inner保持一致 */
  padding: 0 7.6562px; /* 与el-dropdown-item-inner的padding完全一致 */
  cursor: pointer;
  color: rgb(96, 174, 254) !important;
  font-size: 14px;
  transition: all 0.3s;
  position: relative;
  box-sizing: border-box;
  margin: 0; /* 确保无额外margin */
  
  .menu-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .arrow-right-icon {
    margin-left: 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s;
    flex-shrink: 0;
  }
  
  &:hover {
    background: rgba(0, 212, 255, 0.15);
    color: #00d4ff;
    
    .arrow-right-icon {
      color: #00d4ff;
      transform: translateX(2px);
    }
  }
  
  &.is-active {
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
    
    .arrow-right-icon {
      color: #00d4ff;
    }
  }
}

/* 手动控制的三级菜单 */
.manual-third-menu {
  position: fixed !important; /* 使用fixed定位，不受父容器限制 */
  left: auto;
  top: auto;
  min-width: 160px;
  z-index: 3000 !important; /* 更高的z-index */
  
  .new-dropdown-menu {
    background: rgba(0, 20, 40, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    overflow: visible !important;
  }
}

/* 手动菜单项 */
.manual-menu-item {
  padding: 8px 20px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  transition: all 0.3s;
  white-space: nowrap;
  
  &:hover {
    background: rgba(0, 212, 255, 0.15);
    color: #00d4ff;
  }
  
  &.is-active {
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
  }
  
  .menu-name {
    display: block;
  }
}

/* 嵌套包装器需要相对定位 */
.nested-dropdown-wrapper {
  position: relative;
}

/* Tooltip 主题样式 */
:deep(.el-tooltip__popper) {
  background: rgba(0, 20, 40, 0.95) !important;
  border: 1px solid rgba(0, 212, 255, 0.3) !important;
  color: #ffffff !important;
  backdrop-filter: blur(10px);
  font-size: 12px;
  
  &.is-dark {
    background: rgba(0, 20, 40, 0.95) !important;
    
    .el-tooltip__arrow::before {
      background: rgba(0, 20, 40, 0.95) !important;
      border: 1px solid rgba(0, 212, 255, 0.3) !important;
    }
  }
}

/* ================= 移动端响应式样式 ================= */

/* 移动端汉堡菜单按钮 */
.mobile-menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  z-index: 1001; /* 确保汉堡菜单按钮在顶层 */
  
  .menu-icon {
    color: rgba(255, 255, 255, 0.9);
    transition: color 0.3s;
    
    &:hover {
      color: #00d4ff;
    }
  }
}

/* 移动端抽屉菜单样式 */
:deep(.mobile-drawer) {
  z-index: 3000 !important; /* 确保抽屉菜单在最顶层 */
  
  .el-drawer {
    z-index: 3000 !important;
  }
  
  .el-overlay {
    z-index: 2999 !important;
  }
  
  .el-drawer__header {
    background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 80, 0.95));
    color: #00d4ff;
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    margin-bottom: 0;
    padding: 16px 20px;
    position: relative;
    z-index: 3001;
    
    .el-drawer__title {
      color: #00d4ff;
      font-weight: 600;
      font-size: 16px;
    }
    
    .el-drawer__close-btn {
      color: rgba(255, 255, 255, 0.8);
      font-size: 18px;
      z-index: 3002;
      
      &:hover {
        color: #00d4ff;
      }
    }
  }
  
  .el-drawer__body {
    background: linear-gradient(180deg, rgba(0, 20, 40, 0.98), rgba(0, 40, 80, 0.98));
    padding: 0;
    z-index: 3001;
  }
}

.mobile-menu-content {
  height: 100%;
  overflow-y: auto;
}

.mobile-menu-group {
  margin-bottom: 8px;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  min-height: 48px; /* 移动端友好的触摸目标大小 */
  
  .menu-text {
    flex: 1;
    color: rgba(255, 255, 255, 0.85);
    font-size: 15px;
    font-weight: 400;
    line-height: 1.4;
  }
  
  .expand-icon {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    transition: all 0.3s;
    flex-shrink: 0;
    margin-left: 8px;
  }
  
  &:hover {
    background: rgba(0, 212, 255, 0.1);
    border-left-color: rgba(0, 212, 255, 0.5);
    
    .menu-text {
      color: #00d4ff;
    }
    
    .expand-icon {
      color: #00d4ff;
      transform: translateX(2px);
    }
  }
  
  &.active {
    background: rgba(0, 212, 255, 0.15);
    border-left-color: #00d4ff;
    
    .menu-text {
      color: #00d4ff;
      font-weight: 500;
    }
    
    .expand-icon {
      color: #00d4ff;
    }
  }
  
  &.expanded {
    .expand-icon {
      transform: rotate(90deg);
    }
  }
}

/* 展开图标旋转动画 */
.expand-icon {
  &.rotated {
    transform: rotate(90deg);
  }
}

/* 不同级别菜单的样式差异 */
.mobile-menu-item.level-1 {
  background: rgba(0, 212, 255, 0.05);
  font-weight: 500;
  
  .menu-text {
    font-size: 16px;
    font-weight: 500;
  }
}

.mobile-menu-item.level-2 {
  padding-left: 35px;
  background: rgba(0, 0, 0, 0.1);
  
  .menu-text {
    font-size: 14px;
  }
}

.mobile-menu-item.level-3 {
  padding-left: 50px;
  background: rgba(0, 0, 0, 0.15);
  
  .menu-text {
    font-size: 13px;
  }
}

.mobile-submenu {
  background: rgba(0, 0, 0, 0.1);
  
  &.level-3 {
    background: rgba(0, 0, 0, 0.2);
  }
}

/* 移动端响应式断点 */
@media (max-width: 768px) {
  .layout-header {
    position: relative;
    z-index: 1000; /* 确保header在移动端有足够高的层级 */
  }
  
  .header-top {
    height: 50px; /* 移动端减小高度 */
  }
  
  .header-content {
    padding: 0 15px; /* 减小左右间距 */
    gap: 0;
  }
  
  .sys-info {
    width: auto;
    flex: 1;
    min-width: 0; /* 允许收缩 */
    gap: 0; /* 移动端紧凑间距 */
  }
  
  /* 移动端隐藏桌面端Logo下拉菜单 */
  .logo-dropdown-wrapper {
    display: none;
  }
  
  /* 移动端Logo下拉菜单调整 */
  .mobile-logo-dropdown-wrapper {
    display: flex;
    align-items: center;
  }
  
  .mobile-logo-btn {
    margin: 5px 6px 0 0;
  }
  
  .system-title.mobile-title {
    font-size: 16px;
    font-weight: 500;
    line-height: 50px;
    margin-left: 8px;
  }
  
  .logo-icon {
    width: 24px;
    height: 24px;
  }
  
  .logo-btn {
    margin: 5px 0 0 0;
  }
  
  /* 移动端工具栏显示优化 */
  .top-opt-content {
    gap: 6px;
    margin-right: 10px;
    
    /* 移动端显示关键工具项 */
    .opt-item-div {
      /* 显示所有工具项，但调整尺寸 */
      .toolbar-icon {
        font-size: 16px;
      }
      
      /* 工具提示在移动端隐藏文字，只显示图标 */
      .el-tooltip__trigger {
        min-width: 32px;
        min-height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    /* 用户头像和消息中心保持较大尺寸 */
    .message-center-btn,
    .logout {
      .el-badge,
      .avatar-wrapper {
        min-width: 36px;
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    /* 移动端消息中心角标位置调整 */
    .message-center-btn {
      :deep(.el-badge__content) {
        right: 0px;
        top: 0px;
        transform: scale(0.85);
      }
    }
  }
  
  /* 移动端面包屑和三级菜单调整 */
  .child-menu {
    min-height: 38px;
    display: block; /* 移动端始终显示 */
  }
  
  .submenu-content {
    min-height: 38px;
    padding: 0 15px;
    flex-direction: column; /* 移动端垂直布局 */
    align-items: flex-start;
  }
  
  .menu-crumbs {
    width: 100%;
    padding: 8px 0 4px 0;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between; /* 面包屑和下拉选择器分别占据两端 */
    gap: 10px;
    
    .sub-menu-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  .mobile-third-menu-select {
    flex-shrink: 0;
    width: 120px;
    
    :deep(.el-select__wrapper) {
      background: rgba(0, 212, 255, 0.1);
      border: 1px solid rgba(0, 212, 255, 0.3);
      color: #fff;
      
      .el-select__placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
      
      .el-select__selected-item {
        color: #00d4ff;
      }
      
      .el-select__caret {
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
  
  .third-menu {
    width: 100%;
    flex-wrap: wrap;
    gap: 6px;
    margin: 4px 0 0 0;
    justify-content: flex-start;
  }
  
  .third-menu-item {
    font-size: 12px;
    height: 32px;
    line-height: 28px;
    padding: 0 12px;
    margin: 0 4px 4px 0;
    
    &.active {
      transform: skewX(-15deg); /* 移动端减小倾斜角度 */
    }
  }
}

/* 更小屏幕的适配 */
@media (max-width: 480px) {
  .header-content {
    padding: 0 10px;
  }
  
  .system-title.mobile-title {
    font-size: 14px;
    margin-left: 6px;
  }
  
  .logo-icon {
    width: 20px;
    height: 20px;
  }
  
  .mobile-menu-toggle .menu-icon {
    font-size: 20px;
  }
  
  .top-opt-content {
    gap: 6px;
    margin-right: 8px;
  }
  
  .submenu-content {
    padding: 0 10px;
  }
  
  .menu-crumbs {
    font-size: 13px;
    padding: 6px 0 4px 0;
    
    .sub-menu-name {
      font-size: 12px;
    }
  }
  
  .mobile-third-menu-select {
    width: 100px;
    
    :deep(.el-select__wrapper) {
      font-size: 12px;
    }
  }
  
  .third-menu-item {
    font-size: 11px;
    height: 30px;
    line-height: 26px;
    padding: 0 8px;
    margin: 0 2px 4px 0;
  }
}

/* 菜单展开动画 */
.menu-expand-enter-active,
.menu-expand-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.menu-expand-enter-from,
.menu-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.menu-expand-enter-to,
.menu-expand-leave-from {
  opacity: 1;
  max-height: 500px; /* 足够大的值以容纳菜单内容 */
}

/* 平板端适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .new-menu-item {
    width: 100px;
    font-size: 14px;
  }
  
  .system-title {
    font-size: 20px;
  }
  
  .top-opt-content {
    gap: 10px;
    margin-right: 15px;
  }
}
</style>
