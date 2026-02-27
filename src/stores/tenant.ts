/**
 * 租户状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTenantStore = defineStore('tenant', () => {
  // State
  const tenantId = ref<number>(
    Number(localStorage.getItem('tenant_id')) || 0
  )
  const tenantName = ref<string>(
    localStorage.getItem('tenant_name') || ''
  )

  // Getters
  const currentTenantId = computed(() => tenantId.value)
  const currentTenantName = computed(() => tenantName.value)

  // Actions

  /**
   * 保存租户信息
   */
  function saveTenant(id: number, name?: string) {
    tenantId.value = id
    localStorage.setItem('tenant_id', String(id))
    
    if (name) {
      tenantName.value = name
      localStorage.setItem('tenant_name', name)
    }
  }

  /**
   * 清除租户信息
   */
  function clearTenant() {
    tenantId.value = 0
    tenantName.value = ''
    localStorage.removeItem('tenant_id')
    localStorage.removeItem('tenant_name')
  }

  return {
    // State
    tenantId,
    tenantName,
    // Getters
    currentTenantId,
    currentTenantName,
    // Actions
    saveTenant,
    clearTenant,
  }
})

