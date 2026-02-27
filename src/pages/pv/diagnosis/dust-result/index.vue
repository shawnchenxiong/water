<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar } from '@element-plus/icons-vue'
import type { 
  DiagnosisResult, 
  DiagnosisSummary,
  GetDiagnosisResultsParams
} from '@/api/types/diagnosis/diagnosisResult'
import { 
  getDiagnosisResults
} from '@/api/diagnosis/diagnosisResult'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import HistoryTrendDialog from './components/HistoryTrendDialog.vue'
import DeviceDetailDialog from '../device-detail/DeviceDetailDialog.vue'
import dayjs from 'dayjs'

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 分页布局
const paginationLayout = computed(() => {
  return isMobile.value 
    ? 'total, prev, pager, next'
    : 'prev, pager, next, sizes, jumper'
})

// 响应式数据
const loading = ref(false)
const diagnosisResults = ref<DiagnosisResult[]>([])
const summary = ref<DiagnosisSummary>({
  totalDevices: 0,
  analyzedDevices: 0,
  avgDustLossRate: 2.3
})
const selectedStationId = ref<string>('')
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

// 分页
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 历史趋势弹窗
const trendDialogVisible = ref(false)
const selectedDevice = ref({
  deviceId: '',
  deviceName: ''
})

// 设备详情弹窗
const deviceDetailVisible = ref(false)
const selectedDeviceId = ref<string>('')
const selectedDeviceName = ref<string>('')

// 电站选择处理
const handleStationChange = async (data: any) => {
  if (!data || !data.regionId) return
  if (data.childList && data.childList.length > 0) return
  
  selectedStationId.value = data.regionId
  
  // 自动查询该电站的诊断结果
  await loadData()
}

// 查询数据
const loadData = async () => {
  if (!selectedStationId.value) {
    return
  }
  
  try {
    loading.value = true
    
    const params: GetDiagnosisResultsParams = {
      stationId: selectedStationId.value,
      date: selectedDate.value
    }
    
    const response = await getDiagnosisResults(params)
    
    diagnosisResults.value = response.data.diagnosisResults
    summary.value = response.data.summary
    pagination.value.total = response.data.diagnosisResults.length
    
  } catch (error) {
    console.error('获取诊断结果失败:', error)
    ElMessage.error('获取诊断结果失败')
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleQuery = async () => {
  pagination.value.page = 1
  await loadData()
}

// 日期变化处理
const handleDateChange = () => {
  if (selectedStationId.value) {
    handleQuery()
  }
}

// 分页处理
const handleCurrentChange = (page: number) => {
  pagination.value.page = page
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.page = 1
}

// 查看历史趋势
const handleViewTrend = (row: DiagnosisResult) => {
  selectedDevice.value = {
    deviceId: row.deviceId,
    deviceName: row.deviceName
  }
  trendDialogVisible.value = true
}

// 处理设备详情
const handleDeviceDetail = (row: DiagnosisResult) => {
  console.log('点击设备详情，传递数据:', row)
  selectedDeviceId.value = row.deviceId
  selectedDeviceName.value = row.deviceName
  deviceDetailVisible.value = true
}

// 处理设备切换
const handleDeviceChange = (deviceId: string) => {
  selectedDeviceId.value = deviceId
  // 这里可以根据需要更新设备名称
  const device = diagnosisResults.value.find(item => item.deviceId === deviceId)
  if (device) {
    selectedDeviceName.value = device.deviceName
  }
}

// 表格数据（分页）
const tableData = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return diagnosisResults.value.slice(start, end)
})

