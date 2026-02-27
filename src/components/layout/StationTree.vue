<template>
  <div class="station-tree-panel">
    <!-- 搜索和刷新 -->
    <div class="tree-toolbar">
      <div class="search-box">
        <el-input
          v-model="filterText"
          placeholder="搜索电站"
          :prefix-icon="Search"
          clearable
        />
      </div>
      <div class="refresh-btn" @click="handleRefresh" title="刷新">
        <el-icon><Refresh /></el-icon>
      </div>
    </div>

    <!-- 树形结构 -->
    <div class="tree-container">
      <el-tree
      ref="treeRef"
        :data="treeData"
        :props="treeProps"
        :filter-node-method="filterNode"
        :expand-on-click-node="false"
        :default-expanded-keys="defaultExpandedKeys"
        :highlight-current="true"
        node-key="regionId"
        class="region-tree"
        @node-click="handleNodeClick"
    >
      <template #default="{ data }">
        <div class="tree-node-content">
          <el-icon class="tree-node-icon" :class="getNodeIconClass(data)">
            <component :is="getNodeIcon(data)" />
          </el-icon>
          <span class="tree-node-label" :title="data.regionName">
            {{ data.regionName }}
          </span>
        </div>
      </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { ElTree } from 'element-plus';
import { 
  OfficeBuilding, 
  MapLocation, 
  Lightning,
  Search,
  Refresh 
} from '@element-plus/icons-vue';
import type { StationTreeNode, StationTreeProps, StationTreeEmits } from '@/types/station';
import { getRegionDeviceTree } from '@/api/stationApi';

// Props和Emits
const props = withDefaults(defineProps<StationTreeProps>(), {
  deviceType: '0919',
  filterModelId: '',
  autoSelectFirstLeaf: false
});

const emit = defineEmits<StationTreeEmits>();

// Tree相关
const treeRef = ref<InstanceType<typeof ElTree>>();
const treeProps = {
  children: 'childList',
  label: 'regionName'
};

// 搜索相关
const filterText = ref('');

// 树数据状态
const treeData = ref<StationTreeNode[]>([]);
const loading = ref(false);

// 默认展开的节点
const defaultExpandedKeys = computed(() => {
  return treeData.value.length > 0 ? [treeData.value[0].regionId] : [];
});

// 判断节点是否有子节点
const hasChildren = (data: StationTreeNode): boolean => {
  return !!(data.childList && data.childList.length > 0);
};

// 获取节点图标
const getNodeIcon = (data: StationTreeNode) => {
  switch (data.modelId) {
    case '100': // 根节点 - 智能运维平台
      return OfficeBuilding;
    case '101': // 城市节点
      return MapLocation;
    case '102': // 电站节点
      return Lightning;
    default:
      // 根据是否有子节点来判断
      return hasChildren(data) ? MapLocation : Lightning;
  }
};

// 获取节点图标样式类
const getNodeIconClass = (data: StationTreeNode) => {
  switch (data.modelId) {
    case '100':
      return 'icon-platform';
    case '101':
      return 'icon-city';
    case '102':
      return 'icon-station';
    default:
      return hasChildren(data) ? 'icon-city' : 'icon-station';
  }
};

// 处理节点点击
const handleNodeClick = (data: StationTreeNode) => {
  // 只有叶子节点才触发选择事件
  if (!hasChildren(data)) {
    emit('node-click', data);
  }
};

// 自动选择首个叶子节点
const selectFirstLeaf = () => {
  const findFirstLeaf = (nodes: StationTreeNode[]): StationTreeNode | null => {
    for (const node of nodes) {
      if (!hasChildren(node)) return node;
      if (node.childList && node.childList.length) {
        const found = findFirstLeaf(node.childList);
        if (found) return found;
      }
    }
    return null;
  };
  const first = findFirstLeaf(treeData.value);
  if (first) {
    emit('node-click', first);
  }
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  
  try {
    // 调用API接口
    const response = await getRegionDeviceTree(
      props.deviceType,
      props.filterModelId || undefined
    );
    
    treeData.value = response.data || [];
    console.log('数据加载成功:', treeData.value);
    if (props.autoSelectFirstLeaf && treeData.value.length) {
      // 下一个宏任务触发，确保树已渲染
      setTimeout(() => selectFirstLeaf(), 0);
    }
  } catch (error) {
    console.error('数据加载失败:', error);
    treeData.value = [];
  } finally {
    loading.value = false;
  }
};

// 刷新事件
const handleRefresh = () => {
  loadData();
};

// 搜索过滤节点
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.regionName.includes(value);
};

// 监听搜索文本变化
watch(filterText, (val) => {
  treeRef.value?.filter(val);
});

// 监听参数变化
watch(
  () => [props.deviceType, props.filterModelId],
  () => {
    loadData();
  },
  { deep: true }
);

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.station-tree-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.search-box {
  flex: 1;
  
  :deep(.el-input__wrapper) {
    background: rgba(0, 30, 60, 0.6);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 4px;
    
    &:hover {
      border-color: rgba(0, 212, 255, 0.5);
    }
    
    &.is-focus {
      border-color: #00d4ff;
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
    }
  }
  
  :deep(.el-input__inner) {
    color: #fff;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  :deep(.el-input__prefix) {
    color: #00d4ff;
  }
}

.refresh-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
  }
  
  .el-icon {
    color: #00d4ff;
    font-size: 16px;
  }
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(10, 30, 50, 0.4);
    border-radius: 4px;
    margin: 4px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, 
      rgba(0, 212, 255, 0.5) 0%, 
      rgba(0, 180, 230, 0.7) 50%,
      rgba(0, 212, 255, 0.5) 100%
    );
    border-radius: 4px;
    border: 1px solid rgba(0, 212, 255, 0.2);
    
    &:hover {
      background: linear-gradient(180deg, 
        rgba(0, 212, 255, 0.7) 0%, 
        rgba(0, 200, 255, 0.9) 50%,
        rgba(0, 212, 255, 0.7) 100%
      );
      box-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
    }
    
    &:active {
      background: linear-gradient(180deg, 
        rgba(0, 180, 230, 0.8) 0%, 
        rgba(0, 160, 200, 1) 50%,
        rgba(0, 180, 230, 0.8) 100%
      );
    }
  }
}

// 树节点内容样式
.tree-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  
  .tree-node-icon {
    font-size: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    // 平台图标 - 金色
    &.icon-platform {
      color: #ffd700;
    }
    
    // 城市图标 - 青蓝色
    &.icon-city {
      color: #00d4ff;
    }
    
    // 电站图标 - 橙黄色
    &.icon-station {
      color: #ffb800;
    }
  }
  
  .tree-node-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

</style>
