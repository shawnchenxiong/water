<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree
        device-type="0919"
        :auto-select-first-leaf="false"
        @node-click="handleStationSelect"
      />
    </template>

    <!-- 右侧工单管理区 -->
    <template #right>
      <div class="work-order-container">
        <!-- Tab导航 -->
        <div class="tab-navigation">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane name="my-todo" label="待我处理" />
            <el-tab-pane name="my-done" label="我已办理" />
            <el-tab-pane name="all" label="全部工单" />
          </el-tabs>
        </div>

        <!-- 筛选条件区域 -->
        <div class="filter-section">
          <!-- 基础筛选行（移动端始终显示） -->
          <div class="filter-row basic-filters">
            <div class="filter-item">
              <label>工单类型:</label>
              <el-select v-model="filterForm.workOrderType" placeholder="全部" clearable style="width: 120px">
                <el-option label="全部" value="" />
                <el-option
                  v-for="type in basicData.workOrderTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </div>

            <div class="filter-item">
              <label>处理状态:</label>
              <el-select v-model="filterForm.flowStatus" placeholder="全部" clearable style="width: 120px">
                <el-option label="全部" value="" />
                <el-option
                  v-for="status in basicData.flowStatuses"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
            </div>
          </div>

          <!-- 高级筛选行（移动端可展开收起） -->
          <div class="advanced-filters" :class="{ 'mobile-hidden': isMobile && !isFilterExpanded }">
            <!-- PC端：分行布局 -->
            <template v-if="!isMobile">
              <!-- 第一行：4个基础筛选项 -->
              <div class="filter-row">
                <div class="filter-item">
                  <label>工单来源:</label>
                  <el-select v-model="filterForm.workOrderSource" placeholder="全部" clearable style="width: 120px">
                    <el-option label="全部" value="" />
                    <el-option
                      v-for="source in basicData.workOrderSources"
                      :key="source.value"
                      :label="source.label"
                      :value="source.value"
                    />
                  </el-select>
                </div>

                <div class="filter-item">
                  <label>是否合并:</label>
                  <el-select v-model="filterForm.isMerged" placeholder="全部" clearable style="width: 100px">
                    <el-option label="全部" value="" />
                    <el-option label="是" :value="true" />
                    <el-option label="否" :value="false" />
                  </el-select>
                </div>

                <div class="filter-item">
                  <label>工单编号:</label>
                  <el-input
                    v-model="filterForm.workOrderNumber"
                    placeholder="请输入工单编号"
                    clearable
                    style="width: 150px"
                  />
                </div>

                <div class="filter-item">
                  <label>当前处理人:</label>
                  <el-input
                    v-model="filterForm.currentProcessor"
                    placeholder="请输入处理人"
                    clearable
                    style="width: 120px"
                  />
                </div>
              </div>

              <!-- 第二行：2个日期选择器 -->
              <div class="filter-row">
                <div class="filter-item">
                  <label>开始时间:</label>
                  <el-date-picker
                    v-model="filterForm.startTimeRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 320px"
                  />
                </div>

                <div class="filter-item">
                  <label>结束时间:</label>
                  <el-date-picker
                    v-model="filterForm.endTimeRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 320px"
                  />
                </div>
              </div>
            </template>

            <!-- 移动端：分行布局 -->
            <template v-else>
              <!-- 第一行：工单来源 + 是否合并 -->
              <div class="filter-row">
                <div class="filter-item">
                  <label>工单来源:</label>
                  <el-select v-model="filterForm.workOrderSource" placeholder="全部" clearable style="width: 120px">
                    <el-option label="全部" value="" />
                    <el-option
                      v-for="source in basicData.workOrderSources"
                      :key="source.value"
                      :label="source.label"
                      :value="source.value"
                    />
                  </el-select>
                </div>

                <div class="filter-item">
                  <label>是否合并:</label>
                  <el-select v-model="filterForm.isMerged" placeholder="全部" clearable style="width: 100px">
                    <el-option label="全部" value="" />
                    <el-option label="是" :value="true" />
                    <el-option label="否" :value="false" />
                  </el-select>
                </div>
              </div>

              <!-- 第二行：工单编号 + 当前处理人 -->
              <div class="filter-row">
                <div class="filter-item">
                  <label>工单编号:</label>
                  <el-input
                    v-model="filterForm.workOrderNumber"
                    placeholder="请输入工单编号"
                    clearable
                    style="width: 150px"
                  />
                </div>

                <div class="filter-item">
                  <label>当前处理人:</label>
                  <el-input
                    v-model="filterForm.currentProcessor"
                    placeholder="请输入处理人"
                    clearable
                    style="width: 120px"
                  />
                </div>
              </div>

              <!-- 第三行：开始时间（单独一行） -->
              <div class="filter-row single-item">
                <div class="filter-item">
                  <label>开始时间:</label>
                  <el-date-picker
                    v-model="filterForm.startTimeRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 320px"
                  />
                </div>
              </div>

              <!-- 第四行：结束时间（单独一行） -->
              <div class="filter-row single-item">
                <div class="filter-item">
                  <label>结束时间:</label>
                  <el-date-picker
                    v-model="filterForm.endTimeRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 320px"
                  />
                </div>
              </div>
            </template>
          </div>

          <!-- 操作按钮行 -->
          <div class="filter-actions">
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
            <el-button type="primary" :icon="Plus" @click="handleCreate">新增</el-button>
            <el-button :icon="Setting" @click="handleWorkflowConfig">设置</el-button>
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
        </div>

        <!-- 工单表格 -->
        <div class="table-section">
          <el-table
            v-loading="loading"
            :data="workOrders"
            border
            stripe
            height="calc(100vh - 450px)"
          >
            <el-table-column prop="serialNumber" label="序号" width="80" align="center" />
            <el-table-column prop="stationName" label="电站名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="workOrderType" label="工单类型" width="100" align="center">
              <template #default="{ row }">
                <el-tag :color="getWorkOrderTypeColor(row.workOrderType)" size="small">
                  {{ row.workOrderType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="workOrderSource" label="工单来源" width="100" align="center" />
            <el-table-column prop="workOrderNumber" label="工单编号" width="140" show-overflow-tooltip />
            <el-table-column prop="workOrderDescription" label="工单描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="flowStatus" label="流转状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :color="row.statusColor" size="small">
                  {{ row.flowStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="currentProcessor" label="当前处理人" width="100" align="center" />
            <el-table-column prop="startTime" label="工单开始时间" width="150" sortable="custom">
              <template #default="{ row }">
                {{ formatDateTime(row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="endTime" label="工单完成时间" width="150" sortable="custom">
              <template #default="{ row }">
                {{ formatDateTime(row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" :icon="View" @click="handleView(row)">
                  查看
                </el-button>
                <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button link type="primary" :icon="Switch" @click="handleFlow(row)">
                  流转
                </el-button>
                <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">
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
              @current-change="handlePageChange"
            />
      </div>
    </div>
  </div>
    </template>
  </DeviceMonitorLayout>

  <!-- 新增/编辑工单弹窗 -->
  <WorkOrderDialog
    v-model="dialogVisible"
    :work-order-id="currentWorkOrderId"
    :basic-data="basicData"
    @success="handleDialogSuccess"
  />

  <!-- 工单详情弹窗 -->
  <WorkOrderDetailDialog
    v-model="detailDialogVisible"
    :work-order-id="currentWorkOrderId"
  />

  <!-- 工单流转弹窗 -->
  <WorkOrderFlowDialog
    v-model="flowDialogVisible"
    :work-order-id="currentWorkOrderId"
    :basic-data="basicData"
    @success="handleFlowSuccess"
  />

  <!-- 流程配置弹窗 -->
  <WorkflowConfigDialog
    v-model="configDialogVisible"
    :basic-data="basicData"
    @success="handleConfigSuccess"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Setting,
  View,
  Edit,
  Switch,
  Delete,
  ArrowUp,
  ArrowDown,
} from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import WorkOrderDialog from './components/WorkOrderDialog.vue'
import WorkOrderDetailDialog from './components/WorkOrderDetailDialog.vue'
import WorkOrderFlowDialog from './components/WorkOrderFlowDialog.vue'
import WorkflowConfigDialog from './components/WorkflowConfigDialog.vue'
import {
  getWorkOrders,
  getWorkOrderBasicData,
  deleteWorkOrder,
} from '@/api/maintenance/workOrderApi'
import type {
  WorkOrder,
  WorkOrderBasicDataResponse,
  WorkOrderQueryParams,
  TabTypeValue,
} from '@/api/types/work-order'
import type { StationTreeNode } from '@/types/station'

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

// 响应式数据
const loading = ref(false)
const workOrders = ref<WorkOrder[]>([])
const basicData = ref<WorkOrderBasicDataResponse>({
  workOrderTypes: [],
  workOrderSources: [],
  flowStatuses: [],
  workOrderLevels: [],
  users: [],
  stations: [],
})

// Tab和筛选
const activeTab = ref<TabTypeValue>('all')
const filterForm = reactive({
  stationId: '',
  workOrderType: '',
  workOrderSource: '',
  flowStatus: '',
  isMerged: '' as string | boolean,
  workOrderNumber: '',
  currentProcessor: '',
  startTimeRange: [] as string[],
  endTimeRange: [] as string[],
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
})

// 分页布局
const paginationLayout = computed(() => {
  return isMobile.value 
    ? 'total, prev, pager, next'
    : 'total, sizes, prev, pager, next, jumper'
})

// 弹窗
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const flowDialogVisible = ref(false)
const configDialogVisible = ref(false)
const currentWorkOrderId = ref('')

/**
 * 获取工单类型颜色
 */
const getWorkOrderTypeColor = (type: string) => {
  const typeConfig = basicData.value.workOrderTypes.find(t => t.value === type)
  return typeConfig?.color || '#666666'
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return dateTime.replace('T', ' ').substring(0, 19)
}

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const response = await getWorkOrderBasicData()
    basicData.value = response
  } catch (error) {
    ElMessage.error('Failed to load basic data')
  }
}

/**
 * 加载工单列表
 */
const loadWorkOrders = async () => {
  try {
    loading.value = true
    const params: WorkOrderQueryParams = {
      tab: activeTab.value,
      stationId: filterForm.stationId || undefined,
      workOrderType: filterForm.workOrderType || undefined,
      workOrderSource: filterForm.workOrderSource || undefined,
      flowStatus: filterForm.flowStatus || undefined,
      isMerged: filterForm.isMerged === '' ? undefined : Boolean(filterForm.isMerged),
      workOrderNumber: filterForm.workOrderNumber || undefined,
      currentProcessor: filterForm.currentProcessor || undefined,
      startTimeBegin: filterForm.startTimeRange[0] || undefined,
      startTimeEnd: filterForm.startTimeRange[1] || undefined,
      endTimeBegin: filterForm.endTimeRange[0] || undefined,
      endTimeEnd: filterForm.endTimeRange[1] || undefined,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: 'startTime',
      sortOrder: 'desc',
    }

    const response = await getWorkOrders(params)
    workOrders.value = response.workOrders
    pagination.total = response.pagination.total
  } catch (error) {
    ElMessage.error('Failed to load work orders')
  } finally {
    loading.value = false
  }
}

/**
 * 电站选择
 */
const handleStationSelect = (node: StationTreeNode) => {
  console.log('Selected station:', node)
  filterForm.stationId = node.regionId
  pagination.current = 1
  loadWorkOrders()
}

/**
 * Tab切换
 */
const handleTabChange = (tab: TabTypeValue) => {
  activeTab.value = tab
  pagination.current = 1
  loadWorkOrders()
}

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.current = 1
  loadWorkOrders()
}

/**
 * 重置筛选条件
 */
const handleReset = () => {
  Object.assign(filterForm, {
    stationId: '',
    workOrderType: '',
    workOrderSource: '',
    flowStatus: '',
    isMerged: '',
    workOrderNumber: '',
    currentProcessor: '',
    startTimeRange: [],
    endTimeRange: [],
  })
  pagination.current = 1
  loadWorkOrders()
}

/**
 * 新增工单
 */
const handleCreate = () => {
  currentWorkOrderId.value = ''
  dialogVisible.value = true
}

/**
 * 流程配置
 */
const handleWorkflowConfig = () => {
  configDialogVisible.value = true
}

/**
 * 查看工单
 */
const handleView = (workOrder: WorkOrder) => {
  currentWorkOrderId.value = workOrder.id
  detailDialogVisible.value = true
}

/**
 * 编辑工单
 */
const handleEdit = (workOrder: WorkOrder) => {
  currentWorkOrderId.value = workOrder.id
  dialogVisible.value = true
}

/**
 * 工单流转
 */
const handleFlow = (workOrder: WorkOrder) => {
  currentWorkOrderId.value = workOrder.id
  flowDialogVisible.value = true
}

/**
 * 删除工单
 */
const handleDelete = async (workOrder: WorkOrder) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除工单"${workOrder.workOrderNumber}"吗？`,
      'Warning',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    await deleteWorkOrder(workOrder.id)
    ElMessage.success('Delete successfully')
    loadWorkOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete')
    }
  }
}

/**
 * 分页大小变化
 */
const handleSizeChange = () => {
  pagination.current = 1
  loadWorkOrders()
}

/**
 * 页码变化
 */
const handlePageChange = () => {
  loadWorkOrders()
}

/**
 * 弹窗成功回调
 */
const handleDialogSuccess = () => {
  loadWorkOrders()
}

/**
 * 流转成功回调
 */
const handleFlowSuccess = () => {
  loadWorkOrders()
}

/**
 * 配置成功回调
 */
const handleConfigSuccess = () => {
  // 配置更新后可能需要刷新其他数据
  loadBasicData()
}

// 初始化
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  loadBasicData()
  loadWorkOrders()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.work-order-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .tab-navigation {
  margin-bottom: 20px;
  
    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      padding: 0 20px;
    }
  }

  .filter-section {
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(0, 30, 60, 0.3);
  border-radius: 8px;

    .filter-row {
  display: flex;
  align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .filter-item {
        display: flex;
        align-items: center;
        gap: 8px;

        label {
          font-size: 14px;
          color: #ffffff;
          white-space: nowrap;
          min-width: 80px;
        }
      }
    }

    .filter-actions {
      margin-left: auto;
      margin-top: 16px;
      display: flex;
      gap: 8px;
    }
  }

  .table-section {
    flex: 1;
    display: flex;
    flex-direction: column;

    .pagination-section {
      margin-top: 20px;
      padding: 16px 20px 16px 0;
      display: flex;
      justify-content: flex-end;
      flex-shrink: 0;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .work-order-container {
    padding: 12px;
    gap: 12px;

    .tab-navigation {
      :deep(.el-tabs) {
        .el-tabs__header {
          margin-bottom: 12px;
        }
        
        .el-tabs__nav-wrap {
          padding: 0 12px;
        }
        
        .el-tabs__item {
          font-size: 13px;
          padding: 0 12px;
        }
      }
    }

    .filter-section {
      padding: 12px;

      .filter-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 12px;

        &.single-item {
          grid-template-columns: 1fr;
        }
      }

      .advanced-filters {
        &.mobile-hidden {
          display: none;
        }
      }

      .filter-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;

        label {
          font-size: 12px;
          min-width: auto;
        }

        .el-select,
        .el-date-picker,
        .el-input {
          width: 100% !important;
          font-size: 13px;

          .el-input__wrapper,
          .el-select__wrapper {
            min-height: 32px;
          }
        }
      }

      .filter-actions {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;

        .el-button {
          flex: 1;
          max-width: 100px;
          font-size: 13px;
        }
      }
    }

    .table-section {
      .table-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;

        .table-title {
          font-size: 14px;
          text-align: center;
        }

        .table-actions {
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;

          .el-button {
            flex: 1;
            min-width: 80px;
            font-size: 12px;
          }
        }
      }

      .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;

        :deep(.el-table) {
          min-width: 900px;
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

      .pagination-section {
        padding: 12px 0;
        justify-content: center;

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
</style>