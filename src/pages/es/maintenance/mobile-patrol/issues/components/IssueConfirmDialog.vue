<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="issue" class="confirm-content">
      <!-- 问题信息 -->
      <div class="issue-info">
        <h4>问题信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <label>问题等级:</label>
            <el-tag :color="issue.levelColor" size="small">
              {{ issue.inspectionLevel }}
            </el-tag>
          </div>
          <div class="info-item">
            <label>巡检类型:</label>
            <span>{{ issue.inspectionType }}</span>
          </div>
          <div class="info-item">
            <label>电站名称:</label>
            <span>{{ issue.stationName }}</span>
          </div>
          <div class="info-item">
            <label>问题位置:</label>
            <span>{{ issue.location }}</span>
          </div>
        </div>
        
        <div class="description-section">
          <label>问题描述:</label>
          <div class="description-text">
            {{ issue.issueDescription }}
          </div>
        </div>
      </div>

      <!-- 确认表单 -->
      <div class="confirm-form">
        <h4>{{ confirmTitle }}</h4>
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
        >
          <el-form-item :label="confirmLabel" prop="confirmDescription">
            <el-input
              v-model="formData.confirmDescription"
              type="textarea"
              :rows="4"
              :placeholder="confirmPlaceholder"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ confirmButtonText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { confirmIssue } from '@/api/maintenance/mobileInspectionIssuesApi'
import type { InspectionIssue, ConfirmIssueRequest } from '@/api/types/mobile-inspection-issues'

interface Props {
  modelValue: boolean
  issue: InspectionIssue | null
  confirmType: 'confirm' | 'ignore'
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  confirmDescription: '',
})

// 表单验证规则
const formRules: FormRules = {
  confirmDescription: [
    { required: true, message: '请输入说明', trigger: 'blur' },
    { min: 5, message: '说明至少5个字符', trigger: 'blur' },
    { max: 500, message: '说明不能超过500个字符', trigger: 'blur' },
  ],
}

// 提交状态
const submitting = ref(false)

// 计算属性
const dialogTitle = computed(() => {
  return props.confirmType === 'confirm' ? '确认问题' : '忽略问题'
})

const confirmTitle = computed(() => {
  return props.confirmType === 'confirm' ? '确认信息' : '忽略信息'
})

const confirmLabel = computed(() => {
  return props.confirmType === 'confirm' ? '确认说明' : '忽略原因'
})

const confirmPlaceholder = computed(() => {
  return props.confirmType === 'confirm' 
    ? '请输入问题确认说明，如处理方案、预计完成时间等'
    : '请输入忽略原因，如问题不属实、属于正常现象等'
})

const confirmButtonText = computed(() => {
  return props.confirmType === 'confirm' ? '确认问题' : '忽略问题'
})

/**
 * 重置表单
 */
const resetForm = () => {
  formRef.value?.resetFields()
  formData.confirmDescription = ''
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value || !props.issue) return

  try {
    await formRef.value.validate()

    submitting.value = true

    const request: ConfirmIssueRequest = {
      issueId: props.issue.id,
      confirmStatus: props.confirmType === 'confirm' ? '已确认' : '已忽略',
      confirmDescription: formData.confirmDescription.trim(),
    }

    await confirmIssue(request)

    ElMessage.success(
      props.confirmType === 'confirm' ? '问题确认成功' : '问题忽略成功'
    )

    emit('success')
    handleClose()
  } catch (error) {
    console.error('Confirm issue failed:', error)
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
      resetForm()
    }
  }
)
</script>

<style scoped lang="scss">
.confirm-content {
  .issue-info {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #333;

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #00d4ff;
      margin-bottom: 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;

      label {
        font-weight: 500;
        color: #cccccc;
        min-width: 80px;
      }

      span {
        color: #ffffff;
      }
    }

    .description-section {
      label {
        font-weight: 500;
        color: #cccccc;
        margin-bottom: 8px;
        display: block;
      }

      .description-text {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 12px;
        line-height: 1.6;
        color: #ffffff;
        border: 1px solid #333;
      }
    }
  }

  .confirm-form {
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #00d4ff;
      margin-bottom: 16px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
