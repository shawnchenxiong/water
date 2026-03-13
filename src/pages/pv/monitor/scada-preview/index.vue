<template>
  <div class="scada-preview-container">
    <iframe v-if="iframeSrc" :src="iframeSrc" frameborder="0" width="100%" height="100%"></iframe>
    <div v-else class="loading-state">
      <el-empty description="组态加载中..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTenantStore } from '@/stores/tenant'

const route = useRoute()
const userStore = useUserStore()
const tenantStore = useTenantStore()

const iframeSrc = ref('')

const generateIframeSrc = () => {
  const deviceId = route.params.id ? route.params.id.toString() : ''
  const templeteId = route.query.templeteId ? route.query.templeteId.toString() : ''
  
  if (!deviceId) return ''

  const apiUrl = import.meta.env.VITE_APP_API_URL
  const wsUrl = import.meta.env.VITE_APP_WS_API_URL
  
  const token = localStorage.getItem('token') || userStore.token || ''
  const tenantId = tenantStore.currentTenantId || localStorage.getItem('tenant_id') || '1'
  
  let url = `${window.location.origin}${window.location.pathname}#/scada/preview?deviceId=${deviceId}`
  if (templeteId) {
    url += `&templeteId=${templeteId}`
  }
  url += `&tt=${token}&tenantId=${tenantId}`
  
  // 透传用于自我配置的真实后端URL
  if (apiUrl) url += `&api_url=${encodeURIComponent(apiUrl)}`
  if (wsUrl) url += `&ws_url=${encodeURIComponent(wsUrl)}`
  
  return url
}

onMounted(() => {
  iframeSrc.value = generateIframeSrc()
})

watch(() => route.params.id, () => {
  iframeSrc.value = generateIframeSrc()
})
</script>

<style scoped lang="scss">
.scada-preview-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
  
  iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: none;
  }
  
  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #fff;
  }
}
</style>
