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

    <!-- 右侧设备台账管理区 -->
    <template #right>
      <div class="device-ledger-container">
        <!-- 筛选区域 -->
        <div class="filter-section">
          <el-form :model="filterForm" inline>
            <el-form-item label="设备分类">
              <el-select
                v-model="filterForm.deviceCategory"
                placeholder="请选择"
                clearable
                style="width: 160px"
              >
                <el-option label="全部" value="all" />
                <el-option
                  v-for="category in deviceCategories"
                  :key="category.value"
                  :label="category.label"
                  :value="category.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="生产厂家">
              <el-input
                v-model="filterForm.manufacturer"
                placeholder="请输入"
                clearable
                style="width: 200px"
              />
            </el-form-item>

            <el-form-item label="设备类型">
              <el-input
                v-model="filterForm.deviceType"
                placeholder="请输入"
                clearable
                style="width: 160px"
              />
            </el-form-item>

            <el-form-item label="设备名称">
              <el-input
                v-model="filterForm.deviceName"
                placeholder="请输入"
                clearable
                style="width: 160px"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
              <el-button :icon="Refresh" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
            <el-button
              type="danger"
              :icon="Delete"
              :disabled="selectedIds.length === 0"
              @click="handleBatchDelete"
            >
              删除
            </el-button>
            <el-button :icon="Upload" @click="handleImport">导入</el-button>
            <el-button :icon="Download" @click="handleExport">导出</el-button>
            <el-button :icon="DocumentCopy" @click="handleDownloadTemplate">导出模板</el-button>
    </div>
        </div>

        <!-- 表格区域 -->
        <div class="table-section">
          <div class="table-wrapper">
            <el-table
              v-loading="tableLoading"
              :data="tableData"
              border
              stripe
              :height="tableHeight"
              class="device-ledger-table"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column prop="stationName" label="电站名称" min-width="160" show-overflow-tooltip />
              <el-table-column prop="deviceName" label="设备名称" min-width="140" show-overflow-tooltip />
              <el-table-column prop="deviceCategory" label="设备分类" width="100" show-overflow-tooltip />
              <el-table-column prop="deviceNumber" label="设备编号" min-width="140" show-overflow-tooltip />
              <el-table-column prop="manufacturer" label="生产厂家" min-width="160" show-overflow-tooltip />
              <el-table-column prop="installLocation" label="安装地点" min-width="120" show-overflow-tooltip />
              <el-table-column prop="commissioningDate" label="投产日期" width="100" />
              <el-table-column prop="deviceStatus" label="设备状态" width="90" align="center">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.statusColor)" size="small">
                    {{ row.deviceStatus }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right" align="center" class-name="table-operations">
                <template #default="{ row }">
                  <div class="operation-buttons">
                    <el-button link type="primary" size="small" :icon="View" @click="handleView(row)">
                      查看
                    </el-button>
                    <el-button link type="primary" size="small" :icon="Edit" @click="handleEdit(row)">
                      编辑
                    </el-button>
                    <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div class="pagination-section">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
      </div>
    </div>
  </div>
    </template>
  </DeviceMonitorLayout>

  <!-- 新增/编辑弹窗 -->
  <DeviceLedgerDialog
    v-model="dialogVisible"
    :mode="dialogMode"
    :device-id="currentDeviceId"
    :basic-data="basicData"
    @success="handleDialogSuccess"
  />

  <!-- 导入弹窗 -->
  <el-dialog v-model="importDialogVisible" title="导入设备数据" width="600px">
    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :limit="1"
      accept=".xlsx,.xls"
      drag
      :on-change="handleFileChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">只支持 xlsx/xls 文件，且不超过 10MB</div>
      </template>
    </el-upload>

    <template #footer>
      <el-button @click="importDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="importLoading" @click="handleConfirmImport">
        确认导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Upload,
  Download,
  DocumentCopy,
  View,
  Edit,
  UploadFilled,
} from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import DeviceLedgerDialog from './components/DeviceLedgerDialog.vue'
import {
  getDeviceLedgerList,
  getDeviceLedgerBasicData,
  getStationTree,
  deleteDeviceLedger,
  batchDeleteDevices,
  importDeviceLedger,
  downloadImportTemplate,
} from '@/api/maintenance/deviceLedgerApi'
import type {
  DeviceLedgerRecord,
  DeviceLedgerBasicData,
} from '@/api/types/device-ledger'
import type { StationTreeNode } from '@/types/station'
import { downloadExcel, downloadBlobFile, generateTimestampFilename } from '@/utils/download'

