<template>
  <div class="history-alarm-tab">
    <!-- 筛选控制区 -->
    <div class="filter-section">
      <div class="filter-controls">
        <div class="filter-item">
          <span class="filter-label">告警等级</span>
          <el-select 
            v-model="filterForm.level" 
            placeholder="全部"
            size="small"
            style="width: 120px"
            @change="loadData"
          >
            <el-option label="全部" value="" />
            <el-option label="一般" value="1" />
            <el-option label="重要" value="2" />
            <el-option label="紧急" value="3" />
          </el-select>
        </div>
        
        <div class="filter-item">
          <span class="filter-label">告警产生时间</span>
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            size="small"
            style="width: 360px"
            @change="handleDateChange"
          />
        </div>
        
        <div class="filter-item">
          <span class="filter-label">告警消除时间</span>
          <el-date-picker
            v-model="eliminationDateRange"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            size="small"
            style="width: 360px"
            @change="handleEliminationDateChange"
          />
        </div>
        
        <div class="filter-item">
          <span class="filter-label">确认状态</span>
          <el-select 
            v-model="filterForm.isConfirm" 
            placeholder="全部"
            size="small"
            style="width: 120px"
            @change="loadData"
          >
            <el-option label="全部" :value="undefined" />
            <el-option label="未确认" :value="0" />
            <el-option label="已确认" :value="1" />
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
            <el-tag 
              :class="`alarm-level-tag alarm-level-${row.level || '1'}`"
              effect="dark"
            >
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="content" label="告警内容" min-width="150" show-overflow-tooltip />
        
        <el-table-column prop="position" label="告警位置" min-width="200" />
        
        <el-table-column prop="time" label="告警产生时间" width="160" align="center" />
        
        <el-table-column label="告警消除时间" width="160" align="center">
          <template #default="{ row }">
            {{ row.eliminationTime || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="suggest" label="处理建议" min-width="120" />
        
        <el-table-column label="确认状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag 
              :class="`confirm-status-tag confirm-status-${row.isConfirm || 0}`"
              effect="dark"
            >
              {{ row.isConfirm === 1 ? '已确认' : row.isConfirm === 2 ? '已消除' : '未确认' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column :label="isMobile ? '操作' : '操作'" :width="isMobile ? 80 : 220" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="!isMobile" class="action-buttons">
              <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
              <el-button
                v-if="row.isConfirm !== 1 && row.isConfirm !== 2"
                link
                type="success"
                @click="handleConfirmAlarm(row)"
              >
                确认
              </el-button>
              <el-button
                v-if="row.isConfirm !== 2"
                link
                type="danger"
                @click="handleEliminateAlarm(row)"
              >
                消除
              </el-button>
            </div>
            <el-dropdown
              v-else
              trigger="click"
              @command="(cmd) => handleActionCommand(cmd, row)"
            >
              <el-button link type="primary" :icon="MoreFilled" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="detail">详情</el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.isConfirm !== 1 && row.isConfirm !== 2"
                    command="confirm"
                  >
                    确认
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.isConfirm !== 2"
                    command="eliminate"
                  >
                    消除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页控制 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        :layout="paginationLayout"
        :pager-count="isMobile ? 3 : 7"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <!-- 告警详情弹窗 -->
    <AlarmDetailDialog
      v-model:visible="alarmDetailVisible"
      :alarm-id="selectedAlarmId"
      :alarm-level="selectedAlarmLevel"
      @alarm-handled="handleAlarmHandled"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MoreFilled } from '@element-plus/icons-vue'
import { getDeviceHistoryAlarms, confirmAlarm, eliminateAlarm } from '@/api/alarm/history'
import type { DeviceAlarmItem } from '@/api/types/alarm/history'
import AlarmDetailDialog from './AlarmDetailDialog.vue'

interface Props {
  deviceId: string
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true
})

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  if (props.visible && props.deviceId) {
    loadData()
  }
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

// 数据
const alarmList = ref<DeviceAlarmItem[]>([])
const loading = ref(false)
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})
const dateRange = ref<[string, string] | null>(null)
const eliminationDateRange = ref<[string, string] | null>(null)
const filterForm = ref({
  level: '',
  isConfirm: undefined as number | undefined
})

