<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑计划' : '新增计划'"
    :width="isMobile ? '95%' : '1000px'"
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
      <!-- 基础信息 -->
      <div class="form-section">
        <el-form-item label="计划名称" prop="planName">
          <el-input
            v-model="formData.planName"
            placeholder="请输入"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
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
      </div>

      <!-- 工单对象 -->
      <div class="form-section">
        <el-table :data="formData.workOrderObjects" border style="width: 100%">
          <el-table-column prop="serialNumber" label="序号" width="80" align="center" />
          <el-table-column label="电站名称" min-width="200">
            <template #default="{ row, $index }">
              <el-select
                v-model="row.stationId"
                placeholder="请选择电站"
                style="width: 100%"
                @change="handleStationChange($index, row.stationId)"
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
                type="danger"
                size="small"
                :icon="Delete"
                @click="removeObject($index)"
              />
            </template>
          </el-table-column>
        </el-table>
        <div class="add-object-btn">
          <el-button type="primary" :icon="Plus" @click="addObject">
            添加工单对象
          </el-button>
        </div>
      </div>

      <!-- 工单配置 -->
      <div class="form-section">
        <el-form-item label="工单级别" prop="workOrderLevel">
          <el-select v-model="formData.workOrderLevel" placeholder="常规">
            <el-option
              v-for="level in basicData.workOrderLevels"
              :key="level.value"
              :label="level.label"
              :value="level.value"
            />
          </el-select>
        </el-form-item>
        
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
      </div>

      <!-- 人员配置 -->
      <div class="form-section">
        <el-form-item label="是否启用" prop="isEnabled">
          <el-radio-group v-model="formData.isEnabled">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="审批人" prop="approver">
          <el-select v-model="formData.approver" placeholder="请选择" clearable>
            <el-option
              v-for="user in basicData.users"
              :key="user.id"
              :label="`${user.name} (${user.role})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="处理人" prop="processor">
          <el-select v-model="formData.processor" placeholder="请选择">
            <el-option
              v-for="user in basicData.users"
              :key="user.id"
              :label="`${user.name} (${user.role})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="其他处理人" prop="otherProcessors">
          <el-select
            v-model="formData.otherProcessors"
            placeholder="请选择"
            multiple
            clearable
          >
            <el-option
              v-for="user in basicData.users"
              :key="user.id"
              :label="`${user.name} (${user.role})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 时间配置 -->
      <div class="form-section">
        <el-form-item label="首次工单开始时间" prop="firstStartTime">
          <el-date-picker
            v-model="formData.firstStartTime"
            type="datetime"
            placeholder="请选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="首次工单完成时间" prop="firstEndTime">
          <el-date-picker
            v-model="formData.firstEndTime"
            type="datetime"
            placeholder="请选择完成时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="循环周期" prop="cycleType">
          <el-select v-model="formData.cycleType" placeholder="请选择" clearable>
            <el-option
              v-for="cycle in basicData.cycleTypes"
              :key="cycle.value"
              :label="cycle.label"
              :value="cycle.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="循环截止时间" prop="cycleEndTime">
          <el-date-picker
            v-model="formData.cycleEndTime"
            type="datetime"
            placeholder="请选择截止时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </div>

      <!-- 其他配置 -->
      <div class="form-section">
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
        
        <el-form-item label="附件" prop="attachments">
          <el-upload
            v-model:file-list="fileList"
            :auto-upload="false"
            :limit="5"
            multiple
            :on-change="handleFileChange"
          >
            <el-button :icon="Upload">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                最多上传5个文件，单个文件不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
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
  createMaintenancePlan,
  updateMaintenancePlan,
  getMaintenancePlanDetail,
} from '@/api/maintenance/maintenancePlanApi'
import type {
  MaintenancePlanBasicDataResponse,
  PlanFormData,
  PlanObject,
  CreateMaintenancePlanRequest,
  UpdateMaintenancePlanRequest,
} from '@/api/types/maintenance-plan'

