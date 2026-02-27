<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree
        device-type="0917"
        @node-click="handleStationSelect"
      />
    </template>
    
    <!-- 右侧内容 -->
    <template #right>
      <div class="alarm-shield-content">
        <!-- Tab切换 -->
        <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="shield-tabs" :class="{ 'mobile-tabs': isMobile }">
          <el-tab-pane label="区域屏蔽" name="1" />
          <el-tab-pane label="设备屏蔽" name="2" />
          <el-tab-pane label="监控量屏蔽" name="3" />
        </el-tabs>

        <!-- 筛选条件 -->
        <div class="filter-bar" :class="{ 'mobile-filter-bar': isMobile }">
          <el-form :inline="!isMobile" :label-width="isMobile ? '80px' : 'auto'">
            <div class="filter-grid" :class="{ 'mobile-filter-grid': isMobile }">
              <!-- 基础筛选项（移动端始终显示） -->
              <el-form-item label="屏蔽时间" class="date-range-item">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :size="isMobile ? 'default' : 'default'"
                  :style="{ width: '100%' }"
                />
              </el-form-item>
              
              <!-- 高级筛选项（移动端可折叠） -->
              <template v-if="!isMobile || isFilterExpanded">
                <!-- 设备屏蔽和监控量屏蔽才有设备类型 -->
                <el-form-item v-if="activeTab !== '1'" label="设备类型">
                  <el-select 
                    v-model="queryForm.deviceType" 
                    placeholder="全部"
                    :size="isMobile ? 'default' : 'default'"
                    :style="{ width: '100%' }"
                  >
                    <el-option label="全部" value="" />
                    <el-option label="逆变器" value="逆变器" />
                    <el-option label="电能表" value="电能表" />
                  </el-select>
                </el-form-item>
                <!-- 设备屏蔽和监控量屏蔽才有设备名称 -->
                <el-form-item v-if="activeTab !== '1'" label="设备名称">
                  <el-input 
                    v-model="queryForm.deviceName" 
                    placeholder="请输入" 
                    :size="isMobile ? 'default' : 'default'"
                    :style="{ width: '100%' }"
                  />
                </el-form-item>
                <!-- 只有监控量屏蔽才有监控量 -->
                <el-form-item v-if="activeTab === '3'" label="监控量">
                  <el-input 
                    v-model="queryForm.meteName" 
                    placeholder="请输入" 
                    :size="isMobile ? 'default' : 'default'"
                    :style="{ width: '100%' }"
                  />
                </el-form-item>
              </template>
            </div>
          </el-form>
          
          <!-- 操作按钮组 -->
          <div class="action-buttons-section" :class="{ 'mobile-action-buttons': isMobile }">
            <el-button 
              type="primary" 
              @click="handleSearch"
              :size="isMobile ? 'default' : 'default'"
            >
              搜索
            </el-button>
            <el-button 
              type="primary"
              :size="isMobile ? 'default' : 'default'"
            >
              新增屏蔽
            </el-button>
            <el-button 
              type="danger" 
              :disabled="selectedRows.length === 0"
              :size="isMobile ? 'default' : 'default'"
            >
              批量删除
            </el-button>
            <!-- 移动端展开/折叠按钮 -->
            <el-button 
              v-if="isMobile && activeTab !== '1'"
              type="text" 
              @click="toggleFilterExpanded"
              :size="isMobile ? 'default' : 'small'"
            >
              {{ isFilterExpanded ? '收起筛选' : '展开筛选' }}
              <el-icon>
                <ArrowUp v-if="isFilterExpanded" />
                <ArrowDown v-else />
              </el-icon>
            </el-button>
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="table-container">
          <el-table
            :data="tableData"
            v-loading="loading"
            @selection-change="handleSelectionChange"
            height="100%"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="stationName" label="所属电站" width="150" />
            
            <!-- 区域屏蔽 -->
            <template v-if="activeTab === '1'">
              <el-table-column prop="stationPath" label="屏蔽区域" width="200" />
            </template>

            <!-- 设备屏蔽 -->
            <template v-if="activeTab === '2'">
              <el-table-column prop="deviceName" label="设备名称" width="180" />
              <el-table-column prop="deviceModelName" label="设备型号" width="150" />
            </template>

            <!-- 监控量屏蔽 -->
            <template v-if="activeTab === '3'">
              <el-table-column prop="deviceName" label="设备名称" width="180" />
              <el-table-column prop="meteName" label="监控量名称" width="150" />
            </template>

            <el-table-column prop="avoidStartTime" label="开始时间" width="120" />
            <el-table-column prop="avoidEndTime" label="结束时间" width="120" />
            <el-table-column prop="userName" label="创建人" width="100" />
            <el-table-column prop="remark" label="备注" width="150" />
            <el-table-column prop="reasonClearRealAlarm" label="消除原因" width="180" />
            
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small">
                  编辑
                </el-button>
                <el-button link type="danger" size="small">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="isMobile ? [5, 10, 20] : [10, 20, 50, 100]"
          :total="pagination.total"
          :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
          :small="isMobile"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import { getShieldList } from '@/api/alarm/shield';
