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
        <h3 class="dialog-title">设备详情</h3>
        <div class="header-content">
          <div class="header-left">
            <!-- 面包屑导航 -->
            <el-breadcrumb separator=">">
              <el-breadcrumb-item v-if="factoryName">{{ factoryName }}</el-breadcrumb-item>
              <el-breadcrumb-item v-if="deviceType">{{ deviceType }}</el-breadcrumb-item>
              <el-breadcrumb-item>{{ deviceName || deviceId }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <!-- 更新时间和状态 -->
            <div class="status-info">
              <span class="update-time">更新时间: {{ updateTime }}</span>
              <div class="status-indicator">
                <span class="status-dot" :class="deviceStatus === 'online' ? 'online' : 'offline'"></span>
                <span class="status-text">{{ deviceStatus === 'online' ? '在线' : '离线' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="dialog-content">

      <!-- Tab导航 -->
      <el-tabs 
        v-model="activeTab" 
        type="border-card"
        class="device-tabs"
        @tab-change="handleTabChange"
      >
        <el-tab-pane label="监控信息" name="monitor">
          <MonitoringInfoTab 
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
          <div class="tab-content basic-info-content">
            <div v-loading="basicInfoLoading" class="basic-info-list">
              <div v-if="basicInfo" class="info-grid">
                <div class="info-item">
                  <span class="label">设备名称:</span>
                  <span class="value">{{ basicInfo.deviceName || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">设备编码:</span>
                  <span class="value">{{ basicInfo.deviceCode || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">序列号:</span>
                  <span class="value">{{ basicInfo.sn || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">设备类型:</span>
                  <span class="value">{{ basicInfo.deviceType || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">设备位置:</span>
                  <span class="value">{{ basicInfo.deviceLocation || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">连接状态:</span>
                  <span class="value">
                    <el-tag :type="basicInfo.connectionStatus === 1 ? 'success' : 'danger'" size="small">
                      {{ basicInfo.connectionStatus === 1 ? '在线' : '离线' }}
                    </el-tag>
                  </span>
                </div>
                <div class="info-item" v-if="basicInfo.connectionStatus !== 1">
                  <span class="label">离线时间:</span>
                  <span class="value">{{ basicInfo.offlineTime || '-' }}</span>
                </div>
                <div class="info-item" v-if="basicInfo.connectionStatus !== 1">
                  <span class="label">离线时长:</span>
                  <span class="value">{{ basicInfo.offlineDuration || '-' }}</span>
                </div>
              </div>
              <el-empty v-else-if="!basicInfoLoading" description="暂无基础信息数据" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import RealtimeAlarmTab from './RealtimeAlarmTab.vue'
import HistoryAlarmTab from './HistoryAlarmTab.vue'
import MonitoringInfoTab from './MonitoringInfoTab.vue'
import HistoryDataTab from './HistoryDataTab.vue'
import { getDeviceBasicInfo } from '@/api/alarm/history'
import type { DeviceBasicInfo } from '@/api/types/alarm/history'

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
  deviceType?: string
  factoryName?: string
  initialTab?: 'monitor' | 'realtime_alarm' | 'history_alarm' | 'history_data' | 'basic'
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  deviceName: '',
  deviceType: '',
  factoryName: '',
  initialTab: 'monitor'
})

const emit = defineEmits<Emits>()

// 响应式数据
const activeTab = ref<'monitor' | 'realtime_alarm' | 'history_alarm' | 'history_data' | 'basic'>(props.initialTab)
const currentDeviceId = ref<string>(props.deviceId)
const deviceStatus = ref<'online' | 'offline'>('online')
const updateTime = ref<string>(dayjs().format('YYYY-MM-DD HH:mm:ss'))

// 基础信息数据
const basicInfo = ref<DeviceBasicInfo | null>(null)
const basicInfoLoading = ref(false)

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

/**
 * 处理Tab切换
 */
const handleTabChange = (tabName: string | number) => {
  activeTab.value = tabName as typeof activeTab.value
  // Tab切换时加载对应数据
  if (tabName === 'basic' && !basicInfo.value) {
    loadBasicInfo()
  }
}

/**
 * 加载基础信息
 */
async function loadBasicInfo() {
  if (!props.deviceId) {
    return
  }

  basicInfoLoading.value = true
  try {
    const response = await getDeviceBasicInfo(props.deviceId)

    if (response.success && response.code === 200) {
      basicInfo.value = response.result
      // 更新设备状态
      deviceStatus.value = response.result.connectionStatus === 1 ? 'online' : 'offline'
      // 更新更新时间
      updateTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
    } else {
      ElMessage.error(response.message || '加载基础信息失败')
      basicInfo.value = null
    }
  } catch (error: any) {
    console.error('加载基础信息失败:', error)
    ElMessage.error('加载基础信息失败')
    basicInfo.value = null
  } finally {
    basicInfoLoading.value = false
  }
}


/**
 * 关闭弹窗
 */
const handleClose = () => {
  dialogVisible.value = false
}

// 监听props变化
watch(() => props.deviceId, (deviceId) => {
  currentDeviceId.value = deviceId
  // 设备ID变化时重新加载基础信息
  if (activeTab.value === 'basic') {
    loadBasicInfo()
  }
})

watch(() => props.deviceName, () => {
  // 设备名称变化时的处理
})

watch(() => props.initialTab, (tab) => {
  activeTab.value = tab
})

// 监听弹窗显示状态，显示时加载对应数据
watch(() => props.visible, (visible) => {
  if (visible && props.deviceId) {
    // 根据初始Tab加载数据
    if (props.initialTab === 'basic') {
      loadBasicInfo()
    }
  }
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
    flex-direction: column;
    padding: 5px 10px;


    .dialog-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #fafafae8;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-left {
      :deep(.el-breadcrumb) {
        .el-breadcrumb__item {
          .el-breadcrumb__inner {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            font-weight: 400;
            
            &:hover {
              color: #00d4ff;
            }
          }
            
          &:last-child {
            .el-breadcrumb__inner {
              color: #00d4ff;
              font-weight: 500;
            }
          }
            
          .el-breadcrumb__separator {
            color: rgba(255, 255, 255, 0.5);
          }
        }
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

    .device-header-section {
      padding: 15px 20px;
      background: #0d2344;  // 深蓝背景
      border-bottom: 1px solid rgba(0, 212, 255, 0.4);  // 主题青色边框

      .device-info {
        .device-name {
          color: #00d4ff;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .device-meta {
          display: flex;
          gap: 20px;
          font-size: 14px;

          .meta-item {
            color: rgba(255, 255, 255, 0.85);
          }
        }
      }
    }

    .device-tabs {
      height: calc(100% - 100px);  // 减去头部区域高度
      
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

      .tab-content {
        padding: 20px;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        height: 100%;


        &.basic-info-content {
          padding: 20px;
          min-height: 200px;

          .basic-info-list {
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;

              @media (max-width: 768px) {
                grid-template-columns: 1fr;
              }

              .info-item {
                display: flex;
                align-items: center;
                padding: 12px;
                background: rgba(0, 212, 255, 0.05);
                border: 1px solid rgba(0, 212, 255, 0.2);
                border-radius: 4px;

                .label {
                  color: rgba(255, 255, 255, 0.7);
                  font-size: 14px;
                  min-width: 100px;
                  margin-right: 12px;
                  white-space: nowrap;
                }

                .value {
                  color: #ffffff;
                  font-size: 14px;
                  flex: 1;
                  word-break: break-all;
                }
              }
            }
          }
        }

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
        :deep(.el-breadcrumb) {
          .el-breadcrumb__inner {
            font-size: 12px;
          }
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
      .device-header-section {
        padding: 12px 15px;

        .device-info {
          .device-name {
            font-size: 14px;
          }

          .device-meta {
            flex-direction: column;
            gap: 8px;
            font-size: 12px;
          }
        }
      }
      
      .device-tabs {
        height: calc(100% - 120px);  // 移动端头部区域更高
      }
    }
  }
}
</style>
