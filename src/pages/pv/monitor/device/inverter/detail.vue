<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree device-type="0915" />
    </template>

    <!-- 右侧详情内容区 -->
    <template #right>
      <div class="inverter-detail-content">
        <!-- 顶部导航 -->
        <div class="detail-header" :class="{ 'mobile-header': isMobile }">
          <!-- 移动端和桌面端共用的第一行 -->
          <div class="header-row-1">
            <div class="back-button" @click="handleBack">
              <el-icon><ArrowLeft /></el-icon>
              <span>返回</span>
            </div>
            
            <!-- 移动端时设备选择和导航按钮也在第一行 -->
            <div v-if="isMobile" class="mobile-device-controls">
              <el-select 
                v-model="currentDeviceId" 
                @change="handleDeviceChange"
                placeholder="选择设备"
                size="small"
                style="width: 150px"
              >
                <el-option
                  v-for="device in deviceList"
                  :key="device.deviceId"
                  :label="device.deviceName"
                  :value="device.deviceId"
                />
              </el-select>
              <div class="mobile-device-nav">
                <el-button size="small" :disabled="!hasPrev" @click="handlePrevDevice">上一个</el-button>
                <el-button size="small" :disabled="!hasNext" @click="handleNextDevice">下一个</el-button>
              </div>
            </div>
          </div>
          
          <!-- 桌面端面包屑或移动端面包屑 -->
          <div v-if="!isMobile" class="breadcrumb-nav">
            <el-breadcrumb separator=">">
              <el-breadcrumb-item>智能运维平台</el-breadcrumb-item>
              <el-breadcrumb-item>{{ stationPath }}</el-breadcrumb-item>
              <el-breadcrumb-item>逆变器</el-breadcrumb-item>
              <el-breadcrumb-item>
                <el-select 
                  v-model="currentDeviceId" 
                  @change="handleDeviceChange"
                  placeholder="选择设备"
                  style="width: 200px"
                >
                  <el-option
                    v-for="device in deviceList"
                    :key="device.deviceId"
                    :label="device.deviceName"
                    :value="device.deviceId"
                  />
                </el-select>
              </el-breadcrumb-item>
            </el-breadcrumb>
            <div class="device-nav">
              <el-button :disabled="!hasPrev" @click="handlePrevDevice">上一个</el-button>
              <el-button :disabled="!hasNext" @click="handleNextDevice">下一个</el-button>
            </div>
          </div>
          
          <!-- 移动端面包屑 -->
          <div v-else class="mobile-breadcrumb">
            <div class="mobile-breadcrumb-scroll">
              <el-breadcrumb separator=">">
                <el-breadcrumb-item>智能运维平台</el-breadcrumb-item>
                <el-breadcrumb-item>{{ stationPath }}</el-breadcrumb-item>
                <el-breadcrumb-item>逆变器</el-breadcrumb-item>
                <el-breadcrumb-item>{{ getCurrentDeviceName() }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
          </div>
        </div>

        <!-- Tab标签 -->
        <div class="detail-content">
          <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
            <el-tab-pane label="监控信息" name="monitor">
              <MonitorInfoTab :device-id="currentDeviceId" />
            </el-tab-pane>
            <el-tab-pane label="实时告警" name="realtime-alarm">
              <RealtimeAlarmTab :device-id="currentDeviceId" />
            </el-tab-pane>
            <el-tab-pane label="历史告警" name="history-alarm">
              <HistoryAlarmTab :device-id="currentDeviceId" />
            </el-tab-pane>
            <el-tab-pane label="历史数据" name="history-data">
              <HistoryDataTab v-if="activeTab === 'history-data'" :device-id="currentDeviceId" :key="`history-${currentDeviceId}`" />
            </el-tab-pane>
            <el-tab-pane label="基础信息" name="basic-info">
              <BasicInfoTab :device-id="currentDeviceId" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue';
import StationTree from '@/components/layout/StationTree.vue';
import MonitorInfoTab from './components/MonitorInfoTab.vue';
import RealtimeAlarmTab from './components/RealtimeAlarmTab.vue';
import HistoryAlarmTab from './components/HistoryAlarmTab.vue';
import HistoryDataTab from './components/HistoryDataTab.vue';
import BasicInfoTab from './components/BasicInfoTab.vue';
import { getSiblingDevices } from '@/api/device/inverterDetail';

const route = useRoute();
const router = useRouter();

const currentDeviceId = ref(route.params.id as string);
const activeTab = ref('monitor');
const stationPath = ref('加载中...');

// 移动端检测
const isMobile = ref(false);

// 检测是否为移动端
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 设备列表
const deviceList = ref<Array<{
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  onlineStatus: 'online' | 'offline';
}>>([]);

// 当前设备索引
const currentIndex = computed(() => {
  return deviceList.value.findIndex(d => d.deviceId === currentDeviceId.value);
});

const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < deviceList.value.length - 1);