import type { AlarmShieldRow, AvoidType } from '@/api/types/alarm/shield';

// 电站树数据
const selectedRegionId = ref('LHYR98NH00000001');

// Tab切换
const activeTab = ref<AvoidType>('1');

// 筛选条件
const dateRange = ref<[string, string]>(['2025-09-18', '2025-10-18']);
const queryForm = ref({
  deviceType: '',
  deviceName: '',
  meteName: '',
});

// 表格数据
const tableData = ref<AlarmShieldRow[]>([]);
const loading = ref(false);
const selectedRows = ref<AlarmShieldRow[]>([]);

// 分页
const pagination = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0,
});

// 移动端检测
const isMobile = ref(false);
// 筛选项展开状态（仅移动端有效）
const isFilterExpanded = ref(false);

// 检测是否为移动端
const checkIsMobile = () => {
  const newIsMobile = window.innerWidth <= 768;
  if (isMobile.value !== newIsMobile) {
    isMobile.value = newIsMobile;
    // 移动端调整分页大小
    if (newIsMobile) {
      pagination.value.pageSize = 10;
    } else {
      pagination.value.pageSize = 20;
    }
    // 桌面端时自动展开
    if (!newIsMobile) {
      isFilterExpanded.value = false;
    }
  }
};

// 切换筛选项展开状态
const toggleFilterExpanded = () => {
  isFilterExpanded.value = !isFilterExpanded.value;
};

/**
 * 初始化数据  
 */
function initData() {
  selectedRegionId.value = 'LHYR98NH00000001'
  handleSearch()
}

/**
 * 电站选择
 */
function handleStationSelect(node: any) {
  selectedRegionId.value = node.regionId || node.id
  handleSearch()
}

/**
 * Tab切换
 */
function handleTabChange(tab: string | number) {
  activeTab.value = tab as AvoidType;
  pagination.value.pageNum = 1;
  // 清空筛选条件
  queryForm.value = {
    deviceType: '',
    deviceName: '',
    meteName: '',
  };
  handleSearch();
}

/**
 * 搜索
 */
async function handleSearch() {
  loading.value = true;
  try {
    const params: any = {
      regionId: selectedRegionId.value,
      avoidType: activeTab.value,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      beginTime: dateRange.value?.[0],
      endTime: dateRange.value?.[1],
    };

    // 设备屏蔽和监控量屏蔽才有设备类型和设备名称
    if (activeTab.value !== '1') {
      params.deviceType = queryForm.value.deviceType;
      params.deviceName = queryForm.value.deviceName;
    }

    // 监控量屏蔽才有监控量
    if (activeTab.value === '3') {
      params.meteName = queryForm.value.meteName;
    }

    const response = await getShieldList(params);
    tableData.value = response.list;
    pagination.value.total = response.total;
  } catch (error) {
    console.error('Failed to load shield list:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 选择变更
 */
function handleSelectionChange(rows: AlarmShieldRow[]) {
  selectedRows.value = rows;
}

// 初始化
onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
  initData();
});

// 组件卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
});
</script>

