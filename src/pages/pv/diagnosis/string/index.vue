<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree 
        @node-click="handleStationSelect" 
        :auto-select-first-leaf="true"
      />
    </template>
    
    <!-- 主体内容 -->
    <template #right>
      <div v-if="!selectedStationId" class="no-station-selected">
        <ElEmpty description="请在左侧选择电站进行组串诊断" />
      </div>
      
      <div v-else class="string-diagnosis-container">
        <!-- 统计信息区 -->
        <div class="statistics-section">
          <!-- 设备统计 -->
          <div class="device-statistics">
            <div class="statistics-title">设备总数</div>
            <div class="statistics-content">
              <div class="total-count">总{{ statistics?.deviceStatistics.totalDevices || 0 }}台</div>
              <div class="status-counts">
                <span class="online">在线{{ statistics?.deviceStatistics.onlineDevices || 0 }}台</span>
                <span class="offline">离线{{ statistics?.deviceStatistics.offlineDevices || 0 }}台</span>
              </div>
            </div>
          </div>
          
          <!-- 支路检查结果 -->
          <div class="string-statistics">
            <div class="statistics-title">支路检查结果</div>
            <div class="statistics-content">
              <div class="status-item">
                <span class="status-dot normal"></span>
                <span>正常未接入{{ statistics?.stringStatistics.normalNotConnected || 0 }}</span>
              </div>
              <div class="status-item">
                <span class="status-dot error"></span>
                <span>支路断配{{ statistics?.stringStatistics.branchDisconnect || 0 }}</span>
              </div>
              <div class="status-item">
                <span class="status-dot gray"></span>
                <span>未启用支路数据未上报{{ statistics?.stringStatistics.notEnabledNoData || 0 }}</span>
              </div>
              <div class="status-item">
                <span class="status-dot warning"></span>
                <span>待重新核定{{ statistics?.stringStatistics.pendingVerification || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 筛选和操作区 -->
        <div class="filter-section">
          <div class="filter-controls">
            <div class="filter-item">
              <span class="filter-label">启用状态</span>
              <ElSelect 
                v-model="filters.enableStatus" 
                placeholder="全部"
                @change="handleFilterChange"
                :style="{ width: isMobile ? '100%' : '120px' }"
              >
                <ElOption label="全部" value="all" />
                <ElOption label="已启用" value="enabled" />
                <ElOption label="未启用" value="disabled" />
              </ElSelect>
            </div>
            
            <div class="filter-item">
              <span class="filter-label">检查状态</span>
              <ElSelect 
                v-model="filters.checkStatus" 
                placeholder="请选择"
                @change="handleFilterChange"
                :style="{ width: isMobile ? '100%' : '150px' }"
              >
                <ElOption label="全部" value="all" />
                <ElOption label="正常未接入" value="normal_not_connected" />
                <ElOption label="支路断配" value="branch_disconnect" />
                <ElOption label="未启用数据未上报" value="not_enabled_no_data" />
                <ElOption label="待重新核定" value="pending_verification" />
                <ElOption label="已启用正常" value="enabled_normal" />
              </ElSelect>
            </div>
            
            <div class="filter-item">
              <ElInput
                v-model="filters.deviceName"
                placeholder="搜索设备名称"
                :style="{ width: isMobile ? '100%' : '150px' }"
                clearable
                @input="handleSearchInput"
              >
                <template #suffix>
                  <ElIcon><Search /></ElIcon>
                </template>
              </ElInput>
            </div>
            
            <ElButton 
              type="primary" 
              @click="handleSearch"
              :loading="loading"
              :class="{ 'mobile-search-btn': isMobile }"
            >
              搜索
            </ElButton>
          </div>
          
          <div class="action-controls">
            <ElButton 
              type="primary" 
              @click="handleBatchDiagnosis"
              :disabled="selectedRows.length === 0"
              :loading="batchDiagnosisLoading"
            >
              批量诊断
            </ElButton>
            <ElButton 
              @click="handleBatchEnable"
              :disabled="!canBatchEnable"
              :loading="batchEnableLoading"
            >
              批量启用
            </ElButton>
            <ElButton 
              @click="handleBatchDisable" 
              :disabled="!canBatchDisable"
              :loading="batchDisableLoading"
            >
              启用选择
            </ElButton>
          </div>
        </div>
        
        <!-- 数据表格 -->
        <div class="table-section">
          <div v-if="tableData.length === 0 && !loading" style="padding: 20px; text-align: center; color: #999;">
            暂无数据 (selectedStationId: {{ selectedStationId }})
          </div>
          <ElTable
            ref="tableRef"
            v-loading="loading"
            :data="tableData"
            @selection-change="handleSelectionChange"
            :row-class-name="getRowClassName"
            row-key="id"
            :height="isMobile ? '400px' : 'calc(100vh - 420px)'"
          >
            <ElTableColumn type="selection" width="50" />
            
            <ElTableColumn 
              v-if="!isMobile"
              prop="stationName" 
              label="所属电站" 
              min-width="120"
              show-overflow-tooltip
            />
            
            <ElTableColumn 
              label="设备名称" 
              min-width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-button 
                  type="text" 
                  class="device-name-link"
                  @click="handleDeviceDetail(row)"
                >
                  {{ row.deviceName }}
                </el-button>
              </template>
            </ElTableColumn>
            
            <ElTableColumn 
              prop="stringName" 
              label="支路名称" 
              min-width="90"
            />
            
            <ElTableColumn 
              label="核查支路电流(A)" 
              min-width="130"
            >
              <template #default="{ row }">
                <span :class="{ 'zero-current': row.currentValue === 0 }">
                  {{ row.currentValue }}{{ row.currentUnit }}
                </span>
              </template>
            </ElTableColumn>
            
            <ElTableColumn 
              prop="configStatus" 
              label="配置启用状态" 
              min-width="120"
            >
              <template #default="{ row }">
                <ElTag 
                  :type="row.isEnabled ? 'success' : 'info'"
                  size="small"
                >
                  {{ row.configStatus }}
                </ElTag>
              </template>
            </ElTableColumn>
            
            <ElTableColumn 
              label="检查状态" 
              min-width="140"
            >
              <template #default="{ row }">
                <ElTag 
                  :style="{ backgroundColor: row.statusColor, color: '#fff' }"
                  size="small"
                >
                  {{ row.checkStatus }}
                </ElTag>
              </template>
            </ElTableColumn>
            
            <ElTableColumn 
              v-if="!isMobile"
              prop="lastCheckTime" 
              label="最近检查时间" 
              min-width="150"
            >
              <template #default="{ row }">
                {{ formatDateTime(row.lastCheckTime) }}
              </template>
            </ElTableColumn>
            
            <ElTableColumn 
              v-if="!isMobile"
              prop="remarks" 
              label="备注" 
              min-width="100"
              show-overflow-tooltip
            />
            
            <ElTableColumn 
              label="操作" 
              width="200"
              fixed="right"
            >
              <template #default="{ row }">
                <ElButton
                  v-if="row.canEnable"
                  size="small"
                  type="primary"
                  link
                  @click="handleSingleEnable(row)"
                >
                  启用
                </ElButton>
                
                <ElButton
                  v-if="row.canDisable"
                  size="small"
                  type="danger"
                  link
                  @click="handleSingleDisable(row)"
                >
                  禁用
                </ElButton>
                
                <ElButton
                  v-if="row.hasDataComparison"
                  size="small"
                  type="primary"
                  link
                  @click="handleDataCompare(row)"
                >
                  数据对比
                </ElButton>
                
                <ElButton
                  v-if="row.hasCapacityConfig"
                  size="small"
                  type="warning"
                  link
                  @click="handleCapacityConfig(row)"
                >
                  容量配置
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
        
        <!-- 分页器 -->
        <div class="pagination-section">
          <ElPagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[50, 100, 200, 500]"
            :layout="paginationLayout"
            :pager-count="isMobile ? 3 : 7"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
  
  <!-- 批量诊断进度弹窗 -->
  <ElDialog
    v-model="diagnosisProgressVisible"
    title="批量诊断进度"
    width="500px"
    :close-on-click-modal="false"
  >
    <div class="progress-content">
      <div class="progress-info">
        <div class="progress-text">
          正在诊断: {{ diagnosisProgress.currentString || '准备中...' }}
    </div>
        <div class="progress-stats">
          {{ diagnosisProgress.completedCount }}/{{ diagnosisProgress.totalCount }}
        </div>
      </div>
      
      <ElProgress
        :percentage="diagnosisProgress.progress"
        :status="diagnosisProgress.status === 'completed' ? 'success' : 
                diagnosisProgress.status === 'failed' ? 'exception' : undefined"
      />
      
      <div v-if="diagnosisProgress.estimatedEndTime" class="estimated-time">
        预计完成时间: {{ formatDateTime(diagnosisProgress.estimatedEndTime) }}
      </div>
    </div>
    
    <template #footer>
      <ElButton 
        v-if="diagnosisProgress.status === 'completed'"
        type="primary" 
        @click="handleDiagnosisComplete"
      >
        完成
      </ElButton>
      <ElButton 
        v-else
        @click="handleCancelDiagnosis"
      >
        取消
      </ElButton>
    </template>
  </ElDialog>
  
  <!-- 数据对比弹窗 -->
  <DataCompareDialog
    v-model:visible="dataCompareVisible"
    :device-info="selectedDeviceInfo"
  />
  
  <!-- 容量配置弹窗 -->
  <CapacityConfigDialog
    v-model:visible="capacityConfigVisible"
    :device-info="selectedCapacityDevice"
    @success="handleCapacityConfigSuccess"
  />

  <!-- 设备详情弹窗 -->
  <DeviceDetailDialog
    v-model:visible="deviceDetailVisible"
    :device-id="selectedDeviceId"
    :device-name="selectedDeviceName"
    @device-change="handleDeviceChange"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import DataCompareDialog from './components/DataCompareDialog.vue'
import CapacityConfigDialog from './components/CapacityConfigDialog.vue'
import DeviceDetailDialog from '../device-detail/DeviceDetailDialog.vue'
import type { 
  StringDiagnosisRecord,
  StringDiagnosisStatistics,
  GetStringDiagnosisListParams,
  DiagnosisProgress
} from '@/api/types/diagnosis/stringDiagnosis'
import type { StationTreeNode } from '@/types/station'
import {
  getStringDiagnosisList,
  executeStringDiagnosis,
  getDiagnosisProgress,
  batchOperateStrings
} from '@/api/diagnosis/stringDiagnosis'
import { formatDateTime } from '@/utils/date'

// 响应式数据
// 移动端检测
const isMobile = ref(false)

const selectedStationId = ref<string>('')
const selectedStationName = ref<string>('')
const loading = ref(false)
const tableData = ref<StringDiagnosisRecord[]>([])
const statistics = ref<StringDiagnosisStatistics>()
const selectedRows = ref<StringDiagnosisRecord[]>([])

// 筛选参数
const filters = ref({
  enableStatus: 'all',
  checkStatus: 'all',
  deviceName: ''
})

// 分页参数
const pagination = ref({
  current: 1,
  pageSize: 100,
  total: 0,
  totalPages: 0
})

// 批量操作加载状态
const batchDiagnosisLoading = ref(false)
const batchEnableLoading = ref(false)
const batchDisableLoading = ref(false)

// 诊断进度相关
const diagnosisProgressVisible = ref(false)
const diagnosisProgress = ref<DiagnosisProgress>({
  taskId: '',
  status: 'pending',
  progress: 0,
  completedCount: 0,
  totalCount: 0,
  startTime: ''
})
let progressTimer: number | null = null

// 数据对比相关
const dataCompareVisible = ref(false)
const selectedDeviceInfo = ref<StringDiagnosisRecord | null>(null)

// 容量配置相关
const capacityConfigVisible = ref(false)
const selectedCapacityDevice = ref<StringDiagnosisRecord | null>(null)

// 设备详情相关
const deviceDetailVisible = ref(false)
const selectedDeviceId = ref<string>('')
const selectedDeviceName = ref<string>('')

// 计算属性
const canBatchEnable = computed(() => {
  return selectedRows.value.some(row => row.canEnable)
})

const canBatchDisable = computed(() => {
  return selectedRows.value.some(row => row.canDisable)
})

// 在 pagination ref 定义后添加
const paginationLayout = computed(() => {
  return isMobile.value 
    ? 'total, prev, pager, next'
    : 'total, sizes, prev, pager, next, jumper'
})

// 防抖搜索
let searchTimeout: number | null = null
const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = window.setTimeout(() => {
    handleSearch()
  }, 500)
}

/**
 * 处理电站选择
 */
const handleStationSelect = (data: StationTreeNode) => {
  console.log('选择电站:', data)
  selectedStationId.value = data.regionId
  selectedStationName.value = data.regionName
  pagination.value.current = 1 // 重置页码
  fetchData()
}

/**
 * 获取数据
 */
const fetchData = async () => {
  if (!selectedStationId.value) {
    console.log('没有选中电站ID，跳过数据加载')
    return
  }
  
  console.log('开始获取数据，电站ID:', selectedStationId.value)
  loading.value = true
  try {
    const params: GetStringDiagnosisListParams = {
      stationId: selectedStationId.value,
      enableStatus: filters.value.enableStatus === 'all' ? undefined : filters.value.enableStatus,
      checkStatus: filters.value.checkStatus === 'all' ? undefined : filters.value.checkStatus,
      deviceName: filters.value.deviceName || undefined,
      page: pagination.value.current,
      pageSize: pagination.value.pageSize
    }
    
    console.log('API调用参数:', params)
    const response = await getStringDiagnosisList(params)
    console.log('API响应:', response)
    
    if (response.success && response.data) {
      tableData.value = response.data.list
      statistics.value = response.data.statistics
      pagination.value = response.data.pagination
      console.log('数据设置成功，表格数据长度:', tableData.value.length)
    } else {
      console.error('API响应失败:', response.message)
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取组串诊断数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理筛选变化
 */
const handleFilterChange = () => {
  pagination.value.current = 1 // 重置页码
  fetchData()
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  pagination.value.current = 1 // 重置页码
  fetchData()
}

/**
 * 处理表格选择变化
 */
const handleSelectionChange = (selection: StringDiagnosisRecord[]) => {
  selectedRows.value = selection
}

/**
 * 处理分页大小变化
 */
const handleSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
  pagination.value.current = 1
  fetchData()
}

/**
 * 处理当前页变化
 */
const handleCurrentChange = (current: number) => {
  pagination.value.current = current
  fetchData()
}

/**
 * 批量诊断
 */
const handleBatchDiagnosis = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要诊断的组串')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要对选中的 ${selectedRows.value.length} 个组串执行诊断吗？`,
      '批量诊断确认',
      { type: 'warning' }
    )
    
    batchDiagnosisLoading.value = true
    
    const stringIds = selectedRows.value.map(row => row.id)
    const response = await executeStringDiagnosis({
      stationId: selectedStationId.value,
      stringIds,
      diagnosisType: 'full'
    })
    
    if (response.success && response.data) {
      ElMessage.success('诊断任务已启动')
      
      // 显示进度弹窗
      diagnosisProgress.value = {
        taskId: response.data.taskId,
        status: 'pending',
        progress: 0,
        completedCount: 0,
        totalCount: response.data.totalCount,
        startTime: new Date().toISOString()
      }
      diagnosisProgressVisible.value = true
      
      // 开始轮询进度
      startProgressPolling()
    } else {
      ElMessage.error(response.message || '启动诊断失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量诊断失败:', error)
      ElMessage.error('批量诊断失败')
    }
  } finally {
    batchDiagnosisLoading.value = false
  }
}

