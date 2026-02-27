<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree device-type="0913" />
    </template>

    <!-- 右侧详情内容区 -->
    <template #right>
      <div class="weather-station-detail-content">
        <!-- 顶部导航 -->
        <div class="detail-header" :class="{ 'mobile-header': isMobile }">
          <!-- 第一行：返回按钮和设备选择 -->
          <div class="header-row-1">
            <div class="back-button" @click="handleBack">
              <el-icon><ArrowLeft /></el-icon>
              <span v-if="!isMobile">返回</span>
            </div>
            
            <!-- 设备选择 (移动端放在第一行) -->
            <div class="device-select-wrapper" v-if="isMobile">
              <el-select v-model="currentDeviceId" @change="handleDeviceChange" size="small">
                <el-option
                  v-for="device in deviceList"
                  :key="device.id"
                  :label="device.name"
                  :value="device.id"
                />
              </el-select>
            </div>
            
            <!-- 设备导航按钮 (移动端放在第一行) -->
            <div class="device-nav mobile-nav" v-if="isMobile">
              <el-button size="small" :disabled="!hasPrev" @click="handlePrevDevice">
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <el-button size="small" :disabled="!hasNext" @click="handleNextDevice">
                <el-icon><ArrowLeft style="transform: rotate(180deg)" /></el-icon>
              </el-button>
            </div>
          </div>
          
          <!-- 第二行：面包屑导航 (桌面端) / 简化面包屑 (移动端) -->
          <div class="header-row-2" v-if="!isMobile">
            <div class="breadcrumb-nav">
              <el-breadcrumb separator=">">
                <el-breadcrumb-item>智能运维平台</el-breadcrumb-item>
                <el-breadcrumb-item>安徽省亳州市</el-breadcrumb-item>
                <el-breadcrumb-item>亳州利辛县城污水厂</el-breadcrumb-item>
                <el-breadcrumb-item>气象站</el-breadcrumb-item>
                <el-breadcrumb-item>
                  <el-select v-model="currentDeviceId" @change="handleDeviceChange">
                    <el-option
                      v-for="device in deviceList"
                      :key="device.id"
                      :label="device.name"
                      :value="device.id"
                    />
                  </el-select>
                </el-breadcrumb-item>
              </el-breadcrumb>
              <div class="device-nav">
                <el-button :disabled="!hasPrev" @click="handlePrevDevice">上一个</el-button>
                <el-button :disabled="!hasNext" @click="handleNextDevice">下一个</el-button>
              </div>
            </div>
          </div>
          
          <!-- 移动端完整面包屑 (横向滚动) -->
          <div class="mobile-breadcrumb" v-if="isMobile">
            <div class="mobile-breadcrumb-scroll">
              <el-breadcrumb separator=">" class="mobile-breadcrumb-inner">
                <el-breadcrumb-item>智能运维平台</el-breadcrumb-item>
                <el-breadcrumb-item>安徽省亳州市</el-breadcrumb-item>
                <el-breadcrumb-item>亳州利辛县城污水厂</el-breadcrumb-item>
                <el-breadcrumb-item>气象站</el-breadcrumb-item>
                <el-breadcrumb-item class="current-device">
                  {{ deviceList.find(d => d.id === currentDeviceId)?.name || '当前设备' }}
                </el-breadcrumb-item>
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

const route = useRoute();
const router = useRouter();

const currentDeviceId = ref(route.params.id as string);
const activeTab = ref('monitor');

// 移动端响应式状态
const isMobile = ref(false);

// 响应式检测
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 模拟设备列表（实际应从API获取）
const deviceList = ref([
  { id: 'WS_0001', name: '利辛县城气象站' },
  { id: 'WS_0002', name: '东部新城气象站' },
  { id: 'WS_0003', name: '河西气象站' },
  { id: 'WS_0004', name: '东城气象站' },
  { id: 'WS_0005', name: '鹤问湖气象站' },
  { id: 'WS_0006', name: '繁昌第二污水厂气象站' },
  { id: 'WS_0007', name: '六安城南气象站' },
  { id: 'WS_0008', name: '城北二期中科气象站' },
]);

const currentIndex = computed(() => {
  return deviceList.value.findIndex(d => d.id === currentDeviceId.value);
});

const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < deviceList.value.length - 1);

const handleBack = () => {
  router.back();
};

const handleDeviceChange = (deviceId: string) => {
  router.replace(`/pv/monitor/device/weather-station/${deviceId}`);
};

const handlePrevDevice = () => {
  if (hasPrev.value) {
    const prevDevice = deviceList.value[currentIndex.value - 1];
    router.replace(`/pv/monitor/device/weather-station/${prevDevice.id}`);
  }
};

const handleNextDevice = () => {
  if (hasNext.value) {
    const nextDevice = deviceList.value[currentIndex.value + 1];
    router.replace(`/pv/monitor/device/weather-station/${nextDevice.id}`);
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

onMounted(() => {
  // 初始化移动端检测
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
});

// 组件卸载时清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
});
</script>

<style scoped>
.weather-station-detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

.detail-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  
  &:not(.mobile-header) {
    flex-direction: row;
    align-items: center;
    gap: 16px;
    
    .header-row-1 {
      display: contents;
    }
    
    .header-row-2 {
      display: contents;
    }
  }
}

.header-row-1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-row-2 {
  width: 100%;
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
  min-height: 32px; /* 移动端友好的触摸目标 */
  
  &:hover {
    color: #fff;
  }
  
  .el-icon {
    font-size: 16px;
  }
}

