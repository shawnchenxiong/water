<template>
  <div class="monitoring-info-tab">
    <div v-loading="loading" class="monitoring-content">
      <!-- 表格式布局 -->
      <div v-if="monitoringInfo.length > 0" class="monitoring-table">
        <div 
          v-for="(item, index) in monitoringInfo" 
          :key="index"
          class="table-cell"
        >
          <span class="cell-label">{{ item.name }}</span>
          <span class="cell-value">{{ item.value }}</span>
        </div>
      </div>

      <!-- 无数据提示 -->
      <el-empty 
        v-else-if="!loading" 
        description="暂无监控信息数据" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getDeviceMonitoringInfo } from '@/api/alarm/history'
import type { MonitoringInfoItem } from '@/api/types/alarm/history'

interface Props {
  deviceId: string
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true
})

// 响应式数据
const monitoringInfo = ref<MonitoringInfoItem[]>([])
const loading = ref(false)

/**
 * 加载监控信息
 */
async function loadMonitoringInfo() {
  if (!props.deviceId) {
    return
  }

  loading.value = true
  try {
    const response = await getDeviceMonitoringInfo(props.deviceId)

    if (response.success && response.code === 200) {
      monitoringInfo.value = response.result || []
    } else {
      ElMessage.error(response.message || '加载监控信息失败')
      monitoringInfo.value = []
    }
  } catch (error: any) {
    console.error('加载监控信息失败:', error)
    ElMessage.error('加载监控信息失败')
    monitoringInfo.value = []
  } finally {
    loading.value = false
  }
}

// 监听 deviceId 和 visible 变化
watch(
  () => [props.deviceId, props.visible],
  ([deviceId, visible]) => {
    if (deviceId && visible) {
      loadMonitoringInfo()
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.monitoring-info-tab {
  padding: 15px;
  min-height: 200px;

  .monitoring-content {
    width: 100%;
  }

  .monitoring-table {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid #2a568a;
    border-left: 1px solid #2a568a;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }

    .table-cell {
      display: flex;
      align-items: stretch;
      border-right: 1px solid #2a568a;
      border-bottom: 1px solid #2a568a;
      background: transparent;
      min-height: 36px;

      .cell-label {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background-color: #16315e; // label 背景色
        color: #fff;
        font-size: 13px;
        white-space: nowrap;
        min-width: 100px;
        border-right: 1px solid #2a568a;
      }

      .cell-value {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: transparent; // value 透明背景
        color: #fff;
        font-size: 13px;
        word-break: break-all;
        flex: 1;
      }
    }
  }
}
</style>