<style scoped lang="scss">
.alarm-shield-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  gap: 16px;
  overflow: hidden;
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    padding: 12px;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    gap: 10px;
  }
  
  .filter-bar {
    background: rgba(10, 30, 50, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 6px;
    padding: 16px;
    
    /* 移动端适配 */
    &.mobile-filter-bar {
      padding: 12px;
    }
    
    @media (max-width: 768px) {
      padding: 12px;
    }
    
    @media (max-width: 480px) {
      padding: 10px;
    }
    
    :deep(.el-form-item) {
      margin-bottom: 8px;
      
      @media (max-width: 768px) {
        margin-bottom: 12px;
      }
    }
    
    :deep(.el-form-item__label) {
      color: rgba(255, 255, 255, 0.85);
    }
    
    .filter-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      align-items: end;
      
      /* 中等屏幕适配 */
      @media (max-width: 1400px) {
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }
      
      /* 平板端适配 */
      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }
      
      /* 移动端适配 */
      &.mobile-filter-grid {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      
      @media (max-width: 480px) {
        grid-template-columns: 1fr;
        gap: 10px;
      }
      
      /* 时间范围选择器最多占两列 */
      .date-range-item {
        @media (min-width: 1025px) {
          grid-column: span 2;
        }
        
        @media (max-width: 1024px) and (min-width: 769px) {
          grid-column: span 2;
        }
        
        @media (max-width: 768px) {
          grid-column: 1 / -1;
        }
      }
    }
  }
  
  /* 操作按钮区域 */
  .action-buttons-section {
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-top: 12px;
    
    .el-button {
      min-width: 100px;
    }
    
    /* 移动端适配 */
    &.mobile-action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .el-button {
        flex: 0 0 auto;
        min-width: 80px;
      }
    }
    
    @media (max-width: 768px) {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
      
      .el-button {
        flex: 0 0 auto;
        min-width: 80px;
        
        /* 展开折叠按钮特殊处理 */
        &[type="text"] {
          min-width: auto;
          padding: 4px 8px;
          flex-shrink: 0;
          white-space: nowrap;
        }
      }
    }
    
    @media (max-width: 480px) {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 6px;
      align-items: center;
      
      .el-button {
        font-size: 13px;
        padding: 8px 12px;
        
        /* 展开折叠按钮占据第三列，不换行 */
        &[type="text"] {
          grid-column: 3;
          min-width: auto;
          padding: 4px 8px;
          font-size: 12px;
          white-space: nowrap;
        }
        
        /* 前两个按钮占据前两列 */
        &:not([type="text"]) {
          min-width: 0;
        }
      }
    }
  }
  
  .table-container {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
}

// Tab样式
.shield-tabs {
  :deep(.el-tabs__header) {
    background: rgba(10, 30, 50, 0.4);
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    margin-bottom: 0;
    padding: 0 16px;
    
    @media (max-width: 768px) {
      padding: 0 12px;
    }
    
    @media (max-width: 480px) {
      padding: 0 8px;
    }
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    background-color: rgba(0, 212, 255, 0.3);
  }
  
  :deep(.el-tabs__item) {
    color: rgba(255, 255, 255, 0.7);
    border: none;
    
    @media (max-width: 768px) {
      font-size: 14px;
      padding: 0 12px;
    }
    
    @media (max-width: 480px) {
      font-size: 13px;
      padding: 0 8px;
    }
    
    &.is-active {
      color: #00d4ff;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    }
    
    &:hover {
      color: rgba(0, 212, 255, 0.8);
    }
  }
  
  :deep(.el-tabs__active-bar) {
    background-color: #00d4ff;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.6);
  }
  
  /* 移动端适配 */
  &.mobile-tabs {
    :deep(.el-tabs__header) {
      padding: 0 12px;
    }
    
    :deep(.el-tabs__item) {
      font-size: 14px;
      padding: 0 10px;
      
      @media (max-width: 480px) {
        font-size: 13px;
        padding: 0 8px;
      }
    }
  }
}

// el-select, el-input, el-date-picker 样式由全局样式控制

:deep(.el-button) {
  &:not(.el-button--primary):not(.el-button--danger):not(.el-button--link) {
    background: rgba(0, 212, 255, 0.1);
    border-color: rgba(0, 212, 255, 0.3);
    color: rgba(255, 255, 255, 0.85);
    
    &:hover {
      background: rgba(0, 212, 255, 0.2);
      border-color: #00d4ff;
      color: #fff;
    }
  }
}

// 表格内按钮响应式样式
:deep(.el-table) {
  .el-button {
    @media (max-width: 768px) {
      font-size: 12px;
      padding: 4px 8px;
    }
    
    @media (max-width: 480px) {
      font-size: 11px;
      padding: 3px 6px;
    }
  }
}

:deep(.el-pagination) {
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    justify-content: center;
    
    .el-pagination__sizes,
    .el-pagination__total,
    .el-pagination__jump {
      display: none;
    }
  }
  
  .btn-prev,
  .btn-next,
  .el-pager li {
    background: rgba(10, 30, 50, 0.6);
    border: 1px solid rgba(0, 212, 255, 0.3);
    color: rgba(255, 255, 255, 0.85);
    
    @media (max-width: 768px) {
      font-size: 13px;
      padding: 0 8px;
      min-width: 32px;
      height: 32px;
    }
    
    @media (max-width: 480px) {
      font-size: 12px;
      padding: 0 6px;
      min-width: 28px;
      height: 28px;
    }
    
    &:hover {
      color: #00d4ff;
      border-color: #00d4ff;
    }
    
    &.is-active {
      background: rgba(0, 212, 255, 0.3);
      border-color: #00d4ff;
      color: #fff;
    }
  }
  
  .el-pagination__total,
  .el-pagination__jump {
    color: rgba(255, 255, 255, 0.85);
    
    @media (max-width: 768px) {
      font-size: 13px;
    }
  }
}
</style>