/* 移动端设备选择器 */
.device-select-wrapper {
  flex: 1;
  max-width: 200px;
  margin: 0 12px;
  
  :deep(.el-select) {
    width: 100%;
    
    .el-select__wrapper {
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
}

/* 移动端设备导航按钮 */
.device-nav.mobile-nav {
  display: flex;
  gap: 6px;
  
  .el-button {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .el-icon {
      font-size: 14px;
    }
  }
}

/* 移动端完整面包屑 (横向滚动) */
.mobile-breadcrumb {
  padding: 4px 0;
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  
  .mobile-breadcrumb-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      height: 3px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(10, 30, 50, 0.4);
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 212, 255, 0.6);
      border-radius: 2px;
      
      &:hover {
        background: rgba(0, 212, 255, 0.8);
      }
    }
  }
  
  .mobile-breadcrumb-inner {
    display: flex;
    white-space: nowrap;
    
    :deep(.el-breadcrumb__item) {
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
      flex-shrink: 0;
      
      &.current-device {
        color: #00d4ff;
        font-weight: 500;
      }
      
      .el-breadcrumb__inner {
        white-space: nowrap;
      }
      
      .el-breadcrumb__separator {
        color: rgba(255, 255, 255, 0.5);
        margin: 0 8px;
      }
    }
  }
}

.breadcrumb-nav {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.breadcrumb-nav :deep(.el-breadcrumb) {
  flex: 1;
}

.breadcrumb-nav :deep(.el-breadcrumb__item) {
  color: rgba(255, 255, 255, 0.7);
}

.breadcrumb-nav :deep(.el-breadcrumb__item:last-child) {
  color: #00d4ff;
}

.device-nav {
  display: flex;
  gap: 8px;
}

.detail-content {
  flex: 1;
  overflow: hidden;
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
}

.detail-content :deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-content :deep(.el-tabs__header) {
  background: rgba(0, 30, 60, 0.8);
  margin: 0;
  padding: 0 16px;
  position: relative;
  z-index: 2;
}

.detail-content :deep(.el-tabs__nav-wrap) {
  position: relative;
  z-index: 3;
}

.detail-content :deep(.el-tabs__nav) {
  border: none;
}

.detail-content :deep(.el-tabs__nav-prev),
.detail-content :deep(.el-tabs__nav-next) {
  z-index: 4 !important;
  position: relative;
  pointer-events: auto !important;
  cursor: pointer !important;
  color: rgba(255, 255, 255, 0.7);
  
  &:hover {
    color: #00d4ff !important;
  }
  
  &.is-disabled {
    pointer-events: none !important;
    opacity: 0.4;
  }
}

.detail-content :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7);
  border: none;
}

.detail-content :deep(.el-tabs__item.is-active) {
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
}

.detail-content :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 16px;
}

.detail-content :deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
}

/* 移动端响应式适配 */
@media (max-width: 768px) {
  .detail-header {
    padding: 10px 12px;
    gap: 8px;
  }
  
  .header-row-1 {
    gap: 8px;
  }
  
  .back-button {
    min-height: 36px; /* 移动端增大触摸目标 */
    padding: 4px 8px;
    
    .el-icon {
      font-size: 18px;
    }
  }
  
  .device-select-wrapper {
    max-width: 150px;
    margin: 0 8px;
  }
  
  .device-nav.mobile-nav {
    gap: 4px;
    
    .el-button {
      width: 36px;
      height: 36px;
      
      .el-icon {
        font-size: 16px;
      }
    }
  }
  
  .mobile-breadcrumb {
    padding: 2px 0;
    
    .mobile-breadcrumb-inner :deep(.el-breadcrumb__item) {
      font-size: 12px;
      
      .el-breadcrumb__separator {
        margin: 0 6px;
      }
    }
  }
  
  /* 移动端Tab适配 */
  .detail-content :deep(.el-tabs__header) {
    padding: 0 12px;
    position: relative;
    z-index: 2;
  }
  
  .detail-content :deep(.el-tabs__nav-wrap) {
    position: relative;
    z-index: 3;
  }
  
  .detail-content :deep(.el-tabs__nav-prev),
  .detail-content :deep(.el-tabs__nav-next) {
    z-index: 4 !important;
    position: relative;
    pointer-events: auto !important;
    cursor: pointer !important;
    
    &:hover {
      color: #00d4ff !important;
    }
    
    &.is-disabled {
      pointer-events: none !important;
      opacity: 0.4;
    }
  }
  
  .detail-content :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 0 12px;
    position: relative;
    z-index: 3;
  }
  
  .detail-content :deep(.el-tabs__content) {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .detail-header {
    padding: 8px 10px;
  }
  
  .device-select-wrapper {
    max-width: 120px;
    margin: 0 6px;
    
    :deep(.el-select .el-select__wrapper) {
      font-size: 13px;
    }
  }
  
  .device-nav.mobile-nav .el-button {
    width: 34px;
    height: 34px;
  }
  
  .mobile-breadcrumb .mobile-breadcrumb-inner :deep(.el-breadcrumb__item) {
    font-size: 11px;
    
    .el-breadcrumb__separator {
      margin: 0 4px;
    }
  }
  
  .detail-content :deep(.el-tabs__item) {
    font-size: 13px;
    padding: 0 8px;
  }
  
  .detail-content :deep(.el-tabs__content) {
    padding: 10px;
  }
}
</style>

