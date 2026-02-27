<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { 
  CleaningRecord, 
  CleaningQueryParams,
  CleaningRecordForm,
  Station 
} from '@/api/types/diagnosis/cleaningQuery'
import { 
  getCleaningRecords, 
  getStations,
  deleteCleaningRecord,
  validateQueryParams 
} from '@/api/diagnosis/cleaningQuery'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import AddCleaningRecordDialog from './components/AddCleaningRecordDialog.vue'
import dayjs from 'dayjs'

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 响应式数据
const loading = ref(false)
const tableLoading = ref(false)
const records = ref<CleaningRecord[]>([])
const stations = ref<Station[]>([])
const selectedStationId = ref<string>('')

// 查询条件
const queryForm = ref({
  startTime: '',
  endTime: '',
})

// 分页
const pagination = ref({
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0
})

// 弹窗控制
const showAddDialog = ref(false)
const editingRecord = ref<CleaningRecord | null>(null)

// 分页布局
const paginationLayout = computed(() => {
  return isMobile.value 
    ? 'total, prev, pager, next'
    : 'total, sizes, prev, pager, next, jumper'
})

// 生命周期
onMounted(async () => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  
  await loadStations()
  // 设置默认查询时间为最近30天
  const endTime = dayjs()
  const startTime = endTime.subtract(30, 'days')
  queryForm.value.startTime = startTime.format('YYYY-MM-DD HH:mm:ss')
  queryForm.value.endTime = endTime.format('YYYY-MM-DD HH:mm:ss')
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})

// 加载电站列表
const loadStations = async () => {
  try {
    loading.value = true
    const response = await getStations()
    stations.value = response.data.stations
  } catch (error) {
    console.error('加载电站列表失败:', error)
    ElMessage.error('加载电站列表失败')
  } finally {
    loading.value = false
  }
}

// 电站选择处理
const handleStationChange = async (data: any) => {
  if (!data || !data.regionId) return
  if (data.childList && data.childList.length > 0) return
  
  selectedStationId.value = data.regionId
  
  // 自动查询该电站的清洗记录
  if (queryForm.value.startTime && queryForm.value.endTime) {
    await handleQuery()
  }
}

// 查询清洗记录
const handleQuery = async () => {
  if (!selectedStationId.value) {
    ElMessage.warning('请先选择电站')
    return
  }
  
  const queryParams: CleaningQueryParams = {
    stationId: selectedStationId.value,
    startTime: queryForm.value.startTime,
    endTime: queryForm.value.endTime,
    page: pagination.value.page,
    pageSize: pagination.value.pageSize
  }
  
  // 验证查询参数
  const validation = validateQueryParams(queryParams)
  if (!validation.valid) {
    ElMessage.error(validation.message)
    return
  }
  
  try {
    tableLoading.value = true
    const response = await getCleaningRecords(queryParams)
    
    records.value = response.data.records
    pagination.value = response.data.pagination
    
    if (response.data.records.length === 0) {
      ElMessage.info('未查询到清洗记录')
    }
  } catch (error) {
    ElMessage.error('查询清洗记录失败')
  } finally {
    tableLoading.value = false
  }
}

// 重置查询条件
const handleReset = () => {
  const endTime = dayjs()
  const startTime = endTime.subtract(30, 'days')
  queryForm.value.startTime = startTime.format('YYYY-MM-DD HH:mm:ss')
  queryForm.value.endTime = endTime.format('YYYY-MM-DD HH:mm:ss')
  pagination.value.page = 1
}

// 分页变化处理
const handlePageChange = (page: number) => {
  pagination.value.page = page
  handleQuery()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
  pagination.value.page = 1
  handleQuery()
}

// 新增清洗记录
const handleAdd = () => {
  if (!selectedStationId.value) {
    ElMessage.warning('请先选择电站')
    return
  }
  editingRecord.value = null
  showAddDialog.value = true
}

