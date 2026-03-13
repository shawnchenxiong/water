<template>
  <div class="process-data-panel">
    <div class="panel-header">
      <span class="panel-title">实时数据</span>
      <el-button :icon="Refresh" size="small" @click="refreshData">刷新</el-button>
    </div>
    
    <el-scrollbar height="calc(100vh - 180px)">
      <div class="panel-content">
        <!-- 水质数据 -->
        <div v-if="processData?.waterQuality" class="data-section">
          <div class="section-title">水质指标</div>
          <div class="data-grid">
            <div class="data-item">
              <span class="label">COD</span>
              <span class="value">{{ safeFixed(processData.waterQuality.cod) }}</span>
              <span class="unit">mg/L</span>
            </div>
            <div class="data-item">
              <span class="label">氨氮</span>
              <span class="value">{{ safeFixed(processData.waterQuality.nh3n) }}</span>
              <span class="unit">mg/L</span>
            </div>
            <div class="data-item">
              <span class="label">总氮</span>
              <span class="value">{{ safeFixed(processData.waterQuality.tn) }}</span>
              <span class="unit">mg/L</span>
            </div>
            <div class="data-item">
              <span class="label">总磷</span>
              <span class="value">{{ safeFixed(processData.waterQuality.tp) }}</span>
              <span class="unit">mg/L</span>
            </div>
            <div class="data-item">
              <span class="label">pH</span>
              <span class="value">{{ safeFixed(processData.waterQuality.ph) }}</span>
              <span class="unit">-</span>
            </div>
            <div class="data-item">
              <span class="label">溶解氧</span>
              <span class="value">{{ safeFixed(processData.waterQuality.do) }}</span>
              <span class="unit">mg/L</span>
            </div>
          </div>
        </div>

        <!-- 流量数据 -->
        <div v-if="processData?.flow" class="data-section">
          <div class="section-title">流量数据</div>
          <div class="data-grid">
            <div class="data-item">
              <span class="label">进水流量</span>
              <span class="value">{{ safeFixed(processData.flow.inflowRate) }}</span>
              <span class="unit">m³/h</span>
            </div>
            <div class="data-item">
              <span class="label">出水流量</span>
              <span class="value">{{ safeFixed(processData.flow.outflowRate) }}</span>
              <span class="unit">m³/h</span>
            </div>
            <div v-if="processData.flow.returnFlowRate" class="data-item">
              <span class="label">回流流量</span>
              <span class="value">{{ safeFixed(processData.flow.returnFlowRate) }}</span>
              <span class="unit">m³/h</span>
            </div>
          </div>
        </div>

        <!-- 设备状态 -->
        <div v-if="processData?.devices && processData.devices.length > 0" class="data-section">
          <div class="section-title">设备状态</div>
          <div class="device-list">
            <div v-for="device in processData.devices" :key="device.deviceId" class="device-card">
              <div class="device-header">
                <span class="device-name">{{ device.deviceName }}</span>
                <el-tag :type="getStatusType(device.status)" size="small">
                  {{ getStatusText(device.status) }}
                </el-tag>
              </div>
              <div v-if="device.status === 'running'" class="device-params">
                <div v-if="device.frequency" class="param-item">
                  <span>频率:</span>
                  <span>{{ safeFixed(device.frequency, 1) }} Hz</span>
                </div>
                <div v-if="device.current" class="param-item">
                  <span>电流:</span>
                  <span>{{ safeFixed(device.current, 1) }} A</span>
                </div>
                <div v-if="device.power" class="param-item">
                  <span>功率:</span>
                  <span>{{ safeFixed(device.power, 1) }} kW</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 更新时间 -->
        <div class="update-time">
          更新时间: {{ processData?.timestamp ? formatTime(processData.timestamp) : '-' }}
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getProcessData } from '@/api/processApi'
import type { ProcessData } from '@/api/types/water-treatment'
import dayjs from 'dayjs'

const props = defineProps<{
  processId: string
}>()

const processData = ref<ProcessData | null>(null)
let refreshTimer: number | null = null

const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getProcessData(props.processId)
    if (res.code === 200 && res.data) {
      processData.value = res.data
    }
  } catch (error) {
    console.error('加载工艺数据失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    running: 'success',
    stopped: 'info',
    fault: 'danger',
    maintenance: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    fault: '故障',
    maintenance: '维护中'
  }
  return textMap[status] || '未知'
}

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

/** 安全格式化数字，防止非数字值调用 toFixed 报错 */
const safeFixed = (val: any, digits = 2): string => {
  const num = Number(val)
  return isNaN(num) ? '--' : num.toFixed(digits)
}

onMounted(() => {
  loadData()
  // 每30秒自动刷新
  refreshTimer = window.setInterval(() => {
    loadData()
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped lang="scss">
.process-data-panel {
  height: 100%;
  background: rgba(5, 15, 30, 0.8);
  border-left: 1px solid rgba(0, 212, 255, 0.3);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.panel-content {
  padding: 15px;
}

.data-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.data-item {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-item .label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.data-item .value {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.data-item .unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-card {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
  padding: 12px;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.device-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.device-params {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.param-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.update-time {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}
</style>
