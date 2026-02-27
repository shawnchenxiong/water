<template>
  <el-dialog
    v-model="dialogVisible"
    title="诊断记录"
    width="800px"
    :before-close="handleClose"
    class="diagnosis-history-dialog"
  >
    <!-- 查询条件 -->
    <div class="query-form">
      <el-form :model="queryForm" inline>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 历史记录表格 -->
    <el-table
      :data="historyData"
      :loading="loading"
      stripe
      class="history-table"
    >
      <el-table-column prop="diagnosisTime" label="诊断时间" width="180" />
      <el-table-column prop="overallScore" label="综合评分" width="100" align="center">
        <template #default="{ row }">
          <span :style="{ color: getScoreColor(row.overallScore) }">
            {{ row.overallScore }}分
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="abnormalCount" label="异常数量" width="100" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.abnormalCount === 0 ? 'success' : 'danger'"
            size="small"
          >
            {{ row.abnormalCount }}个
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="诊断耗时" width="100" align="center">
        <template #default="{ row }">
          {{ formatDuration(row.duration) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'completed' ? 'success' : 'info'"
            size="small"
          >
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            text
            @click="handleViewDetail(row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getDiagnosisHistory } from '@/api/diagnosis/oneClick'
import type { DiagnosisHistoryItem } from '@/api/types/diagnosis'

interface Props {
  /** 对话框显示状态 */
  modelValue: boolean
  /** 电站ID */
  stationId: string
}

interface Emits {
  /** 更新对话框显示状态 */
  (e: 'update:modelValue', value: boolean): void
  /** 查看详情 */
  (e: 'view-detail', record: DiagnosisHistoryItem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 查询表单
const queryForm = ref({
  startTime: '',
  endTime: ''
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表格数据
const historyData = ref<DiagnosisHistoryItem[]>([])
const loading = ref(false)

// 监听对话框显示状态，自动加载数据
watch(dialogVisible, (visible) => {
  if (visible) {
    loadHistoryData()
  }
})

// 加载历史记录数据
const loadHistoryData = async () => {
  if (!props.stationId) {
    ElMessage.error('请先选择电站')
    return
  }

  loading.value = true
  try {
    const response = await getDiagnosisHistory({
      stationId: props.stationId,
      startTime: queryForm.value.startTime,
      endTime: queryForm.value.endTime,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response.code === 200) {
      historyData.value = response.data.records
      total.value = response.data.pagination.total
      currentPage.value = response.data.pagination.current
      pageSize.value = response.data.pagination.pageSize
    } else {
      ElMessage.error(response.message || '获取历史记录失败')
    }
  } catch (error) {
    console.error('加载诊断历史记录失败:', error)
    ElMessage.error('加载历史记录失败')
  } finally {
    loading.value = false
  }
}

// 处理日期范围变化
const handleDateRangeChange = (value: [string, string] | null) => {
  if (value) {
    queryForm.value.startTime = value[0]
    queryForm.value.endTime = value[1]
  } else {
    queryForm.value.startTime = ''
    queryForm.value.endTime = ''
  }
}

// 查询
const handleQuery = () => {
  currentPage.value = 1
  loadHistoryData()
}

// 重置
const handleReset = () => {
  queryForm.value.startTime = ''
  queryForm.value.endTime = ''
  dateRange.value = null
  currentPage.value = 1
  loadHistoryData()
}

// 页大小变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  loadHistoryData()
}

// 当前页变化
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  loadHistoryData()
}

// 查看详情
const handleViewDetail = (record: DiagnosisHistoryItem) => {
  emit('view-detail', record)
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 获取评分颜色
const getScoreColor = (score: number) => {
  if (score >= 90) return '#27ae60'
  if (score >= 70) return '#f39c12'
  return '#e74c3c'
}

// 格式化持续时间
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}分${remainingSeconds}秒`
}

// 获取状态文字
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    completed: '已完成',
    running: '进行中',
    failed: '失败',
    pending: '等待中'
  }
  return statusMap[status] || status
}
</script>

<style scoped lang="scss">
.diagnosis-history-dialog {
  :deep(.el-dialog) {
    background: linear-gradient(135deg, 
      rgba(10, 30, 50, 0.95) 0%, 
      rgba(15, 40, 70, 0.95) 50%, 
      rgba(10, 30, 50, 0.95) 100%
    );
    border: 1px solid rgba(0, 212, 255, 0.3);
    backdrop-filter: blur(10px);
  }
  
  :deep(.el-dialog__header) {
    border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    
    .el-dialog__title {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
    }
    
    .el-dialog__headerbtn .el-dialog__close {
      color: rgba(255, 255, 255, 0.7);
      
      &:hover {
        color: #00d4ff;
      }
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 20px;
    color: #fff;
  }
  
  :deep(.el-dialog__footer) {
    border-top: 1px solid rgba(0, 212, 255, 0.2);
    padding: 15px 20px;
  }
}

.query-form {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 30, 60, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  
  :deep(.el-form-item__label) {
    color: rgba(255, 255, 255, 0.8);
  }
  
  :deep(.el-input__inner) {
    background: rgba(10, 30, 50, 0.6);
    border-color: rgba(0, 212, 255, 0.3);
    color: #fff;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  :deep(.el-date-editor) {
    background: rgba(10, 30, 50, 0.6);
    border-color: rgba(0, 212, 255, 0.3);
    
    .el-input__inner {
      background: transparent;
      border: none;
    }
  }
}

.history-table {
  :deep(.el-table) {
    background: transparent;
    color: #fff;
    
    .el-table__header {
      background: rgba(0, 30, 60, 0.4);
      
      th {
        background: transparent;
        border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        color: #fff;
      }
    }
    
    .el-table__body {
      tr {
        background: transparent;
        
        &:hover td {
          background: rgba(0, 212, 255, 0.1) !important;
        }
        
        td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }
        
        &.el-table__row--striped td {
          background: rgba(255, 255, 255, 0.02);
        }
      }
    }
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  
  :deep(.el-pagination) {
    .el-pagination__total,
    .el-pagination__jump {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .el-pager li {
      background: transparent;
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      
      &:hover {
        color: #00d4ff;
        border-color: #00d4ff;
      }
      
      &.is-active {
        background: #00d4ff;
        color: #fff;
        border-color: #00d4ff;
      }
    }
    
    .btn-prev,
    .btn-next {
      background: transparent;
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      
      &:hover {
        color: #00d4ff;
        border-color: #00d4ff;
      }
    }
    
    .el-select .el-input__inner {
      background: rgba(10, 30, 50, 0.6);
      border-color: rgba(255, 255, 255, 0.2);
      color: #fff;
    }
  }
  
  // 优化对话框内的滚动条样式
  :deep(.el-table__body-wrapper) {
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(10, 30, 50, 0.4);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, 
        rgba(0, 212, 255, 0.6) 0%, 
        rgba(0, 180, 230, 0.8) 50%,
        rgba(0, 212, 255, 0.6) 100%
      );
      border-radius: 4px;
      border: 1px solid rgba(0, 212, 255, 0.2);
      
      &:hover {
        background: linear-gradient(180deg, 
          rgba(0, 212, 255, 0.8) 0%, 
          rgba(0, 200, 255, 1) 50%,
          rgba(0, 212, 255, 0.8) 100%
        );
        box-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
      }
    }
  }
}
</style>
