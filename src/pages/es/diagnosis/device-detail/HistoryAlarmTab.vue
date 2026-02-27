<template>
  <div class="history-alarm-tab">
    <!-- 筛选控制区 -->
    <div class="filter-section">
      <div class="filter-controls">
        <div class="filter-item">
          <span class="filter-label">告警等级</span>
          <el-select 
            v-model="filterParams.alarmLevel" 
            placeholder="全部"
            size="small"
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="严重" value="严重" />
            <el-option label="警告" value="警告" />
            <el-option label="提示" value="提示" />
          </el-select>
        </div>
        
        <div class="filter-item">
          <span class="filter-label">告警产生时间</span>
          <el-date-picker
            v-model="startTime"
            type="datetime"
            placeholder="开始时间"
            size="small"
            style="width: 160px"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleSearch"
          />
        </div>
        
        <div class="filter-item">
          <span class="filter-label">结束时间</span>
          <el-date-picker
            v-model="endTime"
            type="datetime"
            placeholder="结束时间"
            size="small"
            style="width: 160px"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleSearch"
          />
        </div>
        
        <div class="filter-item">
          <span class="filter-label">确认状态</span>
          <el-select 
            v-model="filterParams.confirmStatus" 
            placeholder="全部"
            size="small"
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="待确认" value="待确认" />
            <el-option label="已确认" value="已确认" />
          </el-select>
        </div>
        
        <el-button 
          type="primary" 
          size="small" 
          @click="handleSearch"
          :loading="loading"
        >
          搜索
        </el-button>
      </div>
    </div>

    <!-- 告警表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="alarmList"
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <el-table-column label="告警等级" width="100" align="center">
          <template #default="{ row }">
            <span 
              class="alarm-level"
              :class="getAlarmLevelClass(row.alarmLevel)"
            >
              {{ row.alarmLevel }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="alarmName" label="告警名称" min-width="150" />
        
        <el-table-column prop="alarmLocation" label="告警位置" min-width="200" />
        
        <el-table-column prop="alarmDevice" label="告警设备" width="120" align="center" />
        
        <el-table-column prop="alarmTime" label="告警产生时间" width="160" align="center" />
        
        <el-table-column label="告警消除时间" width="160" align="center">
          <template #default="{ row }">
            {{ row.clearTime || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="suggestion" label="处理建议" min-width="120" />
        
        <el-table-column label="确认状态" width="100" align="center">
          <template #default="{ row }">
            <span 
              class="confirm-status"
              :class="getConfirmStatusClass(row.confirmStatusColor)"
            >
              {{ row.confirmStatus }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页控制 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        :layout="paginationLayout"
        :pager-count="isMobile ? 3 : 7"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 告警详情弹窗 -->
    <AlarmDetailDialog
      v-model:visible="detailDialogVisible"
      :alarm-id="selectedAlarmId"
      @alarm-handled="handleAlarmHandled"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getDeviceAlarms } from '@/api/diagnosis/deviceDetail'
import type { AlarmInfo, AlarmFilterParams } from '@/api/types/diagnosis/deviceDetail'
import AlarmDetailDialog from './AlarmDetailDialog.vue'

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

// 分页布局
const paginationLayout = computed(() => {
  return isMobile.value 
    ? 'total, prev, pager, next'
    : 'total, sizes, prev, pager, next, jumper'
})

interface Props {
  deviceId: string
  visible: boolean
}

const props = defineProps<Props>()

// 响应式数据
const loading = ref(false)
const alarmList = ref<AlarmInfo[]>([])
const startTime = ref<string>('')
const endTime = ref<string>('')
const detailDialogVisible = ref(false)
const selectedAlarmId = ref<string>('')

// 筛选参数
const filterParams = reactive<AlarmFilterParams>({
  deviceId: '',
  alarmType: 'history',
  alarmLevel: '',
  confirmStatus: '',
  startTime: '',
  endTime: '',
  page: 1,
  pageSize: 20
})

// 分页参数
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

/**
 * 获取告警等级样式类
 */
const getAlarmLevelClass = (level: string): string => {
  switch (level) {
    case '严重':
      return 'level-critical'
    case '警告':
      return 'level-warning'
    case '提示':
      return 'level-info'
    default:
      return 'level-default'
  }
}

/**
 * 获取确认状态样式类
 */
const getConfirmStatusClass = (color: string): string => {
  switch (color) {
    case 'green':
      return 'status-confirmed'
    case 'orange':
      return 'status-pending'
    default:
      return 'status-default'
  }
}

/**
 * 获取表格行样式类
 */
const getRowClassName = ({ row }: { row: AlarmInfo }): string => {
  if (row.alarmLevel === '严重') {
    return 'critical-row'
  }
  return ''
}

/**
 * 搜索告警数据
 */
const handleSearch = async () => {
  filterParams.startTime = startTime.value
  filterParams.endTime = endTime.value
  filterParams.page = 1
  pagination.current = 1
  await fetchAlarmData()
}

/**
 * 获取告警数据
 */
const fetchAlarmData = async () => {
  if (!props.deviceId) return
  
  try {
    loading.value = true
    filterParams.deviceId = props.deviceId
    filterParams.page = pagination.current
    filterParams.pageSize = pagination.pageSize
    
    const response = await getDeviceAlarms(filterParams)
    
    if (response.success && response.data) {
      alarmList.value = response.data.alarms
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    console.error('获取历史告警数据失败:', error)
    ElMessage.error('获取历史告警数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理分页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchAlarmData()
}

/**
 * 处理当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchAlarmData()
}

/**
 * 查看告警详情
 */
const handleViewDetail = (alarm: AlarmInfo) => {
  selectedAlarmId.value = alarm.alarmId
  detailDialogVisible.value = true
}

/**
 * 告警处理完成回调
 */
const handleAlarmHandled = () => {
  // 刷新告警列表
  fetchAlarmData()
}

// 监听弹窗显示状态
watch(() => props.visible, (visible) => {
  if (visible && props.deviceId) {
    fetchAlarmData()
  }
})

// 监听设备ID变化
watch(() => props.deviceId, (deviceId) => {
  if (deviceId && props.visible) {
    filterParams.deviceId = deviceId
    fetchAlarmData()
  }
})

// 组件挂载时获取数据
onMounted(() => {
  if (props.visible && props.deviceId) {
    filterParams.deviceId = props.deviceId
    fetchAlarmData()
  }
})
</script>

<style scoped lang="scss">
.history-alarm-tab {
  padding: 20px;
  background: #0d2344;
  color: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;

  .filter-section {
    margin-bottom: 20px;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #34495e;

    .filter-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      align-items: center;

      .filter-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .filter-label {
          color: #00d4ff;  // 主题青色，提高可读性
          font-size: 14px;
          font-weight: 500;  // 增加字体重量提高清晰度
          white-space: nowrap;
        }
      }

      :deep(.el-select) {
        .el-input__inner {
          background: #0d2344;
          border-color: #0d2344;
          color: #ffffff;
        }
      }

      :deep(.el-date-editor) {
        .el-input__inner {
          background: #0d2344;
          border-color: #0d2344;
          color: #ffffff;
        }
      }

      :deep(.el-button--primary) {
        background: #1680ca;
        border-color: #00d4ff;
        
        &:hover {
          background: #0099cc;
          border-color: #0099cc;
        }
      }
    }
  }

  .table-section {
    flex: 1;
    overflow: hidden;

    :deep(.el-table) {
      background: transparent;
      
      .el-table__body-wrapper {
        background: transparent;
      }

      .el-table__row {
        background: rgba(0, 212, 255, 0.15);
        
        &:hover {
          background: rgba(0, 212, 255, 0.35) !important;  // 主题青色hover效果
        }

        &.critical-row {
          background: rgba(231, 76, 60, 0.2) !important;
        }
      }

      .el-table__header {
        background: rgba(0, 212, 255, 0.15);
      }

      .el-table__cell {
        border-color: #2c3e50;
      }
    }

    .alarm-level {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;

      &.level-critical {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        border: 1px solid #e74c3c;
      }

      &.level-warning {
        background: rgba(243, 156, 18, 0.2);
        color: #f39c12;
        border: 1px solid #f39c12;
      }

      &.level-info {
        background: rgba(52, 152, 219, 0.2);
        color: #3498db;
        border: 1px solid #3498db;
      }

      &.level-default {
        background: rgba(149, 165, 166, 0.2);
        color: #95a5a6;
        border: 1px solid #95a5a6;
      }
    }

    .confirm-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;

      &.status-confirmed {
        background: rgba(39, 174, 96, 0.2);
        color: #27ae60;
        border: 1px solid #27ae60;
      }

      &.status-pending {
        background: rgba(243, 156, 18, 0.2);
        color: #f39c12;
        border: 1px solid #f39c12;
      }

      &.status-default {
        background: rgba(149, 165, 166, 0.2);
        color: #95a5a6;
        border: 1px solid #95a5a6;
      }
    }
  }

  .pagination-section {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    :deep(.el-pagination) {
      .el-pager li {
        background: rgba(0, 212, 255, 0.15);
        color: #ffffff;
        border: 1px solid #34495e;

        &:hover {
          background: rgba(0, 212, 255, 0.35);  // 主题青色hover效果
        }

        &.active {
          background: #1680ca;
          color: #ffffff;
        }
      }

      .btn-prev,
      .btn-next {
        background: rgba(0, 212, 255, 0.15);
        color: #ffffff;
        border: 1px solid #34495e;

        &:hover {
          background: rgba(0, 212, 255, 0.35);  // 主题青色hover效果
        }
      }

      .el-select .el-input {
        .el-input__inner {
          background: rgba(0, 212, 255, 0.15);
          color: #ffffff;
          border-color: #34495e;
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .history-alarm-tab {
    padding: 12px;
    
    .filter-section {
      flex-direction: column;
      margin-bottom: 15px;
      padding: 10px;
      background: rgba(0, 30, 60, 0.9);
      border-radius: 8px;
      
      .filter-controls {
        flex-direction: column;
        gap: 10px;
        width: 100%;
        
        .filter-item {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          
          .filter-label {
            font-size: 12px;
            display: block;
          }
          
          :deep(.el-select),
          :deep(.el-date-picker),
          :deep(.el-input) {
            width: 100% !important;
            
            .el-input__wrapper {
              width: 100%;
            }
          }
        }
        
        .el-button {
          width: 100%;
          font-size: 12px;
          margin-top: 4px;
        }
      }
      
      .batch-operations {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
        
        .el-button {
          width: 100%;
          font-size: 12px;
        }
      }
    }
    
    .table-section {
      flex: none !important;
      overflow-x: auto !important;
      overflow-y: visible !important;
      -webkit-overflow-scrolling: touch;
      margin-bottom: 15px;
      height: auto !important;
      
      :deep(.el-table) {
        font-size: 11px;
        min-width: 600px;
        
        .el-table__cell {
          padding: 6px 4px;
        }
        
        .el-table__header {
          .el-table__cell {
            font-size: 12px;
          }
        }
      }
    }
    
    .pagination-section {
      padding: 10px;
      
      :deep(.el-pagination) {
        flex-wrap: wrap;
        justify-content: center;
        gap: 6px;
        font-size: 12px;
        
        .el-pagination__total {
          font-size: 11px;
          flex-basis: 100%;
          text-align: center;
          margin-bottom: 6px;
        }
        
        .btn-prev,
        .btn-next {
          min-width: 32px;
          font-size: 11px;
        }
        
        .el-pager {
          li {
            min-width: 28px;
            height: 28px;
            line-height: 28px;
            font-size: 11px;
          }
        }
      }
    }
  }
}
</style>
