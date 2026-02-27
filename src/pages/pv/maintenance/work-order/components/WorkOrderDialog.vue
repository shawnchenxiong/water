<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑工单' : '新增工单'"
    :width="isMobile ? '95%' : '900px'"
    :top="isMobile ? '2vh' : '15vh'"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="isMobile ? '80px' : '120px'"
    >
      <!-- 工单信息区域 -->
      <div class="form-section">
        <h4 class="section-title">工单信息</h4>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="工单类型" prop="workOrderType">
              <el-radio-group v-model="formData.workOrderType">
                <el-radio
                  v-for="type in basicData.workOrderTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 工单对象区域 -->
      <div class="form-section">
        <h4 class="section-title">工单对象</h4>
        <div class="object-table">
          <el-table :data="formData.workOrderObjects" border>
            <el-table-column prop="serialNumber" label="序号" width="80" align="center" />
            <el-table-column label="电站名称" min-width="200">
              <template #default="{ row, $index }">
                <el-select
                  v-model="row.stationId"
                  placeholder="请选择电站"
                  style="width: 100%"
                  @change="handleStationChange(row, $index)"
                >
                  <el-option
                    v-for="station in basicData.stations"
                    :key="station.id"
                    :label="station.name"
                    :value="station.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="对象描述" min-width="200">
              <template #default="{ row }">
                <el-input
                  v-model="row.objectDescription"
                  placeholder="请输入对象描述"
                  maxlength="200"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ $index }">
                <el-button
                  link
                  type="danger"
                  :icon="Delete"
                  @click="removeObject($index)"
                />
              </template>
            </el-table-column>
          </el-table>
          <div class="add-object">
            <el-button :icon="Plus" @click="addObject">添加工单对象</el-button>
          </div>
        </div>
      </div>

      <!-- 工单配置区域 -->
      <div class="form-section">
        <h4 class="section-title">工单配置</h4>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工单级别" prop="workOrderLevel">
              <el-select v-model="formData.workOrderLevel" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="level in basicData.workOrderLevels"
                  :key="level.value"
                  :label="level.label"
                  :value="level.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开启预警" prop="enableAlert">
              <el-radio-group v-model="formData.enableAlert">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="工单描述" prop="workOrderDescription">
              <el-input
                v-model="formData.workOrderDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入工单描述"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 人员配置区域 -->
      <div class="form-section">
        <h4 class="section-title">人员配置</h4>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="处理人" prop="processor">
              <el-select v-model="formData.processor" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="user in basicData.users"
                  :key="user.id"
                  :label="`${user.name} (${user.role})`"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="其他处理人" prop="otherProcessors">
              <el-select
                v-model="formData.otherProcessors"
                multiple
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="user in basicData.users"
                  :key="user.id"
                  :label="`${user.name} (${user.role})`"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 时间配置区域 -->
      <div class="form-section">
        <h4 class="section-title">时间配置</h4>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工单开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                placeholder="请选择开始时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工单完成时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="请选择完成时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 其他信息区域 -->
      <div class="form-section">
        <h4 class="section-title">其他信息</h4>
        <el-row>
          <el-col :span="24">
            <el-form-item label="处理建议" prop="processingAdvice">
              <el-input
                v-model="formData.processingAdvice"
                type="textarea"
                :rows="3"
                placeholder="请输入处理建议"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="附件" prop="attachments">
              <el-upload
                v-model:file-list="fileList"
                :auto-upload="false"
                :limit="5"
                multiple
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
              >
                <el-button :icon="Upload">选择文件</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    最多上传5个文件，单个文件不超过10MB
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Upload } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import {
  createWorkOrder,
  updateWorkOrder,
  getWorkOrderDetail,
} from '@/api/maintenance/workOrderApi'
import type {
  CreateWorkOrderFormData,
  WorkOrderBasicDataResponse,
  WorkOrderObject,
} from '@/api/types/work-order'

