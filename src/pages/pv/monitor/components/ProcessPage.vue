<template>
  <DeviceMonitorLayout>
    <!-- ========== 左侧工艺流程树菜单 ========== -->
    <template #left>
      <div style="padding: 10px; color: #fff;">
        <el-input v-model="treeSearch" placeholder="请输入关键字搜索" clearable style="margin-bottom: 15px;" />
        <el-tree
          :data="stationTree"
          :props="{ label: 'name', children: 'children' }"
          :default-expanded-keys="['root']"
          :current-node-key="currentNodeKey"
          node-key="id"
          @node-click="handleNodeClick"
          highlight-current
          style="background: transparent; color: #fff;"
        />
      </div>
    </template>

    <!-- ========== 右侧内容区 ========== -->
    <template #right>
      <div class="process-wrapper">
        <!-- 工艺流程图主区域 -->
        <div class="process-main">
          <!-- 有图片时展示工艺流程图 -->
          <div v-if="processImage" class="process-image-area">
            <img :src="processImage" :alt="currentTitle" class="process-flow-img" />
          </div>
          <!-- 无图片时展示占位 -->
          <div v-else class="process-placeholder">
            <el-empty :description="`${currentTitle} 工艺流程图绘制中...`" />
          </div>
        </div>
        
        <!-- 右侧实时数据面板 -->
        <div class="process-data-sidebar">
          <ProcessDataPanel :processId="processId" />
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
/**
 * 工艺流程通用页面 - 接收 processId 与 processName
 * 使用 DeviceMonitorLayout 布局，左侧工艺树 + 右侧实时数据面板
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import ProcessDataPanel from './ProcessDataPanel.vue'

const route = useRoute()
const router = useRouter()

// 根据当前路由前缀自动适配一期/二期路径
const prefix = computed(() => route.path.startsWith('/es') ? '/es' : '/pv')

// ==================== Props ====================
const props = defineProps<{
  processId: string
  processName: string
}>()

// ==================== 左侧工艺树 ====================
const treeSearch = ref('')
const processNodes = computed(() => [
  { id: 'pre-treatment', name: '预处理', path: `${prefix.value}/monitor/pre-treatment` },
  { id: 'stage1-aao', name: 'I段AAO', path: `${prefix.value}/monitor/stage1-aao` },
  { id: 'secondary-clarifier', name: '二沉池及出水', path: `${prefix.value}/monitor/secondary-clarifier` },
  { id: 'sludge-dewatering', name: '污泥脱水', path: `${prefix.value}/monitor/sludge-dewatering` },
  { id: 'high-eff-sedimentation', name: '高效沉淀池', path: `${prefix.value}/monitor/high-eff-sedimentation` },
  { id: 'denitrification-filter', name: '反硝化深床滤池', path: `${prefix.value}/monitor/denitrification-filter` },
  { id: 'dosing-system', name: '加药系统', path: `${prefix.value}/monitor/dosing-system` },
  { id: 'stage2-aao', name: 'II段AAO', path: `${prefix.value}/monitor/stage2-aao` },
  { id: 'blower-room', name: '鼓风机房', path: `${prefix.value}/monitor/blower-room` },
])

const stationTree = computed(() => [
  {
    id: 'root',
    name: '污水处理厂',
    children: processNodes.value
  }
])

const currentNodeKey = computed(() => props.processId)
const currentTitle = computed(() => props.processName)

// ==================== 工艺流程图映射 ====================
// processId → 图片路径，只有 4 个工艺有实际图片
const processImageMap: Record<string, string> = {
  'pre-treatment': '/images/预处理.png',
  'stage1-aao': '/images/I段AAO.png',
  'high-eff-sedimentation': '/images/高效沉淀池.png',
  'blower-room': '/images/鼓风机房.png',
}
const processImage = computed(() => processImageMap[props.processId] || '')

const handleNodeClick = (node: any) => {
  if (node.path && node.path !== route.path) {
    router.push(node.path)
  }
}

// ==================== 生命周期 ====================
onMounted(() => {})
watch(() => props.processId, () => {})
</script>

<style scoped lang="scss">
.process-wrapper {
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
  gap: 0;
}

/* ========== 工艺流程图主区域 ========== */
.process-main {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 右侧数据面板 */
.process-data-sidebar {
  width: 350px;
  flex-shrink: 0;
}

/* 工艺图片容器 */
.process-image-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(5, 15, 30, 0.6);
}

.process-flow-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* 无图占位 */
.process-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 15, 30, 0.4);
}

</style>
