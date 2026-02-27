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
      <div class="realtime-alarm-content">
        <!-- 筛选条件 -->
        <div class="filter-bar" :class="{ 'mobile-filter-bar': isMobile }">
          <el-form :inline="!isMobile" :model="queryForm" :label-width="isMobile ? '80px' : 'auto'">
            <div class="filter-grid" :class="{ 'mobile-filter-grid': isMobile }">
              <!-- 基础筛选项（移动端始终显示） -->
              <el-form-item label="告警产生时间" class="date-range-item">
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
                <el-form-item label="告警等级">
                  <el-select v-model="queryForm.alarmLevel" placeholder="全部" :size="isMobile ? 'default' : 'default'">
                    <el-option label="全部" value="" />
                    <el-option label="严重" value="severe" />
                    <el-option label="警告" value="warning" />
                    <el-option label="一般" value="normal" />
                    <el-option label="提示" value="info" />
                  </el-select>
                </el-form-item>
                <el-form-item label="设备类型">
                  <el-select v-model="queryForm.deviceType" placeholder="请选择" :size="isMobile ? 'default' : 'default'">
                    <el-option label="全部" value="" />
                    <el-option label="逆变器" value="逆变器" />
                    <el-option label="电能表" value="电能表" />
                  </el-select>
                </el-form-item>
                <el-form-item label="确认状态">
                  <el-select v-model="queryForm.confirmStatus" placeholder="全部" :size="isMobile ? 'default' : 'default'">
                    <el-option label="全部" value="" />
                    <el-option label="未确认" value="unconfirmed" />
                    <el-option label="已确认" value="confirmed" />
                  </el-select>
                </el-form-item>
                <el-form-item label="告警设备">
                  <el-input v-model="queryForm.deviceName" placeholder="告警设备" :size="isMobile ? 'default' : 'default'" />
                </el-form-item>
                <el-form-item label="告警名称">
                  <el-input v-model="queryForm.alarmName" placeholder="告警名称" :size="isMobile ? 'default' : 'default'" />
                </el-form-item>
                <el-form-item label="聚合方式">
                  <el-select 
                    v-model="collectType" 
                    placeholder="聚合方式" 
                    :size="isMobile ? 'default' : 'default'"
                    :style="{ width: '100%' }"
                  >
                    <el-option label="不聚合" :value="0" />
                    <el-option label="按设备" :value="1" />
                    <el-option label="按告警名称" :value="2" />
                  </el-select>
                </el-form-item>
              </template>
            </div>
          
          <!-- 操作按钮组 -->
          <div class="action-buttons-section" :class="{ 'mobile-action-buttons': isMobile }">
            <el-button type="primary" @click="handleQuery" :size="isMobile ? 'default' : 'default'">
              搜索
            </el-button>
            <el-button :icon="Download" @click="handleExport" :size="isMobile ? 'default' : 'default'">
              导出
            </el-button>
            <el-button 
              @click="handleBatchClear" 
              :disabled="!selectedIds.length" 
              :size="isMobile ? 'default' : 'default'"
            >
              批量消除
            </el-button>
            <el-button 
              @click="handleBatchConfirm" 
              :disabled="!selectedIds.length" 
              :size="isMobile ? 'default' : 'default'"
            >
              批量确认
            </el-button>
            <el-button 
              @click="handleToWorkOrder" 
              :disabled="!selectedIds.length" 
              :size="isMobile ? 'default' : 'default'"
            >
              转工单
            </el-button>
            <!-- 移动端展开/折叠按钮 -->
            <el-button 
              v-if="isMobile"
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
        </el-form>
        </div>

        <!-- 数据表格 -->
        <div class="table-container">
          <el-table
            :data="tableData"
            v-loading="loading"
            border
            @selection-change="handleSelectionChange"
            height="100%"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="alarmLevel" label="告警等级" width="100">
              <template #default="{ row }">
                <el-tag :type="getLevelType(row.alarmLevel)">
                  {{ getLevelText(row.alarmLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="alarmName" label="告警名称" width="150" />
            <el-table-column prop="regionName" label="所属电站" width="150" />
            <el-table-column prop="deviceName" label="告警设备" width="150" />
            <el-table-column prop="deviceType" label="设备类型" width="100" />
            <el-table-column prop="alarmTime" label="告警产生时间" width="160" />
            <el-table-column prop="suggestion" label="处理建议" width="150" show-overflow-tooltip />
            <el-table-column prop="confirmStatus" label="确认状态" width="100">
              <template #default="{ row }">
                {{ getStatusText(row.confirmStatus) }}
              </template>
            </el-table-column>
            <el-table-column label="操作"  fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleDetail(row)">详情</el-button>
                <el-button link type="success" size="small" @click="handleConfirm(row)">确认</el-button>
                <el-button link type="danger" size="small" @click="handleClear(row)">消除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="isMobile ? [5, 10, 20] : [10, 20, 40, 100]"
          :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
          :small="isMobile"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </template>
  </DeviceMonitorLayout>

  <!-- 告警详情弹窗 -->
  <AlarmDetailDialog
    v-model:visible="alarmDetailVisible"
    :alarm-id="selectedAlarmId"
    @alarm-handled="handleAlarmHandled"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Download, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import AlarmDetailDialog from '@/pages/es/diagnosis/device-detail/AlarmDetailDialog.vue'
import { getAlarmList } from '@/api/alarm/realtime'
import type { AlarmRecord, CollectType } from '@/api/types/alarm/realtime'

// 状态
const selectedStationId = ref('LHYR98NH00000014')
const collectType = ref<CollectType>(0)
const dateRange = ref<[string, string]>([
  dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD')
])
const queryForm = ref({
  alarmLevel: '',
  deviceType: '',
  confirmStatus: '',
  deviceName: '',
  alarmName: ''
})
const tableData = ref<AlarmRecord[]>([])
const loading = ref(false)
const selectedIds = ref<string[]>([])
const pagination = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

// 移动端检测
const isMobile = ref(false)
// 筛选项展开状态（仅移动端有效）
const isFilterExpanded = ref(false)

// 检测是否为移动端
const checkIsMobile = () => {
  const newIsMobile = window.innerWidth <= 768
  if (isMobile.value !== newIsMobile) {
    isMobile.value = newIsMobile
    // 移动端调整分页大小
    if (newIsMobile) {
      pagination.value.pageSize = 10
    } else {
      pagination.value.pageSize = 20
    }
    // 桌面端时自动展开
    if (!newIsMobile) {
      isFilterExpanded.value = false
    }
  }
}

// 切换筛选项展开状态
const toggleFilterExpanded = () => {
  isFilterExpanded.value = !isFilterExpanded.value
}

// 告警详情弹窗状态
const alarmDetailVisible = ref(false)
const selectedAlarmId = ref('')

// 初始化数据
function initData() {
  selectedStationId.value = 'LHYR98NH00000014'
  handleQuery()
}

// 电站选择
function handleStationSelect(node: any) {
  selectedStationId.value = node.regionId || node.id
  handleQuery()
}

// 查询数据
async function handleQuery() {
  if (!selectedStationId.value) return
  
  loading.value = true
  try {
    const params = {
      collectType: collectType.value,
      type: 'real' as const,
      beginTime: dateRange.value[0],
      endTime: dateRange.value[1],
      regionId: selectedStationId.value,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      ...queryForm.value
    }
    
    const response = await getAlarmList(params)
    if (response.code === 200) {
      tableData.value = response.data.list
      pagination.value.total = response.data.total
    } else {
      ElMessage.error(response.message || '加载数据失败')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 表格选择变化
function handleSelectionChange(selection: AlarmRecord[]) {
  selectedIds.value = selection.map(item => item.id)
}

// 告警等级类型
function getLevelType(level: string) {
  const typeMap: Record<string, any> = {
    severe: 'danger',
    warning: 'warning',
    normal: 'success',
    info: 'info'
  }
  return typeMap[level] || 'info'
}

// 告警等级文本
function getLevelText(level: string) {
  const textMap: Record<string, string> = {
    severe: '严重',
    warning: '警告',
    normal: '一般',
    info: '提示'
  }
  return textMap[level]
}

// 状态文本
function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    unconfirmed: '未确认',
    confirmed: '已确认',
    cleared: '已消除'
  }
  return textMap[status]
}

// 详情
function handleDetail(row: AlarmRecord) {
  selectedAlarmId.value = row.id
  alarmDetailVisible.value = true
}

// 告警处理完成后的回调
function handleAlarmHandled() {
  // 重新加载告警数据
  handleQuery()
}

// 确认
function handleConfirm(row: AlarmRecord) {
  ElMessage.success(`已确认告警: ${row.alarmName}`)
}

// 消除
function handleClear(row: AlarmRecord) {
  ElMessage.success(`已消除告警: ${row.alarmName}`)
}

// 批量确认
function handleBatchConfirm() {
  ElMessage.success(`已批量确认 ${selectedIds.value.length} 条告警`)
}

// 批量消除
function handleBatchClear() {
  ElMessage.success(`已批量消除 ${selectedIds.value.length} 条告警`)
}

// 转工单
function handleToWorkOrder() {
  ElMessage.info('转工单功能开发中...')
}

// 导出
function handleExport() {
  ElMessage.info('导出功能开发中...')
}

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  initData()
})

// 组件卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.realtime-alarm-content {
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
      
      @media (max-width: 768px) {
        font-size: 13px;
      }
      
      @media (max-width: 480px) {
        font-size: 12px;
      }
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
  
  /* 操作按钮区域（在表单内） */
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
          margin-left: auto;
        }
      }
    }
    
    @media (max-width: 480px) {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      
      .el-button {
        flex: 0 0 auto;
        min-width: 70px;
        font-size: 13px;
        padding: 8px 12px;
        
        /* 展开折叠按钮特殊处理 */
        &[type="text"] {
          padding: 4px 8px;
          font-size: 12px;
          white-space: nowrap;
          min-width: auto;
        }
      }
    }
  }
  
  .table-container {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    
    /* 移动端表格优化 */
    @media (max-width: 768px) {
      :deep(.el-table) {
        font-size: 12px;
        
        .el-table__cell {
          padding: 8px 4px;
        }
        
        .el-table-column--selection .cell {
          padding: 4px;
        }
        
        .el-button--link {
          font-size: 12px;
          padding: 2px 4px;
        }
      }
    }
  }
  
  :deep(.el-pagination) {
    justify-content: center;
    
    @media (min-width: 769px) {
      justify-content: flex-end;
    }
  }
  
  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(10, 30, 50, 0.4);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 3px;
    transition: all 0.3s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 212, 255, 0.5);
  }
}

