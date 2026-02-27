<template>
  <el-dialog
    v-model="visible"
    title="工单流转"
    :width="isMobile ? '95%' : '600px'"
    :top="isMobile ? '2vh' : '15vh'"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="workOrderInfo" class="work-order-info">
      <h4>工单信息</h4>
      <el-descriptions :column="isMobile ? 1 : 2" border>
        <el-descriptions-item label="工单编号">
          {{ workOrderInfo.workOrderNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="工单类型">
          {{ workOrderInfo.workOrderType }}
        </el-descriptions-item>
        <el-descriptions-item label="电站名称">
          {{ workOrderInfo.stationName }}
        </el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :color="workOrderInfo.statusColor" size="small">
            {{ workOrderInfo.flowStatus }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前处理人" :span="2">
          {{ workOrderInfo.currentProcessor }}
        </el-descriptions-item>
        <el-descriptions-item label="工单描述" :span="2">
          {{ workOrderInfo.workOrderDescription }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="isMobile ? '80px' : '120px'"
      style="margin-top: 20px"
    >
      <el-form-item label="流转动作" prop="action">
        <el-radio-group v-model="formData.action">
          <el-radio value="approve">审批通过</el-radio>
          <el-radio value="reject">驳回</el-radio>
          <el-radio value="complete">完成</el-radio>
          <el-radio value="assign">转派</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="formData.action === 'assign'"
        label="下一处理人"
        prop="nextProcessor"
      >
        <el-select v-model="formData.nextProcessor" placeholder="请选择" style="width: 100%">
          <el-option
            v-for="user in basicData.users"
            :key="user.id"
            :label="`${user.name} (${user.role})`"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="处理意见" prop="processingComment">
        <el-input
          v-model="formData.processingComment"
          type="textarea"
          :rows="4"
          placeholder="请输入处理意见"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="附件" prop="attachments">
        <el-upload
          v-model:file-list="fileList"
          :auto-upload="false"
          :limit="3"
          multiple
          :on-change="handleFileChange"
        >
          <el-button :icon="Upload">选择文件</el-button>
          <template #tip>
            <div class="el-upload__tip">
              最多上传3个文件，单个文件不超过10MB
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        确认流转
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import {
  flowWorkOrder,
  getWorkOrderDetail,
} from '@/api/maintenance/workOrderApi'
import type {
  WorkOrder,
  WorkOrderFlowRequest,
  WorkOrderBasicDataResponse,
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

// 表单引用
const formRef = ref<FormInstance>()

// 工单信息
const workOrderInfo = ref<WorkOrder | null>(null)

// 表单数据
const formData = reactive<WorkOrderFlowRequest>({
  action: 'approve',
  nextProcessor: '',
  processingComment: '',
  attachments: [],
})

// 表单验证规则
const formRules: FormRules = {
  action: [
    { required: true, message: 'Please select flow action', trigger: 'change' },
  ],
  nextProcessor: [
    {
      required: true,
      message: 'Please select next processor',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (formData.action === 'assign' && !value) {
          callback(new Error('Please select next processor'))
        } else {
          callback()
        }
      },
    },
  ],
  processingComment: [
    { required: true, message: 'Please enter processing comment', trigger: 'blur' },
    { max: 500, message: 'Comment cannot exceed 500 characters', trigger: 'blur' },
  ],
}

// 提交状态
const submitting = ref(false)

// 文件列表
const fileList = ref<UploadFile[]>([])

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
 * 加载工单详情
 */
const loadWorkOrderDetail = async () => {
  if (!props.workOrderId) return

  try {
    const workOrder = await getWorkOrderDetail(props.workOrderId)
    workOrderInfo.value = workOrder as WorkOrder
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
    action: 'approve',
    nextProcessor: '',
    processingComment: '',
    attachments: [],
  })
  fileList.value = []
  workOrderInfo.value = null
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    // 更新附件列表
    formData.attachments = fileList.value.map(file => file.name)

    await flowWorkOrder(props.workOrderId, formData)
    
    const actionText = {
      approve: '审批通过',
      reject: '驳回',
      complete: '完成',
      assign: '转派',
    }[formData.action]

    ElMessage.success(`工单${actionText}成功`)
    emit('success')
    handleClose()
  } catch (error) {
    console.error('Flow failed:', error)
    ElMessage.error('Flow failed')
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
    if (newVal && props.workOrderId) {
      loadWorkOrderDetail()
    }
  }
)
</script>

<style scoped lang="scss">
.work-order-info {
  margin-bottom: 20px;

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #00d4ff;
    margin-bottom: 12px;
  }
}

:deep(.el-descriptions) {
  .el-descriptions__header {
    .el-descriptions__title {
      color: #ffffff;
    }
  }

  .el-descriptions__body {
    .el-descriptions__table {
      .el-descriptions__cell {
        background-color: transparent;
      }
    }
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
  
  .work-order-info {
    margin-bottom: 16px;
    
    h4 {
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    :deep(.el-descriptions) {
      font-size: 12px;
      
      .el-descriptions__label {
        font-size: 12px;
        width: 80px;
      }
      
      .el-descriptions__content {
        font-size: 12px;
      }
    }
  }
  
  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 12px;
      
      .el-form-item__label {
        font-size: 12px;
        line-height: 1.2;
      }
      
      .el-form-item__content {
        .el-input,
        .el-select,
        .el-textarea {
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
