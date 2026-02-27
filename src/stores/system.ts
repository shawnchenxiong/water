import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 系统类型
 */
export type SystemType = 'pv' | 'es'

/**
 * 系统信息
 */
export interface SystemInfo {
  key: SystemType
  name: string
  fullName: string
  description: string
  theme: {
    primary: string
    secondary: string
    accent: string
  }
}

/**
 * 系统配置
 */
const SYSTEM_CONFIG: Record<SystemType, SystemInfo> = {
  pv: {
    key: 'pv',
    name: '鹤问湖一期',
    fullName: '鹤问湖水质净化厂（一期）',
    description: 'Hewenhu Water Purification Plant Phase I',
    theme: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      accent: '#d97706'
    }
  },
  es: {
    key: 'es',
    name: '鹤问湖二期',
    fullName: '鹤问湖水质净化厂（二期）',
    description: 'Hewenhu Water Purification Plant Phase II',
    theme: {
      primary: '#00d4ff',
      secondary: '#0ea5e9',
      accent: '#0284c7'
    }
  }
}

/**
 * 系统Store
 */
export const useSystemStore = defineStore('system', () => {
  // 当前系统类型
  const currentSystemType = ref<SystemType | null>(null)

  // 系统初始化状态
  const isInitialized = ref(false)

  /**
   * 当前系统信息
   */
  const currentSystem = computed(() => {
    if (!currentSystemType.value) return null
    return SYSTEM_CONFIG[currentSystemType.value]
  })

  /**
   * 当前系统标题
   */
  const currentSystemTitle = computed(() => {
    return currentSystem.value?.fullName || 'VoltWise 智慧运维管理系统'
  })

  /**
   * 当前系统主题色
   */
  const currentSystemTheme = computed(() => {
    return currentSystem.value?.theme || {
      primary: '#00d4ff',
      secondary: '#0ea5e9',
      accent: '#0284c7'
    }
  })

  /**
   * 是否为光伏系统
   */
  const isPVSystem = computed(() => {
    return currentSystemType.value === 'pv'
  })

  /**
   * 是否为储能系统
   */
  const isESSystem = computed(() => {
    return currentSystemType.value === 'es'
  })

  /**
   * 设置当前系统
   */
  const setCurrentSystem = (systemType: SystemType) => {
    currentSystemType.value = systemType

    // 持久化到本地存储
    localStorage.setItem('voltwise-current-system', systemType)

    // 标记已初始化
    isInitialized.value = true
  }

  /**
   * 从本地存储恢复系统设置
   */
  const restoreFromStorage = () => {
    const stored = localStorage.getItem('voltwise-current-system')
    if (stored && (stored === 'pv' || stored === 'es')) {
      currentSystemType.value = stored as SystemType
      isInitialized.value = true
    }
  }

  /**
   * 清除系统设置
   */
  const clearSystem = () => {
    currentSystemType.value = null
    isInitialized.value = false
    localStorage.removeItem('voltwise-current-system')
  }

  /**
   * 获取系统配置信息
   */
  const getSystemConfig = (systemType: SystemType): SystemInfo => {
    return SYSTEM_CONFIG[systemType]
  }

  /**
   * 获取所有系统配置
   */
  const getAllSystemsConfig = (): SystemInfo[] => {
    return Object.values(SYSTEM_CONFIG)
  }

  /**
   * 检查是否在系统选择页面
   */
  const isOnSystemSelector = computed(() => {
    return !currentSystemType.value && !isInitialized.value
  })

  return {
    // State
    currentSystemType,
    isInitialized,

    // Getters
    currentSystem,
    currentSystemTitle,
    currentSystemTheme,
    isPVSystem,
    isESSystem,
    isOnSystemSelector,

    // Actions
    setCurrentSystem,
    restoreFromStorage,
    clearSystem,
    getSystemConfig,
    getAllSystemsConfig,
  }
})