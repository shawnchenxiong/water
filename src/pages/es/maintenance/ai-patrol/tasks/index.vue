<template>
  <div class="ai-patrol-tasks-container">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form
        ref="filterFormRef"
        :model="filterForm"
        label-width="auto"
      >
        <!-- PC端：第一行 -->
        <div class="filter-row" v-if="!isMobile">
          <el-form-item label="任务类型">
            <el-select v-model="filterForm.taskType" placeholder="全部" clearable style="width: 140px">
              <el-option label="全部" value="" />
              <el-option
                v-for="type in basicData.taskTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="执行模式">
            <el-select v-model="filterForm.executeMode" placeholder="全部" clearable style="width: 140px">
              <el-option label="全部" value="" />
              <el-option
                v-for="mode in basicData.executeModes"
                :key="mode.value"
                :label="mode.label"
                :value="mode.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="任务状态">
            <el-select v-model="filterForm.taskStatus" placeholder="全部" clearable style="width: 140px">
              <el-option label="全部" value="" />
              <el-option
                v-for="status in basicData.taskStatuses"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- PC端：第二行 -->
        <div class="filter-row" v-if="!isMobile">
          <el-form-item label="最后执行时间">
            <el-date-picker
              v-model="filterForm.executeTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 380px"
            />
          </el-form-item>
          <el-form-item label="关键字">
            <el-input
              v-model="filterForm.keyword"
              placeholder="任务名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
        </div>

        <!-- 移动端：基础筛选（始终显示） -->
        <div class="filter-row basic-filters" v-if="isMobile">
          <el-form-item label="任务类型">
            <el-select v-model="filterForm.taskType" placeholder="全部" clearable style="width: 140px">
              <el-option label="全部" value="" />
              <el-option
                v-for="type in basicData.taskTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="任务状态">
            <el-select v-model="filterForm.taskStatus" placeholder="全部" clearable style="width: 140px">
              <el-option label="全部" value="" />
              <el-option
                v-for="status in basicData.taskStatuses"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- 移动端：高级筛选（可展开收起） -->
        <div class="advanced-filters" v-if="isMobile" :class="{ 'mobile-hidden': !isFilterExpanded }">
          <div class="filter-row">
            <el-form-item label="执行模式">
              <el-select v-model="filterForm.executeMode" placeholder="全部" clearable style="width: 140px">
                <el-option label="全部" value="" />
                <el-option
                  v-for="mode in basicData.executeModes"
                  :key="mode.value"
                  :label="mode.label"
                  :value="mode.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="关键字">
              <el-input
                v-model="filterForm.keyword"
                placeholder="任务名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
          </div>

          <div class="filter-row">
            <el-form-item label="最后执行时间">
              <el-date-picker
                v-model="filterForm.executeTimeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 380px"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 操作按钮行 -->
        <div class="filter-actions">
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            重置
          </el-button>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新增
          </el-button>
          <el-button :icon="Delete" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
            批量删除
          </el-button>
          <!-- 移动端展开/收起按钮 -->
          <el-button 
            v-if="isMobile"
            type="text" 
            @click="toggleFilterExpanded"
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
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="taskName" label="任务名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="taskType" label="任务类型" width="120" align="center" />
        <el-table-column prop="executeMode" label="执行模式" width="120" align="center" />
        <el-table-column prop="executeTimeRange" label="执行时间段" width="180" align="center" />
        <el-table-column prop="executeInterval" label="执行时间/执行间隔" width="160" align="center" />
        <el-table-column prop="taskStatus" label="任务状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :color="getStatusColor(row.taskStatus)"
              size="small"
            >
              {{ row.taskStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastExecuteTime" label="最后执行时间" width="180" align="center" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :icon="View"
              size="small"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              type="primary"
              link
              :icon="Edit"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              :icon="Delete"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          :layout="paginationLayout"
          :pager-count="isMobile ? 3 : 7"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete, Plus, View, Edit, Refresh, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import {
  getPatrolTasks,
  getPatrolTaskBasicData,
  deletePatrolTask,
  batchDeletePatrolTasks
} from '@/api/aiPatrolApi'
import type {
  PatrolTaskRecord,
  PatrolTaskBasicData
} from '@/api/types/ai-patrol'

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 筛选展开状态
const isFilterExpanded = ref(false)
const toggleFilterExpanded = () => {
  isFilterExpanded.value = !isFilterExpanded.value
}

// 基础数据
const basicData = ref<PatrolTaskBasicData>({
  taskTypes: [],
  executeModes: [],
  taskStatuses: []
})

// 筛选表单
const filterForm = reactive({
  taskType: '',
  executeMode: '',
  taskStatus: '',
  executeTimeRange: [] as string[],
  keyword: ''
})

// 表格数据
const tableData = ref<PatrolTaskRecord[]>([])
const loading = ref(false)
const selectedRows = ref<PatrolTaskRecord[]>([])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 分页布局
const paginationLayout = computed(() => {
  return isMobile.value
    ? 'total, prev, pager, next'
    : 'total, sizes, prev, pager, next, jumper'
})

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case '执行中':
      return '#27ae60' // 绿色
    case '待执行':
      return '#e67e22' // 橙色
    case '已完成':
      return '#3498db' // 蓝色
    case '已暂停':
      return '#95a5a6' // 灰色
    default:
      return '#95a5a6'
  }
}

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const response = await getPatrolTaskBasicData()
    if (response.code === 200) {
      basicData.value = response.data
    }
  } catch (error) {
    console.error('加载基础数据失败:', error)
  }
}

