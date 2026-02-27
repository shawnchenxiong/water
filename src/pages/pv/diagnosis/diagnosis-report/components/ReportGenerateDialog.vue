<template>
  <el-dialog
    v-model="visible"
    title="生成诊断报告"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="报告名称" prop="reportName">
        <el-input
          v-model="formData.reportName"
          placeholder="请输入报告名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="选择电站" prop="stationId">
        <el-select
          v-model="formData.stationId"
          placeholder="请选择电站"
          filterable
          class="w-full"
        >
          <el-option
            v-for="station in stationOptions"
            :key="station.value"
            :label="station.label"
            :value="station.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="报告模板" prop="templateId">
        <el-select
          v-model="formData.templateId"
          placeholder="请选择报告模板"
          class="w-full"
        >
          <el-option
            v-for="template in templateOptions"
            :key="template.templateId"
            :label="template.templateName"
            :value="template.templateId"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="时间范围" prop="dateRange">
        <el-date-picker
          v-model="formData.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </el-form-item>
      
      <el-form-item label="报告选项">
        <el-checkbox v-model="formData.includeCharts">包含图表</el-checkbox>
        <el-checkbox v-model="formData.includeTrends" class="ml-4">包含趋势分析</el-checkbox>
      </el-form-item>
      
      <el-form-item label="自定义章节">
        <el-checkbox-group v-model="formData.customSections">
          <el-checkbox label="recommendations">建议措施</el-checkbox>
          <el-checkbox label="appendix">附录信息</el-checkbox>
          <el-checkbox label="trend">趋势分析</el-checkbox>
          <el-checkbox label="charts">图表分析</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleGenerate" :loading="generating">
          生成报告
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getReportTemplates } from '@/api/diagnosis/diagnosisReport'
import type { 
  GenerateReportRequest, 
  ReportTemplate 
} from '@/api/types/diagnosis/diagnosisReport'

interface Props {
  modelValue: boolean
  reportName?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'generate', params: GenerateReportRequest): void
}

const props = withDefaults(defineProps<Props>(), {
  reportName: ''
})

const emit = defineEmits<Emits>()

// 对话框显示控制
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 表单相关
const formRef = ref<FormInstance>()
const generating = ref(false)

// 表单数据
const formData = ref<GenerateReportRequest & { dateRange: string[] }>({
  reportName: '',
  stationId: '',
  templateId: '',
  startDate: '',
  endDate: '',
  dateRange: [],
  includeCharts: true,
  includeTrends: true,
  customSections: ['recommendations', 'appendix']
})

// 表单验证规则
const formRules: FormRules = {
  reportName: [
    { required: true, message: '请输入报告名称', trigger: 'blur' },
    { min: 2, max: 50, message: '报告名称长度在2到50个字符', trigger: 'blur' }
  ],
  stationId: [
    { required: true, message: '请选择电站', trigger: 'change' }
  ],
  templateId: [
    { required: true, message: '请选择报告模板', trigger: 'change' }
  ],
  dateRange: [
    { required: true, message: '请选择时间范围', trigger: 'change' }
  ]
}

// 选项数据
const templateOptions = ref<ReportTemplate[]>([])
const stationOptions = ref([
  { value: 'station_001', label: '六安东城污水厂' },
  { value: 'station_002', label: '芜湖南亭市后水灯' },
  { value: 'station_003', label: '大龙测试电站' },
  { value: 'station_004', label: '第二测试电站' }
])

/**
 * 加载报告模板
 */
const loadTemplates = async () => {
  try {
    const response = await getReportTemplates()
    if (response.code === 200) {
      templateOptions.value = response.data.reportTemplates
    }
  } catch (error) {
    console.error('加载报告模板失败:', error)
  }
}

/**
 * 生成报告
 */
const handleGenerate = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    generating.value = true
    
    // 构造请求参数
    const params: GenerateReportRequest = {
      reportName: formData.value.reportName,
      stationId: formData.value.stationId,
      templateId: formData.value.templateId,
      startDate: formData.value.dateRange[0],
      endDate: formData.value.dateRange[1],
      includeCharts: formData.value.includeCharts,
      includeTrends: formData.value.includeTrends,
      customSections: formData.value.customSections
    }
    
    emit('generate', params)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    generating.value = false
  }
}

/**
 * 关闭对话框
 */
const handleClose = () => {
  visible.value = false
  resetForm()
}

/**
 * 重置表单
 */
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  formData.value = {
    reportName: '',
    stationId: '',
    templateId: '',
    startDate: '',
    endDate: '',
    dateRange: [],
    includeCharts: true,
    includeTrends: true,
    customSections: ['recommendations', 'appendix']
  }
}

// 监听报告名称变化
watch(() => props.reportName, (newName) => {
  if (newName) {
    formData.value.reportName = newName
  }
})

// 监听时间范围变化
watch(() => formData.value.dateRange, (newRange) => {
  if (newRange && newRange.length === 2) {
    formData.value.startDate = newRange[0]
    formData.value.endDate = newRange[1]
  }
})

// 组件初始化
onMounted(() => {
  loadTemplates()
})
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  padding: 20px 24px;
  
  .el-dialog__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.w-full {
  width: 100%;
}

.ml-4 {
  margin-left: 16px;
}

:deep(.el-checkbox) {
  margin-right: 16px;
  
  .el-checkbox__label {
    padding-left: 8px;
  }
}

:deep(.el-checkbox-group) {
  .el-checkbox {
    margin-bottom: 8px;
  }
}
</style>