// Element Plus 组件样式覆盖
:deep(.el-select) {
  .el-input__wrapper {
    background: rgba(10, 30, 50, 0.6);
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: none;
    
    &:hover {
      border-color: rgba(0, 212, 255, 0.5);
    }
    
    &.is-focus {
      border-color: #00d4ff;
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
    }
  }
  
  .el-input__inner {
    color: #fff;
  }
}

:deep(.el-input) {
  .el-input__wrapper {
    background: rgba(10, 30, 50, 0.6);
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: none;
    
    &:hover {
      border-color: rgba(0, 212, 255, 0.5);
    }
    
    &.is-focus {
      border-color: #00d4ff;
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
    }
  }
  
  .el-input__inner {
    color: #fff;
  }
}

:deep(.el-date-picker) {
  .el-input__wrapper {
    background: rgba(10, 30, 50, 0.6);
    border-color: rgba(0, 212, 255, 0.3);
  }
}

:deep(.el-button) {
  &:not(.el-button--primary):not(.el-button--link) {
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

:deep(.el-table) {
  background: rgba(10, 30, 50, 0.4);
  color: rgba(255, 255, 255, 0.85);
  
  th.el-table__cell {
    background: rgba(0, 212, 255, 0.1);
    color: #00d4ff;
    border-color: rgba(0, 212, 255, 0.2);
  }
  
  tr {
    background: transparent;
    
    &:hover > td {
      background: rgba(0, 212, 255, 0.05);
    }
  }
  
  td.el-table__cell {
    border-color: rgba(0, 212, 255, 0.1);
  }
}

:deep(.el-pagination) {
  .btn-prev,
  .btn-next,
  .el-pager li {
    background: rgba(10, 30, 50, 0.6);
    border: 1px solid rgba(0, 212, 255, 0.3);
    color: rgba(255, 255, 255, 0.85);
    
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
  }
}
</style>