// 初始化
onMounted(() => {
  selectedDate.value = dayjs().format('YYYY-MM-DD')
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<template>
  <DeviceMonitorLayout class="diagnosis-result-page">
    <template #left>
      <StationTree 
        :auto-select-first-leaf="true"
        @node-click="handleStationChange"
      />
    </template>
    
    <template #right>
      <div class="main-content">
        <!-- 查询区域 -->
        <div class="query-section">
          <div class="query-form">
            <div class="form-item">
              <span class="label">时间</span>
              <div class="date-picker-wrapper">
                <el-icon class="calendar-icon"><Calendar /></el-icon>
                <el-date-picker
                  v-model="selectedDate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :disabled-date="(time: Date) => time.getTime() > Date.now()"
                  @change="handleDateChange"
                />
              </div>
              <el-button type="primary" @click="handleQuery" :loading="loading">
                提交
              </el-button>
            </div>
          </div>
          
          <div class="weather-info">
            <div class="temperature">16°C - 12°C</div>
            <div class="loss-rate">电站积尘损失率：{{ summary.avgDustLossRate }}%</div>
          </div>
        </div>
        
        <!-- 表格区域 -->
        <div class="table-section">
          <div class="table-wrapper">
            <el-table
              :data="tableData"
              v-loading="loading"
              style="width: 100%"
              :height="isMobile ? undefined : 600"
              :max-height="isMobile ? 370 : undefined"
            >
            <el-table-column prop="stationName" label="电站" min-width="180" />
            <el-table-column 
              label="设备名称" 
              min-width="120"
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
            </el-table-column>
            <el-table-column prop="dailyGeneration" label="当日发电量 (kWh)" min-width="150" align="right" />
            <el-table-column prop="equivalentHours" label="等价发电量(h)" min-width="130" align="right" />
            <el-table-column prop="installedCapacity" label="装机容量(kWp)" min-width="130" align="right" />
            <el-table-column prop="dustLossRate" label="设备积尘损失率 (%)" min-width="160" align="right">
              <template #default="{ row }">
                {{ row.dustLossRate !== null ? row.dustLossRate + '%' : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  link 
                  size="small"
                  @click="handleViewTrend(row)"
                >
                  历史趋势
                </el-button>
              </template>
            </el-table-column>
            </el-table>
          </div>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <div v-if="!isMobile" class="total-info">共 {{ pagination.total }} 条</div>
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="pagination.page"
                v-model:page-size="pagination.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="pagination.total"
                :layout="paginationLayout"
                :pager-count="isMobile ? 3 : 7"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
  
  <!-- 历史趋势弹窗 -->
  <HistoryTrendDialog
    v-model:visible="trendDialogVisible"
    :device-id="selectedDevice.deviceId"
    :device-name="selectedDevice.deviceName"
  />

  <!-- 设备详情弹窗 -->
  <DeviceDetailDialog
    v-model:visible="deviceDetailVisible"
    :device-id="selectedDeviceId"
    :device-name="selectedDeviceName"
    @device-change="handleDeviceChange"
  />
</template>

<style scoped lang="scss">
.diagnosis-result-page {
  height: 100%;
}

.main-content {
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  
  .query-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 0;
    
    .query-form {
      .form-item {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .label {
          color: #d1d5db;
          font-size: 14px;
          min-width: 40px;
        }
        
        .date-picker-wrapper {
          position: relative;
          
          .calendar-icon {
            position: absolute;
            left: 8px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
            z-index: 1;
          }
          
          :deep(.el-date-editor) {
            width: 200px;
            
            .el-input__wrapper {
              padding-left: 32px;
              background: rgba(0, 212, 255, 0.1);
              border-color: rgba(0, 212, 255, 0.3);
            }
            
            .el-input__inner {
              color: #d1d5db;
            }
          }
        }
      }
    }
    
    .weather-info {
      display: flex;
      align-items: center;
      gap: 24px;
      color: #d1d5db;
      font-size: 14px;
      
      .temperature {
        color: #00D4FF;
      }
    }
  }
  
  .table-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: visible;
    min-height: 400px;
    
    .table-wrapper {
      flex: 1;
      overflow: hidden;
    }
    
    :deep(.el-table) {
      background: transparent;
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 8px;
      
      .el-table__header {
        background: rgba(0, 212, 255, 0.1);
        
        th {
          background: transparent;
          border-color: rgba(0, 212, 255, 0.2);
          color: #00D4FF;
          font-weight: 500;
        }
      }
      
      .el-table__body {
        tr {
          background: transparent;
          
          &:hover {
            background: rgba(0, 212, 255, 0.05);
          }
          
          td {
            border-color: rgba(0, 212, 255, 0.1);
            color: #d1d5db;
            
            .el-button--primary.is-link {
              color: #00D4FF;
              
              &:hover {
                color: #40a9ff;
              }
            }
          }
        }
      }
    }
    
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      margin-top: 16px;
      
      .total-info {
        color: #d1d5db;
        font-size: 14px;
      }
      
      .pagination-wrapper {
        :deep(.el-pagination) {
          .el-pagination__total,
          .el-pagination__jump,
          .el-select .el-input__inner {
            color: #d1d5db;
          }
          
          .el-pager li {
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.2);
            color: #d1d5db;
            margin: 0 4px;
            
            &:hover {
              color: #00D4FF;
              border-color: #00D4FF;
            }
            
            &.is-active {
              background: #00D4FF;
              border-color: #00D4FF;
              color: #1a1f2e;
            }
          }
          
          .btn-prev,
          .btn-next {
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.2);
            color: #d1d5db;
            
            &:hover {
              color: #00D4FF;
              border-color: #00D4FF;
            }
            
            &:disabled {
              background: rgba(0, 212, 255, 0.05);
              border-color: rgba(0, 212, 255, 0.1);
              color: #6b7280;
            }
          }
        }
      }
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

// 移动端适配
@media (max-width: 768px) {
  .main-content {
    padding: 12px;
    overflow-y: auto;
    overflow-x: hidden;
    
    .query-section {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
      padding: 10px;
      background: rgba(0, 30, 60, 0.9);
      border-radius: 8px;
      
      .query-form {
        width: 100%;
        
        .form-item {
          flex-direction: column;
          gap: 8px;
          align-items: stretch;
          
          .label {
            font-size: 12px;
            min-width: auto;
          }
          
          .date-picker-wrapper {
            width: 100%;
            
            :deep(.el-date-editor) {
              width: 100%;
            }
          }
          
          .el-button {
            width: 100%;
            margin-top: 4px;
          }
        }
      }
      
      .weather-info {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
        font-size: 12px;
        padding: 10px;
        background: rgba(0, 212, 255, 0.1);
        border-radius: 4px;
      }
    }
    
    .table-section {
      min-height: auto;
      height: auto;
      flex: none;
      overflow: visible;
      
      .table-wrapper {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        border-radius: 8px;
        border: 1px solid rgba(0, 212, 255, 0.2);
      }
      
      
      .pagination-container {
        flex-direction: column;
        gap: 10px;
        padding: 12px 0;
        
        .pagination-wrapper {
          width: 100%;
          
          :deep(.el-pagination) {
            display: flex;
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
              padding: 4px 8px;
            }
            
            .el-pager {
              li {
                min-width: 28px;
                height: 28px;
                line-height: 28px;
                font-size: 11px;
                margin: 0 2px;
              }
            }
          }
        }
      }
    }
  }
}
</style>