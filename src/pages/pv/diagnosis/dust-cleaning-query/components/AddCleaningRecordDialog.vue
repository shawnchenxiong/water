<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { 
  CleaningRecord, 
  CleaningRecordForm, 
  Station,
  CleaningMethod,
  CreateCleaningRecordRequest,
  UpdateCleaningRecordRequest
} from '@/api/types/diagnosis/cleaningQuery'
import { 
  createCleaningRecord, 
  updateCleaningRecord,
  validateCleaningRecordForm 
} from '@/api/diagnosis/cleaningQuery'
import { cleaningMethods } from '@/api/mock/cleaningQuery'
import dayjs from 'dayjs'

interface Props {
  modelValue: boolean
  stations: Station[]
  selectedStationId?: string
  editingRecord?: CleaningRecord | null
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

// 表单数据
const formData = ref<CleaningRecordForm>({
  stationId: '',
  cleaningTime: '',
  cleaningMethod: '人工清洗',
  cleaningArea: null,
  cleaningPersonnel: '',
  cleaningCost: null,
  remark: ''
})

// 表单引用
const formRef = ref()

// 加载状态
const loading = ref(false)

// 是否编辑模式
const isEditMode = computed(() => !!props.editingRecord)

// 弹窗标题
const dialogTitle = computed(() => {
  return isEditMode.value ? '编辑清洗记录' : '新增清洗记录'
})

// 监听弹窗打开，初始化表单数据
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      initForm()
    }
  }
)