// 加载同电站设备列表
const loadSiblingDevices = async () => {
  try {
    const response = await getSiblingDevices(currentDeviceId.value);
    deviceList.value = response.devices;
    
    // 更新电站路径
    if (response.stationPath) {
      stationPath.value = response.stationPath;
    }
  } catch (error) {
    console.error('加载设备列表失败:', error);
  }
};

// 返回
const handleBack = () => {
  router.push('/pv/monitor/device/inverter');
};

// 设备切换
const handleDeviceChange = (deviceId: string) => {
  router.replace(`/pv/monitor/device/inverter/${deviceId}`);
};

const handlePrevDevice = () => {
  if (hasPrev.value) {
    const prevDevice = deviceList.value[currentIndex.value - 1];
    router.replace(`/pv/monitor/device/inverter/${prevDevice.deviceId}`);
  }
};

const handleNextDevice = () => {
  if (hasNext.value) {
    const nextDevice = deviceList.value[currentIndex.value + 1];
    router.replace(`/pv/monitor/device/inverter/${nextDevice.deviceId}`);
  }
};

// 处理标签页切换
const handleTabChange = (tabName: string | number) => {
  console.log('Tab changed to:', tabName);
  if (tabName === 'history-data') {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }
};

// 获取当前设备名称（用于移动端面包屑）
const getCurrentDeviceName = () => {
  const current = deviceList.value.find(d => d.deviceId === currentDeviceId.value);
  return current?.deviceName || '未知设备';
};

onMounted(() => {
  // 初始化移动端检测
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
  
  loadSiblingDevices();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
});
</script>

<style scoped lang="scss">
.inverter-detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  
  /* 移动端适配 */
  &.mobile-header {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
    
    .header-row-1 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 12px;
      
      .back-button {
        flex-shrink: 0;
      }
      
      .mobile-device-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .mobile-device-nav {
          display: flex;
          gap: 4px;
          
          .el-button {
            padding: 4px 8px;
            font-size: 12px;
          }
        }
      }
    }
  }
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #00d4ff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  flex-shrink: 0;

  &:hover {
    color: #fff;
  }
}

.breadcrumb-nav {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;

  :deep(.el-breadcrumb) {
    flex: 1;
    min-width: 0;
  }

  :deep(.el-breadcrumb__item) {
    color: rgba(255, 255, 255, 0.7);
  }

  :deep(.el-breadcrumb__item:last-child) {
    color: #00d4ff;
  }

  :deep(.el-select) {
    .el-input__wrapper {
      background: rgba(10, 24, 45, 0.6);
      border-color: rgba(0, 212, 255, 0.3);
      box-shadow: none;

      &:hover {
        border-color: rgba(0, 212, 255, 0.6);
      }
    }

    .el-input__inner {
      color: #fff;
    }
  }
}

.device-nav {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 移动端面包屑 */
.mobile-breadcrumb {
  width: 100%;
  
  .mobile-breadcrumb-scroll {
    width: 100%;
    overflow-x: auto;
    padding: 4px 0;
    
    /* 自定义滚动条 */
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 20, 40, 0.3);
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 212, 255, 0.3);
      border-radius: 2px;
      
      &:hover {
        background: rgba(0, 212, 255, 0.5);
      }
    }
    
    :deep(.el-breadcrumb) {
      white-space: nowrap;
      
      .el-breadcrumb__item {
        font-size: 13px;
        
        .el-breadcrumb__inner {
          color: rgba(255, 255, 255, 0.8);
        }
        
        &:last-child .el-breadcrumb__inner {
          color: #00d4ff;
          font-weight: 500;
        }
      }
      
      .el-breadcrumb__separator {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
      }
    }
  }
}

.detail-content {
  flex: 1;
  overflow: hidden;
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;

  :deep(.el-tabs) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :deep(.el-tabs__header) {
    background: rgba(0, 30, 60, 0.8);
    margin: 0;
    padding: 0 16px;
  }

  :deep(.el-tabs__nav) {
    border: none;
  }

  :deep(.el-tabs__item) {
    color: rgba(255, 255, 255, 0.7);
    border: none;

    &.is-active {
      color: #00d4ff;
      background: rgba(0, 212, 255, 0.1);
    }

    &:hover {
      color: #00d4ff;
    }
  }

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
    padding: 16px;
  }

  :deep(.el-tab-pane) {
    height: 100%;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 212, 255, 0.3);
      border-radius: 4px;
    }
  }
}
</style>

