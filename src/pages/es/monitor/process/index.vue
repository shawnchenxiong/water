<template>
  <DeviceMonitorLayout>
    <!-- ========== 左侧工艺流程树菜单 ========== -->
    <template #left>
      <div style="padding: 10px; color: #fff;">
        <!-- 搜索框 -->
        <el-input v-model="treeSearch" placeholder="请输入关键字搜索" clearable style="margin-bottom: 15px;" />

        <!-- 加载状态 -->
        <div v-if="treeLoading" class="tree-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在加载菜单...</span>
        </div>

        <!-- 工艺流程树 -->
        <el-tree
          v-else
          ref="treeRef"
          :data="filteredTreeData"
          :props="treeProps"
          :default-expanded-keys="defaultExpandedKeys"
          :current-node-key="currentMonitorId"
          node-key="value"
          @node-click="handleNodeClick"
          highlight-current
          :expand-on-click-node="false"
          style="background: transparent; color: #fff;"
        />
      </div>
    </template>

    <!-- ========== 右侧内容区 ========== -->
    <template #right>
      <div class="process-wrapper">
        <!-- 工艺流程主区域 -->
        <div class="process-main">
          <!-- 标题栏 -->
          <div class="process-title-bar">
            <span class="process-title">{{ currentNodeLabel || '请选择工艺节点' }}</span>
            <span v-if="currentNodeData?.responsible" class="process-responsible">
              负责人: {{ currentNodeData.responsible }}
            </span>
          </div>

          <!-- 子节点监控点列表 -->
          <div v-if="monitorPoints.length > 0" class="monitor-points-area">
            <el-scrollbar>
              <div class="monitor-grid">
                <div
                  v-for="point in monitorPoints"
                  :key="point.value"
                  class="monitor-card"
                  :class="{ 'has-children': point.children && point.children.length > 0 }"
                  @click="handleMonitorPointClick(point)"
                >
                  <div class="monitor-card-header">
                    <span class="monitor-name">{{ point.label }}</span>
                    <el-tag v-if="point.responsible" type="info" size="small">
                      {{ point.responsible }}
                    </el-tag>
                  </div>
                  <!-- 如果有子节点，展示子节点数量 -->
                  <div v-if="point.children && point.children.length > 0" class="monitor-card-meta">
                    <el-icon><Folder /></el-icon>
                    <span>包含 {{ point.children.length }} 个子项</span>
                  </div>
                  <!-- 叶子节点显示监控点标识 -->
                  <div v-else class="monitor-card-meta leaf">
                    <el-icon><Monitor /></el-icon>
                    <span>监控点 #{{ point.value }}</span>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>

          <!-- 无数据占位 -->
          <div v-else class="process-placeholder">
            <el-empty :description="emptyDescription" />
          </div>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
/**
 * 鹤问湖二期 - 工艺流程通用页面
 *
 * 根据路由参数 :monitorId 从后端获取对应节点的监控数据，
 * 左侧树形菜单完全由后端 getAllMonitorList 接口驱动。
 *
 * 中文注释符合 Google 编程规范要求
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import { Loading, Folder, Monitor } from '@element-plus/icons-vue'
import {
  getAllMonitorList,
  getMonitorNodeById,
  type MonitorTreeNode,
} from '@/api/monitorApi'

const route = useRoute()
const router = useRouter()

// ==================== 路由参数 ====================
/** 当前选中的监控节点ID（来自路由 :monitorId） */
const currentMonitorId = computed(() => route.params.monitorId as string)

// ==================== 左侧树形菜单 ====================
/** 树组件引用 */
const treeRef = ref<any>(null)

/** 树数据加载状态 */
const treeLoading = ref(false)

/** 搜索关键词 */
const treeSearch = ref('')

/** 后端返回的完整树形数据 */
const treeData = ref<MonitorTreeNode[]>([])

/** 树组件 props 配置 */
const treeProps = {
  label: 'label',
  children: 'children',
  isLeaf: (data: any) => !data.children || data.children.length === 0,
}

/** 默认展开的节点 */
const defaultExpandedKeys = computed(() => {
  // 展开所有一级节点
  return treeData.value.map(item => item.value)
})