// 筛选表单
const filterForm = reactive({
  stationId: '',
  deviceCategory: 'all',
  manufacturer: '',
  deviceType: '',
  deviceName: '',
})

// 表格数据
const tableData = ref<DeviceLedgerRecord[]>([])
const tableLoading = ref(false)
const selectedIds = ref<string[]>([])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
})

// 基础数据
const basicData = ref<DeviceLedgerBasicData | null>(null)
const deviceCategories = ref<any[]>([])

// 弹窗
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const currentDeviceId = ref('')

// 导入
const importDialogVisible = ref(false)
const importLoading = ref(false)
const uploadFile = ref<File | null>(null)

// 计算表格高度
const tableHeight = computed(() => {
  if (typeof window !== 'undefined') {
    const screenHeight = window.innerHeight
    if (screenHeight <= 480) {
      return 'calc(100vh - 280px)'  // 小屏移动端
    } else if (screenHeight <= 768) {
      return 'calc(100vh - 300px)'  // 移动端
    } else if (screenHeight <= 1024) {
      return 'calc(100vh - 320px)'  // 平板端
    }
  }
  return 'calc(100vh - 320px)'  // 桌面端
})

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const data = await getDeviceLedgerBasicData()
    basicData.value = data
    deviceCategories.value = data.deviceCategories
  } catch (error) {
    ElMessage.error('Failed to load basic data')
  }
}

/**
 * 加载设备台账列表
 */
const loadDeviceLedgerList = async () => {
  try {
    tableLoading.value = true
    const params = {
      ...filterForm,
      deviceCategory: filterForm.deviceCategory === 'all' ? undefined : filterForm.deviceCategory,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }
    const response = await getDeviceLedgerList(params)
    tableData.value = response.deviceLedger
    pagination.total = response.pagination.total
  } catch (error) {
    ElMessage.error('Failed to load device ledger list')
  } finally {
    tableLoading.value = false
  }
}

/**
 * 电站选择
 */
const handleStationSelect = (node: StationTreeNode) => {
  // StationTree 组件只会在点击叶子节点时触发事件
  // 叶子节点就是电站节点
  console.log('Selected station:', node)
  filterForm.stationId = node.regionId
  pagination.current = 1
  loadDeviceLedgerList()
}

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.current = 1
  loadDeviceLedgerList()
}

/**
 * 重置
 */
const handleReset = () => {
  filterForm.stationId = ''
  filterForm.deviceCategory = 'all'
  filterForm.manufacturer = ''
  filterForm.deviceType = ''
  filterForm.deviceName = ''
  pagination.current = 1
  loadDeviceLedgerList()
}

/**
 * 新增
 */
const handleAdd = () => {
  dialogMode.value = 'add'
  currentDeviceId.value = ''
  dialogVisible.value = true
}

/**
 * 查看
 */
const handleView = (row: DeviceLedgerRecord) => {
  dialogMode.value = 'view'
  currentDeviceId.value = row.id
  dialogVisible.value = true
}

/**
 * 编辑
 */
const handleEdit = (row: DeviceLedgerRecord) => {
  dialogMode.value = 'edit'
  currentDeviceId.value = row.id
  dialogVisible.value = true
}

/**
 * 删除
 */
