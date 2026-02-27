<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree
        device-type="0919"
        :auto-select-first-leaf="true"
        @node-click="handleStationSelect"
      />
    </template>

    <!-- 右侧主内容 -->
    <template #right>
      <div class="inspection-records-container">
        <!-- 操作区域 -->
        <div class="action-section">
          <el-button :icon="Refresh" @click="loadRecordList">
            刷新
          </el-button>
        </div>

        <!-- 记录列表 -->
        <div class="table-section">
          <el-table
            v-loading="loading"
            :data="tableData"
            :height="tableHeight"
            stripe
            @sort-change="handleSortChange"
          >
            <el-table-column
              prop="inspectionType"
              label="巡检类型"
              width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="stationName"
              label="巡检电站"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column
              prop="inspectionStatus"
              label="巡检状态"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-tag
                  :type="getStatusTagType(row.inspectionStatus)"
                  size="small"
                >
                  {{ row.inspectionStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="inspectionNotes"
              label="巡检耗注"
              min-width="200"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span v-if="row.inspectionNotes">{{ row.inspectionNotes }}</span>
                <span v-else class="text-placeholder">-</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="inspector"
              label="巡检人员"
              width="100"
              show-overflow-tooltip
            />
            <el-table-column
              prop="updateTime"
              label="更新时间"
              width="160"
              sortable="custom"
              show-overflow-tooltip
            />
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-section">
          <div class="pagination-info">
            共{{ pagination.total }}条
          </div>
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[20, 50, 100]"
            layout="sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'

// API 导入
import {
  getInspectionRecordList,
  getInspectionRecordBasicData
} from '@/api/maintenance/mobileInspectionRecordsApi'

// 类型导入
import type {
  InspectionRecord,
  InspectionRecordQueryParams,
  InspectionRecordBasicData,
  PaginationParams,
  SortParams
} from '@/api/types/mobile-inspection-records'
import type { StationTreeNode } from '@/types/station'

// 基础数据
const basicData = ref<InspectionRecordBasicData>({
  inspectionTypes: [],
  inspectionStatuses: []
})

// 表格数据
const tableData = ref<InspectionRecord[]>([])
const loading = ref(false)

// 当前选中的电站
const selectedStationId = ref('')
const selectedStationName = ref('')

/**
 * 电站选择
 */
const handleStationSelect = (node: StationTreeNode) => {
  console.log('Selected station:', node)
  selectedStationId.value = node.regionId
  selectedStationName.value = node.regionName
  pagination.current = 1
  loadRecordList()
}

// 分页参数
const pagination = reactive<PaginationParams>({
  current: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0
})

// 排序参数
const sortParams = reactive<SortParams>({
  field: 'updateTime',
  order: 'desc'
})

// 表格高度计算
const tableHeight = computed(() => {
  return 'calc(100vh - 280px)'
})

/**
 * 获取状态标签类型
 */
const getStatusTagType = (status: string) => {
  const statusMap = {
    '待开始': 'info' as const,
    '进行中': 'warning' as const,
    '已完成': 'success' as const,
    '已暂停': 'danger' as const
  }
  return statusMap[status as keyof typeof statusMap] || 'info' as const
}

/**
 * 加载记录列表
 */
const loadRecordList = async () => {
  if (!selectedStationId.value) {
    tableData.value = []
    pagination.total = 0
    return
  }

  loading.value = true
  try {
    const params: InspectionRecordQueryParams = {
      stationId: selectedStationId.value,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sortParams.field,
      sortOrder: sortParams.order
    }

    const response = await getInspectionRecordList(params)
    if (response.code === 200) {
      tableData.value = response.data.inspectionRecords
      pagination.total = response.data.pagination.total
      pagination.totalPages = response.data.pagination.totalPages
    } else {
      ElMessage.error('获取记录列表失败')
    }
  } catch (error) {
    console.error('加载记录列表失败:', error)
    ElMessage.error('加载记录列表失败，请重试')
  } finally {
    loading.value = false
  }
}

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const response = await getInspectionRecordBasicData()
    if (response.code === 200) {
      basicData.value = response.data
    }
  } catch (error) {
    console.error('加载基础数据失败:', error)
  }
}

/**
 * 排序变化
 */
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  if (prop && order) {
    sortParams.field = prop
    sortParams.order = order === 'ascending' ? 'asc' : 'desc'
    pagination.current = 1
    loadRecordList()
  }
}

/**
 * 分页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadRecordList()
}

/**
 * 当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadRecordList()
}

// 组件挂载
onMounted(async () => {
  await loadBasicData()
  
  // 等待StationTree组件加载完成后，如果有自动选择的节点，会触发node-click事件
  await nextTick()
})
</script>

<style scoped lang="scss">
.inspection-records-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .action-section {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 20px;
  }

  .table-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.el-table) {
      flex: 1;

      .el-table__header-wrapper {
        th {
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          border-bottom: 1px solid #333;
        }
      }

      .el-table__body-wrapper {
        .el-table__row {
          background-color: rgba(255, 255, 255, 0.02);
          color: #cccccc;

          &:hover {
            background-color: rgba(0, 212, 255, 0.1);
          }

          &.el-table__row--striped {
            background-color: rgba(255, 255, 255, 0.05);

            &:hover {
              background-color: rgba(0, 212, 255, 0.1);
            }
          }

          td {
            border-bottom: 1px solid #333;
          }
        }
      }

      .el-table__empty-block {
        background-color: transparent;
        color: #cccccc;
      }
    }

    .text-placeholder {
      color: #909399;
      font-style: italic;
    }
  }

  .pagination-section {
    margin-top: 20px;
    padding: 16px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    .pagination-info {
      color: #cccccc;
      font-size: 14px;
    }

    :deep(.el-pagination) {
      .el-pagination__total,
      .el-pagination__jump,
      .el-pager li,
      .el-pagination__sizes .el-select .el-input__inner {
        color: #cccccc;
      }

      .el-pager li.is-active {
        background-color: #00d4ff;
        color: #ffffff;
      }

      .btn-prev,
      .btn-next {
        color: #cccccc;

        &:hover {
          color: #00d4ff;
        }

        &.is-disabled {
          color: #666;
        }
      }

      .el-pagination__sizes {
        .el-select {
          .el-input {
            .el-input__wrapper {
              background-color: rgba(255, 255, 255, 0.05);
              border-color: #333;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1400px) {
  .inspection-records-container {
    .table-section {
      :deep(.el-table) {
        font-size: 12px;
      }
    }
  }
}

// 状态标签样式
:deep(.el-tag) {
  &.el-tag--info {
    background-color: rgba(144, 147, 153, 0.2);
    border-color: #909399;
    color: #909399;
  }

  &.el-tag--warning {
    background-color: rgba(230, 162, 60, 0.2);
    border-color: #E6A23C;
    color: #E6A23C;
  }

  &.el-tag--success {
    background-color: rgba(103, 194, 58, 0.2);
    border-color: #67C23A;
    color: #67C23A;
  }

  &.el-tag--danger {
    background-color: rgba(245, 108, 108, 0.2);
    border-color: #F56C6C;
    color: #F56C6C;
  }
}
</style>