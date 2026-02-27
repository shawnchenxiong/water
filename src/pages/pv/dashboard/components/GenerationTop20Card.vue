<template>
  <div class="generation-top20-card">
    <div class="card-header">
      <span class="card-title">发电量TOP20</span>
      <div class="date-controls">
        <el-button text>日</el-button>
        <el-button text class="active">月</el-button>
        <el-button text>年</el-button>
      </div>
    </div>
    <div class="generation-top20-list">
      <div 
        v-for="(item, index) in generationData" 
        :key="index"
        class="generation-item"
      >
        <div class="station-name">{{ item.stationName }}</div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${(item.generation / 7000) * 100}%` }"
          ></div>
        </div>
        <div class="generation-value">{{ item.generation }}{{ item.unit }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { PowerGenerationTop20 } from '@/api/types/pv-dashboard'
import { getGenerationTop20 } from '@/api/pvDashboardApi'
import { ElMessage } from 'element-plus'

/**
 * 组件Props
 */
interface Props {
  generationData?: PowerGenerationTop20[]
}

const props = defineProps<Props>()

// 响应式数据
const loading = ref(false)
const generationDataRef = ref<PowerGenerationTop20[]>([])

// 使用props或API数据
const generationData = computed(() => props.generationData || generationDataRef.value)

/**
 * 加载数据
 */
const loadData = async () => {
  if (props.generationData) return
  
  loading.value = true
  try {
    const response = await getGenerationTop20('month')
    if (response.code === 200) {
      generationDataRef.value = response.data
    } else {
      ElMessage.error(response.message || '加载数据失败')
    }
  } catch (error) {
    console.error('加载发电量TOP20数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 组件挂载后加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.generation-top20-card {
  padding: 12px 8px; // 整体更紧凑
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.card-title {
  color: #00d4ff;
  font-size: 15px;
  font-weight: 500;
}

.date-controls {
  display: flex;
  gap: 6px;
}

.date-controls .el-button {
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  background: transparent;
  min-width: 36px;
  height: 26px;
  font-size: 12px;
}

.date-controls .el-button.active,
.date-controls .el-button:hover {
  color: #00d4ff;
  border-color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
}

.generation-top20-list {
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 50px);
  overflow-y: auto;
}

.generation-item {
  display: flex;
  align-items: center;
  gap: 10px; // 增加间距，让视觉更清晰
  padding: 4px 0; // 与满发小时保持一致
}

.station-name {
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  min-width: 85px; // 缩小名称列宽度
  max-width: 85px; // 限制最大宽度
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-bar {
  flex: 1;
  height: 8px; // 增加进度条高度，更明显
  background: rgba(0, 212, 255, 0.15);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #0099cc);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 4px rgba(0, 212, 255, 0.6); // 添加发光效果
}

.generation-value {
  color: #00d4ff;
  font-size: 13px; // 稍微加大数值字体
  font-weight: 600; // 加粗数值
  min-width: 45px; // 缩小数值列宽度
  text-align: right;
}

/* 美化滚动条样式 */
.generation-top20-list::-webkit-scrollbar {
  width: 6px;
}

.generation-top20-list::-webkit-scrollbar-track {
  background: rgba(10, 22, 40, 0.6);
  border-radius: 3px;
  margin: 4px 0;
}

.generation-top20-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #00d4ff 0%, #0099cc 100%);
  border-radius: 3px;
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.generation-top20-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #00e5ff 0%, #00b8e6 100%);
  box-shadow: 0 0 6px rgba(0, 212, 255, 0.6);
}
</style>

