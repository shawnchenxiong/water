<template>
  <div class="power-stats-card">
    <div class="stats-header">
      <div class="stats-icon">
        <el-icon :size="24"><Lightning /></el-icon>
      </div>
      <div class="stats-content">
        <div class="stats-title">发电功率</div>
        <div class="real-time-power">
          {{ powerStats.realtimePower }} 
          <span class="unit">MW</span>
        </div>
      </div>
    </div>
    
    <div class="stats-details">
      <div class="stat-item">
        <span class="stat-label">今日发电量</span>
        <span class="stat-value">{{ formatPower(powerStats.todayGeneration) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">当月发电量</span>
        <span class="stat-value">{{ formatPower(powerStats.monthlyGeneration) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">年累计发电量</span>
        <span class="stat-value">{{ formatPower(powerStats.yearlyGeneration) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">累计发电量</span>
        <span class="stat-value">{{ formatPower(powerStats.totalGeneration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Lightning } from '@element-plus/icons-vue'
import type { PowerGenerationStats } from '@/api/types/pv-dashboard'
import { getPowerGenerationStats } from '@/api/pvDashboardApi'
import { ElMessage } from 'element-plus'

/**
 * 组件Props
 */
interface Props {
  powerStats?: PowerGenerationStats
}

const props = defineProps<Props>()

// 响应式数据
const loading = ref(false)
const powerStats = ref<PowerGenerationStats>({
  realtimePower: 0,
  todayGeneration: 0,
  monthlyGeneration: 0,
  yearlyGeneration: 0,
  totalGeneration: 0
})

/**
 * 加载数据
 */
const loadData = async () => {
  // 如果有 props 数据，优先使用 props
  if (props.powerStats) {
    powerStats.value = props.powerStats
    return
  }
  
  loading.value = true
  try {
    const response = await getPowerGenerationStats()
    if (response.code === 200) {
      powerStats.value = response.data
    } else {
      ElMessage.error(response.message || '加载数据失败')
    }
  } catch (error) {
    console.error('加载发电统计数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 格式化功率显示
 */
const formatPower = (power?: number): string => {
  if (!power) return '0kWh'
  if (power >= 10000) {
    return `${(power / 10000).toFixed(2)}万kWh`
  }
  return `${power.toFixed(2)}kWh`
}

// 组件挂载后加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.power-stats-card {
  border-radius: 8px;
  padding: 12px; // 更紧凑的padding
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.stats-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px; // 减小间距
  gap: 10px; // 减小gap
  flex-shrink: 0;
}

.stats-icon {
  width: 40px; // 缩小图标
  height: 40px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 153, 204, 0.2));
  border-radius: 6px; // 调整圆角
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00d4ff;
  flex-shrink: 0;
}

// 调整图标大小
.stats-icon :deep(.el-icon) {
  font-size: 20px !important;
}

.stats-content {
  flex: 1;
  min-width: 0;
}

.stats-title {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px; // 减小字体
  margin-bottom: 4px; // 减小间距
}

.real-time-power {
  color: #00d4ff;
  font-size: 20px; // 减小字体
  font-weight: 600;
  line-height: 1.2;
}

.unit {
  font-size: 14px; // 减小字体
  color: rgba(255, 255, 255, 0.6);
  margin-left: 4px;
}

.stats-details {
  display: flex;
  flex-direction: column;
  gap: 1px; // 减小gap
  flex: 1;
  min-height: 0;
  // 移除 overflow-y: auto，不使用滚动条
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0; // 减小padding
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  flex-shrink: 0;
  
  &:last-child {
    border-bottom: none; // 最后一项不显示边框
  }
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px; // 减小字体
}

.stat-value {
  color: #00d4ff;
  font-size: 13px; // 减小字体
  font-weight: 500;
}
</style>

