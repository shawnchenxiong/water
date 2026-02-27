<template>
  <div class="fault-library-container">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form
        ref="filterFormRef"
        :model="filterForm"
        label-width="auto"
      >
        <!-- PC端：自然流式排列 -->
        <div class="filter-content" v-if="!isMobile">
          <div class="filter-row">
            <el-form-item label="设备类型">
              <el-select
                v-model="filterForm.deviceType"
                placeholder="请选择"
                clearable
                style="width: 200px"
              >
                <el-option
                  v-for="type in basicData.deviceTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="故障表现">
              <el-input
                v-model="filterForm.faultDescription"
                placeholder="请输入"
                clearable
                style="width: 300px"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 移动端：简单两项布局 -->
        <div class="filter-content mobile-layout" v-else>
          <div class="filter-row">
            <el-form-item label="设备类型">
              <el-select
                v-model="filterForm.deviceType"
                placeholder="请选择"
                clearable
              >
                <el-option
                  v-for="type in basicData.deviceTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="故障表现">
              <el-input
                v-model="filterForm.faultDescription"
                placeholder="请输入"
                clearable
              />
            </el-form-item>
          </div>
        </div>

        <!-- 操作按钮行 -->
        <div class="filter-actions">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-section">
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        新增
      </el-button>
      <el-button :icon="Delete" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
        删除
      </el-button>
      <el-button :icon="Upload" @click="handleImport">
        导入
      </el-button>
      <el-button :icon="Download" @click="handleExportTemplate">
        导出模板
      </el-button>
      <el-button :icon="Download" @click="handleExport">
        导出
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="deviceType" label="设备类型" width="150" align="center" />
        <el-table-column prop="faultDescription" label="故障表现" min-width="200" show-overflow-tooltip />
        <el-table-column prop="impactScope" label="影响范围" min-width="250" show-overflow-tooltip />
        <el-table-column prop="possibleCause" label="可能原因" min-width="300" show-overflow-tooltip />
        <el-table-column prop="solutionSuggestion" label="处理建议" min-width="300" show-overflow-tooltip />
        <el-table-column prop="relatedAlarmCount" label="关联告警" width="100" align="center">
          <template #default="{ row }">
            <span>{{ row.relatedAlarmCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="modifiedBy" label="修改人" width="120" align="center" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
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
    </div>

    <!-- 分页 -->
    <div class="pagination-section" v-if="tableData.length > 0">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>

  <!-- 新增/编辑弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :title="isEditing ? '编辑' : '新增'"
    :width="isMobile ? '95%' : '800px'"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="设备类型" prop="deviceType" required>
            <el-select
              v-model="formData.deviceType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="type in basicData.deviceTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="故障表现" prop="faultDescription" required>
            <el-input
              v-model="formData.faultDescription"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="影响范围" prop="impactScope" required>
            <el-input
              v-model="formData.impactScope"
              placeholder="请输入影响范围，例如：通讯中断、发电低效、发电故障"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="可能原因" prop="possibleCause" required>
            <el-input
              v-model="formData.possibleCause"
              type="textarea"
              :rows="4"
              placeholder="请输入"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="处理建议" prop="solutionSuggestion" required>
            <el-input
              v-model="formData.solutionSuggestion"
              type="textarea"
              :rows="4"
              placeholder="请输入"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="关联告警">
            <el-button type="primary" :icon="Link" @click="handleBindAlarm">
              绑定告警测点
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="应用范围">
            <el-radio-group v-model="formData.applicationScope">
              <el-radio label="cover">覆盖已有通用告警策略配置</el-radio>
              <el-radio label="keep">保留已有通用告警策略配置</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="submitting">
        确认
      </el-button>
    </template>
  </el-dialog>

  <!-- 导入弹窗 -->
  <el-dialog
    v-model="importDialogVisible"
    title="导入故障库"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-upload
      class="upload-demo"
      drag
      action="https://jsonplaceholder.typicode.com/posts/"
      multiple
      :show-file-list="false"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持 .xls, .xlsx 文件，文件大小不超过 10MB
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Plus, 
  Delete, 
  Upload, 
  Download, 
  Edit,
  Link,
  UploadFilled,
  Refresh
} from '@element-plus/icons-vue'
import { 
  getFaultLibraryRecords, 
  getFaultLibraryBasicData,
  createFaultLibraryRecord,
  updateFaultLibraryRecord,
  deleteFaultLibraryRecord,
  batchDeleteFaultLibraryRecords
} from '@/api/faultLibraryApi'
import type { 
  FaultLibraryRecord, 
  FaultLibraryBasicData, 
  FaultLibraryFormData,
  FaultLibraryQueryParams 
} from '@/api/types/fault-library'

// 响应式检测
const isMobile = computed(() => window.innerWidth <= 768)

// 基础数据
const basicData = ref<FaultLibraryBasicData>({
  deviceTypes: []
})

// 筛选表单
const filterForm = reactive<FaultLibraryQueryParams>({
  deviceType: '',
  faultDescription: ''
})

// 表格数据
const tableData = ref<FaultLibraryRecord[]>([])
const loading = ref(false)
const selectedRows = ref<FaultLibraryRecord[]>([])

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
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const isEditing = ref(false)
const submitting = ref(false)

// 表单数据
const formData = reactive<FaultLibraryFormData>({
  deviceType: '',
  faultDescription: '',
  impactScope: '',
  possibleCause: '',
  solutionSuggestion: '',
  applicationScope: 'cover'
})

// 表单验证规则
const formRules = {
  deviceType: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ],
  faultDescription: [
    { required: true, message: '请输入故障表现', trigger: 'blur' }
  ],
  impactScope: [
    { required: true, message: '请输入影响范围', trigger: 'blur' }
  ],
  possibleCause: [
    { required: true, message: '请输入可能原因', trigger: 'blur' }
  ],
  solutionSuggestion: [
    { required: true, message: '请输入处理建议', trigger: 'blur' }
  ]
}