// 初始化表单
const initForm = () => {
  if (props.editingRecord) {
    // 编辑模式，填入现有数据
    formData.value = {
      stationId: props.editingRecord.stationId,
      cleaningTime: props.editingRecord.cleaningTime,
      cleaningMethod: props.editingRecord.cleaningMethod,
      cleaningArea: props.editingRecord.cleaningArea,
      cleaningPersonnel: props.editingRecord.cleaningPersonnel,
      cleaningCost: props.editingRecord.cleaningCost || null,
      remark: props.editingRecord.remark || ''
    }
  } else {
    // 新增模式，重置表单
    formData.value = {
      stationId: props.selectedStationId || '',
      cleaningTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      cleaningMethod: '人工清洗',
      cleaningArea: null,
      cleaningPersonnel: '',
      cleaningCost: null,
      remark: ''
    }
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
}

// 确认保存
const handleConfirm = async () => {
  // 表单验证
  const validation = validateCleaningRecordForm(formData.value)
  if (!validation.valid) {
    ElMessage.error(validation.message)
    return
  }
  
  try {
    loading.value = true
    
    if (isEditMode.value && props.editingRecord) {
      // 编辑模式
      const updateData: UpdateCleaningRecordRequest = {
        cleaningTime: formData.value.cleaningTime,
        cleaningMethod: formData.value.cleaningMethod,
        cleaningArea: formData.value.cleaningArea!,
        cleaningPersonnel: formData.value.cleaningPersonnel,
        cleaningCost: formData.value.cleaningCost || undefined,
        remark: formData.value.remark || undefined
      }
      
      await updateCleaningRecord(props.editingRecord.id, updateData)
      ElMessage.success('清洗记录更新成功')
    } else {
      // 新增模式
      const createData: CreateCleaningRecordRequest = {
        stationId: formData.value.stationId,
        cleaningTime: formData.value.cleaningTime,
        cleaningMethod: formData.value.cleaningMethod,
        cleaningArea: formData.value.cleaningArea!,
        cleaningPersonnel: formData.value.cleaningPersonnel,
        cleaningCost: formData.value.cleaningCost || undefined,
        submitter: 'admin', // 实际应该从用户信息获取
        remark: formData.value.remark || undefined
      }
      
      await createCleaningRecord(createData)
      ElMessage.success('清洗记录添加成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('保存清洗记录失败:', error)
    ElMessage.error('保存清洗记录失败')
  } finally {
    loading.value = false
  }
}

// 表单验证规则
const formRules = {
  stationId: [
    { required: true, message: '请选择所属电站', trigger: 'change' }
  ],
  cleaningTime: [
    { required: true, message: '请选择清洗时间', trigger: 'change' }
  ],
  cleaningMethod: [
    { required: true, message: '请选择清洗方式', trigger: 'change' }
  ],
  cleaningArea: [
    { required: true, message: '请输入清洗面积', trigger: 'blur' },
    { type: 'number', min: 1, message: '清洗面积必须大于0', trigger: 'blur' }
  ],
  cleaningPersonnel: [
    { required: true, message: '请输入清洗人员', trigger: 'blur' },
    { min: 2, max: 50, message: '清洗人员长度在2到50个字符', trigger: 'blur' }
  ]
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="dialogTitle"
    :width="isMobile ? '90%' : '600px'"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="left"
    >
      <el-form-item label="所属电站" prop="stationId">
        <el-select 
          v-model="formData.stationId" 
          placeholder="请选择电站"
          style="width: 100%"
          :disabled="isEditMode"
        >
          <el-option
            v-for="station in stations"
            :key="station.stationId"
            :label="station.stationName"
            :value="station.stationId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="清洗时间" prop="cleaningTime">
        <el-date-picker
          v-model="formData.cleaningTime"
          type="datetime"
          placeholder="选择清洗时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="清洗方式" prop="cleaningMethod">
        <el-select 
          v-model="formData.cleaningMethod" 
          placeholder="请选择清洗方式"
          style="width: 100%"
        >
          <el-option
            v-for="method in cleaningMethods"
            :key="method"
            :label="method"
            :value="method"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="清洗面积" prop="cleaningArea">
        <el-input-number
          v-model="formData.cleaningArea"
          :min="1"
          :max="99999"
          :precision="2"
          placeholder="请输入清洗面积"
          style="width: 100%"
        />
        <span class="unit-text">平方米</span>
      </el-form-item>

      <el-form-item label="清洗人员" prop="cleaningPersonnel">
        <el-input
          v-model="formData.cleaningPersonnel"
          placeholder="请输入清洗人员姓名"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="清洗成本">
        <el-input-number
          v-model="formData.cleaningCost"
          :min="0"
          :max="999999"
          :precision="2"
          placeholder="请输入清洗成本(可选)"
          style="width: 100%"
        />
        <span class="unit-text">元</span>
      </el-form-item>

      <el-form-item label="备注说明">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注说明(可选)"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button 
        type="primary" 
        @click="handleConfirm"
        :loading="loading"
      >
        {{ isEditMode ? '更新' : '确认' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.unit-text {
  margin-left: 8px;
  color: #a3a3a3;
  font-size: 12px;
}

:deep(.el-dialog) {
  background: #1a1f2e;
  border: 1px solid rgba(0, 212, 255, 0.3);

  .el-dialog__header {
    border-bottom: 1px solid rgba(0, 212, 255, 0.2);

    .el-dialog__title {
      color: #00D4FF;
      font-weight: 500;
    }
  }

  .el-dialog__body {
    color: #d1d5db;
  }
}

:deep(.el-form-item__label) {
  color: #a3a3a3;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  background: rgba(0, 212, 255, 0.05);
  border-color: rgba(0, 212, 255, 0.2);

  &:hover {
    border-color: rgba(0, 212, 255, 0.4);
  }

  &.is-focus {
    border-color: #00D4FF;
  }
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  color: #d1d5db;
}

:deep(.el-select) {
  .el-input__wrapper {
    background: rgba(0, 212, 255, 0.05);
    border-color: rgba(0, 212, 255, 0.2);
  }
}

:deep(.el-input-number) {
  width: 100%;
  
  .el-input__wrapper {
    background: rgba(0, 212, 255, 0.05);
    border-color: rgba(0, 212, 255, 0.2);
  }
}

:deep(.el-date-editor) {
  --el-date-editor-width: 100%;
  
  .el-input__wrapper {
    background: rgba(0, 212, 255, 0.05);
    border-color: rgba(0, 212, 255, 0.2);
    
    &:hover {
      border-color: rgba(0, 212, 255, 0.5);
    }
    
    &.is-focus {
      border-color: #00D4FF;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  :deep(.el-dialog__body) {
    padding: 15px;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  :deep(.el-dialog__footer) {
    padding: 12px 15px;
    text-align: center;
    
    .el-button {
      min-width: 80px;
      margin: 0 8px;
    }
  }
  
  :deep(.el-form-item) {
    margin-bottom: 16px;
    
    .el-form-item__label {
      font-size: 13px;
    }
  }
  
  .unit-text {
    font-size: 11px;
    margin-left: 6px;
  }
}
</style>