/**
 * 开始轮询诊断进度
 */
const startProgressPolling = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
  }
  
  progressTimer = window.setInterval(async () => {
    try {
      const response = await getDiagnosisProgress(diagnosisProgress.value.taskId)
      if (response.success && response.data) {
        diagnosisProgress.value = response.data
        
        // 如果完成，停止轮询
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          stopProgressPolling()
        }
      }
    } catch (error) {
      console.error('获取诊断进度失败:', error)
    }
  }, 2000) // 每2秒轮询一次
}

/**
 * 停止轮询
 */
const stopProgressPolling = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

/**
 * 诊断完成
 */
const handleDiagnosisComplete = () => {
  diagnosisProgressVisible.value = false
  stopProgressPolling()
  fetchData() // 刷新数据
}

/**
 * 取消诊断
 */
const handleCancelDiagnosis = () => {
  diagnosisProgressVisible.value = false
  stopProgressPolling()
}

/**
 * 批量启用
 */
const handleBatchEnable = async () => {
  const enableableRows = selectedRows.value.filter(row => row.canEnable)
  if (enableableRows.length === 0) {
    ElMessage.warning('选中的组串中没有可启用的项目')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要启用选中的 ${enableableRows.length} 个组串吗？`,
      '批量启用确认',
      { type: 'warning' }
    )
    
    batchEnableLoading.value = true
    
    const response = await batchOperateStrings({
      stationId: selectedStationId.value,
      stringIds: enableableRows.map(row => row.id),
      operation: 'enable'
    })
    
    if (response.success && response.data) {
      ElMessage.success(`批量启用完成，成功 ${response.data.successCount} 个，失败 ${response.data.failedCount} 个`)
      fetchData() // 刷新数据
    } else {
      ElMessage.error(response.message || '批量启用失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量启用失败:', error)
      ElMessage.error('批量启用失败')
    }
  } finally {
    batchEnableLoading.value = false
  }
}

/**
 * 批量禁用
 */
const handleBatchDisable = async () => {
  const disableableRows = selectedRows.value.filter(row => row.canDisable)
  if (disableableRows.length === 0) {
    ElMessage.warning('选中的组串中没有可禁用的项目')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要禁用选中的 ${disableableRows.length} 个组串吗？`,
      '批量禁用确认',
      { type: 'warning' }
    )
    
    batchDisableLoading.value = true
    
    const response = await batchOperateStrings({
      stationId: selectedStationId.value,
      stringIds: disableableRows.map(row => row.id),
      operation: 'disable'
    })
    
    if (response.success && response.data) {
      ElMessage.success(`批量禁用完成，成功 ${response.data.successCount} 个，失败 ${response.data.failedCount} 个`)
      fetchData() // 刷新数据
    } else {
      ElMessage.error(response.message || '批量禁用失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量禁用失败:', error)
      ElMessage.error('批量禁用失败')
    }
  } finally {
    batchDisableLoading.value = false
  }
}