/** 根据搜索关键词过滤树数据 */
const filteredTreeData = computed(() => {
  if (!treeSearch.value) return treeData.value

  const keyword = treeSearch.value.toLowerCase()

  /** 递归过滤节点 */
  function filterNodes(nodes: MonitorTreeNode[]): MonitorTreeNode[] {
    const result: MonitorTreeNode[] = []
    for (const node of nodes) {
      // 当前节点匹配
      if (node.label.toLowerCase().includes(keyword)) {
        result.push(node)
        continue
      }
      // 子节点中有匹配的
      if (node.children) {
        const filteredChildren = filterNodes(node.children)
        if (filteredChildren.length > 0) {
          result.push({ ...node, children: filteredChildren })
        }
      }
    }
    return result
  }

  return filterNodes(treeData.value)
})

/** 加载树形数据 */
const loadTreeData = async () => {
  treeLoading.value = true
  try {
    treeData.value = await getAllMonitorList()
    console.log('[EsMonitorProcess] 加载工艺流程树数据:', treeData.value.length, '个一级节点')
  } catch (error) {
    console.error('[EsMonitorProcess] 加载树数据失败:', error)
  } finally {
    treeLoading.value = false
  }
}

/** 树节点点击事件 */
const handleNodeClick = (data: MonitorTreeNode) => {
  // 如果是有 children 的节点，也允许点击查看详情
  const targetPath = `/es/monitor/process/${data.value}`
  if (route.path !== targetPath) {
    router.push(targetPath)
  }
}

// ==================== 右侧内容区 ====================
/** 当前选中节点的完整数据 */
const currentNodeData = ref<MonitorTreeNode | null>(null)

/** 当前节点名称 */
const currentNodeLabel = computed(() => currentNodeData.value?.label || '')

/** 当前节点的子监控点列表 */
const monitorPoints = computed(() => {
  if (!currentNodeData.value) return []
  return currentNodeData.value.children || []
})

/** 空状态描述文本 */
const emptyDescription = computed(() => {
  if (treeLoading.value) return '正在加载数据...'
  if (!currentMonitorId.value) return '请从左侧菜单选择工艺节点'
  if (!currentNodeData.value) return '未找到对应的工艺节点数据'
  return `${currentNodeLabel.value} 暂无子监控点`
})

/** 加载当前节点数据 */
const loadNodeData = async () => {
  if (!currentMonitorId.value) {
    currentNodeData.value = null
    return
  }

  const node = await getMonitorNodeById(currentMonitorId.value)
  currentNodeData.value = node

  if (node) {
    console.log('[EsMonitorProcess] 当前节点:', node.label, '子节点数:', node.children?.length || 0)
  } else {
    console.warn('[EsMonitorProcess] 未找到节点:', currentMonitorId.value)
  }
}

/** 监控点卡片点击 - 如果有子节点则导航到该节点 */
const handleMonitorPointClick = (point: MonitorTreeNode) => {
  if (point.children && point.children.length > 0) {
    router.push(`/es/monitor/process/${point.value}`)
  }
}

// ==================== 生命周期 ====================
onMounted(async () => {
  await loadTreeData()
  await loadNodeData()
})

// 监听路由参数变化，重新加载节点数据
watch(currentMonitorId, async () => {
  await loadNodeData()
  // 同步树的当前选中状态
  if (treeRef.value && currentMonitorId.value) {
    treeRef.value.setCurrentKey(currentMonitorId.value)
  }
})
</script>

<style scoped lang="scss">
/* ========== 树加载状态 ========== */
.tree-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  padding: 20px 0;
  justify-content: center;
}

/* ========== 工艺流程内容区 ========== */
.process-wrapper {
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
}

.process-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 标题栏 */
.process-title-bar {
  padding: 16px 20px;
  background: rgba(0, 20, 40, 0.6);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.process-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
}

.process-responsible {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

/* 监控点网格区域 */
.monitor-points-area {
  flex: 1;
  overflow: hidden;
  padding: 20px;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding-bottom: 20px;
}

/* 监控点卡片 */
.monitor-card {
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.8) 0%, rgba(0, 20, 45, 0.9) 100%);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: linear-gradient(180deg, #00d4ff, #0ea5e9);
    opacity: 0.6;
    transition: opacity 0.3s;
  }

  &:hover {
    border-color: rgba(0, 212, 255, 0.5);
    box-shadow: 0 4px 20px rgba(0, 212, 255, 0.15);
    transform: translateY(-2px);

    &::before {
      opacity: 1;
    }
  }

  &.has-children {
    cursor: pointer;
  }
}

.monitor-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.monitor-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.monitor-card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);

  .el-icon {
    font-size: 14px;
    color: rgba(0, 212, 255, 0.6);
  }

  &.leaf .el-icon {
    color: rgba(0, 212, 255, 0.4);
  }
}

/* 无数据占位 */
.process-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 15, 30, 0.4);
}
</style>
