<template>
  <DeviceMonitorLayout>
    <!-- 左侧设备分类树 -->
    <template #left>
      <div class="device-tree-panel">
        <div class="tree-search">
          <el-input
            v-model="filterText"
            placeholder="分类名称"
            clearable
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <div class="tree-content">
          <div class="tree-empty">
            <el-empty 
              :image-size="60"
              image="/images/empty.png"
              description="暂无数据"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- 右侧电气监视内容 -->
    <template #right>
      <div class="electrical-monitor-container">
        <!-- 监视内容区域 -->
        <div class="monitor-content">
          <div class="empty-state">
            <el-empty 
              :image-size="80"
              image="/images/empty.png"
              description="暂无数据"
            />
          </div>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'

// 搜索过滤（预留功能）
const filterText = ref('')
</script>

<style scoped lang="scss">
.device-tree-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;

  .tree-search {
    margin-bottom: 16px;

    :deep(.el-input) {
      .el-input__wrapper {
        background-color: rgba(10, 30, 50, 0.6);
        border: 1px solid rgba(0, 212, 255, 0.3);
      }
      
      .el-input__inner {
        color: rgba(255, 255, 255, 0.85);
        
        &::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      }
    }
  }

  .tree-content {
    flex: 1;
    overflow: hidden;

    :deep(.el-tree) {
      background-color: transparent;
      color: rgba(255, 255, 255, 0.85);

      .el-tree-node {
        .el-tree-node__content {
          padding: 8px;
          border-radius: 4px;
          transition: all 0.3s ease;

          &:hover {
            background-color: rgba(0, 212, 255, 0.1);
          }

          &.is-current {
            background-color: rgba(0, 212, 255, 0.2);
          }
        }

        .el-tree-node__expand-icon {
          color: rgba(255, 255, 255, 0.65);
        }
      }
    }

    .tree-empty {
      text-align: center;
      padding: 40px 20px;

      :deep(.el-empty) {
        .el-empty__description {
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }
}

.electrical-monitor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .monitor-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.el-empty) {
        .el-empty__description {
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .device-tree-panel {
    padding: 12px;

    .tree-search {
      margin-bottom: 12px;
    }
  }

  .electrical-monitor-container {
    padding: 12px;
  }
}
</style>