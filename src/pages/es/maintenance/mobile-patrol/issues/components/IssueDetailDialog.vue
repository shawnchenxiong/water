<template>
  <el-dialog
    v-model="visible"
    title="问题详情"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="issue-detail">
      <div v-if="issue" class="detail-content">
        <!-- 基本信息 -->
        <div class="info-section">
          <h4>基本信息</h4>
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
              <label>确认状态:</label>
              <el-tag :color="issue.statusColor" size="small">
                {{ issue.confirmStatus }}
              </el-tag>
            </div>
            <div class="info-item">
              <label>巡检人员:</label>
              <span>{{ issue.inspector }}</span>
            </div>
            <div class="info-item">
              <label>更新时间:</label>
              <span>{{ issue.updateTime }}</span>
            </div>
          </div>
        </div>

        <!-- 问题描述 -->
        <div class="info-section">
          <h4>问题描述</h4>
          <div class="description-content">
            {{ issue.issueDescription }}
          </div>
        </div>

        <!-- 问题位置 -->
        <div class="info-section">
          <h4>问题位置</h4>
          <div class="location-content">
            <el-icon><Location /></el-icon>
            <span>{{ issue.location }}</span>
          </div>
        </div>

        <!-- 问题图片 -->
        <div class="info-section" v-if="issue.images && issue.images.length > 0">
          <h4>问题图片</h4>
          <div class="images-grid">
            <div
              v-for="(image, index) in issue.images"
              :key="index"
              class="image-item"
              @click="handlePreviewImage(index)"
            >
              <el-image
                :src="getImageUrl(image)"
                :alt="`问题图片${index + 1}`"
                fit="cover"
                :preview-src-list="imageUrls"
                :initial-index="index"
              />
            </div>
          </div>
        </div>

        <!-- 确认信息 -->
        <div class="info-section" v-if="issue.confirmStatus !== '待确认'">
          <h4>确认信息</h4>
          <div class="confirm-info">
            <div class="info-item">
              <label>确认人:</label>
              <span>{{ issue.confirmer || '-' }}</span>
            </div>
            <div class="info-item">
              <label>确认时间:</label>
              <span>{{ issue.confirmTime || '-' }}</span>
            </div>
            <div class="confirm-description">
              <label>确认说明:</label>
              <div class="description-text">
                {{ issue.confirmDescription || '-' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-data">
        <el-empty description="暂无数据" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button
          v-if="issue && issue.confirmStatus === '待确认'"
          type="success"
          @click="handleConfirm"
        >
          确认问题
        </el-button>
        <el-button
          v-if="issue && issue.confirmStatus === '待确认'"
          type="warning"
          @click="handleIgnore"
        >
          忽略问题
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Location } from '@element-plus/icons-vue'
import { getInspectionIssueDetail } from '@/api/maintenance/mobileInspectionIssuesApi'
import type { InspectionIssue } from '@/api/types/mobile-inspection-issues'

interface Props {
  modelValue: boolean
  issueId: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', issue: InspectionIssue): void
  (e: 'ignore', issue: InspectionIssue): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 问题详情数据
const issue = ref<InspectionIssue | null>(null)
const loading = ref(false)

// 图片URL列表
const imageUrls = computed(() => {
  if (!issue.value || !issue.value.images) return []
  return issue.value.images.map(image => getImageUrl(image))
})

/**
 * 获取图片URL
 */
const getImageUrl = (imageName: string): string => {
  // 这里应该根据实际情况构建图片URL
  // 示例：如果是相对路径，需要拼接完整URL
  if (imageName.startsWith('http')) {
    return imageName
  }
  return `https://example.com/inspection-images/${imageName}`
}

/**
 * 预览图片
 */
const handlePreviewImage = (index: number) => {
  // Element Plus 的 el-image 组件会自动处理预览
  console.log('Preview image at index:', index)
}

/**
 * 加载问题详情
 */
const loadIssueDetail = async () => {
  if (!props.issueId) return

  try {
    loading.value = true
    const data = await getInspectionIssueDetail(props.issueId)
    issue.value = data
  } catch (error) {
    console.error('Load issue detail failed:', error)
    ElMessage.error('Failed to load issue detail')
    issue.value = null
  } finally {
    loading.value = false
  }
}

/**
 * 确认问题
 */
const handleConfirm = () => {
  if (issue.value) {
    emit('confirm', issue.value)
    handleClose()
  }
}

/**
 * 忽略问题
 */
const handleIgnore = () => {
  if (issue.value) {
    emit('ignore', issue.value)
    handleClose()
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  visible.value = false
  issue.value = null
}

// 监听弹窗打开
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.issueId) {
      loadIssueDetail()
    }
  }
)
</script>

<style scoped lang="scss">
.issue-detail {
  .detail-content {
    .info-section {
      margin-bottom: 24px;
      
      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        font-size: 16px;
        font-weight: 600;
        color: #00d4ff;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #333;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
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

      .description-content {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 16px;
        line-height: 1.6;
        color: #ffffff;
      }

      .location-content {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #ffffff;

        .el-icon {
          color: #00d4ff;
        }
      }

      .images-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;

        .image-item {
          width: 120px;
          height: 120px;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.3s;

          &:hover {
            border-color: #00d4ff;
          }

          :deep(.el-image) {
            width: 100%;
            height: 100%;
          }
        }
      }

      .confirm-info {
        .info-item {
          margin-bottom: 12px;
        }

        .confirm-description {
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
            min-height: 60px;
          }
        }
      }
    }
  }

  .no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
