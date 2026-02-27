<template>
  <div class="video-device-tree-panel">
    <!-- 标题 -->
    <div class="tree-header">
      <span class="header-title">设备列表</span>
    </div>
    
    <!-- 搜索和工具栏 -->
    <div class="tree-toolbar">
      <div class="search-box">
        <el-input
          v-model="filterText"
          placeholder="请输入关键字搜索"
          :prefix-icon="Search"
          clearable
        />
      </div>
      <div class="toolbar-actions">
        <el-tooltip content="空文件夹隐藏">
          <div 
            class="action-btn" 
            :class="{ active: hideEmptyFolder }" 
            @click="hideEmptyFolder = !hideEmptyFolder"
          >
            <el-icon><Folder /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="在线">
          <div 
            class="action-btn" 
            :class="{ active: showOnline }" 
            @click="showOnline = !showOnline"
          >
            <el-icon><VideoCamera /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="离线">
          <div 
            class="action-btn" 
            :class="{ active: showOffline }" 
            @click="showOffline = !showOffline"
          >
            <el-icon><VideoCameraFilled /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="刷新">
          <div class="action-btn" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
          </div>
        </el-tooltip>
      </div>
    </div>

    <!-- 树形结构 -->
    <div class="tree-container">
      <el-tree
        ref="treeRef"
        :data="filteredTreeData"
        :props="treeProps"
        :filter-node-method="filterNode"
        :expand-on-click-node="false"
        :default-expand-all="true"
        :highlight-current="true"
        node-key="id"
        class="device-tree"
        @node-click="handleNodeClick"
      >
        <template #default="{ data }">
          <div class="tree-node-content">
            <el-icon class="tree-node-icon" :class="getNodeIconClass(data)">
              <component :is="getNodeIcon(data)" />
            </el-icon>
            <span class="tree-node-label" :title="data.name">
              {{ data.name }}
            </span>
            <!-- 区域节点显示在线/总数 -->
            <span v-if="data.type === 'region'" class="device-count">
              ({{ data.onlineCount }}/{{ data.totalCount }})
            </span>
            <!-- 设备节点显示在线状态 -->
            <span v-else class="device-status" :class="{ online: data.online }">
              {{ data.online ? '在线' : '离线' }}
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
  MapLocation, 
  VideoCamera, 
  VideoCameraFilled,
  Folder,
  Search,
  Refresh 
} from '@element-plus/icons-vue';
import type { VideoDeviceNode } from '@/api/types/video/browsing';

// Props
interface Props {
  // 设备树数据
  treeData?: VideoDeviceNode[];
}

const props = withDefaults(defineProps<Props>(), {
  treeData: () => []
});

// Emits
interface Emits {
  (e: 'device-click', device: VideoDeviceNode): void;
  (e: 'refresh'): void;
}

const emit = defineEmits<Emits>();

// Tree 相关
const treeRef = ref<InstanceType<typeof ElTree>>();
const treeProps = {
  children: 'children',
  label: 'name'
};

// 搜索和过滤
const filterText = ref('');
const hideEmptyFolder = ref(false);
const showOnline = ref(true);
const showOffline = ref(true);

// 判断节点是否有子节点
const hasChildren = (data: VideoDeviceNode): boolean => {
  return !!(data.children && data.children.length > 0);
};

// 过滤树数据
const filteredTreeData = computed(() => {
  const filterTree = (nodes: VideoDeviceNode[]): VideoDeviceNode[] => {
    return nodes.filter(node => {
      // 如果是区域节点
      if (node.type === 'region') {
        // 如果隐藏空文件夹，检查是否有设备
        if (hideEmptyFolder.value && (!node.children || node.children.length === 0)) {
          return false;
        }
        // 递归过滤子节点
        if (node.children) {
          const filteredChildren = filterTree(node.children);
          node.children = filteredChildren;
          // 如果隐藏空文件夹且过滤后没有子节点，则隐藏该节点
          if (hideEmptyFolder.value && filteredChildren.length === 0) {
            return false;
          }
        }
        return true;
      }
      
      // 如果是设备节点
      if (node.type === 'device') {
        // 根据在线/离线过滤
        if (!showOnline.value && node.online) return false;
        if (!showOffline.value && !node.online) return false;
        return true;
      }
      
      return true;
    });
  };
  
  return filterTree(JSON.parse(JSON.stringify(props.treeData)));
});

