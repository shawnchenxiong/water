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
      <div class="maintenance-plan-container">
        <!-- 筛选区域 -->
        <div class="filter-section">
          <el-form
            ref="filterFormRef"
            :model="filterForm"
            label-width="auto"
          >
            <!-- PC端：第一行 -->
            <div class="filter-row" v-if="!isMobile">
              <el-form-item label="计划名称">
                <el-input
                  v-model="filterForm.planName"
                  placeholder="请输入"
                  clearable
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="计划状态">
                <el-select
                  v-model="filterForm.planStatus"
                  placeholder="全部"
                  clearable
                  style="width: 120px"
                >
                  <el-option
                    v-for="status in basicData.planStatuses"
                    :key="status.value"
                    :label="status.label"
                    :value="status.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="工单类型">
                <el-select
                  v-model="filterForm.workOrderType"
                  placeholder="全部"
                  clearable
                  style="width: 120px"
                >
                  <el-option
                    v-for="type in basicData.workOrderTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="循环周期">
                <el-select
                  v-model="filterForm.cycleType"
                  placeholder="全部"
                  clearable
                  style="width: 100px"
                >
                  <el-option
                    v-for="cycle in basicData.cycleTypes"
                    :key="cycle.value"
                    :label="cycle.label"
                    :value="cycle.value"
                  />
                </el-select>
              </el-form-item>
            </div>

            <!-- PC端：第二行 -->
            <div class="filter-row" v-if="!isMobile">
              <el-form-item label="更新时间">
                <el-date-picker
                  v-model="filterForm.updateTimeRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 240px"
                />
              </el-form-item>
              <el-form-item label="结束时间">
                <el-date-picker
                  v-model="filterForm.endTimeRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 240px"
                />
              </el-form-item>
            </div>

            <!-- 移动端：基础筛选（始终显示） -->
            <div class="filter-row basic-filters" v-if="isMobile">
              <el-form-item label="计划状态">
                <el-select
                  v-model="filterForm.planStatus"
                  placeholder="全部"
                  clearable
                  style="width: 120px"
                >
                  <el-option
                    v-for="status in basicData.planStatuses"
                    :key="status.value"
                    :label="status.label"
                    :value="status.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="工单类型">
                <el-select
                  v-model="filterForm.workOrderType"
                  placeholder="全部"
                  clearable
                  style="width: 120px"
                >
                  <el-option
                    v-for="type in basicData.workOrderTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
            </div>

            <!-- 移动端：高级筛选（可展开收起） -->
            <div class="advanced-filters" v-if="isMobile" :class="{ 'mobile-hidden': !isFilterExpanded }">
              <div class="filter-row">
                <el-form-item label="计划名称">
                  <el-input
                    v-model="filterForm.planName"
                    placeholder="请输入"
                    clearable
                    style="width: 200px"
                  />
                </el-form-item>
                <el-form-item label="循环周期">
                  <el-select
                    v-model="filterForm.cycleType"
                    placeholder="全部"
                    clearable
                    style="width: 100px"
                  >
                    <el-option
                      v-for="cycle in basicData.cycleTypes"
                      :key="cycle.value"
                      :label="cycle.label"
                      :value="cycle.value"
                    />
                  </el-select>
                </el-form-item>
              </div>

              <div class="filter-row">
                <el-form-item label="更新时间">
                  <el-date-picker
                    v-model="filterForm.updateTimeRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 240px"
                  />
                </el-form-item>
                <el-form-item label="结束时间">
                  <el-date-picker
                    v-model="filterForm.endTimeRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 240px"
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
              <el-button
                type="primary"
                :icon="Plus"
                @click="handleCreate"
              >
                新增
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

        <!-- 计划列表 -->
        <div class="table-section">
          <el-table
            v-loading="loading"
            :data="tableData"
            border
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="planName" label="计划名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="planStatus" label="计划状态" width="100">
              <template #default="{ row }">
                <el-tag :color="row.statusColor" size="small">
                  {{ row.planStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="workOrderType" label="工单类型" width="120">
              <template #default="{ row }">
                <el-tag
                  :color="getWorkOrderTypeColor(row.workOrderType)"
                  size="small"
                >
                  {{ row.workOrderType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="stationName" label="电站名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="firstStartTime" label="首次工单开始时间" width="160" />
            <el-table-column prop="nextStartTime" label="下次工单开始时间" width="160">
              <template #default="{ row }">
                {{ row.nextStartTime || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="cycleType" label="循环周期" width="100">
              <template #default="{ row }">
                {{ row.cycleType || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="cycleEndTime" label="循环截止时间" width="160">
              <template #default="{ row }">
                {{ row.cycleEndTime || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="updater" label="更新人" width="100" />
            <el-table-column prop="updateTime" label="更新时间" width="160" sortable="custom" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  :icon="Edit"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-dropdown
                  trigger="click"
                  @command="(command: string) => handleCommand(command, row)"
                >
                  <el-button size="small" :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-if="row.planStatus === '暂停'"
                        command="start"
                        :icon="VideoPlay"
                      >
                        启动
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-if="row.planStatus === '进行中'"
                        command="pause"
                        :icon="VideoPause"
                      >
                        暂停
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-if="['进行中', '暂停'].includes(row.planStatus)"
                        command="complete"
                        :icon="Check"
                      >
                        完成
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" :icon="Delete">
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
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
  </DeviceMonitorLayout>

  <!-- 新增/编辑计划弹窗 -->
  <MaintenancePlanDialog
    v-model="dialogVisible"
    :plan-id="currentPlanId"
    :basic-data="basicData"
    @success="handleDialogSuccess"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Edit,
  Delete,
  MoreFilled,
  VideoPlay,
  VideoPause,
  Check,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import MaintenancePlanDialog from './components/MaintenancePlanDialog.vue'
import {
  getMaintenancePlans,
  deleteMaintenancePlan,
  updatePlanStatus,
  getMaintenancePlanBasicData,
} from '@/api/maintenance/maintenancePlanApi'
import type {
  MaintenancePlan,
  MaintenancePlanQueryParams,
  MaintenancePlanBasicDataResponse,
  FilterFormData,
} from '@/api/types/maintenance-plan'
import type { StationTreeNode } from '@/types/station'

// 基础数据
const basicData = ref<MaintenancePlanBasicDataResponse>({
  workOrderTypes: [],
  users: [],
  stations: [],
  planStatuses: [],
  cycleTypes: [],
  workOrderLevels: [],
})

// 筛选表单
const filterForm = reactive<FilterFormData>({
  planName: '',
  planStatus: '',
  workOrderType: '',
  cycleType: '',
  updateTimeRange: [],
  endTimeRange: [],
})

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

// 表格数据
const tableData = ref<MaintenancePlan[]>([])
const loading = ref(false)
const selectedRows = ref<MaintenancePlan[]>([])

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

// 弹窗状态
const dialogVisible = ref(false)
const currentPlanId = ref('')

// 当前选中的电站
const selectedStationId = ref('')

/**
 * 获取工单类型颜色
 */
const getWorkOrderTypeColor = (type: string) => {
  const typeConfig = basicData.value.workOrderTypes.find(t => t.value === type)
  return typeConfig?.color || '#666666'
}

/**
 * 电站选择
 */
const handleStationSelect = (node: StationTreeNode) => {
  console.log('Selected station:', node)
  selectedStationId.value = node.regionId
  pagination.current = 1
  loadMaintenancePlans()
}

/**
 * 加载运维计划列表
 */
const loadMaintenancePlans = async () => {
  try {
    loading.value = true
    const params: MaintenancePlanQueryParams = {
      stationId: selectedStationId.value || undefined,
      planName: filterForm.planName || undefined,
      planStatus: filterForm.planStatus || undefined,
      workOrderType: filterForm.workOrderType || undefined,
      cycleType: filterForm.cycleType || undefined,
      updateTimeStart: filterForm.updateTimeRange[0] || undefined,
      updateTimeEnd: filterForm.updateTimeRange[1] || undefined,
      endTimeStart: filterForm.endTimeRange[0] || undefined,
      endTimeEnd: filterForm.endTimeRange[1] || undefined,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: 'updateTime',
      sortOrder: 'desc',
    }
    
    const response = await getMaintenancePlans(params)
    tableData.value = response.maintenancePlans
    pagination.total = response.pagination.total
  } catch (error) {
    console.error('Load maintenance plans failed:', error)
    ElMessage.error('Failed to load maintenance plans')
  } finally {
    loading.value = false
  }
}

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const data = await getMaintenancePlanBasicData()
    basicData.value = data
  } catch (error) {
    console.error('Load basic data failed:', error)
    ElMessage.error('Failed to load basic data')
  }
}

/**
 * 查询
 */
const handleSearch = () => {
  pagination.current = 1
  loadMaintenancePlans()
}

/**
 * 重置
 */
const handleReset = () => {
  Object.assign(filterForm, {
    planName: '',
    planStatus: '',
    workOrderType: '',
    cycleType: '',
    updateTimeRange: [],
    endTimeRange: [],
  })
  pagination.current = 1
  loadMaintenancePlans()
}

/**
 * 新建计划
 */
const handleCreate = () => {
  currentPlanId.value = ''
  dialogVisible.value = true
}

/**
 * 编辑计划
 */
const handleEdit = (row: MaintenancePlan) => {
  currentPlanId.value = row.id
  dialogVisible.value = true
}

/**
 * 操作命令
 */
const handleCommand = async (command: string, row: MaintenancePlan) => {
  switch (command) {
    case 'start':
      await handleStatusChange(row.id, '进行中')
      break
    case 'pause':
      await handleStatusChange(row.id, '暂停')
      break
    case 'complete':
      await handleStatusChange(row.id, '已完成')
      break
    case 'delete':
      await handleDelete(row)
      break
  }
}

/**
 * 状态变更
 */
const handleStatusChange = async (planId: string, status: string) => {
  try {
    await updatePlanStatus(planId, { status })
    ElMessage.success(`计划状态已更新为${status}`)
    loadMaintenancePlans()
  } catch (error) {
    console.error('Update status failed:', error)
    ElMessage.error('状态更新失败，请重试')
  }
}

/**
 * 删除计划
 */
const handleDelete = async (row: MaintenancePlan) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除计划 "${row.planName}" 吗？`,
      '确认删除',
      {
        type: 'warning',
      }
    )

    await deleteMaintenancePlan(row.id)
    ElMessage.success('删除成功')
    loadMaintenancePlans()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete failed:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

/**
 * 表格选择变化
 */
const handleSelectionChange = (selection: MaintenancePlan[]) => {
  selectedRows.value = selection
}

/**
 * 分页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadMaintenancePlans()
}

/**
 * 当前页变化
 */
const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadMaintenancePlans()
}

/**
 * 弹窗成功回调
 */
const handleDialogSuccess = () => {
  loadMaintenancePlans()
}

// 页面初始化
onMounted(async () => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  await loadBasicData()
  await loadMaintenancePlans()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.maintenance-plan-container {
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

// 移动端适配
@media (max-width: 768px) {
  .maintenance-plan-container {
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
          min-width: 800px;
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