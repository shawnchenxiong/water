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
                  type="datetimerange"
                  range-separator="-"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  :size="isMobile ? 'default' : 'default'"
                  :style="{ width: '100%' }"
                  :shortcuts="dateShortcuts"
                  @change="handleDateChange"
                />
              </el-form-item>
              
              <!-- 高级筛选项（移动端可折叠） -->
              <template v-if="!isMobile || isFilterExpanded">
                <el-form-item label="告警等级">
                  <el-select v-model="queryForm.alarmLevel" placeholder="全部" :size="isMobile ? 'default' : 'default'">
                    <el-option label="全部" value="" />
                    <el-option label="一般" value="1" />
                    <el-option label="重要" value="2" />
                    <el-option label="紧急" value="3" />
                  </el-select>
                </el-form-item>
                <el-form-item label="设备类型">
                  <el-select v-model="queryForm.deviceType" placeholder="请选择" :size="isMobile ? 'default' : 'default'">
                    <el-option label="全部" value="" />
                    <el-option
                      v-for="item in deviceTypeOptions"
                      :key="item.value"
                      :label="item.name"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="确认状态">
                  <el-select 
                    v-model="queryForm.confirmStatus" 
                    placeholder="全部" 
                    :size="isMobile ? 'default' : 'default'"
                    @change="handleQuery"
                  >
                    <el-option label="全部" value="" />
                    <el-option label="未确认" value="0" />
                    <el-option label="已确认" value="1" />
                  </el-select>
                </el-form-item>
                <el-form-item label="告警设备">
                  <el-input v-model="queryForm.deviceName" placeholder="告警设备" :size="isMobile ? 'default' : 'default'" />
                </el-form-item>
                <el-form-item label="告警名称">
                  <el-input v-model="queryForm.alarmName" placeholder="告警名称" :size="isMobile ? 'default' : 'default'" />
                </el-form-item>
              </template>
            </div>
          </el-form>
          
          <!-- 操作按钮组 -->
          <div class="action-buttons-section" :class="{ 'mobile-action-buttons': isMobile }">
            <!-- 左侧按钮组 -->
            <div class="left-buttons">
              <el-button type="primary" @click="handleQuery" :size="isMobile ? 'default' : 'default'">
                搜索
              </el-button>
              <el-button @click="handleReset" :size="isMobile ? 'default' : 'default'">
                重置
              </el-button>
              <el-button :icon="Download" @click="handleExport" :size="isMobile ? 'default' : 'default'">
                导出
              </el-button>
            </div>
            
            <!-- 右侧按钮组 -->
            <div class="right-buttons">
              <!-- 批量操作按钮 -->
              <el-button 
                @click="handleBatchConfirm"
                :disabled="!canBatchConfirm || selectedRows.length === 0"
                :size="isMobile ? 'default' : 'default'"
              >
                批量确认
              </el-button>
              <el-button 
                @click="handleBatchEliminate"
                :disabled="!canBatchEliminate || selectedRows.length === 0"
                :size="isMobile ? 'default' : 'default'"
              >
                批量消除
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
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="table-container">
          <el-table 
            :data="tableData" 
            v-loading="loading" 
            border 
            height="100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" :selectable="checkSelectable" />
            <el-table-column prop="level" label="告警等级" width="100">
              <template #default="{ row }">
                <el-tag :class="`alarm-level-tag alarm-level-${getLevelNumber(row.level)}`" effect="dark">
                  {{ getLevelText(row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="告警名称" width="150" show-overflow-tooltip />
            <el-table-column prop="factoryName" label="所属电站" width="150" />
            <el-table-column prop="deviceName" label="告警设备" width="150">
              <template #default="{ row }">
                <el-button 
                  link 
                  type="primary" 
                  @click="handleDeviceClick(row)"
                  class="device-name-link"
                >
                  {{ row.deviceName }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="deviceType" label="设备类型" width="100" />
            <el-table-column prop="time" label="告警产生时间" width="180" />
            <el-table-column prop="suggest" label="处理建议" />
            <el-table-column prop="isConfirm" label="确认状态" width="100">
              <template #default="{ row }">
                <el-tag :class="`confirm-status-tag confirm-status-${row.isConfirm}`" effect="dark">
                  {{ getStatusText(row.isConfirm) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" :width="isMobile ? 50 : 180" fixed="right">
              <template #default="{ row }">
                <!-- PC端：显示按钮 -->
                <div v-if="!isMobile" class="action-buttons">
                  <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
                  <el-button 
                    v-if="row.isConfirm !== 1 && row.isConfirm !== 2"
                    link 
                    type="success" 
                    @click="handleConfirm(row)"
                  >
                    确认
                  </el-button>
                  <el-button 
                    v-if="row.isConfirm !== 2 && !row.eliminationTime"
                    link 
                    type="danger" 
                    @click="handleEliminate(row)"
                  >
                    消除
                  </el-button>
                </div>
                <!-- 移动端：下拉菜单 -->
                <el-dropdown v-else trigger="click" @command="(cmd) => handleActionCommand(cmd, row)">
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
                        v-if="row.isConfirm !== 2 && !row.eliminationTime"
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
    :alarm-level="selectedAlarmLevel"
    :alarm-time="selectedAlarmTime"
    @alarm-handled="handleAlarmHandled"
  />

  <!-- 设备详情弹窗 -->
  <DeviceDetailDialog
    v-model:visible="deviceDetailVisible"
    :device-id="selectedDeviceId"
    :device-name="selectedDeviceName"
    :device-type="selectedDeviceType"
    :factory-name="selectedFactoryName"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Download, ArrowUp, ArrowDown, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import AlarmDetailDialog from '../components/AlarmDetailDialog.vue'
import DeviceDetailDialog from '../components/DeviceDetailDialog.vue'
import { getHistoryAlarmList, confirmAlarm, eliminateAlarm, getDeviceTypeList, type DeviceTypeOption } from '@/api/alarm/history'
import type { OperationLogItem } from '@/api/types/alarm/history'
import type { StationTreeNode } from '@/types/station'

// 状态
const selectedStationId = ref<string | undefined>(undefined)
const factoryId = ref<number | undefined>(undefined)
const dateRange = ref<[string, string]>([
  dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
  dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
])
const queryForm = ref({
  alarmLevel: '',
  deviceType: '',
  confirmStatus: '', 
  deviceName: '',
  alarmName: ''
})
const tableData = ref<OperationLogItem[]>([])
const loading = ref(false)
const pagination = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0
})
// 设备类型列表
const deviceTypeOptions = ref<DeviceTypeOption[]>([])

// 批量操作相关
const selectedRows = ref<OperationLogItem[]>([])

// 计算是否可以批量确认（至少有一个未确认且未消除的告警）
const canBatchConfirm = computed(() => {
  return selectedRows.value.some(row => 
    row.isConfirm !== 1 && row.isConfirm !== 2
  )
})

// 计算是否可以批量消除（至少有一个未消除的告警）
const canBatchEliminate = computed(() => {
  return selectedRows.value.some(row => row.isConfirm !== 2)
})

// 移动端检测
const isMobile = ref(false)
// 筛选项展开状态（仅移动端有效）
const isFilterExpanded = ref(false)

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一月',
    value: () => {
      const end = dayjs().endOf('day')
      const start = dayjs().subtract(1, 'month').startOf('day')
      return [start.format('YYYY-MM-DD HH:mm:ss'), end.format('YYYY-MM-DD HH:mm:ss')]
    }
  },
  {
    text: '最近三月',
    value: () => {
      const end = dayjs().endOf('day')
      const start = dayjs().subtract(3, 'month').startOf('day')
      return [start.format('YYYY-MM-DD HH:mm:ss'), end.format('YYYY-MM-DD HH:mm:ss')]
    }
  },
  {
    text: '最近一年',
    value: () => {
      const end = dayjs().endOf('day')
      const start = dayjs().subtract(1, 'year').startOf('day')
      return [start.format('YYYY-MM-DD HH:mm:ss'), end.format('YYYY-MM-DD HH:mm:ss')]
    }
  }
]

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
const selectedAlarmId = ref<number | null>(null)
const selectedAlarmLevel = ref<string>('')
const selectedAlarmTime = ref<string>('')

// 设备详情弹窗状态
const deviceDetailVisible = ref(false)
const selectedDeviceId = ref<string>('')
const selectedDeviceName = ref<string>('')
const selectedDeviceType = ref<string>('')
const selectedFactoryName = ref<string>('')

// 加载设备类型列表
async function loadDeviceTypeList() {
  try {
    const list = await getDeviceTypeList()
    deviceTypeOptions.value = list
  } catch (error) {
    console.error('加载设备类型列表失败:', error)
  }
}

// 初始化数据
function initData() {
  loadDeviceTypeList()
  handleQuery()
}

// 电站选择
function handleStationSelect(node: StationTreeNode) {
  selectedStationId.value = node.regionId
  // 设置 factoryId（优先使用 factoryId，如果没有则使用 regionId）
  factoryId.value = node.factoryId || (node.regionId ? Number(node.regionId) : undefined)
  handleQuery()
}

// 日期变化处理（当用户在日期选择器中点击确认后触发）
function handleDateChange() {
  // 重置分页到第一页
  pagination.value.pageNum = 1
  // 触发查询
  handleQuery()
}

// 查询数据
async function handleQuery() {
  loading.value = true
  try {
    const params: any = {
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      factoryId: factoryId.value,
      alarmLevel: queryForm.value.alarmLevel || undefined,
      deviceType: queryForm.value.deviceType || undefined,
      confirmStatus: queryForm.value.confirmStatus || undefined,
      deviceName: queryForm.value.deviceName || undefined,
      alarmName: queryForm.value.alarmName || undefined,
      isReal: 1
    }
    
    // 只有当时间范围存在时才添加时间参数
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      // 日期时间选择器已经包含时间，直接使用
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    
    const response = await getHistoryAlarmList(params)
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

// 告警等级数字（用于 class）
function getLevelNumber(level: string | number) {
  const levelNum = typeof level === 'string' ? parseInt(level) : level
  return levelNum || 1
}

// 告警等级文本（level 是字符串类型 "1" | "2" | "3"）
function getLevelText(level: string | number) {
  const levelNum = typeof level === 'string' ? parseInt(level) : level
  const textMap: Record<number, string> = {
    1: '一般',
    2: '重要',
    3: '紧急'
  }
  return textMap[levelNum] || '未知'
}

// 状态文本（使用原始数字字段）
function getStatusText(status: number) {
  const textMap: Record<number, string> = {
    0: '未确认',
    1: '已确认',
    2: '已消除'
  }
  return textMap[status] || '未知'
}

// 详情
function handleDetail(row: OperationLogItem) {
  // OperationLogItem 的 id 是 number | undefined
  if (!row.id) {
    ElMessage.warning('无法获取告警ID')
    return
  }
  selectedAlarmId.value = row.id
  // OperationLogItem 的 level 是字符串类型 "1" | "2" | "3"
  selectedAlarmLevel.value = row.level || '1'
  // 传递告警产生时间
  selectedAlarmTime.value = row.time || ''
  alarmDetailVisible.value = true
}

// 设备点击处理
function handleDeviceClick(row: OperationLogItem) {
  // 优先使用设备ID，如果没有则使用设备名称
  selectedDeviceId.value = row.deviceId || row.deviceName
  selectedDeviceName.value = row.deviceName
  selectedDeviceType.value = row.deviceType
  selectedFactoryName.value = row.factoryName || ''
  deviceDetailVisible.value = true
}

// 消除告警
async function handleEliminate(row: OperationLogItem) {
  // OperationLogItem 的 id 是 number | undefined
  if (!row.id) {
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
      id: row.id
    })

    if (response.success && response.code === 200) {
      ElMessage.success('告警消除成功')
      // 重新加载数据
      handleQuery()
    } else {
      ElMessage.error(response.message || '告警消除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '告警消除失败')
    }
  }
}

// 确认告警
async function handleConfirm(row: OperationLogItem) {
  // OperationLogItem 的 id 是 number | undefined
  if (!row.id) {
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
      id: row.id,
      confirmOpinions: comment || '已确认'
    })

    if (response.success && response.code === 200) {
      ElMessage.success('告警确认成功')
      // 重新加载数据
      handleQuery()
    } else {
      ElMessage.error(response.message || '告警确认失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '告警确认失败')
    }
  }
}

// 告警处理完成后的回调
function handleAlarmHandled() {
  // 重新加载告警数据
  handleQuery()
}

// 移动端操作命令处理
function handleActionCommand(command: string, row: OperationLogItem) {
  switch (command) {
    case 'detail':
      handleDetail(row)
      break
    case 'confirm':
      handleConfirm(row)
      break
    case 'eliminate':
      handleEliminate(row)
      break
  }
}

// 表格选择变化
function handleSelectionChange(selection: OperationLogItem[]) {
  selectedRows.value = selection
}

// 检查行是否可选（用于控制checkbox是否可选）
function checkSelectable(_row: OperationLogItem) {
  // 所有行都可以选择，但批量操作按钮会根据状态判断是否可用
  return true
}

// 批量确认
async function handleBatchConfirm() {
  // 筛选出可以确认的告警（未确认且未消除）
  const confirmableRows = selectedRows.value.filter(row => 
    row.isConfirm !== 1 && row.isConfirm !== 2
  )
  
  if (confirmableRows.length === 0) {
    ElMessage.warning('所选告警中没有可确认的项')
    return
  }

  try {
    const { value: comment } = await ElMessageBox.prompt(
      `确定要批量确认 ${confirmableRows.length} 条告警吗？`,
      '批量确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请输入确认意见（所有告警将使用相同意见）...'
      }
    )

    loading.value = true

    // 并发调用单个确认接口
    const confirmPromises = confirmableRows
      .filter(row => row.id)
      .map(row => 
        confirmAlarm({
          id: row.id!,
          confirmOpinions: comment || '已确认'
        }).then(response => ({
          success: response.success && response.code === 200,
          row
        })).catch(error => {
          console.error(`确认告警 ${row.id} 失败:`, error)
          return { success: false, row }
        })
      )

    const results = await Promise.all(confirmPromises)
    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount

    loading.value = false

    if (successCount > 0) {
      ElMessage.success(`成功确认 ${successCount} 条告警${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
      // 清空选择
      selectedRows.value = []
      // 重新加载数据
      handleQuery()
    } else {
      ElMessage.error('批量确认失败')
    }
  } catch (error: any) {
    loading.value = false
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量确认失败')
    }
  }
}

// 批量消除
async function handleBatchEliminate() {
  // 筛选出可以消除的告警（未消除）
  const eliminatableRows = selectedRows.value.filter(row => 
    row.isConfirm !== 2
  )
  
  if (eliminatableRows.length === 0) {
    ElMessage.warning('所选告警中没有可消除的项')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要批量消除 ${eliminatableRows.length} 条告警吗？`,
      '批量消除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true

    // 并发调用单个消除接口
    const eliminatePromises = eliminatableRows
      .filter(row => row.id)
      .map(row => 
        eliminateAlarm({ id: row.id! })
          .then(response => ({
            success: response.success && response.code === 200,
            row
          }))
          .catch(error => {
            console.error(`消除告警 ${row.id} 失败:`, error)
            return { success: false, row }
          })
      )

    const results = await Promise.all(eliminatePromises)
    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount

    loading.value = false

    if (successCount > 0) {
      ElMessage.success(`成功消除 ${successCount} 条告警${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
      // 清空选择
      selectedRows.value = []
      // 重新加载数据
      handleQuery()
    } else {
      ElMessage.error('批量消除失败')
    }
  } catch (error: any) {
    loading.value = false
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量消除失败')
    }
  }
}

// 重置
function handleReset() {
  // 重置日期范围为当天
  dateRange.value = [
    dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  ]
  // 重置筛选条件
  queryForm.value = {
    alarmLevel: '',
    deviceType: '',
    confirmStatus: '', // 重置为全部
    deviceName: '',
    alarmName: ''
  }
  // 重置电站筛选
  factoryId.value = undefined
  // 重置分页到第一页
  pagination.value.pageNum = 1
  // 重新查询
  handleQuery()
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
// 表格中告警等级文本样式
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
  
  /* 操作按钮区域 */
  .action-buttons-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
    
    .left-buttons,
    .right-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .el-button {
      min-width: 100px;
    }
    
    /* 移动端适配 */
    &.mobile-action-buttons {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      
      .left-buttons,
      .right-buttons {
        width: 100%;
        justify-content: flex-start;
      }
      
      .el-button {
        flex: 0 0 auto;
        min-width: 80px;
      }
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      
      .left-buttons,
      .right-buttons {
        width: 100%;
        justify-content: flex-start;
        gap: 8px;
      }
      
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
      .left-buttons,
      .right-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        
        .el-button {
          font-size: 13px;
          padding: 8px 12px;
          min-width: 0;
          
          /* 展开折叠按钮特殊处理 */
          &[type="text"] {
            grid-column: span 2;
            min-width: auto;
            padding: 4px 8px;
            font-size: 12px;
            white-space: nowrap;
          }
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

// el-select, el-input, el-date-picker 样式由全局样式控制

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

// 表格内操作按钮样式
:deep(.el-table) {
  // 操作按钮样式
  .action-buttons {
    display: flex;
    gap: 4px;
    flex-wrap: nowrap;
    align-items: center;

    .el-button {
      padding: 0 4px;
      font-size: 13px;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;

      .el-button {
        font-size: 12px;
      }
    }
  }

  // 移动端下拉菜单按钮样式
  @media (max-width: 768px) {
    :deep(.el-dropdown) {
      .el-button {
        padding: 0;
        min-width: auto;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

// 告警设备链接样式
:deep(.device-name-link) {
  padding: 0 !important;
  font-size: inherit;
  color: #409eff !important;
  background: transparent !important;
  border: none !important;
  
  &:hover {
    color: #409eff !important;
    background: transparent !important;
    border: none !important;
  }
  
  &:focus {
    color: #409eff !important;
    background: transparent !important;
    border: none !important;
  }
  
  &:active {
    color: #409eff !important;
    background: transparent !important;
    border: none !important;
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
