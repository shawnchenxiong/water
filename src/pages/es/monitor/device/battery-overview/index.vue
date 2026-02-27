<template>
  <div class="battery-overview-page">
    <!-- 顶部控制栏 -->
    <div class="top-controls">
      <div class="station-selector">
        <el-tree-select
          v-model="selectedStationId"
          :data="stationTreeData"
          :render-after-expand="false"
          :default-expand-all="true"
          placeholder="请选择电站"
          :props="{ label: 'regionName', value: 'regionId', children: 'childList' }"
          :check-on-click-node="true"
          @change="handleStationChange"
        />
      </div>
      
      <div class="status-bar">
        <div class="status-title">阵列总数({{ statistics.total }}):</div>
        <div class="status-items">
          <div class="status-item status-normal">
            <span class="status-dot"></span>
            <span>正常({{ statistics.normal }})</span>
          </div>
          <div class="status-item status-warning">
            <span class="status-dot"></span>
            <span>告警({{ statistics.warning }})</span>
          </div>
          <div class="status-item status-offline">
            <span class="status-dot"></span>
            <span>离线({{ statistics.offline }})</span>
          </div>
        </div>
        <div class="status-refresh">
          <span>每行8列</span>
          <el-button
            :icon="Refresh"
            circle
            size="small"
            @click="handleRefresh"
            title="刷新数据"
          />
        </div>
      </div>
    </div>

    <!-- 电池总览内容区 -->
    <div class="battery-content">
      <!-- 暂时为空，等待具体需求 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElButton, ElTreeSelect } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import type { StationTreeNode } from '@/types/station'

// 响应式数据
const selectedStationId = ref<string>('')
const stationTreeData = ref<StationTreeNode[]>([])

/**
 * 加载电站树数据
 */
const loadStationTree = async () => {
  try {
    // 模拟加载电站树数据
    await new Promise(resolve => setTimeout(resolve, 500))
    stationTreeData.value = [
      {
        regionId: '1',
        regionName: '智能运维平台',
        modelId: 'platform',
        upRegionId: '0',
        sort: 1,
        childList: [
          {
            regionId: '2',
            regionName: '安徽省芜湖市',
            modelId: 'region',
            upRegionId: '1',
            sort: 1,
            childList: [
              {
                regionId: '3',
                regionName: '清源储能电站',
                modelId: 'station',
                upRegionId: '2',
                sort: 1
              }
            ]
          }
        ]
      }
    ]
    
    // 默认选择电站节点
    selectedStationId.value = '3'
  } catch (error) {
    console.error('加载电站树失败:', error)
    ElMessage.error('加载电站树失败')
  }
}

// 统计数据
const statistics = reactive({
  total: 0,
  normal: 0,
  warning: 0,
  offline: 0
})


/**
 * 电站选择变化处理
 */
const handleStationChange = (stationId: string) => {
  console.log('选择电站:', stationId)
  // TODO: 根据具体需求加载相应数据
}

/**
 * 刷新数据
 */
const handleRefresh = () => {
  ElMessage.success('数据已刷新')
  // TODO: 根据具体需求实现刷新逻辑
}


// 设置选择器宽度
const setSelectWidth = () => {
  const stationSelector = document.querySelector('.station-selector') as HTMLElement
  const select = stationSelector?.querySelector('.el-select') as HTMLElement
  
  if (stationSelector && select) {
    stationSelector.style.width = '180px'
    stationSelector.style.minWidth = '180px'
    select.style.width = '100%'
    select.style.minWidth = '180px'
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadStationTree()
  
  // 确保DOM渲染后设置宽度
  nextTick(() => {
    setSelectWidth()
  })
})
</script>

<style lang="scss">
// 全局样式用于确保电站选择器宽度
.battery-overview-page .station-selector {
  width: 180px !important;
  min-width: 180px !important;
  
  .el-select {
    width: 100% !important;
    min-width: 180px !important;
  }
}
</style>

<style scoped lang="scss">
.battery-overview-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(10, 20, 40, 0.8);
  
  .top-controls {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    background: rgba(0, 212, 255, 0.1);
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    gap: 20px;
    
    .station-selector {
      width: 180px !important; // 设置容器宽度
      min-width: 180px !important;
      
      :deep(.el-select) {
        width: 100% !important; // 子元素占满容器
        min-width: 180px !important;
        
        .el-select__wrapper {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          
          .el-select__placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          
          .el-select__selected-item {
            color: #fff;
          }
          
          .el-select__caret {
            color: rgba(255, 255, 255, 0.6);
          }
        }
      }
    }
    
    // TreeSelect下拉框样式（全局）
    :deep(.el-popper) {
      &.el-tree-select__popper {
        background: rgba(20, 50, 100, 0.95);
        border: 1px solid rgba(0, 212, 255, 0.4);
        
        .el-tree {
          background: transparent;
          color: #fff;
          
          .el-tree-node {
            &:hover {
              background: rgba(0, 212, 255, 0.1);
            }
            
            &.is-current > .el-tree-node__content {
              background: rgba(0, 212, 255, 0.2);
            }
            
            .el-tree-node__content {
              color: #fff;
              
              &:hover {
                background: rgba(0, 212, 255, 0.1);
              }
            }
          }
        }
      }
    }
  }
  
  .status-bar {
    display: flex;
    align-items: center;
    flex: 1;
    
    .status-title {
      color: #fff;
      font-size: 14px;
      margin-right: 20px;
    }
    
    .status-items {
      display: flex;
      gap: 24px;
      flex: 1;
      
      .status-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        &.status-normal {
          color: #52c41a;
          .status-dot {
            background: #52c41a;
          }
        }
        
        &.status-warning {
          color: #faad14;
          .status-dot {
            background: #faad14;
          }
        }
        
        &.status-offline {
          color: #ff4d4f;
          .status-dot {
            background: #ff4d4f;
          }
        }
      }
    }
    
    .status-refresh {
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }
  }
  
  .battery-content {
    flex: 1;
    padding: 20px;
    overflow: auto;
    
    // 暂时为空，等待具体需求
  }
}

// 移动端适配
@media (max-width: 768px) {
  .battery-overview-page {
    .top-controls {
      flex-direction: column;
      gap: 8px;
      align-items: stretch;
      padding: 12px 16px;
      
      .station-selector {
        :deep(.el-tree-select) {
          width: 100%;
        }
      }
      
      .status-bar {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        
        .status-title {
          margin-right: 12px;
          font-size: 13px;
        }
        
        .status-items {
          display: flex;
          gap: 12px;
          flex: 1;
          
          .status-item {
            font-size: 12px;
          }
        }
        
        .status-refresh {
          display: flex;
          align-items: center;
          gap: 6px;
          
          span {
            font-size: 12px;
          }
        }
      }
    }
    
    .battery-content {
      padding: 12px;
    }
  }
}
</style>