const handleDelete = async (row: DeviceLedgerRecord) => {
  try {
    await ElMessageBox.confirm(`确定要删除设备"${row.deviceName}"吗？`, 'Warning', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })

    await deleteDeviceLedger(row.id)
    ElMessage.success('Delete successfully')
    loadDeviceLedgerList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete')
    }
  }
}

/**
 * 批量删除
 */
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条记录吗？`, 'Warning', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })

    await batchDeleteDevices({ deviceIds: selectedIds.value })
    ElMessage.success('Batch delete successfully')
    selectedIds.value = []
    loadDeviceLedgerList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to batch delete')
    }
  }
}

/**
 * 导入
 */
const handleImport = () => {
  importDialogVisible.value = true
  uploadFile.value = null
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
    importLoading.value = true
    const result = await importDeviceLedger(uploadFile.value, filterForm.stationId)

    if (result.failedCount > 0) {
      ElMessage.warning(
        `Import completed: ${result.successCount} success, ${result.failedCount} failed`
      )
      console.log('Error rows:', result.errorRows)
    } else {
      ElMessage.success(`Import successfully: ${result.successCount} records`)
    }

    importDialogVisible.value = false
    loadDeviceLedgerList()
  } catch (error) {
    ElMessage.error('Failed to import')
  } finally {
    importLoading.value = false
  }
}

/**
 * 导出
 */
const handleExport = async () => {
  try {
    // 获取要导出的数据
    const dataToExport = tableData.value

    if (!dataToExport || dataToExport.length === 0) {
      ElMessage.warning('暂无数据可导出')
      return
    }

    // 定义导出列
    const exportColumns = [
      { label: '电站名称', prop: 'stationName', width: 180 },
      { label: '设备名称', prop: 'deviceName', width: 150 },
      { label: '设备分类', prop: 'deviceCategory', width: 120 },
      { label: '设备编号', prop: 'deviceNumber', width: 150 },
      { label: '设备型号', prop: 'deviceType', width: 180 },
      { label: '生产厂家', prop: 'manufacturer', width: 200 },
      { label: '设备子类', prop: 'deviceSubCategory', width: 150 },
      { label: 'KKS编码', prop: 'kksCode', width: 120 },
      { label: '安装地点', prop: 'installLocation', width: 150 },
      { label: '所属变电站', prop: 'associatedStation', width: 150 },
      { label: '投产日期', prop: 'commissioningDate', width: 120 },
      { label: '保修日期', prop: 'warrantyDate', width: 120 },
      { label: '设备状态', prop: 'deviceStatus', width: 100 },
      { label: '接入组件容量(kWp)', prop: 'connectedComponentCapacity', width: 160 },
      { label: '接入组件编号', prop: 'connectedComponentsSerialNumbers', width: 180 },
      { label: '组件厂商', prop: 'connectedComponentManufacturer', width: 180 },
      { label: '组件型号', prop: 'connectedComponentModel', width: 180 },
      { label: '组件类型', prop: 'connectedComponentType', width: 150 },
      { label: '备注', prop: 'remarks', width: 300 },
      { label: '创建时间', prop: 'createTime', width: 160 },
      { label: '更新时间', prop: 'updateTime', width: 160 },
    ]

    const filename = generateTimestampFilename('设备台账')
    await downloadExcel(dataToExport, exportColumns, filename, '设备台账')

    ElMessage.success(`成功导出 ${dataToExport.length} 条设备台账数据`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

/**
 * 下载模板
 */
const handleDownloadTemplate = async () => {
  try {
    // 创建模板数据（空数据，只有表头）
    const templateData: any[] = []

    // 定义模板列（与导出列相同）
    const templateColumns = [
      { label: '电站名称', prop: 'stationName', width: 180 },
      { label: '设备名称', prop: 'deviceName', width: 150 },
      { label: '设备分类', prop: 'deviceCategory', width: 120 },
      { label: '设备编号', prop: 'deviceNumber', width: 150 },
      { label: '设备型号', prop: 'deviceType', width: 180 },
      { label: '生产厂家', prop: 'manufacturer', width: 200 },
      { label: '设备子类', prop: 'deviceSubCategory', width: 150 },
      { label: 'KKS编码', prop: 'kksCode', width: 120 },
      { label: '安装地点', prop: 'installLocation', width: 150 },
      { label: '所属变电站', prop: 'associatedStation', width: 150 },
      { label: '投产日期', prop: 'commissioningDate', width: 120 },
      { label: '保修日期', prop: 'warrantyDate', width: 120 },
      { label: '设备状态', prop: 'deviceStatus', width: 100 },
      { label: '接入组件容量(kWp)', prop: 'connectedComponentCapacity', width: 160 },
      { label: '接入组件编号', prop: 'connectedComponentsSerialNumbers', width: 180 },
      { label: '组件厂商', prop: 'connectedComponentManufacturer', width: 180 },
      { label: '组件型号', prop: 'connectedComponentModel', width: 180 },
      { label: '组件类型', prop: 'connectedComponentType', width: 150 },
      { label: '备注', prop: 'remarks', width: 300 },
    ]

    // 添加一行示例数据
    const exampleData = {
      stationName: '示例电站',
      deviceName: '1#逆变器',
      deviceCategory: '逆变器',
      deviceNumber: 'INV-001-2024',
      deviceType: 'SUN2000-60KTL-M0',
      manufacturer: '华为技术有限公司',
      deviceSubCategory: '组串式逆变器',
      kksCode: '21GAA001',
      installLocation: '1号逆变器房',
      associatedStation: '1号变电站',
      commissioningDate: '2024-05-20',
      warrantyDate: '2027-05-20',
      deviceStatus: '运行',
      connectedComponentCapacity: 60.5,
      connectedComponentsSerialNumbers: 'PV001-PV016',
      connectedComponentManufacturer: '晶澳太阳能',
      connectedComponentModel: 'JAM72S20-455/MR',
      connectedComponentType: '单晶硅组件',
      remarks: '示例数据，请删除此行后填写实际数据',
    }
    templateData.push(exampleData)

    const filename = '设备台账导入模板'
    await downloadExcel(templateData, templateColumns, filename, '设备台账模板')

    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败，请重试')
  }
}

/**
 * 表格选择变化
 */
const handleSelectionChange = (selection: DeviceLedgerRecord[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

/**
 * 分页大小变化
 */
const handleSizeChange = () => {
  pagination.current = 1
  loadDeviceLedgerList()
}

/**
 * 页码变化
 */
const handlePageChange = () => {
  loadDeviceLedgerList()
}

/**
 * 弹窗成功回调
 */
const handleDialogSuccess = () => {
  loadDeviceLedgerList()
}

/**
 * 获取状态类型
 */
const getStatusType = (color: string) => {
  const typeMap: Record<string, any> = {
    green: 'success',
    blue: 'info',
    yellow: 'warning',
    orange: 'warning',
    red: 'danger',
    gray: 'info',
  }
  return typeMap[color] || 'info'
}

// 初始化
onMounted(() => {
  loadBasicData()
  // 不需要手动加载电站树，StationTree 组件会自己加载
  // 也不需要立即加载设备列表，等待电站树选择后再加载（autoSelectFirstLeaf 会自动触发）
})
</script>

<style scoped lang="scss">
.device-ledger-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .filter-section {
    margin-bottom: 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
    border: 1px solid rgba(0, 212, 255, 0.15);
    border-radius: 12px;
    padding: 20px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    
    .el-form {
      margin-bottom: 16px;

      :deep(.el-form-item) {
        margin-right: 16px;
        margin-bottom: 12px;

        .el-form-item__label {
          color: #ffffff;
          font-weight: 500;
        }
      }

      :deep(.el-input) {
        .el-input__wrapper {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 8px;

          &:hover {
            border-color: rgba(0, 212, 255, 0.4);
          }

          &.is-focus {
            border-color: #00d4ff;
            box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
          }
        }

        .el-input__inner {
          color: #ffffff;
        }
      }

      :deep(.el-select) {
        .el-input {
          .el-input__wrapper {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 8px;

            &:hover {
              border-color: rgba(0, 212, 255, 0.4);
            }

            &.is-focus {
              border-color: #00d4ff;
              box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
            }
          }
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .el-button {
        &--primary {
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
          border: none;
          
          &:hover {
            background: linear-gradient(135deg, #33ddff 0%, #00b8d9 100%);
            box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
          }
        }

        &--danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: none;
          
          &:hover {
            background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
          }
        }
      }
    }
  }

  .table-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .table-wrapper {
      flex: 1;
      border-radius: 12px;
      border: 1px solid rgba(0, 212, 255, 0.15);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
      backdrop-filter: blur(10px);
      overflow: hidden;
    }

    .device-ledger-table {
      :deep(.el-table__header) {
        th {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.08) 100%);
          color: #ffffff;
          font-weight: 600;
          border-bottom: 1px solid rgba(0, 212, 255, 0.3);
        }
      }

      :deep(.el-table__body) {
        .el-table__row {
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(0, 212, 255, 0.08);
          }

          &.el-table__row--striped {
            background: rgba(255, 255, 255, 0.05);

            &:hover {
              background: rgba(0, 212, 255, 0.08);
            }
          }

          td {
            border-bottom: 1px solid rgba(0, 212, 255, 0.1);
            color: #ffffff;
          }
        }
      }

      .operation-buttons {
        display: flex;
        gap: 6px;
        justify-content: center;
        align-items: center;

        .el-button {
          &--primary {
            color: #00d4ff;
            
            &:hover {
              color: #33ddff;
              background: rgba(0, 212, 255, 0.1);
            }
          }

          &--danger {
            color: #ef4444;
            
            &:hover {
              color: #f87171;
              background: rgba(239, 68, 68, 0.1);
            }
          }
        }
      }
    }

    .pagination-section {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
      padding: 16px 0;
    }
  }
}

// 平板端适配
@media (max-width: 1024px) {
  .device-ledger-container {
    padding: 16px;

    .filter-section {
      padding: 16px;
      margin-bottom: 16px;

      .el-form {
        margin-bottom: 12px;

        :deep(.el-form-item) {
          margin-right: 12px;
          margin-bottom: 10px;

          .el-form-item__label {
            font-size: 13px;
          }
        }

        :deep(.el-input),
        :deep(.el-select) {
          .el-input__wrapper {
            height: 36px;
            font-size: 13px;
          }
        }
      }

      .action-buttons {
        gap: 8px;

        .el-button {
          font-size: 13px;
          padding: 8px 12px;
        }
      }
    }

    .table-section {
      .el-table {
        :deep(.el-table__header) {
          th {
            font-size: 13px;
            padding: 8px;
          }
        }

        :deep(.el-table__body) {
          td {
            font-size: 13px;
            padding: 8px;
          }
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .device-ledger-container {
    padding: 12px;
    height: calc(100vh - 100px);

    .filter-section {
      padding: 12px;
      margin-bottom: 12px;

      .el-form {
        display: flex;
        flex-direction: column;
        margin-bottom: 12px;

        :deep(.el-form-item) {
          margin-right: 0;
          margin-bottom: 12px;
          width: 100%;

          &:last-child {
            margin-bottom: 0;
          }

          .el-form-item__label {
            font-size: 12px;
            margin-bottom: 6px;
            display: block;
          }

          .el-form-item__content {
            width: 100%;
          }
        }

        :deep(.el-input),
        :deep(.el-select) {
          width: 100% !important;

          .el-input__wrapper {
            height: 36px;
            font-size: 14px;
          }
        }
      }

      .action-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 8px;

        .el-button {
          font-size: 12px;
          padding: 8px 12px;
          height: 36px;
        }
      }
    }

    .table-section {
      .table-wrapper {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid rgba(0, 212, 255, 0.15);
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
      }

      .device-ledger-table {
        min-width: 1200px;

        :deep(.el-table__header) {
          th {
            font-size: 12px;
            padding: 8px 4px;
            white-space: nowrap;
            background: rgba(0, 212, 255, 0.08);
            color: #ffffff;
            font-weight: 600;
          }
        }

        :deep(.el-table__body) {
          td {
            font-size: 12px;
            padding: 8px 4px;
            color: #ffffff;
          }

          .operation-buttons {
            display: flex;
            gap: 4px;
            justify-content: center;
            flex-wrap: wrap;

            .el-button {
              font-size: 11px;
              padding: 4px 8px;
              height: 24px;
              min-width: 40px;
            }
          }
        }

        :deep(.el-tag) {
          font-size: 11px;
          height: 20px;
          line-height: 18px;
        }
      }

      .pagination-section {
        margin-top: 12px;
        justify-content: center;

        :deep(.el-pagination) {
          .el-pagination__sizes,
          .el-pagination__jump {
            display: none;
          }
        }
      }
    }
  }
}

// 小屏移动端适配
@media (max-width: 480px) {
  .device-ledger-container {
    padding: 8px;

    .filter-section {
      padding: 8px;
      margin-bottom: 8px;

      .el-form {
        :deep(.el-form-item) {
          margin-bottom: 8px;

          .el-form-item__label {
            font-size: 11px;
          }
        }

        :deep(.el-input),
        :deep(.el-select) {
          .el-input__wrapper {
            height: 32px;
            font-size: 12px;
          }
        }
      }

      .action-buttons {
        gap: 6px;

        .el-button {
          font-size: 11px;
          padding: 6px 8px;
          height: 32px;
        }
      }
    }

    .table-section {
      .table-wrapper {
        border-radius: 6px;
      }

      .device-ledger-table {
        min-width: 1000px;

        :deep(.el-table__header) {
          th {
            font-size: 11px;
            padding: 6px 2px;
            background: rgba(0, 212, 255, 0.1);
          }
        }

        :deep(.el-table__body) {
          td {
            font-size: 11px;
            padding: 6px 2px;
          }

          .operation-buttons {
            gap: 2px;

            .el-button {
              font-size: 10px;
              padding: 2px 4px;
              height: 20px;
              min-width: 32px;
            }
          }
        }

        :deep(.el-tag) {
          font-size: 10px;
          height: 18px;
          line-height: 16px;
          padding: 0 4px;
        }
      }

      .pagination-section {
        margin-top: 8px;

        :deep(.el-pagination) {
          .el-pager {
            li {
              min-width: 24px;
              height: 24px;
              line-height: 24px;
              font-size: 11px;
            }
          }

          .btn-prev,
          .btn-next {
            min-width: 24px;
            height: 24px;
            line-height: 24px;
            font-size: 11px;
          }
        }
      }
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

// 下拉菜单样式
:deep(.el-select-dropdown) {
  background-color: rgba(0, 0, 0, 0.9);
  border: 1px solid #333;

  .el-select-dropdown__item {
    color: #cccccc;

    &:hover {
      background-color: rgba(0, 212, 255, 0.1);
      color: #00d4ff;
    }

    &.is-selected {
      background-color: #00d4ff;
      color: #ffffff;
    }
  }
}

// 移动端导入弹框优化
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin-top: 5vh;

    .el-dialog__header {
      padding: 16px;

      .el-dialog__title {
        font-size: 16px;
      }
    }

    .el-dialog__body {
      padding: 16px;
    }

    .el-dialog__footer {
      padding: 12px 16px;
    }

    .el-upload {
      .el-upload-dragger {
        height: 120px;

        .el-icon--upload {
          font-size: 48px;
        }

        .el-upload__text {
          font-size: 13px;
        }
      }

      .el-upload__tip {
        font-size: 11px;
      }
    }
  }
}
</style>
