<template>
  <el-dialog
    v-model="dialogVisible"
    title="设备详情"
    :width="isMobile ? '95%' : '90%'"
    :top="isMobile ? '2vh' : '3vh'"
    :before-close="handleClose"
    class="device-detail-dialog"
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-left">
          <span class="dialog-title">设备详情</span>
        </div>
        <div class="header-right">
          <!-- 更新时间和状态 -->
          <div class="status-info">
            <span class="update-time">更新时间: 2025-10-21 15:05:00</span>
            <div class="status-indicator">
              <span class="status-dot online"></span>
              <span class="status-text">在线</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="dialog-content">
      <!-- 面包屑导航和设备切换 -->
      <div class="breadcrumb-section">
        <!-- 面包屑导航 -->
        <div class="breadcrumb">
          <span class="breadcrumb-item">智能运维平台</span>
          <el-icon class="breadcrumb-separator"><ArrowRight /></el-icon>
          <span class="breadcrumb-item">安徽省芜湖市</span>
          <el-icon class="breadcrumb-separator"><ArrowRight /></el-icon>
          <span class="breadcrumb-item">芜湖南亭市后水灯</span>
          <el-icon class="breadcrumb-separator"><ArrowRight /></el-icon>
          <el-select 
            v-model="deviceType" 
            placeholder="逆变器"
            size="small"
            style="width: 100px"
          >
            <el-option label="逆变器" value="inverter" />
          </el-select>
          <el-icon class="breadcrumb-separator"><ArrowRight /></el-icon>
          <el-select 
            v-model="currentDeviceId" 
            placeholder="选择设备"
            size="small"
            style="width: 120px"
            @change="handleDeviceChange"
          >
            <el-option
              v-for="device in deviceList"
              :key="device.id"
              :label="device.name"
              :value="device.id"
            />
          </el-select>
        </div>
        
        <!-- 设备切换按钮 -->
        <div class="device-navigation">
          <el-button 
            type="primary" 
            size="small" 
            :icon="ArrowLeft"
            @click="handlePrevDevice"
            :disabled="!hasPrevDevice"
          >
            下一个
          </el-button>
          <el-button 
            type="primary" 
            size="small" 
            @click="handleNextDevice"
            :disabled="!hasNextDevice"
          >
            上一个
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- Tab导航 -->
      <el-tabs 
        v-model="activeTab" 
        type="border-card"
        class="device-tabs"
        @tab-change="handleTabChange"
      >
        <el-tab-pane label="监控信息" name="monitor">
          <MonitorInfoTab 
            :device-id="currentDeviceId" 
            :visible="dialogVisible && activeTab === 'monitor'"
          />
        </el-tab-pane>
        
        <el-tab-pane label="实时告警" name="realtime_alarm">
          <RealtimeAlarmTab 
            :device-id="currentDeviceId" 
            :visible="dialogVisible && activeTab === 'realtime_alarm'"
          />
        </el-tab-pane>
        
        <el-tab-pane label="历史告警" name="history_alarm">
          <HistoryAlarmTab 
            :device-id="currentDeviceId" 
            :visible="dialogVisible && activeTab === 'history_alarm'"
          />
        </el-tab-pane>
        
        <el-tab-pane label="历史数据" name="history_data">
          <HistoryDataTab 
            :device-id="currentDeviceId" 
            :visible="dialogVisible && activeTab === 'history_data'"
          />
        </el-tab-pane>
        
        <el-tab-pane label="基础信息" name="basic">
          <BasicInfoTab 
            :device-id="currentDeviceId" 
            :visible="dialogVisible && activeTab === 'basic'"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import type { DeviceDetailTab } from '@/api/types/diagnosis/deviceDetail'
import BasicInfoTab from './BasicInfoTab.vue'
import MonitorInfoTab from './MonitorInfoTab.vue'
import RealtimeAlarmTab from './RealtimeAlarmTab.vue'
import HistoryAlarmTab from './HistoryAlarmTab.vue'
import HistoryDataTab from './HistoryDataTab.vue'

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})

interface Props {
  visible: boolean
  deviceId: string
  deviceName?: string
  initialTab?: DeviceDetailTab
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'device-change', deviceId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  deviceName: '',
  initialTab: 'monitor'
})

const emit = defineEmits<Emits>()

// 响应式数据
const activeTab = ref<DeviceDetailTab>(props.initialTab)
const currentDeviceId = ref<string>(props.deviceId)
const currentDeviceName = ref<string>(props.deviceName || 'CN-N0101')
const deviceType = ref<string>('inverter')

// 模拟设备列表（实际应该从API获取）
const deviceList = ref([
  { id: 'CN-N0101', name: 'CN-N0101' },
  { id: 'CN-N0102', name: 'CN-N0102' },
  { id: 'CN-N0103', name: 'CN-N0103' },
  { id: 'CN-N0104', name: 'CN-N0104' },
  { id: 'CN-N0105', name: 'CN-N0105' }
])

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const currentDeviceIndex = computed(() => {
  return deviceList.value.findIndex((device: { id: string; name: string }) => device.id === currentDeviceId.value)
})

const hasPrevDevice = computed(() => {
  return currentDeviceIndex.value > 0
})

const hasNextDevice = computed(() => {
  return currentDeviceIndex.value < deviceList.value.length - 1
})

/**
 * 处理Tab切换
 */
const handleTabChange = (tabName: string | number) => {
  activeTab.value = tabName as DeviceDetailTab
}

/**
 * 处理设备切换
 */
const handleDeviceChange = (deviceId: string) => {
  currentDeviceId.value = deviceId
  const device = deviceList.value.find((d: { id: string; name: string }) => d.id === deviceId)
  if (device) {
    currentDeviceName.value = device.name
  }
  emit('device-change', deviceId)
}

