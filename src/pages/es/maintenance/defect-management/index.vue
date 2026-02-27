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

    <!-- 右侧主内容 -->
    <template #right>
      <div class="defect-management-container">
        <!-- 筛选区域 -->
        <div class="filter-section">
          <el-form
            ref="filterFormRef"
            :model="filterForm"
            label-width="auto"
          >
            <!-- PC端：第一行 -->
            <div class="filter-row" v-if="!isMobile">
              <el-form-item label="设备名称">
                <el-input
                  v-model="filterForm.deviceName1"
                  placeholder="请输入"
                  clearable
                  style="width: 160px"
                />
              </el-form-item>
              <el-form-item label="设备类型">
                <el-select
                  v-model="filterForm.deviceType"
                  placeholder="全部"
                  clearable
                  style="width: 140px"
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
              <el-form-item label="缺陷类型">
                <el-select
                  v-model="filterForm.defectType"
                  placeholder="全部"
                  clearable
                  style="width: 140px"
                >
                  <el-option label="全部" value="" />
                  <el-option
                    v-for="type in basicData.defectTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="缺陷级别">
                <el-select
                  v-model="filterForm.defectLevel"
                  placeholder="全部"
                  clearable
                  style="width: 140px"
                >
                  <el-option label="全部" value="" />
                  <el-option
                    v-for="level in basicData.defectLevels"
                    :key="level.value"
                    :label="level.label"
                    :value="level.value"
                  />
                </el-select>
              </el-form-item>
            </div>

            <!-- PC端：第二行 -->
            <div class="filter-row" v-if="!isMobile">
              <el-form-item label="缺陷原因">
                <el-select
                  v-model="filterForm.defectReason"
                  placeholder="全部"
                  clearable
                  style="width: 140px"
                >
                  <el-option label="全部" value="" />
                  <el-option
                    v-for="reason in basicData.defectReasons"
                    :key="reason.value"
                    :label="reason.label"
                    :value="reason.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="处理状态">
                <el-select
                  v-model="filterForm.handleStatus"
                  placeholder="全部"
                  clearable
                  style="width: 140px"
                >
                  <el-option label="全部" value="" />
                  <el-option
                    v-for="status in basicData.handleStatuses"
                    :key="status.value"
                    :label="status.label"
                    :value="status.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="缺陷填写时间">
                <el-date-picker
                  v-model="filterForm.submitTimeRange"
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

            <!-- 移动端：基础筛选（始终显示） -->
            <div class="filter-row basic-filters" v-if="isMobile">
              <el-form-item label="缺陷类型">
                <el-select
                  v-model="filterForm.defectType"
                  placeholder="全部"
                  clearable
                  style="width: 140px"
                >
                  <el-option label="全部" value="" />
                  <el-option
                    v-for="type in basicData.defectTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="处理状态">
                <el-select
                  v-model="filterForm.handleStatus"
                  placeholder="全部"
                  clearable
                  style="width: 140px"
                >
                  <el-option label="全部" value="" />
                  <el-option
                    v-for="status in basicData.handleStatuses"
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
                <el-form-item label="设备名称">
                  <el-input
                    v-model="filterForm.deviceName1"
                    placeholder="请输入"
                    clearable
                    style="width: 160px"
                  />
                </el-form-item>
                <el-form-item label="设备类型">
                  <el-select
                    v-model="filterForm.deviceType"
                    placeholder="全部"
                    clearable
                    style="width: 140px"
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
              </div>

              <div class="filter-row">
                <el-form-item label="缺陷级别">
                  <el-select
                    v-model="filterForm.defectLevel"
                    placeholder="全部"
                    clearable
                    style="width: 140px"
                  >
                    <el-option label="全部" value="" />
                    <el-option
                      v-for="level in basicData.defectLevels"
                      :key="level.value"
                      :label="level.label"
                      :value="level.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="缺陷原因">
                  <el-select
                    v-model="filterForm.defectReason"
                    placeholder="全部"
                    clearable
                    style="width: 140px"
                  >
                    <el-option label="全部" value="" />
                    <el-option
                      v-for="reason in basicData.defectReasons"
                      :key="reason.value"
                      :label="reason.label"
                      :value="reason.value"
                    />
                  </el-select>
                </el-form-item>
              </div>

              <div class="filter-row">
                <el-form-item label="缺陷填写时间">
                  <el-date-picker
                    v-model="filterForm.submitTimeRange"
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
              <el-button :icon="Promotion" @click="handleConvertToWorkOrder">
                转工单
              </el-button>
              <el-button :icon="Upload" @click="handleImport">
                导入
              </el-button>
              <el-button :icon="Download" @click="handleExport">
                导出
              </el-button>
              <el-button :icon="Download" @click="handleExportTemplate">
                导出模板
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
            <el-table-column
              prop="stationName"
              label="电站名称"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column
              prop="deviceName"
              label="设备名称"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="deviceType"
              label="设备类型"
              width="100"
              align="center"
            />
            <el-table-column
              prop="defectDescription"
              label="缺陷描述"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="handleStatus"
              label="处理状态"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-tag
                  :color="row.statusColor"
                  size="small"
                  effect="dark"
                >
                  {{ row.handleStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="responsibleUnit"
              label="责任单位"
              width="100"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              prop="submitter"
              label="填写人"
              width="100"
              align="center"
            />
            <el-table-column
              label="操作"
              width="180"
              fixed="right"
              align="center"
            >
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  :icon="View"
                  @click="handleView(row)"
                >
                  查看
                </el-button>
                <el-button
                  link
                  type="primary"
                  :icon="Edit"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="danger"
                  :icon="Delete"
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
  </DeviceMonitorLayout>

  <!-- 新增/编辑缺陷弹窗 -->
  <DefectDialog
    v-model="dialogVisible"
    :defect-id="currentDefectId"
    :basic-data="basicData"
    @success="handleDialogSuccess"
  />

  <!-- 缺陷详情弹窗 -->
  <DefectDetailDialog
    v-model="detailDialogVisible"
    :defect-id="currentDefectId"
  />

  <!-- 导入弹窗 -->
  <el-dialog
    v-model="importDialogVisible"
    title="导入缺陷数据"
    width="500px"
  >
    <el-upload
      ref="uploadRef"
      action="#"
      :auto-upload="false"
      :limit="1"
      accept=".xlsx,.xls"
      :on-change="handleFileChange"
    >
      <template #trigger>
        <el-button type="primary">选择文件</el-button>
      </template>
      <template #tip>
        <div class="el-upload__tip">
          只能上传 xlsx/xls 文件，且不超过 10MB
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button @click="importDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirmImport">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Promotion,
  Upload,
  Download,
  View,
  Edit,
  Delete,
  Refresh,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import DefectDialog from './components/DefectDialog.vue'
import DefectDetailDialog from './components/DefectDetailDialog.vue'
import {
  getDefectList,
  getDefectBasicData,
  deleteDefect,
  convertToWorkOrder
} from '@/api/maintenance/defectManagementApi'
import type {
  DefectRecord,
  DefectQueryParams,
  DefectBasicData,
  PaginationParams
} from '@/api/types/defect-management'
import type { StationTreeNode } from '@/types/station'
import { downloadExcel, generateTimestampFilename } from '@/utils/download'

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
const basicData = ref<DefectBasicData>({
  deviceTypes: [],
  defectTypes: [],
  defectLevels: [],
  defectReasons: [],
  handleStatuses: [],
  responsibleUnits: []
})

// 表格数据
const tableData = ref<DefectRecord[]>([])
const loading = ref(false)
const selectedRows = ref<DefectRecord[]>([])


// 筛选表单
const filterForm = reactive({
  stationId: '',
  deviceName1: '',
  deviceName2: '',
  deviceType: '',
  defectType: '',
  defectLevel: '',
  defectReason: '',
  handleStatus: '',
  submitTimeRange: [] as string[]
})

// 分页参数
const pagination = reactive<PaginationParams>({
  current: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0
})

// 分页布局
const paginationLayout = computed(() => {
  return isMobile.value 
    ? 'total, prev, pager, next'
    : 'total, sizes, prev, pager, next, jumper'
})

// 弹窗控制
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const importDialogVisible = ref(false)
const currentDefectId = ref('')

// 上传相关
const uploadRef = ref()
const uploadFile = ref<File | null>(null)

/**
 * 电站选择
 */
const handleStationSelect = (node: StationTreeNode) => {
  console.log('Selected station:', node)
  filterForm.stationId = node.regionId
  pagination.current = 1
  loadDefectList()
}

/**
 * 加载缺陷列表
 */
const loadDefectList = async () => {
  loading.value = true
  try {
    const params: DefectQueryParams = {
      stationId: filterForm.stationId || '',
      deviceName1: filterForm.deviceName1 || undefined,
      deviceName2: filterForm.deviceName2 || undefined,
      deviceType: filterForm.deviceType || undefined,
      defectType: filterForm.defectType || undefined,
      defectLevel: filterForm.defectLevel || undefined,
      defectReason: filterForm.defectReason || undefined,
      handleStatus: filterForm.handleStatus || undefined,
      submitTimeStart: filterForm.submitTimeRange[0] || undefined,
      submitTimeEnd: filterForm.submitTimeRange[1] || undefined,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: 'submitTime',
      sortOrder: 'desc'
    }

    const response = await getDefectList(params)
    if (response.code === 200) {
      tableData.value = response.data.defects
      pagination.total = response.data.pagination.total
      pagination.totalPages = response.data.pagination.totalPages || 0
    } else {
      ElMessage.error('Failed to load defect list')
    }
  } catch (error) {
    console.error('加载缺陷列表失败:', error)
    ElMessage.error('Failed to load defect list, please try again')
  } finally {
    loading.value = false
  }
}

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const response = await getDefectBasicData()
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
  loadDefectList()
}

/**
 * 重置筛选条件
 */
const handleReset = () => {
  Object.assign(filterForm, {
    stationId: '',
    deviceName1: '',
    deviceName2: '',
    deviceType: '',
    defectType: '',
    defectLevel: '',
    defectReason: '',
    handleStatus: '',
    submitTimeRange: []
  })
  pagination.current = 1
  loadDefectList()
}

/**
 * 表格选择变化
 */
const handleSelectionChange = (selection: DefectRecord[]) => {
  selectedRows.value = selection
}

/**
 * 新增缺陷
 */
const handleCreate = () => {
  currentDefectId.value = ''
  dialogVisible.value = true
}

/**
 * 查看缺陷
 */
const handleView = (row: DefectRecord) => {
  currentDefectId.value = row.id
  detailDialogVisible.value = true
}

/**
 * 编辑缺陷
 */
const handleEdit = (row: DefectRecord) => {
  currentDefectId.value = row.id
  dialogVisible.value = true
}

/**
 * 删除缺陷
 */
const handleDelete = async (row: DefectRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除缺陷"${row.id}"吗？`,
      'Warning',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    await deleteDefect(row.id)
    ElMessage.success('Delete successfully')
    loadDefectList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete')
    }
  }
}

/**
 * 转工单
 */
const handleConvertToWorkOrder = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('Please select defects to convert')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedRows.value.length} 条缺陷转为工单吗？`,
      'Confirm',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'info'
      }
    )

    const defectIds = selectedRows.value.map(row => row.id)
    const response = await convertToWorkOrder(defectIds)
    
    if (response.code === 200) {
      ElMessage.success(`Successfully converted to work order: ${response.data.workOrderId}`)
      loadDefectList()
    } else {
      ElMessage.error('Failed to convert to work order')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to convert to work order')
    }
  }
}

