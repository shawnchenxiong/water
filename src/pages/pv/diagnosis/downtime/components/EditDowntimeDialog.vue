<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { DowntimeEvent } from '@/api/types/diagnosis/downtime'

interface Props {
  modelValue: boolean
  event?: DowntimeEvent
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', event: DowntimeEvent): void
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

const formData = ref({
  reason: '',
  remark: '',
})

// 停机原因选项
const reasonOptions = [
  { label: '设备故障停运', value: '设备故障停运' },
  { label: '设备检修停运', value: '设备检修停运' },
  { label: '电网故障停运', value: '电网故障停运' },
  { label: '未归因原因停运', value: '未归因原因停运' },
]

// 监听弹窗打开，初始化表单数据
watch(
  () => props.event,
  (event) => {
    if (event) {
      formData.value = {
        reason: event.reason || '',
        remark: event.remark || '',
      }
    }
  },
  { immediate: true }
)

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
}

// 确认修改
const handleConfirm = () => {
  if (!props.event) return

  emit('confirm', {
    ...props.event,
    reason: formData.value.reason,
    remark: formData.value.remark,
  })
  handleClose()
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="编辑停运事件"
    :width="isMobile ? '95%' : '800px'"
    :top="isMobile ? '2vh' : '15vh'"
    @close="handleClose"
  >
    <el-form v-if="event" label-position="left" :label-width="isMobile ? '80px' : '110px'">
      <el-row :gutter="isMobile ? 0 : 20">
        <!-- 左列 -->
        <el-col :span="isMobile ? 24 : 12">
          <el-form-item label="电站名称">
            <el-input :value="event.stationName" disabled class="disabled-input" />
          </el-form-item>
          <el-form-item label="开始时间">
            <el-input :value="event.startTime" disabled class="disabled-input" />
          </el-form-item>
          <el-form-item label="考核中断时长">
            <el-input :value="event.duration" disabled class="disabled-input" />
          </el-form-item>
          <el-form-item label="影响收益">
            <el-input :value="event.impactRevenue?.toFixed(2)" disabled class="disabled-input" />
          </el-form-item>
        </el-col>

        <!-- 右列 -->
        <el-col :span="isMobile ? 24 : 12">
          <el-form-item label="停运设备">
            <el-input :value="event.deviceName" disabled class="disabled-input" />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-input :value="event.endTime" disabled class="disabled-input" />
          </el-form-item>
          <el-form-item label="损失收益">
            <el-input :value="event.lossRevenue?.toFixed(2)" disabled class="disabled-input" />
          </el-form-item>
          <el-form-item label="停机原因">
            <el-select v-model="formData.reason" placeholder="请选择停机原因" style="width: 100%">
              <el-option
                v-for="option in reasonOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 备注 - 全宽 -->
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
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

:deep(.el-form-item) {
  margin-bottom: 18px;
}

.disabled-input {
  :deep(.el-input__wrapper) {
    background-color: rgba(0, 212, 255, 0.05);
    box-shadow: none;
  }
  
  :deep(.el-input__inner) {
    color: var(--el-text-color-primary);
  }
}

:deep(.el-input__wrapper) {
  background: rgba(0, 212, 255, 0.05);
  border-color: rgba(0, 212, 255, 0.2);

  &:hover {
    border-color: rgba(0, 212, 255, 0.4);
  }

  &.is-focus {
    border-color: #00D4FF;
  }
}

:deep(.el-input__inner) {
  color: #d1d5db;
}

:deep(.el-textarea__inner) {
  background: rgba(0, 212, 255, 0.05);
  border-color: rgba(0, 212, 255, 0.2);
  color: #d1d5db;

  &:hover {
    border-color: rgba(0, 212, 255, 0.4);
  }

  &:focus {
    border-color: #00D4FF;
  }
}

// 移动端适配
@media (max-width: 768px) {
  :deep(.el-dialog) {
    margin: 0;
    
    .el-dialog__body {
      padding: 12px;
    }
    
    .el-dialog__footer {
      padding: 12px;
      
      .el-button {
        width: 100px;
        font-size: 13px;
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
          .el-select__input {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