/**
 * 加载任务列表
 */
const loadTaskList = async () => {
  loading.value = true
  
  try {
    const response = await getPatrolTasks({
      taskType: filterForm.taskType,
      executeMode: filterForm.executeMode,
      taskStatus: filterForm.taskStatus,
      executeTimeRange: filterForm.executeTimeRange,
      keyword: filterForm.keyword,
      current: pagination.current,
      pageSize: pagination.pageSize
    })
    
    if (response.code === 200) {
      tableData.value = response.data.records
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('加载任务列表失败:', error)
    ElMessage.error('Failed to load task list')
  } finally {
    loading.value = false
  }
}

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.current = 1
  loadTaskList()
}

/**
 * 重置筛选条件
 */
const handleReset = () => {
  Object.assign(filterForm, {
    taskType: '',
    executeMode: '',
    taskStatus: '',
    executeTimeRange: [],
    keyword: ''
  })
  pagination.current = 1
  loadTaskList()
}

/**
 * 表格选择变化
 */
const handleSelectionChange = (selection: PatrolTaskRecord[]) => {
  selectedRows.value = selection
}

/**
 * 批量删除
 */
const handleBatchDelete = async () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 条任务吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const taskIds = selectedRows.value.map(row => row.id)
        const response = await batchDeletePatrolTasks(taskIds)
        if (response.code === 200) {
          ElMessage.success(response.message)
          loadTaskList()
        }
      } catch (error) {
        console.error('批量删除失败:', error)
        ElMessage.error('Batch delete failed')
      }
    })
    .catch(() => {})
}

/**
 * 新增
 */
const handleCreate = () => {
  ElMessage.info('New task feature is under development')
}

/**
 * 查看
 */
const handleView = (row: PatrolTaskRecord) => {
  console.log('查看任务:', row)
  ElMessage.info('View feature is under development')
}

/**
 * 编辑
 */
const handleEdit = (row: PatrolTaskRecord) => {
  console.log('编辑任务:', row)
  ElMessage.info('Edit feature is under development')
}

/**
 * 删除
 */
const handleDelete = (row: PatrolTaskRecord) => {
  ElMessageBox.confirm(`确定删除任务 "${row.taskName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const response = await deletePatrolTask(row.id)
        if (response.code === 200) {
          ElMessage.success(response.message)
          loadTaskList()
        }
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('Delete failed')
      }
    })
    .catch(() => {})
}

/**
 * 分页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadTaskList()
}

/**
 * 当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadTaskList()
}

// 组件挂载
onMounted(async () => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  await loadBasicData()
  await loadTaskList()
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.ai-patrol-tasks-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .filter-section {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;

    .filter-row {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      :deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: 0;
      }
    }

    .basic-filters {
      margin-bottom: 16px;
    }

    .advanced-filters {
      transition: all 0.3s ease;
      
      &.mobile-hidden {
        display: none;
      }
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 16px;
    }
  }

  .table-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.el-table) {
      flex: 1;
    }

    .pagination-section {
      margin-top: 20px;
      padding: 16px 20px 16px 0;
      display: flex;
      justify-content: flex-end;
    }
  }
}

:deep(.el-table) {
  background-color: transparent;

  th,
  td {
    background-color: transparent;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .ai-patrol-tasks-container {
    padding: 12px;
    gap: 12px;

    .filter-section {
      padding: 12px;

      .filter-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        :deep(.el-form-item) {
          flex: 0 0 calc(50% - 6px);
          margin-bottom: 0;

          .el-form-item__label {
            font-size: 12px;
            min-width: 70px;
          }

          .el-form-item__content {
            flex: 1;

            .el-input,
            .el-select {
              width: 100% !important;
              font-size: 13px;

              .el-input__wrapper,
              .el-select__wrapper {
                min-height: 32px;
              }
            }

            .el-date-picker {
              width: 100% !important;
              font-size: 13px;
            }
          }

          // 日期选择器占满整行
          &:has(.el-date-picker) {
            flex: 0 0 100%;
          }
        }
      }

      .filter-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        margin-top: 12px;
        gap: 8px;

        .el-button {
          font-size: 13px;
        }
      }
    }

    .table-section {
      .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;

        :deep(.el-table) {
          min-width: 800px;
          font-size: 11px;

          .el-table__header th,
          .el-table__body td {
            padding: 6px 2px;

            .cell {
              padding: 0 4px;
            }
          }

          // 操作列紧凑显示
          .el-button--small {
            padding: 4px 8px;
            font-size: 11px;
          }
        }
      }

      .pagination-section {
        padding: 12px 0;
        justify-content: center;

        :deep(.el-pagination) {
          .btn-prev,
          .btn-next {
            min-width: 28px;
            padding: 0 4px;
            font-size: 11px;
          }

          .el-pager {
            li {
              min-width: 24px;
              height: 24px;
              line-height: 24px;
              font-size: 11px;
              margin: 0 2px;
            }
          }

          .el-pagination__total {
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