/**
 * 导入
 */
const handleImport = () => {
  importDialogVisible.value = true
}

/**
 * 文件选择
 */
const handleFileChange = (file: any) => {
  uploadFile.value = file.raw
}

/**
 * 确认导入
 */
const handleConfirmImport = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('Please select a file')
    return
  }

  try {
    // TODO: 实现导入功能
    const response = { code: 200, data: { successCount: 0, failCount: 0 } }
    // const response = await importDefects(uploadFile.value)
    if (response.code === 200) {
      ElMessage.success(
        `Import completed. Success: ${response.data.successCount}, Failed: ${response.data.failCount}`
      )
      importDialogVisible.value = false
      uploadFile.value = null
      uploadRef.value?.clearFiles()
      loadDefectList()
    } else {
      ElMessage.error('Import failed')
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('Import failed, please try again')
  }
}

/**
 * 导出
 */
const handleExport = () => {
  try {
    if (tableData.value.length === 0) {
      ElMessage.warning('No data to export')
      return
    }

    // 定义导出列配置
    const exportColumns = [
      { prop: 'stationName', label: '电站名称', width: 140 },
      { prop: 'defectType', label: '缺陷类型', width: 120 },
      { prop: 'deviceName', label: '设备名称', width: 140 },
      { prop: 'deviceType', label: '设备类型', width: 120 },
      { prop: 'defectLevel', label: '缺陷级别', width: 100 },
      { prop: 'defectReason', label: '缺陷原因', width: 160 },
      { 
        prop: 'defectDescription', 
        label: '缺陷描述', 
        width: 200,
        formatter: (row: any) => row.defectDescription || '-'
      },
      { prop: 'handleStatus', label: '处理状态', width: 100 },
      { 
        prop: 'responsibleUnit', 
        label: '责任单位', 
        width: 140,
        formatter: (row: any) => row.responsibleUnit || '-'
      },
      { 
        prop: 'submitter', 
        label: '提交人', 
        width: 100,
        formatter: (row: any) => row.submitter || '-'
      },
      { prop: 'submitTime', label: '缺陷填写时间', width: 160 }
    ]

    // 生成文件名
    const filename = generateTimestampFilename('缺陷列表')

    // 使用工具函数导出Excel
    downloadExcel(tableData.value, exportColumns, filename, '缺陷列表')
    ElMessage.success('Export successfully')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('Export failed, please try again')
  }
}

