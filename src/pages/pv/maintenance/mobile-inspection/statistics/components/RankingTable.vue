<template>
  <div class="ranking-table">
    <div class="table-header">
      <h3 class="table-title">{{ title }}</h3>
    </div>
    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <span>加载中...</span>
      </div>
      <div v-else-if="!data || data.length === 0" class="empty-state">
        <span>暂无数据</span>
      </div>
      <div v-else class="table-content">
        <el-table
          :data="data"
          :height="tableHeight"
          stripe
          @row-click="handleRowClick"
        >
          <el-table-column
            prop="rank"
            label="排名"
            width="60"
            align="center"
          >
            <template #default="{ row }">
              <div class="rank-cell" :class="getRankClass(row.rank)">
                {{ row.rank }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :prop="nameField"
            :label="nameLabel"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column
            prop="score"
            label="评分"
            width="80"
            align="right"
          >
            <template #default="{ row }">
              <span class="score-cell">{{ row.score.toFixed(1) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import type { StationRankingItem, PersonnelRankingItem } from '@/api/types/mobile-inspection-statistics'

interface Props {
  title: string
  data: StationRankingItem[] | PersonnelRankingItem[]
  type: 'station' | 'personnel'
  loading?: boolean
  height?: number
}

interface Emits {
  (e: 'row-click', row: StationRankingItem | PersonnelRankingItem): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: 300
})

const emit = defineEmits<Emits>()

// 计算表格高度
const tableHeight = computed(() => {
  return props.height - 60 // 减去标题高度
})

// 根据类型确定名称字段和标签
const nameField = computed(() => {
  return props.type === 'station' ? 'stationName' : 'name'
})

const nameLabel = computed(() => {
  return props.type === 'station' ? '电站名称' : '人员姓名'
})

/**
 * 获取排名样式类
 */
const getRankClass = (rank: number): string => {
  if (rank === 1) return 'rank-first'
  if (rank === 2) return 'rank-second'
  if (rank === 3) return 'rank-third'
  return 'rank-normal'
}

/**
 * 处理行点击
 */
const handleRowClick = (row: StationRankingItem | PersonnelRankingItem) => {
  emit('row-click', row)
}
</script>

<style scoped lang="scss">
.ranking-table {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid #333;
  padding: 16px;

  .table-header {
    margin-bottom: 16px;

    .table-title {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }
  }

  .table-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .loading-state,
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #cccccc;
      font-size: 14px;
      gap: 8px;

      .loading-icon {
        font-size: 24px;
        animation: spin 1s linear infinite;
      }
    }

    .table-content {
      flex: 1;
      min-height: 0;

      :deep(.el-table) {
        background-color: transparent;
        color: #cccccc;

        .el-table__header-wrapper {
          th {
            background-color: rgba(255, 255, 255, 0.05);
            color: #ffffff;
            border-bottom: 1px solid #333;
            font-weight: 600;
          }
        }

        .el-table__body-wrapper {
          .el-table__row {
            background-color: rgba(255, 255, 255, 0.02);
            color: #cccccc;
            cursor: pointer;

            &:hover {
              background-color: rgba(0, 212, 255, 0.1);
            }

            &.el-table__row--striped {
              background-color: rgba(255, 255, 255, 0.05);

              &:hover {
                background-color: rgba(0, 212, 255, 0.1);
              }
            }

            td {
              border-bottom: 1px solid #333;
            }
          }
        }

        .el-table__empty-block {
          background-color: transparent;
          color: #cccccc;
        }
      }

      .rank-cell {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-weight: 600;
        font-size: 12px;

        &.rank-first {
          background-color: #ffd700;
          color: #000000;
        }

        &.rank-second {
          background-color: #c0c0c0;
          color: #000000;
        }

        &.rank-third {
          background-color: #cd7f32;
          color: #ffffff;
        }

        &.rank-normal {
          background-color: rgba(255, 255, 255, 0.1);
          color: #cccccc;
        }
      }

      .score-cell {
        color: #00d4ff;
        font-weight: 600;
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 1400px) {
  .ranking-table {
    .table-container {
      .table-content {
        :deep(.el-table) {
          font-size: 12px;
        }
      }
    }
  }
}

// 平板端适配  
@media (max-width: 1024px) {
  .ranking-table {
    padding: 12px;

    .table-header {
      margin-bottom: 12px;

      .table-title {
        font-size: 15px;
      }
    }

    .table-container {
      .table-content {
        :deep(.el-table) {
          font-size: 12px;

          .el-table__header-wrapper {
            th {
              padding: 8px 0;
              font-size: 12px;
            }
          }

          .el-table__body-wrapper {
            .el-table__row {
              td {
                padding: 8px 0;
              }
            }
          }
        }

        .rank-cell {
          width: 20px;
          height: 20px;
          font-size: 11px;
        }

        .score-cell {
          font-size: 12px;
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .ranking-table {
    padding: 12px;

    .table-header {
      margin-bottom: 12px;

      .table-title {
        font-size: 14px;
      }
    }

    .table-container {
      .loading-state,
      .empty-state {
        font-size: 13px;

        .loading-icon {
          font-size: 20px;
        }
      }

      .table-content {
        // 表格容器添加横向滚动
        overflow-x: auto;

        :deep(.el-table) {
          min-width: 280px;
          font-size: 12px;

          .el-table__header-wrapper {
            th {
              padding: 6px 0;
              font-size: 11px;
              
              &:first-child {
                width: 50px;
              }
              
              &:last-child {
                width: 60px;
              }
            }
          }

          .el-table__body-wrapper {
            .el-table__row {
              td {
                padding: 6px 0;
                font-size: 11px;
              }
            }
          }
        }

        .rank-cell {
          width: 18px;
          height: 18px;
          font-size: 10px;
        }

        .score-cell {
          font-size: 11px;
          font-weight: 600;
        }
      }
    }
  }
}

// 小屏移动端适配
@media (max-width: 480px) {
  .ranking-table {
    padding: 8px;

    .table-header {
      margin-bottom: 8px;

      .table-title {
        font-size: 13px;
        font-weight: 500;
      }
    }

    .table-container {
      .loading-state,
      .empty-state {
        font-size: 12px;
        gap: 6px;

        .loading-icon {
          font-size: 18px;
        }
      }

      .table-content {
        :deep(.el-table) {
          min-width: 260px;
          font-size: 11px;

          .el-table__header-wrapper {
            th {
              padding: 4px 0;
              font-size: 10px;
              
              &:first-child {
                width: 45px;
              }
              
              &:last-child {
                width: 55px;
              }
            }
          }

          .el-table__body-wrapper {
            .el-table__row {
              td {
                padding: 4px 0;
                font-size: 10px;
              }
            }
          }
        }

        .rank-cell {
          width: 16px;
          height: 16px;
          font-size: 9px;
        }

        .score-cell {
          font-size: 10px;
        }
      }
    }
  }
}
</style>