/**
 * 单个启用
 */
const handleSingleEnable = async (row: StringDiagnosisRecord) => {
  try {
    const response = await batchOperateStrings({
      stationId: selectedStationId.value,
      stringIds: [row.id],
      operation: 'enable'
    })
    
    if (response.success) {
      ElMessage.success('启用成功')
      fetchData() // 刷新数据
    } else {
      ElMessage.error(response.message || '启用失败')
    }
  } catch (error) {
    console.error('启用失败:', error)
    ElMessage.error('启用失败')
  }
}

/**
 * 单个禁用
 */
const handleSingleDisable = async (row: StringDiagnosisRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要禁用组串 "${row.stringName}" 吗？`,
      '禁用确认',
      { type: 'warning' }
    )
    
    const response = await batchOperateStrings({
      stationId: selectedStationId.value,
      stringIds: [row.id],
      operation: 'disable'
    })
    
    if (response.success) {
      ElMessage.success('禁用成功')
      fetchData() // 刷新数据
    } else {
      ElMessage.error(response.message || '禁用失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('禁用失败:', error)
      ElMessage.error('禁用失败')
    }
  }
}

/**
 * 数据对比
 */
const handleDataCompare = (row: StringDiagnosisRecord) => {
  console.log('点击数据对比，传递数据:', row)
  selectedDeviceInfo.value = row
  dataCompareVisible.value = true
}

/**
 * 容量配置
 */
const handleCapacityConfig = (row: StringDiagnosisRecord) => {
  selectedCapacityDevice.value = row
  capacityConfigVisible.value = true
}

/**
 * 容量配置成功回调
 */
const handleCapacityConfigSuccess = () => {
  ElMessage.success('容量配置保存成功')
  fetchData() // 刷新数据
}

/**
 * 处理设备详情
 */
const handleDeviceDetail = (row: StringDiagnosisRecord) => {
  console.log('点击设备详情，传递数据:', row)
  selectedDeviceId.value = row.deviceId
  selectedDeviceName.value = row.deviceName
  deviceDetailVisible.value = true
}

/**
 * 处理设备切换
 */
const handleDeviceChange = (deviceId: string) => {
  selectedDeviceId.value = deviceId
  // 这里可以根据需要更新设备名称
  const device = tableData.value.find(item => item.deviceId === deviceId)
  if (device) {
    selectedDeviceName.value = device.deviceName
  }
}

/**
 * 获取表格行的类名
 */
const getRowClassName = ({ row }: { row: StringDiagnosisRecord }) => {
  const statusClass = {
    'branch_disconnect': 'row-error',
    'pending_verification': 'row-warning', 
    'not_enabled_no_data': 'row-gray',
    'normal_not_connected': 'row-normal',
    'enabled_normal': 'row-success',
    'not_enabled': 'row-disabled'
  }
  return statusClass[row.checkStatusCode] || ''
}

// 组件销毁时清理定时器
onUnmounted(() => {
  stopProgressPolling()
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})

// 页面挂载时获取数据
// 移动端检测函数
const checkIsMobile = () => {
  const newIsMobile = window.innerWidth <= 768
  isMobile.value = newIsMobile
}

onMounted(() => {
  // 如果已经选择了电站，则立即加载数据
  if (selectedStationId.value) {
    fetchData()
  }
  
  // 移动端检测
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.string-diagnosis-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 12px;
    height: auto;
    min-height: 100%;
  }
}

.no-station-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

// 统计信息区
.statistics-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .device-statistics,
  .string-statistics {
    flex: 1;
    background: linear-gradient(135deg, rgba(0, 30, 60, 0.9) 0%, rgba(10, 40, 80, 0.95) 100%);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(0, 212, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;

    @media (max-width: 768px) {
      padding: 16px;
      border-radius: 8px;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 30% 50%, rgba(0, 212, 255, 0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    
    .statistics-title {
      font-size: 15px;
      color: #00d4ff;
      margin-bottom: 16px;
      font-weight: 600;
      position: relative;
      z-index: 2;

      @media (max-width: 768px) {
        font-size: 14px;
        margin-bottom: 12px;
      }
    }
    
    .statistics-content {
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
      z-index: 2;
      
      .total-count {
        font-size: 20px;
        font-weight: 700;
        color: #ffffff;
        text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
      }
      
      .status-counts {
        display: flex;
        gap: 16px;
        
        .online {
          color: #27ae60;
          font-size: 14px;
          font-weight: 500;
        }
        
        .offline {
          color: #e74c3c;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }
  
  .string-statistics .statistics-content {
    flex-wrap: wrap;
    gap: 12px;
    
    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #ffffff;
      font-weight: 500;
      
      .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        box-shadow: 0 0 6px currentColor;
        
        &.normal {
          background-color: #27ae60;
          color: #27ae60;
        }
        
        &.error {
          background-color: #e74c3c;
          color: #e74c3c;
        }
        
        &.gray {
          background-color: #95a5a6;
          color: #95a5a6;
        }
        
        &.warning {
          background-color: #e67e22;
          color: #e67e22;
        }
      }
    }
  }
}

// 筛选和操作区
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.9) 0%, rgba(10, 40, 80, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
    padding: 12px;
    border-radius: 8px;
    overflow: visible;
    height: auto;
    min-height: auto;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 70% 50%, rgba(0, 212, 255, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .filter-controls {
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
    z-index: 2;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
      width: 100%;
    }
    
    .filter-item {
      display: flex;
      align-items: center;
      gap: 10px;
      
      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        gap: 6px;
      }
      
      .filter-label {
        font-size: 14px;
        color: #00d4ff;
        white-space: nowrap;
        font-weight: 500;
        
        @media (max-width: 768px) {
          font-size: 13px;
        }
      }
    }
    
    .mobile-search-btn {
      width: 100%;
    }
  }
  
  .action-controls {
    display: flex;
    gap: 12px;
    position: relative;
    z-index: 2;

    @media (max-width: 768px) {
      flex-wrap: wrap;
      gap: 8px;

      .el-button {
        flex: 1;
        min-width: auto;
      }
    }
  }
}

// 表格区域
.table-section {
  flex: 1;
  min-height: 0;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.9) 0%, rgba(10, 40, 80, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: visible;
  position: relative;

  @media (max-width: 768px) {
    border-radius: 8px;
    flex: none;
    min-height: 400px;
    height: auto;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 30%, rgba(0, 212, 255, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  
  :deep(.el-table) {
    background: transparent;
    
    .el-table__header-wrapper {
      background: rgba(0, 40, 80, 0.8);
      
      th {
        background: transparent;
        color: #00d4ff;
        font-weight: 600;
        border-bottom: 1px solid rgba(0, 212, 255, 0.3);
      }
    }
    
    .el-table__body-wrapper {
      background: transparent;
      
      tr {
        background: transparent;
        
        &:nth-child(even) {
          background: rgba(0, 212, 255, 0.03);
        }
        
        &:hover {
          background: rgba(0, 212, 255, 0.1) !important;
        }
        
        // 状态行颜色
        &.row-error {
          background: rgba(245, 108, 108, 0.15) !important;
          
          &:hover {
            background: rgba(245, 108, 108, 0.25) !important;
          }
        }
        
        &.row-warning {
          background: rgba(230, 162, 60, 0.15) !important;
          
          &:hover {
            background: rgba(230, 162, 60, 0.25) !important;
          }
        }
        
        &.row-gray {
          background: rgba(144, 147, 153, 0.1) !important;
          
          &:hover {
            background: rgba(144, 147, 153, 0.2) !important;
          }
        }
        
        &.row-normal {
          background: rgba(103, 194, 58, 0.1) !important;
          
          &:hover {
            background: rgba(103, 194, 58, 0.2) !important;
          }
        }
        
        &.row-success {
          background: rgba(64, 158, 255, 0.1) !important;
          
          &:hover {
            background: rgba(64, 158, 255, 0.2) !important;
          }
        }
        
        &.row-disabled {
          background: rgba(192, 196, 204, 0.1) !important;
          
          &:hover {
            background: rgba(192, 196, 204, 0.2) !important;
          }
        }
        
        td {
          border-bottom: 1px solid rgba(0, 212, 255, 0.1);
          color: #ffffff;
        }
      }
    }
    
    .el-table__empty-block {
      background: transparent;
      color: #ffffff;
    }
  }
  
  .zero-current {
    color: #e74c3c;
    font-weight: 600;
    text-shadow: 0 0 4px rgba(231, 76, 60, 0.5);
  }
}

// 分页区域
.pagination-section {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.9) 0%, rgba(10, 40, 80, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;

  @media (max-width: 768px) {
    padding: 10px;
    border-radius: 8px;
    
    :deep(.el-pagination) {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
      font-size: 13px;
      
      .el-pagination__total {
        font-size: 12px;
        margin-right: 0;
        flex-basis: 100%;
        text-align: center;
        margin-bottom: 6px;
      }
      
      .btn-prev,
      .btn-next {
        padding: 4px 8px;
        min-width: 32px;
        font-size: 12px;
      }
      
      .el-pager {
        li {
          min-width: 28px;
          height: 28px;
          line-height: 28px;
          font-size: 12px;
          padding: 0 4px;
        }
      }
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  
  :deep(.el-pagination) {
    position: relative;
    z-index: 2;
    
    .el-pagination__total,
    .el-pagination__jump {
      color: #ffffff;
    }
    
    .btn-prev,
    .btn-next,
    .el-pager li {
      background: rgba(0, 40, 80, 0.6);
      border: 1px solid rgba(0, 212, 255, 0.3);
      color: #ffffff;
      
      &:hover {
        background: rgba(0, 212, 255, 0.2);
        border-color: #00d4ff;
      }
      
      &.is-active {
        background: #00d4ff;
        border-color: #00d4ff;
        color: #ffffff;
      }
    }
    
    .el-select .el-select__wrapper {
      background: rgba(0, 40, 80, 0.6);
      border-color: rgba(0, 212, 255, 0.3);
      
      .el-select__placeholder,
      .el-select__selected-item {
        color: #ffffff;
      }
    }
  }
}

// 进度弹窗样式
.progress-content {
  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .progress-text {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
    
    .progress-stats {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }
  
  .estimated-time {
    margin-top: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
}

// 移动端表格适配
@media (max-width: 768px) {
  :deep(.el-table) {
    font-size: 12px;
    
    .el-table__header th {
      padding: 8px 0;
    }
    
    .el-table__body td {
      padding: 8px 0;
    }
    
    // 操作列按钮优化
    .el-button {
      font-size: 11px;
      padding: 4px 8px;
    }
  }
}

// 设备名称链接样式
:deep(.device-name-link) {
  color: #00d4ff !important;
  font-weight: 500;
  
  &:hover {
    color: #0099cc !important;
    text-decoration: underline;
  }
}
</style>