interface Props {
  modelValue: boolean
  workOrderId: string
  basicData: WorkOrderBasicDataResponse
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 是否编辑模式
const isEdit = computed(() => !!props.workOrderId)

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<CreateWorkOrderFormData>({
  workOrderType: '检修工单',
  workOrderObjects: [],
  workOrderLevel: '常规',
  workOrderDescription: '',
  enableAlert: false,
  processor: '',
  otherProcessors: [],
  startTime: '',
  endTime: '',
  processingAdvice: '',
  attachments: [],
})

// 表单验证规则
const formRules: FormRules = {
  workOrderType: [
    { required: true, message: 'Please select work order type', trigger: 'change' },
  ],
  workOrderLevel: [
    { required: true, message: 'Please select work order level', trigger: 'change' },
  ],
  workOrderDescription: [
    { required: true, message: 'Please enter work order description', trigger: 'blur' },
    { max: 500, message: 'Description cannot exceed 500 characters', trigger: 'blur' },
  ],
  processor: [
    { required: true, message: 'Please select processor', trigger: 'change' },
  ],
  startTime: [
    { required: true, message: 'Please select start time', trigger: 'change' },
  ],
  endTime: [
    { required: true, message: 'Please select end time', trigger: 'change' },
  ],
}

// 提交状态
const submitting = ref(false)

// 文件列表
const fileList = ref<UploadFile[]>([])

/**
 * 添加工单对象
 */
const addObject = () => {
  const newObject: WorkOrderObject = {
    serialNumber: formData.workOrderObjects.length + 1,
    stationId: '',
    stationName: '',
    objectDescription: '',
  }
  formData.workOrderObjects.push(newObject)
}

/**
 * 移除工单对象
 */
const removeObject = (index: number) => {
  formData.workOrderObjects.splice(index, 1)
  // 重新编号
  formData.workOrderObjects.forEach((obj, idx) => {
    obj.serialNumber = idx + 1
  })
}

/**
 * 电站选择变化
 */
const handleStationChange = (row: WorkOrderObject, index: number) => {
  const station = props.basicData.stations.find(s => s.id === row.stationId)
  if (station) {
    row.stationName = station.name
  }
}

/**
 * 文件变化
 */
const handleFileChange = (file: UploadFile) => {
  // 检查文件大小
  if (file.raw && file.raw.size > 10 * 1024 * 1024) {
    ElMessage.error('File size cannot exceed 10MB')
    return false
  }
}

/**
 * 文件移除
 */
const handleFileRemove = () => {
  // 更新附件列表
  formData.attachments = fileList.value.map(file => file.name)
}

/**
 * 加载工单详情
 */
const loadWorkOrderDetail = async () => {
  if (!props.workOrderId) return

  try {
    const workOrder = await getWorkOrderDetail(props.workOrderId)
    if (workOrder) {
      // 填充表单数据
      Object.assign(formData, {
        workOrderType: workOrder.workOrderType,
        workOrderLevel: workOrder.workOrderLevel || '常规',
        workOrderDescription: workOrder.workOrderDescription,
        enableAlert: workOrder.enableAlert || false,
        processor: workOrder.currentProcessorId,
        otherProcessors: [],
        startTime: workOrder.startTime,
        endTime: workOrder.endTime,
        processingAdvice: workOrder.processingAdvice || '',
        attachments: workOrder.attachments || [],
      })

      // 设置工单对象
      formData.workOrderObjects = [{
        serialNumber: 1,
        stationId: workOrder.stationId,
        stationName: workOrder.stationName,
        objectDescription: workOrder.workOrderDescription,
      }]
    }
  } catch (error) {
    ElMessage.error('Failed to load work order detail')
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    workOrderType: '检修工单',
    workOrderObjects: [],
    workOrderLevel: '常规',
    workOrderDescription: '',
    enableAlert: false,
    processor: '',
    otherProcessors: [],
    startTime: '',
    endTime: '',
    processingAdvice: '',
    attachments: [],
  })
  fileList.value = []
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 验证工单对象
    if (formData.workOrderObjects.length === 0) {
      ElMessage.warning('Please add at least one work order object')
      return
    }

    // 验证时间
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      ElMessage.warning('End time must be later than start time')
      return
    }

    submitting.value = true

    // 更新附件列表
    formData.attachments = fileList.value.map(file => file.name)

    if (isEdit.value) {
      await updateWorkOrder({ ...formData, id: props.workOrderId })
      ElMessage.success('Update successfully')
    } else {
      const result = await createWorkOrder(formData)
      ElMessage.success(`Work order created: ${result.workOrderNumber}`)
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('Submit failed:', error)
    ElMessage.error('Submit failed')
  } finally {
    submitting.value = false
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  resetForm()
  visible.value = false
}

// 监听弹窗打开
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      if (isEdit.value) {
        loadWorkOrderDetail()
      } else {
        // 新增时添加一个默认对象
        addObject()
        // 设置默认时间
        const now = new Date()
        const startTime = new Date(now.getTime() + 60 * 60 * 1000) // 1小时后
        const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1天后
        formData.startTime = startTime.toISOString().slice(0, 19).replace('T', ' ')
        formData.endTime = endTime.toISOString().slice(0, 19).replace('T', ' ')
      }
    }
  }
)
</script>

<style scoped lang="scss">
.form-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #00d4ff;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  }
}

.object-table {
  .add-object {
    margin-top: 12px;
    text-align: center;
  }
}

:deep(.el-dialog__body) {
  max-height: 600px;
  overflow-y: auto;
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
  :deep(.el-dialog) {
    margin: 0;
    
    .el-dialog__body {
      padding: 12px;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .el-dialog__footer {
      padding: 12px;
      
      .el-button {
        width: 100px;
        font-size: 13px;
      }
    }
  }
  
  .form-section {
    margin-bottom: 16px;
    
    .section-title {
      font-size: 14px;
      margin-bottom: 12px;
    }
    
    :deep(.el-form-item) {
      margin-bottom: 12px;
      
      .el-form-item__label {
        font-size: 12px;
        line-height: 1.2;
      }
      
      .el-form-item__content {
        .el-input,
        .el-select,
        .el-textarea,
        .el-date-picker {
          font-size: 13px;
          
          .el-input__wrapper,
          .el-select__wrapper {
            min-height: 32px;
          }
          
          .el-input__inner,
          .el-select__input,
          .el-textarea__inner {
            font-size: 13px;
          }
        }
        
        .el-radio-group {
          .el-radio {
            margin-right: 12px;
            margin-bottom: 8px;
            
            .el-radio__label {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
  
  .object-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    
    :deep(.el-table) {
      min-width: 600px;
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
    
    .add-object {
      margin-top: 12px;
      
      .el-button {
        width: 100%;
        font-size: 13px;
      }
    }
  }
  
  :deep(.el-upload) {
    .el-button {
      font-size: 12px;
      padding: 6px 12px;
    }
    
    .el-upload__tip {
      font-size: 11px;
    }
  }
}
</style>