/**
 * 导出模板
 */
const handleExportTemplate = () => {
  try {
    // 准备模板数据 - 创建一个空行作为模板
    const templateData = [
      {
        stationName: '',
        deviceName: '',
        deviceType: '',
        defectType: '',
        defectLevel: '',
        defectReason: '',
        defectDescription: '',
        handleStatus: '',
        responsibleUnit: '',
        submitter: ''
      }
    ]

    // 定义模板列配置
    const templateColumns = [
      { prop: 'stationName', label: '电站名称', width: 140 },
      { prop: 'deviceName', label: '设备名称', width: 140 },
      { prop: 'deviceType', label: '设备类型', width: 120 },
      { prop: 'defectType', label: '缺陷类型', width: 120 },
      { prop: 'defectLevel', label: '缺陷级别', width: 100 },
      { prop: 'defectReason', label: '缺陷原因', width: 160 },
      { prop: 'defectDescription', label: '缺陷描述', width: 200 },
      { prop: 'handleStatus', label: '处理状态', width: 100 },
      { prop: 'responsibleUnit', label: '责任单位', width: 140 },
      { prop: 'submitter', label: '提交人', width: 100 }
    ]

    // 生成文件名
    const filename = generateTimestampFilename('缺陷导入模板')

    // 使用工具函数导出Excel
    downloadExcel(templateData, templateColumns, filename, '缺陷导入模板')
    ElMessage.success('Export template successfully')
  } catch (error) {
    console.error('导出模板失败:', error)
    ElMessage.error('Export template failed, please try again')
  }
}

/**
 * 分页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadDefectList()
}

/**
 * 当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadDefectList()
}

/**
 * 弹窗成功回调
 */
const handleDialogSuccess = () => {
  loadDefectList()
}

// 组件挂载
onMounted(async () => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  await loadBasicData()
  await loadDefectList()
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.defect-management-container {
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
  .defect-management-container {
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

            .el-button {
              width: 100%;
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
        gap: 8px;
        margin-top: 12px;

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