/**
 * 加载故障库列表
 */
const loadFaultLibraryRecords = async () => {
  loading.value = true
  try {
    const params = {
      ...filterForm,
      current: pagination.current,
      pageSize: pagination.pageSize
    }
    const response = await getFaultLibraryRecords(params)
    if (response.code === 200) {
      tableData.value = response.data.records
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('加载故障库失败:', error)
    ElMessage.error('加载故障库失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const response = await getFaultLibraryBasicData()
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
  loadFaultLibraryRecords()
}

/**
 * 表格选择变化
 */
const handleSelectionChange = (selection: FaultLibraryRecord[]) => {
  selectedRows.value = selection
}

/**
 * 新增
 */
const handleCreate = () => {
  isEditing.value = false
  Object.assign(formData, {
    deviceType: '',
    faultDescription: '',
    impactScope: '',
    possibleCause: '',
    solutionSuggestion: '',
    applicationScope: 'cover'
  })
  dialogVisible.value = true
}

/**
 * 编辑
 */
const handleEdit = (row: FaultLibraryRecord) => {
  isEditing.value = true
  Object.assign(formData, {
    id: row.id,
    deviceType: row.deviceType,
    faultDescription: row.faultDescription,
    impactScope: row.impactScope,
    possibleCause: row.possibleCause,
    solutionSuggestion: row.solutionSuggestion,
    applicationScope: 'cover'
  })
  dialogVisible.value = true
}

/**
 * 删除
 */
const handleDelete = (row: FaultLibraryRecord) => {
  ElMessageBox.confirm(`确定删除故障 "${row.faultDescription}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteFaultLibraryRecord(row.id)
      ElMessage.success('删除成功')
      loadFaultLibraryRecords()
    })
    .catch(() => {})
}

/**
 * 批量删除
 */
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }
  ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const ids = selectedRows.value.map(row => row.id)
      await batchDeleteFaultLibraryRecords(ids)
      ElMessage.success('批量删除成功')
      loadFaultLibraryRecords()
    })
    .catch(() => {})
}

/**
 * 确认提交
 */
const handleConfirm = async () => {
  const formRef = document.querySelector('.el-form') as any
  if (!formRef) return
  
  try {
    await formRef.validate()
    submitting.value = true
    
    if (isEditing.value) {
      await updateFaultLibraryRecord(formData.id!, formData)
      ElMessage.success('编辑成功')
    } else {
      await createFaultLibraryRecord(formData)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    loadFaultLibraryRecords()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

/**
 * 绑定告警测点
 */
const handleBindAlarm = () => {
  ElMessage.info('绑定告警测点功能待实现')
}

/**
 * 导入
 */
const handleImport = () => {
  importDialogVisible.value = true
}

/**
 * 确认导入
 */
const handleConfirmImport = () => {
  ElMessage.success('导入功能待实现')
  importDialogVisible.value = false
}

/**
 * 导出模板
 */
const handleExportTemplate = () => {
  ElMessage.info('导出模板功能待实现')
}

/**
 * 导出
 */
const handleExport = () => {
  ElMessage.info('导出功能待实现')
}

/**
 * 分页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadFaultLibraryRecords()
}

/**
 * 当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadFaultLibraryRecords()
}

/**
 * 重置筛选
 */
const handleReset = () => {
  Object.assign(filterForm, {
    deviceType: '',
    faultDescription: ''
  })
  pagination.current = 1
  loadFaultLibraryRecords()
}


// 组件挂载
onMounted(async () => {
  await loadBasicData()
  await loadFaultLibraryRecords()
})
</script>

<style scoped lang="scss">
.fault-library-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;

  .filter-section {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 20px;

    .filter-content {
      .filter-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        :deep(.el-form-item) {
          margin-bottom: 0;
        }
      }
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;
    }
  }

  .action-section {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
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

// 移动端适配
@media (max-width: 768px) {
  .fault-library-container {
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
            }
          }
        }

      }

      .filter-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-start;
        margin-top: 12px;

        .el-button {
          font-size: 12px;
        }
      }
    }

    .action-section {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-start;

      .el-button {
        font-size: 12px;
        // 保持原始大小，不要强制拉宽
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
          padding: 0 4px;
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

    .el-form {
      .el-form-item {
        margin-bottom: 16px;

        .el-form-item__label {
          font-size: 13px;
          padding: 0;
        }

        .el-input,
        .el-select,
        .el-textarea {
          font-size: 13px;
        }
      }
    }
  }

  // 上传弹窗适配
  :deep(.el-upload) {
    width: 100%;

    .el-upload__tip {
      font-size: 12px;
      line-height: 1.5;
    }
  }
}
</style>