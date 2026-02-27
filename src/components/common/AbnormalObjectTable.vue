<template>
  <div class="abnormal-object-table">
    <div class="table-section">
      <div class="section-title">异常对象</div>
      
      <el-table
        :data="pagedData"
        size="small"
        :header-cell-style="{
          backgroundColor: 'rgba(0, 40, 80, 0.8)',
          color: '#ffffff',
          borderColor: 'rgba(0, 212, 255, 0.3)'
        }"
        :cell-style="{
          backgroundColor: 'rgba(0, 30, 60, 0.5)',
          color: '#ffffff',
          borderColor: 'rgba(0, 212, 255, 0.2)'
        }"
      >
        <el-table-column
          prop="objectName"
          label="对象名称"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleObjectClick(row)"
            >
              {{ row.objectName }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="objectType" 
          label="对象类型"
          align="center"
        />
      </el-table>
      
      <div class="table-pagination" v-if="data.length > 0">
        <div class="pagination-info">
          共 {{ data.length }} 条
        </div>
        <div class="pagination-controls">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20, 40]"
            :total="data.length"
            layout="sizes, prev, pager, next"
            small
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
          <div class="goto-page">
            前往
            <el-input-number
              v-model="gotoPage"
              :min="1"
              :max="Math.ceil(data.length / pageSize)"
              size="small"
              controls-position="right"
              @change="handleGotoPage"
              @keyup.enter="handleGotoPage"
            />
            页
          </div>
        </div>
      </div>
    </div>
    
    <div class="suggestion-section">
      <div class="section-title">处理建议</div>
      <div class="suggestion-content">
        <p v-if="suggestedActions.length === 0">暂无处理建议</p>
        <div v-else class="suggestion-list">
          <div 
            v-for="(action, index) in suggestedActions" 
            :key="index"
            class="suggestion-item"
          >
            <el-icon class="suggestion-icon"><InfoFilled /></el-icon>
            <span>{{ action }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import type { AbnormalObject } from '@/api/types/diagnosis'

interface Props {
  /** 异常对象数据 */
  data: AbnormalObject[]
  /** 处理建议列表 */
  suggestions?: string[]
  /** 初始页大小 */
  initialPageSize?: number
}

interface Emits {
  /** 关闭表格事件 */
  (e: 'close'): void
  /** 对象点击事件 */
  (e: 'object-click', object: AbnormalObject): void
}

const props = withDefaults(defineProps<Props>(), {
  suggestions: () => [],
  initialPageSize: 10
})

const emit = defineEmits<Emits>()

// 分页相关
const currentPage = ref(1)
const pageSize = ref(props.initialPageSize)
const gotoPage = ref(1)

// 处理建议
const suggestedActions = computed(() => {
  if (props.suggestions && props.suggestions.length > 0) {
    return props.suggestions
  }
  
  // 根据异常类型生成默认建议
  if (props.data.length === 0) return []
  
  const suggestions = []
  const deviceTypes = [...new Set(props.data.map(item => item.objectType))]
  
  if (deviceTypes.includes('逆变器')) {
    suggestions.push('检查逆变器通讯线路是否正常连接')
    suggestions.push('重启逆变器设备并检查网络配置')
  }
  
  if (deviceTypes.includes('电表')) {
    suggestions.push('检查电表通讯接口是否松动')
    suggestions.push('验证电表通讯参数配置是否正确')
  }
  
  if (deviceTypes.includes('气象站')) {
    suggestions.push('检查气象站供电是否正常')
    suggestions.push('清洁气象站传感器表面')
  }
  
  return suggestions
})

// 分页后的数据
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.data.slice(start, end)
})

// 监听数据变化，重置分页
watch(() => props.data, () => {
  currentPage.value = 1
  gotoPage.value = 1
})

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  gotoPage.value = 1
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  gotoPage.value = val
}

// 跳转到指定页
const handleGotoPage = (val: number | undefined) => {
  if (val && val >= 1 && val <= Math.ceil(props.data.length / pageSize.value)) {
    currentPage.value = val
  }
}

// 处理对象点击
const handleObjectClick = (object: AbnormalObject) => {
  emit('object-click', object)
}
</script>

<style scoped lang="scss">
.abnormal-object-table {
  margin-top: 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  
  .table-section {
    margin-bottom: 16px;
    
    .section-title {
      font-size: 14px;
      color: #00d4ff;
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    }
  }
  
  .suggestion-section {
    .section-title {
      font-size: 14px;
      color: #00d4ff;
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    }
    
    .suggestion-content {
      .suggestion-list {
        .suggestion-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          line-height: 1.4;
          
          .suggestion-icon {
            color: #00d4ff;
            margin-right: 8px;
            margin-top: 2px;
            font-size: 14px;
          }
        }
      }
      
      p {
        color: rgba(255, 255, 255, 0.6);
        font-size: 13px;
        margin: 0;
      }
    }
  }
  
  :deep(.el-table) {
    background-color: transparent;
    
    .el-table__header-wrapper {
      background: rgba(0, 40, 80, 0.8);
    }
    
    .el-table__body-wrapper {
      .el-table__row {
        &:hover {
          background-color: rgba(0, 212, 255, 0.1) !important;
        }
      }
    }
    
    .el-table td,
    .el-table th {
      border-bottom: 1px solid rgba(0, 212, 255, 0.2);
      font-size: 12px;
      padding: 6px 0;
    }
    
    .el-table__empty-block {
      background-color: transparent;
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  .table-pagination {
    margin-top: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .pagination-info {
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
    }
    
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .goto-page {
        display: flex;
        align-items: center;
        gap: 4px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 13px;
        
        .el-input-number {
          width: 60px;
          
          :deep(.el-input__wrapper) {
            background-color: rgba(0, 40, 80, 0.6);
            border-color: rgba(0, 212, 255, 0.3);
            
            .el-input__inner {
              color: #ffffff;
              text-align: center;
            }
          }
        }
      }
    }
    
    :deep(.el-pagination) {
      .btn-prev,
      .btn-next,
      .el-pager li {
        background-color: rgba(0, 40, 80, 0.6);
        color: #ffffff;
        border: 1px solid rgba(0, 212, 255, 0.3);
        
        &:hover {
          background-color: rgba(0, 212, 255, 0.2);
        }
        
        &.is-active {
          background-color: #00d4ff;
          color: #000;
        }
      }
      
      .el-select .el-input {
        .el-input__wrapper {
          background-color: rgba(0, 40, 80, 0.6);
          border-color: rgba(0, 212, 255, 0.3);
          
          .el-input__inner {
            color: #ffffff;
          }
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .abnormal-object-table {
    padding: 12px;
    
    .table-section .section-title,
    .suggestion-section .section-title {
      font-size: 13px;
    }
    
    :deep(.el-table) {
      .el-table td,
      .el-table th {
        font-size: 11px;
        padding: 4px 0;
      }
    }
    
    .table-pagination {
      flex-direction: column;
      gap: 8px;
      align-items: stretch;
      
      .pagination-controls {
        justify-content: center;
      }
      
      :deep(.el-pagination) {
        .el-pagination__sizes {
          display: none;
        }
      }
    }
  }
}
</style>