// 编辑清洗记录
const handleEdit = (record: CleaningRecord) => {
  editingRecord.value = record
  showAddDialog.value = true
}

// 删除清洗记录
const handleDelete = async (record: CleaningRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除清洗记录"${record.cleaningTime}"吗？`,
      '删除清洗记录',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    await deleteCleaningRecord(record.id)
    
    ElMessage.success('清洗记录删除成功')
    
    // 重新查询
    await handleQuery()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除清洗记录失败:', error)
      ElMessage.error('删除清洗记录失败')
    }
  } finally {
    loading.value = false
  }
}

// 保存清洗记录成功回调
const handleSaveSuccess = () => {
  showAddDialog.value = false
  handleQuery()
}

// 获取当前选中电站名称
const selectedStationName = computed(() => {
  const station = stations.value.find(s => s.stationId === selectedStationId.value)
  return station?.stationName || ''
})

// 导出功能
const handleExport = () => {
  if (records.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  
  ElMessage.info('导出功能开发中...')
}
</script>

<template>
  <DeviceMonitorLayout>
    <!-- 左侧面板 -->
    <template #left>
      <StationTree 
        :auto-select-first-leaf="true"
        @node-click="handleStationChange"
      />
    </template>

    <!-- 右侧面板 -->
    <template #right>
      <div class="cleaning-query-content">
        <!-- 查询条件区 -->
        <div class="query-section">
          <div class="query-form">
            <div class="form-row">
              <div class="form-item">
                <label class="form-label">清洗时间:</label>
                <div class="time-range">
                  <el-date-picker
                    v-model="queryForm.startTime"
                    type="datetime"
                    placeholder="开始时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    class="time-picker"
                  />
                  <span class="time-separator">~</span>
                  <el-date-picker
                    v-model="queryForm.endTime"
                    type="datetime"
                    placeholder="结束时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    class="time-picker"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="query-actions">
            <el-button 
              type="primary" 
              @click="handleQuery"
              :loading="tableLoading"
              :disabled="!selectedStationId"
            >
              提交
            </el-button>
            <el-button 
              type="primary" 
              @click="handleAdd"
              :disabled="!selectedStationId"
            >
              新增
            </el-button>
          </div>
        </div>

        <!-- 数据表格区 -->
        <div class="table-section">
          <div class="table-header">
            <div class="table-info">
              <span v-if="selectedStationName" class="station-info">
                当前电站：{{ selectedStationName }}
              </span>
            </div>
            <div class="table-actions">
              <el-button 
                size="small" 
                @click="handleExport"
                :disabled="records.length === 0"
              >
                导出
              </el-button>
              <el-button size="small" @click="handleReset">重置</el-button>
            </div>
          </div>

          <div class="table-container">
            <el-table
              :data="records"
              v-loading="tableLoading"
              stripe
              border
              height="500"
              empty-text="暂无数据"
            >
              <el-table-column prop="stationName" label="所属电站" min-width="200" />
              <el-table-column prop="cleaningTime" label="清洗时间" min-width="180" />
              <el-table-column prop="submitter" label="提交人" min-width="100" />
              <el-table-column prop="submitTime" label="提交时间" min-width="180" />
              <el-table-column label="操作" width="160" fixed="right">
                <template #default="{ row }">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="handleEdit(row)"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="handleDelete(row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              :layout="paginationLayout"
              :pager-count="isMobile ? 3 : 7"
              @size-change="handlePageSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>

      <!-- 新增/编辑清洗记录弹窗 -->
      <AddCleaningRecordDialog
        v-model="showAddDialog"
        :stations="stations"
        :selected-station-id="selectedStationId"
        :editing-record="editingRecord"
        @success="handleSaveSuccess"
      />
    </template>
  </DeviceMonitorLayout>
</template>

<style scoped lang="scss">
.cleaning-query-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;

  .query-section {
    display: flex;
    align-items: flex-end;
    gap: 20px;
    padding: 20px;
    background: rgba(0, 212, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 8px;

    .query-form {
      flex: 1;

      .form-row {
        display: flex;
        gap: 20px;
        align-items: center;
      }

      .form-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .form-label {
          color: #00D4FF;
          font-size: 14px;
          white-space: nowrap;
        }

        .time-range {
          display: flex;
          align-items: center;
          gap: 8px;

          .time-picker {
            width: 200px;
          }

          .time-separator {
            color: #a3a3a3;
            font-size: 14px;
          }
        }
      }
    }

    .query-actions {
      display: flex;
      gap: 12px;
    }
  }

  .table-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .station-info {
        color: #00D4FF;
        font-size: 14px;
      }

      .table-actions {
        display: flex;
        gap: 8px;
      }
    }

    .table-container {
      flex: 1;
      overflow: hidden;
      min-height: 500px;
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      padding-top: 16px;
      border-top: 1px solid rgba(0, 212, 255, 0.1);
      margin-top: 16px;
    }
  }
}

:deep(.el-date-editor) {
  --el-date-editor-width: 200px;
  
  .el-input__wrapper {
    background: rgba(0, 212, 255, 0.05);
    border-color: rgba(0, 212, 255, 0.3);
    
    &:hover {
      border-color: rgba(0, 212, 255, 0.5);
    }
    
    &.is-focus {
      border-color: #00D4FF;
    }
  }
  
  .el-input__inner {
    color: #d1d5db;
  }
}

:deep(.el-table) {
  background: transparent;
  border-color: rgba(0, 212, 255, 0.2);

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
      border-color: rgba(0, 212, 255, 0.1);

      &:hover {
        background: rgba(0, 212, 255, 0.05);
      }

      td {
        border-color: rgba(0, 212, 255, 0.1);
        color: #d1d5db;
      }
    }

    .el-table__row--striped {
      background: rgba(0, 212, 255, 0.02);
    }
  }

  .el-table__empty-text {
    color: #a3a3a3;
  }
}

:deep(.el-pagination) {
  .el-pagination__total,
  .el-pagination__jump {
    color: #d1d5db;
  }
  
  .el-pager li {
    background: rgba(0, 212, 255, 0.05);
    border-color: rgba(0, 212, 255, 0.2);
    color: #d1d5db;
    
    &:hover {
      color: #00D4FF;
    }
    
    &.is-active {
      background: #00D4FF;
      color: #1a1f2e;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .cleaning-query-content {
    padding: 12px;
    gap: 12px;

    .query-section {
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      align-items: stretch;

      .query-form {
        .form-row {
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
        }

        .form-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;

          .form-label {
            font-size: 12px;
          }

          .time-range {
            width: 100%;
            display: flex;
            flex-direction: row;
            gap: 8px;
            align-items: center;

            .time-picker {
              width: 180px;
              max-width: calc(50% - 4px);
            }

            .time-separator {
              color: #a3a3a3;
              font-size: 14px;
            }
          }
        }
      }

      .query-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-start;

        .el-button {
          font-size: 13px;
          min-width: 80px;
        }
      }
    }

    .table-section {
      .table-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;

        .station-info {
          font-size: 12px;
        }

        .table-actions {
          width: 100%;
          justify-content: space-between;

          .el-button {
            flex: 1;
            font-size: 12px;
          }
        }
      }

      .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        min-height: auto;

        :deep(.el-table) {
          min-width: 700px;
          font-size: 11px;

          .el-table__header {
            th {
              font-size: 12px;
              padding: 8px 4px;
            }
          }

          .el-table__body {
            td {
              padding: 8px 4px;
            }
          }
        }
      }

      .pagination-container {
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

  :deep(.el-date-editor) {
    width: 250px !important;
    max-width: 100% !important;
    --el-date-editor-width: 250px;
  }
}
</style>
