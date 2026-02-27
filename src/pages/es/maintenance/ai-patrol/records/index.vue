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
      <div class="patrol-records-container">
        <!-- 筛选区域 -->
        <div class="filter-section">
          <el-form
            ref="filterFormRef"
            :model="filterForm"
            label-width="auto"
          >
            <!-- PC端：充分利用空间的紧凑布局 -->
            <div class="filter-content" v-if="!isMobile">
              <!-- 第一行：基础筛选 -->
              <div class="filter-row">
                <el-form-item label="设备类型">
                  <el-select
                    v-model="filterForm.deviceType"
                    placeholder="全部"
                    clearable
                    style="width: 160px"
                  >
                    <el-option label="全部" value="" />
                    <el-option
                      v-for="type in basicData.deviceTypes"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="巡检结果">
                  <el-select
                    v-model="filterForm.result"
                    placeholder="全部"
                    clearable
                    style="width: 120px"
                  >
                    <el-option label="全部" value="" />
                    <el-option
                      v-for="result in basicData.results"
                      :key="result.value"
                      :label="result.label"
                      :value="result.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="审核状态">
                  <el-select
                    v-model="filterForm.auditStatus"
                    placeholder="全部"
                    clearable
                    style="width: 120px"
                  >
                    <el-option label="全部" value="" />
                    <el-option
                      v-for="status in basicData.auditStatuses"
                      :key="status.value"
                      :label="status.label"
                      :value="status.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="关键字">
                  <el-input
                    v-model="filterForm.keyword"
                    placeholder="设备名称/位置"
                    clearable
                    style="width: 200px"
                  />
                </el-form-item>
              </div>
              <!-- 第二行：时间筛选 -->
              <div class="filter-row">
                <el-form-item label="巡检时间">
                  <el-date-picker
                    v-model="filterForm.inspectionTimeRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 400px"
                  />
                </el-form-item>
              </div>
            </div>

            <!-- 移动端：展开收起布局 -->
            <div class="filter-content mobile-layout" v-else>
              <!-- 基础筛选（始终显示） -->
              <div class="filter-row basic-filters">
                <el-form-item label="设备类型">
                  <el-select
                    v-model="filterForm.deviceType"
                    placeholder="全部"
                    clearable
                    style="width: 160px"
                  >
                    <el-option label="全部" value="" />
                    <el-option
                      v-for="type in basicData.deviceTypes"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="巡检结果">
                  <el-select
                    v-model="filterForm.result"
                    placeholder="全部"
                    clearable
                    style="width: 120px"
                  >
                    <el-option label="全部" value="" />
                    <el-option
                      v-for="result in basicData.results"
                      :key="result.value"
                      :label="result.label"
                      :value="result.value"
                    />
                  </el-select>
                </el-form-item>
              </div>

              <!-- 高级筛选（移动端可展开收起） -->
              <div class="advanced-filters" :class="{ 'mobile-hidden': !isFilterExpanded }">
                <div class="filter-row">
                  <el-form-item label="审核状态">
                    <el-select
                      v-model="filterForm.auditStatus"
                      placeholder="全部"
                      clearable
                      style="width: 120px"
                    >
                      <el-option label="全部" value="" />
                      <el-option
                        v-for="status in basicData.auditStatuses"
                        :key="status.value"
                        :label="status.label"
                        :value="status.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="关键字">
                    <el-input
                      v-model="filterForm.keyword"
                      placeholder="设备名称/位置"
                      clearable
                      style="width: 200px"
                    />
                  </el-form-item>
                </div>
                <div class="filter-row">
                  <el-form-item label="巡检时间" class="mobile-date-picker-item">
                    <el-date-picker
                      v-model="filterForm.inspectionTimeRange"
                      type="datetimerange"
                      range-separator="至"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      class="mobile-date-picker"
                      style="width: 400px"
                    />
                  </el-form-item>
                </div>
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
              <el-button :icon="Download" @click="handleExport">
                导出
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
            stripe
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="stationName" label="电站名称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="location" label="设备位置" min-width="120" show-overflow-tooltip />
            <el-table-column prop="deviceName" label="设备名称" min-width="130" show-overflow-tooltip />
            <el-table-column prop="deviceType" label="设备类型" width="140" align="center" />
            <el-table-column prop="pointName" label="巡检点位" min-width="120" show-overflow-tooltip />
            <el-table-column prop="inspectionTime" label="巡检时间" width="180" align="center" />
            <el-table-column prop="result" label="巡检结果" width="100" align="center">
              <template #default="{ row }">
                <el-tag :color="getResultColor(row.result)" size="small">
                  {{ row.result }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="auditStatus" label="审核状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :color="getAuditStatusColor(row.auditStatus)" size="small">
                  {{ row.auditStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
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
                  v-if="row.auditStatus === '待审核'"
                  type="success"
                  link
                  :icon="Check"
                  size="small"
                  @click="handleAudit(row)"
                >
                  审核
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-section" v-if="tableData.length > 0">
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
    </template>
  </DeviceMonitorLayout>

  <!-- 巡检记录详情弹窗 -->
  <el-dialog
    v-model="detailDialogVisible"
    title="巡检记录详情"
    :width="isMobile ? '95%' : '800px'"
    :close-on-click-modal="false"
  >
    <div v-if="currentRecord" class="record-detail">
      <el-descriptions :column="isMobile ? 1 : 2" border>
        <el-descriptions-item label="电站名称">{{ currentRecord.stationName }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ currentRecord.taskName }}</el-descriptions-item>
        <el-descriptions-item label="设备位置">{{ currentRecord.location }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentRecord.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ currentRecord.deviceType }}</el-descriptions-item>
        <el-descriptions-item label="巡检点位">{{ currentRecord.pointName }}</el-descriptions-item>
        <el-descriptions-item label="巡检时间">{{ currentRecord.inspectionTime }}</el-descriptions-item>
        <el-descriptions-item label="巡检结果">
          <el-tag :color="getResultColor(currentRecord.result)" size="small">
            {{ currentRecord.result }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 异常描述 -->
      <div v-if="currentRecord.abnormalDesc" class="abnormal-desc">
        <h4>异常描述</h4>
        <p>{{ currentRecord.abnormalDesc }}</p>
    </div>
    
      <!-- 巡检图片 -->
      <div v-if="currentRecord.images && currentRecord.images.length > 0" class="inspection-images">
        <h4>巡检图片</h4>
        <div class="image-grid">
          <div
            v-for="(image, index) in currentRecord.images"
            :key="index"
            class="image-item"
          >
            <el-image
              :src="image"
              :preview-src-list="currentRecord.images"
              :initial-index="index"
              fit="cover"
              style="width: 100px; height: 100px"
            />
          </div>
        </div>
      </div>

      <!-- 审核信息 -->
      <div v-if="currentRecord.auditStatus !== '待审核'" class="audit-info">
        <h4>审核信息</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="审核状态">
            <el-tag :color="getAuditStatusColor(currentRecord.auditStatus)" size="small">
              {{ currentRecord.auditStatus }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.auditor" label="审核人">
            {{ currentRecord.auditor }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.auditTime" label="审核时间">
            {{ currentRecord.auditTime }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.auditRemark" label="审核备注">
            {{ currentRecord.auditRemark }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    <template #footer>
      <el-button @click="detailDialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 审核弹窗 -->
  <el-dialog
    v-model="auditDialogVisible"
    title="审核巡检记录"
    :width="isMobile ? '95%' : '500px'"
    :close-on-click-modal="false"
  >
    <el-form
      ref="auditFormRef"
      :model="auditForm"
      :rules="auditRules"
      label-width="80px"
    >
      <el-form-item label="审核结果" prop="result">
        <el-radio-group v-model="auditForm.result">
          <el-radio label="已审核">通过</el-radio>
          <el-radio label="已驳回">驳回</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="审核备注" prop="remark">
        <el-input
          v-model="auditForm.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入审核备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="auditDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirmAudit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Search, 
  Refresh, 
  Download, 
  View, 
  Check,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import { getPatrolRecords, getPatrolRecordBasicData } from '@/api/patrolRecordApi'
import type { 
  PatrolRecord, 
  PatrolRecordBasicData, 
  PatrolRecordQueryParams 
} from '@/api/types/ai-patrol'
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

// 基础数据
const basicData = ref<PatrolRecordBasicData>({
  deviceTypes: [],
  results: [],
  auditStatuses: []
})

// 筛选表单
const filterForm = reactive<PatrolRecordQueryParams>({
  stationId: '',
  deviceType: '',
  result: '',
  auditStatus: '',
  inspectionTimeRange: [],
  keyword: ''
})

// 表格数据
const tableData = ref<PatrolRecord[]>([])
const loading = ref(false)
const selectedRows = ref<PatrolRecord[]>([])

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

// 弹窗控制
const detailDialogVisible = ref(false)
const auditDialogVisible = ref(false)
const currentRecord = ref<PatrolRecord | null>(null)

// 审核表单
const auditForm = reactive({
  result: '已审核',
  remark: ''
})

const auditRules = {
  result: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  remark: [
    { required: true, message: '请输入审核备注', trigger: 'blur' }
  ]
}

/**
 * 获取巡检结果颜色
 */
const getResultColor = (result: string) => {
  switch (result) {
    case '正常':
      return '#27ae60' // 绿色
    case '异常':
      return '#e74c3c' // 红色
    case '警告':
      return '#f39c12' // 黄色
    default:
      return '#95a5a6' // 灰色
  }
}

/**
 * 获取审核状态颜色
 */
const getAuditStatusColor = (status: string) => {
  switch (status) {
    case '待审核':
      return '#e67e22' // 橙色
    case '已审核':
      return '#27ae60' // 绿色
    case '已驳回':
      return '#e74c3c' // 红色
    default:
      return '#95a5a6' // 灰色
  }
}

/**
 * 加载巡检记录列表
 */
const loadPatrolRecords = async () => {
  loading.value = true
  try {
    const params = {
      ...filterForm,
      current: pagination.current,
      pageSize: pagination.pageSize
    }
    const response = await getPatrolRecords(params)
    if (response.code === 200) {
      tableData.value = response.data.records
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('加载巡检记录失败:', error)
    ElMessage.error('加载巡检记录失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const response = await getPatrolRecordBasicData()
    if (response.code === 200) {
      basicData.value = response.data
    }
  } catch (error) {
    console.error('加载基础数据失败:', error)
  }
}

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.current = 1
  loadPatrolRecords()
}

/**
 * 重置筛选条件
 */
const handleReset = () => {
  Object.assign(filterForm, {
    deviceType: '',
    result: '',
    auditStatus: '',
    inspectionTimeRange: [],
    keyword: ''
  })
  pagination.current = 1
  loadPatrolRecords()
}

/**
 * 表格选择变化
 */
const handleSelectionChange = (selection: PatrolRecord[]) => {
  selectedRows.value = selection
}

/**
 * 查看详情
 */
const handleView = (row: PatrolRecord) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

/**
 * 审核记录
 */
const handleAudit = (row: PatrolRecord) => {
  currentRecord.value = row
  auditForm.result = '已审核'
  auditForm.remark = ''
  auditDialogVisible.value = true
}

/**
 * 确认审核
 */
const handleConfirmAudit = () => {
  // TODO: 实现审核逻辑
  ElMessage.success(`${auditForm.result}成功`)
  auditDialogVisible.value = false
  loadPatrolRecords()
}

/**
 * 导出记录
 */
const handleExport = () => {
  ElMessage.info('导出功能待实现')
}

/**
 * 电站树节点点击
 */
const handleStationSelect = (node: StationTreeNode) => {
  filterForm.stationId = node.regionId
  handleSearch()
}

/**
 * 分页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadPatrolRecords()
}

/**
 * 当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadPatrolRecords()
}

// 组件挂载
onMounted(async () => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  await loadBasicData()
  await loadPatrolRecords()
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.patrol-records-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;

  .filter-section {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 20px;

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

    // PC端布局
    .filter-content:not(.mobile-layout) {
      .filter-row {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 16px;
        flex-wrap: wrap;

        &:last-child {
          margin-bottom: 0;
        }

        :deep(.el-form-item) {
          margin-bottom: 0;
          margin-right: 0;
        }
      }
    }

    // 移动端布局
    .mobile-layout {
      .basic-filters {
        margin-bottom: 16px;
      }

      .advanced-filters {
        transition: all 0.3s ease;

        &.mobile-hidden {
          display: none;
        }
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
      background-color: transparent;

      th,
      td {
        background-color: transparent;
      }
    }
  }

  .pagination-section {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
  }
}

// 记录详情样式
.record-detail {
  .abnormal-desc {
    margin-top: 20px;

    h4 {
      color: #ffffff;
      margin-bottom: 10px;
    }

    p {
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.6;
      background-color: rgba(239, 76, 60, 0.1);
      padding: 12px;
      border-radius: 4px;
      border-left: 4px solid #ef4c3c;
    }
  }

  .inspection-images {
    margin-top: 20px;

    h4 {
      color: #ffffff;
      margin-bottom: 10px;
    }

    .image-grid {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      .image-item {
        border-radius: 4px;
        overflow: hidden;
      }
    }
  }

  .audit-info {
    margin-top: 20px;

    h4 {
  color: #ffffff;
      margin-bottom: 10px;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .patrol-records-container {
    padding: 12px;
    gap: 12px;

    .filter-section {
      padding: 12px;

      .mobile-layout {
        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;

          :deep(.el-form-item) {
            flex: 0 0 calc(50% - 6px) !important;
            margin-bottom: 0;
            width: calc(50% - 6px);

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
          }

          // 日期选择器特殊处理 - 使用属性选择器而不是:has()
          .el-form-item {
            &:nth-child(n) {
              .el-form-item__content {
                .mobile-date-picker {
                  width: 100% !important;
                  max-width: 260px !important;
                  font-size: 12px;
                  
                  :deep(.el-input__wrapper) {
                    font-size: 11px;
                    min-height: 28px;
                    padding: 0 6px;
                  }
                  
                  :deep(.el-range-separator) {
                    font-size: 10px;
                    padding: 0 4px;
                  }
                  
                  :deep(.el-input__inner) {
                    font-size: 11px;
                  }
                }
              }
            }
          }
        }

        // 包含日期选择器的表单项占满整行
        .filter-row .el-form-item:has(.mobile-date-picker),
        .mobile-date-picker-item {
          flex: 0 0 100% !important;
          width: 100% !important;
        }
      }

      .filter-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        gap: 8px;
        margin-top: 12px;

        .el-button {
          font-size: 13px;
        }
      }
    }

    .table-section {
      :deep(.el-table) {
        font-size: 12px;

        .el-table__header th,
        .el-table__body td {
          padding: 8px 4px;
        }

        .cell {
          padding: 0 8px;
        }

        // 隐藏选择列
        .el-table__column--selection {
          display: none;
        }

        // 操作列紧凑显示
        .el-button--small {
          padding: 4px 8px;
          font-size: 11px;
        }
      }
    }

    .pagination-section {
      justify-content: center;
      padding: 12px 0;

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

  // 弹窗适配
  :deep(.el-dialog) {
    .el-dialog__body {
      padding: 16px 12px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .el-descriptions {
      :deep(.el-descriptions__label) {
        font-size: 12px;
        width: 80px;
      }

      :deep(.el-descriptions__content) {
        font-size: 12px;
      }
    }

    .record-detail {
      .abnormal-desc,
      .audit-info {
        h4 {
          font-size: 14px;
        }
      }

      .inspection-images {
        .image-grid {
          .image-item {
            :deep(.el-image) {
              width: 80px !important;
              height: 80px !important;
            }
          }
        }
      }
    }
  }
}
</style>