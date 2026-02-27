<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑缺陷' : '新增缺陷'"
    :width="isMobile ? '95%' : '800px'"
    :top="isMobile ? '2vh' : '15vh'"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-width="isMobile ? '80px' : '120px'"
    >
      <el-row :gutter="20">
        <el-col :span="isMobile ? 24 : 12">
          <el-form-item label="设备名称" prop="deviceName">
            <el-input
              v-model="formData.deviceName"
              placeholder="请输入设备名称"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="isMobile ? 24 : 12">
          <el-form-item label="设备类型" prop="deviceType">
            <el-select
              v-model="formData.deviceType"
              placeholder="请选择设备类型"
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
        <el-col :span="isMobile ? 24 : 12">
          <el-form-item label="缺陷类型" prop="defectType">
            <el-select
              v-model="formData.defectType"
              placeholder="请选择缺陷类型"
              style="width: 100%"
            >
              <el-option
                v-for="type in basicData.defectTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="isMobile ? 24 : 12">
          <el-form-item label="缺陷级别" prop="defectLevel">
            <el-select
              v-model="formData.defectLevel"
              placeholder="请选择缺陷级别"
              style="width: 100%"
            >
              <el-option
                v-for="level in basicData.defectLevels"
                :key="level.value"
                :label="level.label"
                :value="level.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="isMobile ? 24 : 12">
          <el-form-item label="缺陷原因" prop="defectReason">
            <el-select
              v-model="formData.defectReason"
              placeholder="请选择缺陷原因"
              style="width: 100%"
            >
              <el-option
                v-for="reason in basicData.defectReasons"
                :key="reason.value"
                :label="reason.label"
                :value="reason.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="isMobile ? 24 : 12">
          <el-form-item label="责任单位" prop="responsibleUnit">
            <el-select
              v-model="formData.responsibleUnit"
              placeholder="请选择责任单位"
              style="width: 100%"
            >
              <el-option
                v-for="unit in basicData.responsibleUnits"
                :key="unit.value"
                :label="unit.label"
                :value="unit.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="isMobile ? 24 : 12">
          <el-form-item label="处理状态" prop="handleStatus">
            <el-select
              v-model="formData.handleStatus"
              placeholder="请选择处理状态"
              style="width: 100%"
            >
              <el-option
                v-for="status in basicData.handleStatuses"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="isMobile ? 24 : 12">
          <el-form-item label="填写人" prop="submitter">
            <el-input
              v-model="formData.submitter"
              placeholder="请输入填写人"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="缺陷描述" prop="defectDescription">
        <el-input
          v-model="formData.defectDescription"
          type="textarea"
          :rows="4"
          placeholder="请输入缺陷描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getDefectDetail, createDefect, updateDefect } from '@/api/maintenance/defectManagementApi'
import type { DefectBasicData, DefectRecord } from '@/api/types/defect-management'

// Props
interface Props {
  modelValue: boolean
  defectId: string
  basicData: DefectBasicData
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  defectId: '',
  basicData: () => ({
    deviceTypes: [],
    defectTypes: [],
    defectLevels: [],
    defectReasons: [],
    handleStatuses: [],
    responsibleUnits: []
  })
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const emit = defineEmits<Emits>()

// 表单
const formRef = ref<FormInstance>()
const formData = ref<Partial<DefectRecord>>({
  deviceName: '',
  deviceType: '',
  defectType: '',
  defectLevel: '',
  defectReason: '',
  defectDescription: '',
  handleStatus: '',
  responsibleUnit: '',
  submitter: ''
})

// 表单验证规则
const rules: FormRules = {
  deviceName: [
    { required: true, message: '请输入设备名称', trigger: 'blur' }
  ],
  deviceType: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ],
  defectType: [
    { required: true, message: '请选择缺陷类型', trigger: 'change' }
  ],
  defectLevel: [
    { required: true, message: '请选择缺陷级别', trigger: 'change' }
  ],
  defectReason: [
    { required: true, message: '请选择缺陷原因', trigger: 'change' }
  ],
  defectDescription: [
    { required: true, message: '请输入缺陷描述', trigger: 'blur' }
  ],
  handleStatus: [
    { required: true, message: '请选择处理状态', trigger: 'change' }
  ],
  responsibleUnit: [
    { required: true, message: '请选择责任单位', trigger: 'change' }
  ],
  submitter: [
    { required: true, message: '请输入填写人', trigger: 'blur' }
  ]
}

// 提交加载状态
const submitLoading = ref(false)

// 是否为编辑模式
const isEdit = computed(() => !!props.defectId)

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

/**
 * 加载缺陷详情
 */
const loadDefectDetail = async () => {
  if (!props.defectId) {
    return
  }

  try {
    const response = await getDefectDetail(props.defectId)
    if (response.code === 200) {
      formData.value = { ...response.data }
    } else {
      ElMessage.error('Failed to load defect details')
    }
  } catch (error) {
    console.error('加载缺陷详情失败:', error)
    ElMessage.error('Failed to load defect details, please try again')
  }
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      // 编辑
      await updateDefect(props.defectId, formData.value)
      ElMessage.success('Update successfully')
    } else {
      // 新增
      await createDefect(formData.value)
      ElMessage.success('Create successfully')
    }

    emit('success')
    handleClose()
  } catch (error) {
    if (error !== false) {
      console.error('提交失败:', error)
      ElMessage.error(isEdit.value ? 'Update failed' : 'Create failed')
    }
  } finally {
    submitLoading.value = false
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  formRef.value?.resetFields()
  formData.value = {
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
  emit('update:modelValue', false)
}

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 组件挂载
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})

// 监听弹窗打开
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.defectId) {
        loadDefectDetail()
      } else {
        // 新增时设置默认值
        formData.value = {
          deviceName: '',
          deviceType: '',
          defectType: '',
          defectLevel: '',
          defectReason: '',
          defectDescription: '',
          handleStatus: '待处理',
          responsibleUnit: '',
          submitter: ''
        }
      }
    }
  }
)
</script>

<style scoped lang="scss">
:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-form) {
  .el-form-item {
    margin-bottom: 20px;

    .el-form-item__label {
      color: #ffffff;
    }
  }
}
</style>

