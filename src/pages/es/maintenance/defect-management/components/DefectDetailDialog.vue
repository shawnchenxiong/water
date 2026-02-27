<template>
  <el-dialog
    v-model="visible"
    title="缺陷详情"
    :width="isMobile ? '95%' : '800px'"
    :top="isMobile ? '2vh' : '15vh'"
    @close="handleClose"
  >
    <el-descriptions
      v-loading="loading"
      :column="2"
      border
    >
      <el-descriptions-item label="缺陷编号">
        {{ defectDetail.id || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="电站名称">
        {{ defectDetail.stationName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="设备名称">
        {{ defectDetail.deviceName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="设备类型">
        {{ defectDetail.deviceType || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="缺陷类型">
        {{ defectDetail.defectType || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="缺陷级别">
        <el-tag
          v-if="defectDetail.defectLevel"
          :color="getLevelColor(defectDetail.defectLevel)"
          size="small"
          effect="dark"
        >
          {{ defectDetail.defectLevel }}
        </el-tag>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="缺陷原因">
        {{ defectDetail.defectReason || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="处理状态">
        <el-tag
          v-if="defectDetail.handleStatus"
          :color="defectDetail.statusColor"
          size="small"
          effect="dark"
        >
          {{ defectDetail.handleStatus }}
        </el-tag>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="责任单位">
        {{ defectDetail.responsibleUnit || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="填写人">
        {{ defectDetail.submitter || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="填写时间">
        {{ defectDetail.submitTime || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ defectDetail.updateTime || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="缺陷描述" :span="2">
        {{ defectDetail.defectDescription || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDefectDetail } from '@/api/maintenance/defectManagementApi'
import type { DefectRecord } from '@/api/types/defect-management'

// Props
interface Props {
  modelValue: boolean
  defectId: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  defectId: ''
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const emit = defineEmits<Emits>()

// 缺陷详情
const defectDetail = ref<Partial<DefectRecord>>({})
const loading = ref(false)

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

/**
 * 获取级别颜色
 */
const getLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    '紧急': '#F56C6C',
    '重要': '#E6A23C',
    '一般': '#409EFF',
    '轻微': '#909399'
  }
  return colorMap[level] || '#909399'
}

/**
 * 加载缺陷详情
 */
const loadDefectDetail = async () => {
  if (!props.defectId) {
    return
  }

  loading.value = true
  try {
    const response = await getDefectDetail(props.defectId)
    if (response.code === 200) {
      defectDetail.value = response.data
    } else {
      ElMessage.error('Failed to load defect details')
    }
  } catch (error) {
    console.error('加载缺陷详情失败:', error)
    ElMessage.error('Failed to load defect details, please try again')
  } finally {
    loading.value = false
  }
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

/**
 * 关闭弹窗
 */
const handleClose = () => {
  defectDetail.value = {}
  emit('update:modelValue', false)
}

// 监听弹窗打开
watch(
  () => props.modelValue,
  (val) => {
    if (val && props.defectId) {
      loadDefectDetail()
    }
  }
)
</script>

<style scoped lang="scss">
:deep(.el-descriptions) {
  .el-descriptions__label {
    color: rgba(255, 255, 255, 0.85);
    background-color: rgba(0, 30, 60, 0.3);
    font-weight: 500;
  }

  .el-descriptions__content {
    color: rgba(255, 255, 255, 0.65);
    background-color: rgba(0, 30, 60, 0.1);
  }
}
</style>