/**
 * 上一个设备
 */
const handlePrevDevice = () => {
  if (hasPrevDevice.value) {
    const prevDevice = deviceList.value[currentDeviceIndex.value - 1]
    handleDeviceChange(prevDevice.id)
  }
}

/**
 * 下一个设备
 */
const handleNextDevice = () => {
  if (hasNextDevice.value) {
    const nextDevice = deviceList.value[currentDeviceIndex.value + 1]
    handleDeviceChange(nextDevice.id)
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  dialogVisible.value = false
}

// 监听props变化
watch(() => props.deviceId, (deviceId: string) => {
  currentDeviceId.value = deviceId
})

watch(() => props.deviceName, (deviceName: string) => {
  if (deviceName) {
    currentDeviceName.value = deviceName
  }
})

watch(() => props.initialTab, (tab: DeviceDetailTab) => {
  activeTab.value = tab
})
</script>

<style scoped lang="scss">
.device-detail-dialog {
  :deep(.el-dialog) {
    background: #0d2344;  // 深蓝背景
    border: 1px solid rgba(0, 212, 255, 0.4);  // 主题青色边框
    border-radius: 8px;
    box-shadow: rgba(57, 182, 247, 0.3) 0px 0px 50px -20px;  // 青色发光阴影
  }

  :deep(.el-dialog__header) {
    background: #0d2344;  // 深蓝背景
    border-bottom: 1px solid #1875b7;  // 青蓝边框
    padding: 0;
    border-radius: 8px 8px 0 0;
  }

  :deep(.el-dialog__body) {
    padding: 0;
    background: #0d2344;  // 深蓝背景
    border-radius: 0 0 8px 8px;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    color: #ffffff;

    .header-left {
      .dialog-title {
        color: #00d4ff;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .header-right {
      display: flex;
      align-items: center;

      .status-info {
        display: flex;
        align-items: center;
        gap: 15px;
        font-size: 12px;

        .update-time {
          color: #bdc3c7;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            
            &.online {
              background: #27ae60;
            }
            
            &.offline {
              background: #e74c3c;
            }
          }

          .status-text {
            color: #ffffff;
          }
        }
      }
    }
  }

  .dialog-content {
    height: 75vh;

    .breadcrumb-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 20px;
      background: #0d2344;  // 深蓝背景
      border-bottom: 1px solid rgba(0, 212, 255, 0.4);  // 主题青色边框

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;

        .breadcrumb-item {
          color: #ffffff;  // 白色文字
        }

        .breadcrumb-separator {
          color: #39b6f7;  // 青色发光
          font-size: 12px;
        }

        :deep(.el-select) {
          .el-input__inner {
            background: rgba(0, 212, 255, 0.15);  // 主题青色背景
            border-color: #39b6f7;  // 青色边框
            color: #ffffff;
            font-size: 14px;
          }
          
          .el-input__suffix {
            color: #ffffff;
          }
        }
      }

      .device-navigation {
        display: flex;
        gap: 8px;

        :deep(.el-button--primary) {
          background: #1680ca;  // 青色主按钮
          border-color: rgba(0, 212, 255, 0.4);  // 主题青色边框
          font-size: 12px;
          padding: 6px 12px;
          color: #ffffff;
          
          &:hover:not(:disabled) {
            background: #39b6f7;  // 青色发光
            border-color: #39b6f7;
            box-shadow: 0 0 12px rgba(57, 182, 247, 0.5);  // 发光效果
          }

          &:disabled {
            background: #0d2344;
            border-color: rgba(0, 212, 255, 0.4);
            color: #6b7280;
          }
        }
      }
    }

    .device-tabs {
      height: calc(100% - 60px);  // 减去面包屑区域高度
      
      :deep(.el-tabs__content) {
        height: calc(100% - 55px);  // 减去tab头部高度
        overflow-y: auto;
        overflow-x: hidden;
        
        // 美化滚动条
        &::-webkit-scrollbar {
          width: 6px;
        }
        
        &::-webkit-scrollbar-track {
          background: rgba(10, 30, 50, 0.4);
          border-radius: 3px;
        }
        
        &::-webkit-scrollbar-thumb {
          background: #00d4ff;
          border-radius: 3px;
          
          &:hover {
            background: rgba(0, 212, 255, 0.8);
          }
        }
      }
      
      :deep(.el-tab-pane) {
        height: 100%;
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .device-detail-dialog {
    .dialog-header {
      flex-direction: column;
      gap: 10px;
      padding: 12px 15px;
      
      .header-left {
        .dialog-title {
          font-size: 16px;
        }
      }
      
      .header-right {
        width: 100%;
        justify-content: flex-start;
        
        .status-info {
          gap: 10px;
          font-size: 11px;
        }
      }
    }
    
    .dialog-content {
      .breadcrumb-section {
        flex-direction: column;
        gap: 10px;
        padding: 10px 12px;
        
        .breadcrumb {
          flex-wrap: wrap;
          gap: 6px;
          font-size: 12px;
          
          .breadcrumb-item {
            font-size: 12px;
          }
          
          .breadcrumb-separator {
            font-size: 12px;
          }
          
          .el-select {
            width: 90px !important;
            font-size: 12px;
          }
        }
        
        .device-navigation {
          width: 100%;
          justify-content: space-between;
          
          .el-button {
            flex: 1;
            font-size: 12px;
            padding: 6px 10px;
          }
        }
      }
      
      .device-tabs {
        height: calc(100% - 110px);  // 移动端面包屑区域更高
      }
    }
  }
}
</style>