// 获取节点图标
const getNodeIcon = (data: VideoDeviceNode) => {
  if (data.type === 'region') {
    return MapLocation;
  }
  return data.online ? VideoCamera : VideoCameraFilled;
};

// 获取节点图标样式类
const getNodeIconClass = (data: VideoDeviceNode) => {
  if (data.type === 'region') {
    return 'icon-region';
  }
  return data.online ? 'icon-online' : 'icon-offline';
};

// 处理节点点击
const handleNodeClick = (data: VideoDeviceNode) => {
  // 只有设备节点才触发点击事件
  if (data.type === 'device') {
    emit('device-click', data);
  }
};

// 刷新事件
const handleRefresh = () => {
  emit('refresh');
};

// 搜索过滤节点
const filterNode = (value: string, data: VideoDeviceNode) => {
  if (!value) return true;
  return data.name.toLowerCase().includes(value.toLowerCase());
};

// 监听搜索文本变化
watch(filterText, (val) => {
  treeRef.value?.filter(val);
});

// 组件挂载时展开所有节点
onMounted(() => {
  // 可以添加初始化逻辑
});
</script>

<style scoped lang="scss">
.video-device-tree-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.tree-header {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  background: rgba(0, 212, 255, 0.05);
  
  .header-title {
    font-weight: 600;
    font-size: 16px;
    color: #00d4ff;
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  }
}

.tree-toolbar {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.15);
  background: rgba(10, 30, 50, 0.3);
}

.search-box {
  flex: 1;
  
  :deep(.el-input__wrapper) {
    background: rgba(10, 30, 50, 0.6);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 4px;
    box-shadow: none;
    transition: all 0.3s ease;
    
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

.toolbar-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 30, 50, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.25);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  .el-icon {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
  }
  
  &:hover {
    border-color: rgba(0, 212, 255, 0.5);
    background: rgba(0, 212, 255, 0.1);
    
    .el-icon {
      color: #00d4ff;
      transform: scale(1.1);
    }
  }
  
  &.active {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.15);
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
    
    .el-icon {
      color: #00d4ff;
      filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.8));
    }
  }
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 4px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 3px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(0, 212, 255, 0.5);
    }
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(10, 30, 50, 0.4);
    border-radius: 3px;
  }
}

// Element Plus 树节点样式覆盖
.device-tree {
  background: transparent;
  
  :deep(.el-tree-node__content) {
    background: transparent;
    border-radius: 4px;
    padding: 8px 4px;
    transition: all 0.3s ease;
    color: rgba(255, 255, 255, 0.85);
    height: auto;
    min-height: 32px;
    
    &:hover {
      background: rgba(0, 212, 255, 0.1);
      border-left: 2px solid #00d4ff;
      padding-left: 10px;
    }
  }
  
  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background: rgba(0, 212, 255, 0.15);
    border-left: 2px solid #00d4ff;
    padding-left: 10px;
  }
  
  :deep(.el-tree-node__expand-icon) {
    color: #00d4ff;
    font-size: 14px;
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
    
    // 区域图标 - 青色
    &.icon-region {
      color: #00d4ff;
    }
    
    // 在线设备 - 绿色
    &.icon-online {
      color: #10b981;
    }
    
    // 离线设备 - 灰色
    &.icon-offline {
      color: rgba(255, 255, 255, 0.4);
    }
  }
  
  .tree-node-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: rgba(255, 255, 255, 0.85);
  }
  
  .device-count {
    font-size: 12px;
    color: #00d4ff;
    font-weight: 500;
    flex-shrink: 0;
  }
  
  .device-status {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 3px;
    flex-shrink: 0;
    
    &.online {
      color: #10b981;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    
    &:not(.online) {
      color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>

