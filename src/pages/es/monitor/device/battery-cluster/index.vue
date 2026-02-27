<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree
        device-type="battery-cluster"
        @node-click="handleStationSelect"
      />
    </template>

    <!-- 右侧内容区 -->
    <template #right>
      <div class="battery-cluster-content">
        <!-- 统计栏和工具栏在同一行 -->
        <div class="top-bar" :class="{ 'mobile': isMobile }">
          <!-- 左侧统计区 -->
          <div class="statistics-section">
            <div
              v-for="item in statisticsItems"
              :key="item.key"
              class="stat-item"
              :class="{ active: activeStatus === item.key }"
              @click="handleStatusFilter(item.key)"
            >
              <span v-if="item.dot" class="status-dot" :class="`dot-${item.dot}`"></span>
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-value">({{ item.value }})</div>
            </div>
          </div>

          <!-- 右侧工具栏 -->
          <div class="toolbar-section">
            <el-input
              v-model="searchKeyword"
              placeholder="关键字"
              clearable
              :style="{ width: isMobile ? '140px' : '200px' }"
              :size="isMobile ? 'small' : 'default'"
              @input="handleSearch"
            />
            <el-button 
              type="primary"
              :size="isMobile ? 'small' : 'default'"
              @click="handleSearchClick"
            >
              搜索
            </el-button>
            <el-button 
              :icon="Download" 
              circle
              :size="isMobile ? 'small' : 'default'"
              @click="handleDownload"
              title="导出"
            />
            <el-button 
              :icon="Refresh" 
              circle
              :size="isMobile ? 'small' : 'default'"
              @click="handleRefresh"
              title="刷新"
            />
            <el-button-group>
              <el-button
                :icon="List"
                :type="viewMode === 'list' ? 'primary' : ''"
                :size="isMobile ? 'small' : 'default'"
                @click="handleViewModeChange('list')"
                title="列表视图"
              />
              <el-button
                :icon="Grid"
                :type="viewMode === 'card' ? 'primary' : ''"
                :size="isMobile ? 'small' : 'default'"
                @click="handleViewModeChange('card')"
                title="卡片视图"
              />
            </el-button-group>
          </div>
        </div>

        <!-- 内容区 -->
        <div class="content-area">
          <!-- 暂无数据 -->
          <div class="empty-state">
            <img src="/images/empty.png" alt="暂无数据" class="empty-image" />
          </div>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Download,
  Refresh,
  Grid,
  List
} from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import type { StationTreeNode } from '@/types/station'

// 移动端检测
const isMobile = ref(false)

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 统计数据
const statistics = ref({
  total: 0,
  normal: 0,
  alarm: 0,
  offline: 0
})

// 筛选条件
const activeStatus = ref<string>('all')
const searchKeyword = ref<string>('')

// 视图模式
const viewMode = ref<'card' | 'list'>('card')

// 统计项
const statisticsItems = computed(() => [
  { key: 'all', label: '总数', value: statistics.value.total, dot: '' },
  { key: 'normal', label: '正常', value: statistics.value.normal, dot: 'green' },
  { key: 'alarm', label: '告警', value: statistics.value.alarm, dot: 'red' },
  { key: 'offline', label: '离线', value: statistics.value.offline, dot: 'gray' }
])

// 状态筛选
const handleStatusFilter = (status: string) => {
  activeStatus.value = status
  ElMessage.info(`筛选状态: ${status}`)
}

// 电站选择
const handleStationSelect = (node: StationTreeNode) => {
  // 只有叶子节点(具体电站)才能选择
  if (!node.childList || node.childList.length === 0) {
    ElMessage.info(`选择电站: ${node.regionName}`)
  }
}

// 搜索
const handleSearch = () => {
  ElMessage.info(`搜索关键字: ${searchKeyword.value}`)
}

// 搜索按钮点击
const handleSearchClick = () => {
  ElMessage.info(`搜索: ${searchKeyword.value || '全部'}`)
}

// 刷新
const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

// 导出
const handleDownload = () => {
  ElMessage.info('导出功能开发中')
}

// 视图模式切换
const handleViewModeChange = (mode: 'card' | 'list') => {
  viewMode.value = mode
  ElMessage.success(`切换到${mode === 'card' ? '卡片' : '列表'}视图`)
}

// 初始化
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

// 清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.battery-cluster-content {
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(25, 55, 110, 0.7);
  border-bottom: 1px solid rgba(0, 212, 255, 0.4);
  gap: 20px;
  
  &.mobile {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px 16px;
  }
}

.statistics-section {
  display: flex;
  gap: 24px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  background: transparent;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  white-space: nowrap;
  
  &:hover {
    opacity: 0.8;
  }
  
  &.active {
    border-bottom-color: #00d4ff;
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    
    &.dot-green {
      background: #27ae60;
      box-shadow: 0 0 8px rgba(39, 174, 96, 0.6);
    }
    
    &.dot-red {
      background: #e74c3c;
      box-shadow: 0 0 8px rgba(231, 76, 60, 0.6);
    }
    
    &.dot-gray {
      background: #95a5a6;
      box-shadow: 0 0 8px rgba(149, 165, 166, 0.6);
    }
  }
  
  .stat-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
  }
  
  .stat-value {
    font-size: 14px;
    color: #00d4ff;
  }
}

.toolbar-section {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.top-bar.mobile {
  .statistics-section {
    width: 100%;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .stat-item {
    flex: 0 0 auto;
    padding: 6px 0;
    
    .status-dot {
      width: 6px;
      height: 6px;
    }
    
    .stat-label {
      font-size: 12px;
    }
    
    .stat-value {
      font-size: 12px;
    }
  }
  
  .toolbar-section {
    width: 100%;
    justify-content: flex-end;
    
    .el-input {
      flex: 1;
      max-width: 180px;
    }
  }
}

.content-area {
  flex: 1;
  width: 100%;
  max-width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 4px;
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  
  .empty-image {
    max-width: 300px;
    width: 80%;
    height: auto;
    opacity: 0.6;
  }
}
</style>