interface Props {
  modelValue: boolean
  planId: string
  basicData: MaintenancePlanBasicDataResponse
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
const isEdit = computed(() => !!props.planId)

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<PlanFormData>({
  planName: '',
  workOrderType: '检修工单',
  workOrderObjects: [],
  workOrderLevel: '常规',
  workOrderDescription: '',
  isEnabled: true,
  approver: '',
  processor: '',
  otherProcessors: [],
  firstStartTime: '',
  firstEndTime: '',
  cycleType: '',
  cycleEndTime: '',
  processingAdvice: '',
  attachments: [],
})

// 表单验证规则
const formRules: FormRules = {
  planName: [
    { required: true, message: 'Please enter plan name', trigger: 'blur' },
    { max: 50, message: 'Plan name cannot exceed 50 characters', trigger: 'blur' },
  ],
  workOrderType: [
    { required: true, message: 'Please select work order type', trigger: 'change' },
  ],
  workOrderLevel: [
    { required: true, message: 'Please select work order level', trigger: 'change' },
  ],
  processor: [
    { required: true, message: 'Please select processor', trigger: 'change' },
  ],
  firstStartTime: [
    { required: true, message: 'Please select first start time', trigger: 'change' },
  ],
  firstEndTime: [
    { required: true, message: 'Please select first end time', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value && formData.firstStartTime && new Date(value) <= new Date(formData.firstStartTime)) {
          callback(new Error('End time must be later than start time'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  cycleEndTime: [
    {
      validator: (rule, value, callback) => {
        if (formData.cycleType && !value) {
          callback(new Error('Please select cycle end time when cycle type is set'))
        } else if (value && formData.firstStartTime && new Date(value) <= new Date(formData.firstStartTime)) {
          callback(new Error('Cycle end time must be later than first start time'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
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
  const newObject: PlanObject = {
    serialNumber: formData.workOrderObjects.length + 1,
    stationId: '',
    stationName: '',
    objectDescription: '',
  }
  formData.workOrderObjects.push(newObject)
}

/**
 * 删除工单对象
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
const handleStationChange = (index: number, stationId: string) => {
  const station = props.basicData.stations.find(s => s.id === stationId)
  if (station) {
    formData.workOrderObjects[index].stationName = station.name
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
  
  // 更新附件列表
  formData.attachments = fileList.value.map(f => f.name)
}

/**
 * 加载计划详情
 */
const loadPlanDetail = async () => {
  if (!props.planId) return

  try {
    const plan = await getMaintenancePlanDetail(props.planId)
    
    // 填充表单数据
    Object.assign(formData, {
      planName: plan.planName,
      workOrderType: plan.workOrderType,
      workOrderObjects: plan.workOrderObjects || [],
      workOrderLevel: plan.workOrderLevel || '常规',
      workOrderDescription: plan.workOrderDescription || '',
      isEnabled: plan.isEnabled ?? true,
      approver: plan.approverId || '',
      processor: plan.processorId,
      otherProcessors: plan.otherProcessorIds || [],
      firstStartTime: plan.firstStartTime,
      firstEndTime: plan.firstEndTime || '',
      cycleType: plan.cycleType || '',
      cycleEndTime: plan.cycleEndTime || '',
      processingAdvice: plan.processingAdvice || '',
      attachments: plan.attachments || [],
    })

    // 设置文件列表
    fileList.value = (plan.attachments || []).map((name, index) => ({
      uid: index,
      name,
      status: 'success',
    })) as UploadFile[]
  } catch (error) {
    ElMessage.error('Failed to load plan detail')
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    planName: '',
    workOrderType: '检修工单',
    workOrderObjects: [],
    workOrderLevel: '常规',
    workOrderDescription: '',
    isEnabled: true,
    approver: '',
    processor: '',
    otherProcessors: [],
    firstStartTime: '',
    firstEndTime: '',
    cycleType: '',
    cycleEndTime: '',
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
      ElMessage.warning('请至少添加一个工单对象')
      return
    }

    for (const obj of formData.workOrderObjects) {
      if (!obj.stationId) {
        ElMessage.warning('请为所有工单对象选择电站')
        return
      }
    }

    submitting.value = true

    // 更新附件列表
    formData.attachments = fileList.value.map(file => file.name)

    if (isEdit.value) {
      // 编辑
      const updateData: UpdateMaintenancePlanRequest = {
        id: props.planId,
        ...formData,
      }
      await updateMaintenancePlan(updateData)
      ElMessage.success('计划更新成功')
    } else {
      // 新增
      const createData: CreateMaintenancePlanRequest = formData
      await createMaintenancePlan(createData)
      ElMessage.success('计划创建成功')
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('Submit failed:', error)
    ElMessage.error('操作失败，请重试')
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
        loadPlanDetail()
      } else {
        // 新增时添加一个默认对象
        addObject()
      }
    }
  }
)
</script>

<style scoped lang="scss">
.form-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.add-object-btn {
  margin-top: 12px;
  text-align: center;
}

:deep(.el-upload__tip) {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
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
        
        .el-checkbox-group {
          .el-checkbox {
            margin-right: 12px;
            margin-bottom: 8px;
            
            .el-checkbox__label {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
  
  .object-item {
    padding: 12px;
    margin-bottom: 12px;
    
    .object-header {
      margin-bottom: 12px;
      
      .object-title {
        font-size: 13px;
      }
      
      .el-button {
        font-size: 11px;
        padding: 4px 8px;
      }
    }
    
    .object-form {
      :deep(.el-form-item) {
        margin-bottom: 10px;
        
        .el-form-item__label {
          font-size: 11px;
        }
      }
    }
  }
  
  .add-object-btn {
    width: 100%;
    font-size: 13px;
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