// 告警详情弹窗状态
const alarmDetailVisible = ref(false)
const selectedAlarmId = ref<number | null>(null)
const selectedAlarmLevel = ref<string>('')

/**
 * 搜索告警数据
 */
const handleSearch = async () => {
  pagination.value.page = 1
  await loadData()
}

/**
 * 加载数据
 */
async function loadData() {
  if (!props.deviceId) {
    return
  }

  loading.value = true
  try {
    const params: any = {
      deviceId: props.deviceId,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }

    // 添加可选筛选参数
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    if (eliminationDateRange.value && eliminationDateRange.value[0] && eliminationDateRange.value[1]) {
      params.eliminationStartTime = eliminationDateRange.value[0]
      params.eliminationEndTime = eliminationDateRange.value[1]
    }
    if (filterForm.value.level) {
      params.level = filterForm.value.level
    }
    if (filterForm.value.isConfirm !== undefined) {
      params.isConfirm = filterForm.value.isConfirm
    }

    const response = await getDeviceHistoryAlarms(params)

    if (response.success && response.code === 200) {
      alarmList.value = response.result?.data || []
      pagination.value.total = response.result?.total || 0
    } else {
      ElMessage.error(response.message || '加载历史告警失败')
      alarmList.value = []
      pagination.value.total = 0
    }
  } catch (error: any) {
    console.error('加载历史告警失败:', error)
    ElMessage.error('加载历史告警失败')
    alarmList.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

/**
 * 获取告警等级样式类
 */
const getAlarmLevelClass = (level: string): string => {
  switch (level) {
    case '3':
      return 'level-critical'
    case '2':
      return 'level-warning'
    case '1':
      return 'level-info'
    default:
      return 'level-default'
  }
}

/**
 * 获取告警等级文本
 */
function getLevelText(level: string) {
  const textMap: Record<string, string> = {
    '1': '一般',
    '2': '重要',
    '3': '紧急'
  }
  return textMap[level] || '未知'
}

/**
 * 获取确认状态样式类
 */
const getConfirmStatusClass = (isConfirm: number): string => {
  return isConfirm === 1 ? 'status-confirmed' : 'status-pending'
}

/**
 * 获取表格行样式类
 */
const getRowClassName = ({ row }: { row: DeviceAlarmItem }): string => {
  if (row.level === '3') {
    return 'critical-row'
  }
  return ''
}

/**
 * 查看告警详情
 */
const handleViewDetail = (alarm: DeviceAlarmItem) => {
  if (!alarm.id) {
    ElMessage.warning('无法获取告警ID')
    return
  }
  selectedAlarmId.value = alarm.id
  selectedAlarmLevel.value = alarm.level
  alarmDetailVisible.value = true
}

/**
 * 告警处理完成回调
 */
const handleAlarmHandled = () => {
  // 重新加载数据
  loadData()
}

/**
 * 告警确认
 */
const handleConfirmAlarm = async (alarm: DeviceAlarmItem) => {
  if (!alarm.id) {
    ElMessage.warning('无法获取告警ID')
    return
  }

  try {
    const { value: comment } = await ElMessageBox.prompt(
      '请输入确认意见',
      '告警确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请输入确认意见...'
      }
    )

    const response = await confirmAlarm({
      id: alarm.id,
      confirmOpinions: comment || '已确认'
    })

    if (response.success && response.code === 200) {
      ElMessage.success('告警确认成功')
      await loadData()
    } else {
      ElMessage.error(response.message || '告警确认失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '告警确认失败')
    }
  }
}

/**
 * 消除告警
 */
const handleEliminateAlarm = async (alarm: DeviceAlarmItem) => {
  if (!alarm.id) {
    ElMessage.warning('无法获取告警ID')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定要消除此告警吗？',
      '手动消除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await eliminateAlarm({
      id: alarm.id
    })

    if (response.success && response.code === 200) {
      ElMessage.success('告警消除成功')
      await loadData()
    } else {
      ElMessage.error(response.message || '告警消除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '告警消除失败')
    }
  }
}

/**
 * 移动端操作菜单
 */
const handleActionCommand = (command: string, row: DeviceAlarmItem) => {
  switch (command) {
    case 'detail':
      handleViewDetail(row)
      break
    case 'confirm':
      handleConfirmAlarm(row)
      break
    case 'eliminate':
      handleEliminateAlarm(row)
      break
    default:
      break
  }
}

/**
 * 处理日期变化
 */
function handleDateChange() {
  pagination.value.page = 1
  loadData()
}

/**
 * 处理消除日期变化
 */
function handleEliminationDateChange() {
  pagination.value.page = 1
  loadData()
}

/**
 * 重置筛选条件
 */
function resetFilter() {
  dateRange.value = null
  eliminationDateRange.value = null
  filterForm.value = {
    level: '',
    isConfirm: undefined
  }
  pagination.value.page = 1
  loadData()
}

// 监听props变化
watch(() => props.deviceId, () => {
  if (props.visible && props.deviceId) {
    pagination.value.page = 1
    loadData()
  }
})

watch(() => props.visible, (visible) => {
  if (visible && props.deviceId && alarmList.value.length === 0) {
    loadData()
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
          // 颜色由全局样式控制
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }
      }

      // el-select 和 el-date-editor 样式由全局样式控制

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

    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
      align-items: center;
    }

    // 表格中告警等级标签样式
    :deep(.alarm-level-tag) {
      font-size: 14px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
      border-top: none !important;
      border-bottom: none !important;
      border-left: 1px solid;
      border-right: 1px solid;
      
      &.alarm-level-1 {
        color: #66b3ff !important; // 一般 - 浅蓝色
        background: rgba(102, 179, 255, 0.1) !important; // 90%透明
        border-left-color: #66b3ff !important;
        border-right-color: #66b3ff !important;
        box-shadow: 0 0 8px rgba(102, 179, 255, 0.6);
      }
      
      &.alarm-level-2 {
        color: #ffb800 !important; // 重要 - 黄色
        background: rgba(255, 184, 0, 0.1) !important; // 90%透明
        border-left-color: #ffb800 !important;
        border-right-color: #ffb800 !important;
        box-shadow: 0 0 8px rgba(255, 184, 0, 0.6);
      }
      
      &.alarm-level-3 {
        color: #ff4444 !important; // 紧急 - 红色
        background: rgba(255, 68, 68, 0.1) !important; // 90%透明
        border-left-color: #ff4444 !important;
        border-right-color: #ff4444 !important;
        box-shadow: 0 0 8px rgba(255, 68, 68, 0.6);
      }
    }

    // 表格中确认状态标签样式
    :deep(.confirm-status-tag) {
      font-size: 14px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
      border-top: none !important;
      border-bottom: none !important;
      border-left: 1px solid;
      border-right: 1px solid;
      
      &.confirm-status-0 {
        color: #ffb800 !important; // 未确认 - 橙黄色
        background: rgba(255, 184, 0, 0.1) !important; // 90%透明
        border-left-color: #ffb800 !important;
        border-right-color: #ffb800 !important;
        box-shadow: 0 0 8px rgba(255, 184, 0, 0.6);
      }
      
      &.confirm-status-1 {
        color: #27ae60 !important; // 已确认 - 绿色
        background: rgba(39, 174, 96, 0.1) !important; // 90%透明
        border-left-color: #27ae60 !important;
        border-right-color: #27ae60 !important;
        box-shadow: 0 0 8px rgba(39, 174, 96, 0.6);
      }
      
      &.confirm-status-2 {
        color: #95a5a6 !important; // 已消除 - 灰色
        background: rgba(149, 165, 166, 0.1) !important; // 90%透明
        border-left-color: #95a5a6 !important;
        border-right-color: #95a5a6 !important;
        box-shadow: 0 0 8px rgba(149, 165, 166, 0.6);
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

      // el-select 样式由全局样式控制
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

