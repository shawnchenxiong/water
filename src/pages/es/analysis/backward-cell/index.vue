<template>
  <DeviceMonitorLayout>
    <template #left>
      <StationTree
        device-type="0919"
        :auto-select-first-leaf="true"
        @node-click="handleStationSelect"
      />
    </template>

    <template #right>
      <div class="backward-cell-container">
        <!-- 筛选区域 -->
        <div class="filter-section">
          <el-form
            ref="filterFormRef"
            :model="filterForm"
            label-width="auto"
          >
            <!-- PC端：单行排列（筛选项 + 按钮） -->
            <div class="filter-content" v-if="!isMobile">
              <div class="filter-row">
                <el-form-item label="电池阵列">
                  <el-select
                    v-model="filterForm.batteryArray"
                    placeholder="请选择"
                    clearable
                    style="width: 200px"
                  >
                    <el-option
                      v-for="array in basicData.batteryArrays"
                      :key="array.value"
                      :label="array.label"
                      :value="array.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="时间">
                  <el-date-picker
                    v-model="filterForm.timeRange"
                    type="daterange"
                    range-separator="—"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 300px"
                  />
                </el-form-item>
                <!-- PC端按钮直接在同一行 -->
                <div class="filter-buttons">
                  <el-button type="primary" :icon="Search" @click="handleSearch">
                    搜索
                  </el-button>
                  <el-button :icon="Download" @click="handleExport">
                    导出
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 移动端：简单两项布局 -->
            <div class="filter-content mobile-layout" v-else>
              <div class="filter-row">
                <el-form-item label="电池阵列">
                  <el-select
                    v-model="filterForm.batteryArray"
                    placeholder="请选择"
                    clearable
                  >
                    <el-option
                      v-for="array in basicData.batteryArrays"
                      :key="array.value"
                      :label="array.label"
                      :value="array.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="时间">
                  <el-date-picker
                    v-model="filterForm.timeRange"
                    type="daterange"
                    range-separator="—"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    class="mobile-date-picker"
                  />
                </el-form-item>
              </div>
            </div>

            <!-- 移动端操作按钮行 -->
            <div class="filter-actions" v-if="isMobile">
              <el-button type="primary" :icon="Search" @click="handleSearch">
                搜索
              </el-button>
              <el-button :icon="Download" @click="handleExport">
                导出
              </el-button>
            </div>
          </el-form>
        </div>

        <!-- 分析说明 -->
        <div class="analysis-description">
          自动汇总关于电池阵列每个电池簇最低电压的5个单体，方便发现落后单体。
        </div>

        <!-- 数据展示区域 -->
        <div class="data-section">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="8" animated />
          </div>
          
          <div v-else-if="hasData" class="data-content">
            <!-- 数据表格 -->
            <div class="table-section">
              <el-table
                :data="tableData"
                border
                stripe
                style="width: 100%"
                empty-text="暂无数据"
              >
                <el-table-column prop="batteryCluster" label="电池簇" width="120" align="center" />
                <el-table-column prop="cellNumber" label="单体编号" width="100" align="center" />
                <el-table-column prop="voltage" label="电压(V)" width="120" align="center" />
                <el-table-column prop="current" label="电流(A)" width="120" align="center" />
                <el-table-column prop="temperature" label="温度(°C)" width="120" align="center" />
                <el-table-column prop="soc" label="SOC(%)" width="100" align="center" />
                <el-table-column prop="recordTime" label="记录时间" min-width="160" align="center" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag
                      :type="getStatusType(row.status)"
                      size="small"
                    >
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 分页 -->
            <div class="pagination-section" v-if="tableData.length > 0">
              <el-pagination
                v-model:current-page="pagination.current"
                v-model:page-size="pagination.pageSize"
                :total="pagination.total"
                :page-sizes="[10, 20, 50, 100]"
                :layout="paginationLayout"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
          
          <!-- 空数据状态 -->
          <div v-else class="empty-state">
            <el-empty 
              :image-size="80"
              image="/images/empty.png"
              description="请选择电池阵列和时间范围后点击搜索"
            />
          </div>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import type { StationTreeNode } from '@/types/station'

// 响应式检测
const isMobile = computed(() => window.innerWidth <= 768)

// 基础数据
const basicData = ref({
  batteryArrays: [
    { label: '1号电池阵列', value: 'array_1' },
    { label: '2号电池阵列', value: 'array_2' },
    { label: '3号电池阵列', value: 'array_3' },
    { label: '4号电池阵列', value: 'array_4' }
  ]
})

// 筛选表单
const filterForm = reactive({
  stationId: '',
  batteryArray: '',
  timeRange: [] as string[]
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 分页布局
const paginationLayout = computed(() => {
  return isMobile.value
    ? 'total, prev, pager, next'
    : 'total, sizes, prev, pager, next, jumper'
})

// 是否有数据
const hasData = computed(() => {
  return tableData.value.length > 0
})

/**
 * 电站树节点点击
 */
const handleStationSelect = (node: StationTreeNode) => {
  filterForm.stationId = node.regionId
  // 可以自动触发搜索或等待用户手动搜索
}

/**
 * 搜索
 */
const handleSearch = async () => {
  if (!filterForm.batteryArray) {
    ElMessage.warning('请选择电池阵列')
    return
  }
  
  if (!filterForm.timeRange || filterForm.timeRange.length !== 2) {
    ElMessage.warning('请选择时间范围')
    return
  }
  
  loading.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    const mockData = generateMockData()
    tableData.value = mockData
    pagination.total = mockData.length
    
    ElMessage.success('分析完成')
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    loading.value = false
  }
}

/**
 * 导出
 */
const handleExport = () => {
  if (!hasData.value) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  
  ElMessage.info('导出功能开发中')
}

/**
 * 获取状态类型
 */
const getStatusType = (status: string) => {
  switch (status) {
    case '正常':
      return 'success'
    case '异常':
      return 'danger'
    case '警告':
      return 'warning'
    default:
      return 'info'
  }
}

/**
 * 生成模拟数据
 */
const generateMockData = () => {
  const data = []
  const clusters = ['簇1', '簇2', '簇3', '簇4', '簇5']
  const statuses = ['正常', '异常', '警告']
  
  for (let i = 0; i < 25; i++) {
    const cluster = clusters[Math.floor(i / 5)]
    const cellNumber = (i % 5) + 1
    
    data.push({
      batteryCluster: cluster,
      cellNumber: `单体${cellNumber.toString().padStart(2, '0')}`,
      voltage: (3.2 + Math.random() * 0.4).toFixed(3),
      current: (Math.random() * 50 - 25).toFixed(2),
      temperature: (25 + Math.random() * 10).toFixed(1),
      soc: Math.floor(Math.random() * 100),
      recordTime: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    })
  }
  
  return data
}

/**
 * 分页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
}

/**
 * 当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.current = page
}

// 组件挂载
onMounted(() => {
  // 设置默认时间范围（最近7天）
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 6)
  
  filterForm.timeRange = [
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ]
})
</script>

<style scoped lang="scss">
.backward-cell-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;

  .filter-section {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 20px;

    .filter-content {
      .filter-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        :deep(.el-form-item) {
          margin-bottom: 0;
        }

        .filter-buttons {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-left: 16px;
        }
      }
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;
    }
  }

  .analysis-description {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .data-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background-color: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    padding: 20px;

    .loading-container {
      flex: 1;
    }

    .data-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;

      .table-section {
        flex: 1;
        
        :deep(.el-table) {
          background-color: transparent;

          th,
          td {
            background-color: transparent;
            border-color: rgba(255, 255, 255, 0.1);
          }

          th {
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
          }

          td {
            color: rgba(255, 255, 255, 0.8);
          }

          .el-table__empty-text {
            color: rgba(255, 255, 255, 0.6);
          }
        }
      }

      .pagination-section {
        display: flex;
        justify-content: flex-end;
        padding: 16px 0 0 0;
      }
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      padding: 40px 20px;

      :deep(.el-empty) {
        .el-empty__description {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }
        
        .el-empty__image {
          opacity: 0.6;
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .backward-cell-container {
    padding: 12px;
    gap: 12px;

    .filter-section {
      padding: 12px;

      .mobile-layout {
        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;

          :deep(.el-form-item) {
            flex: 0 0 calc(50% - 6px) !important;
            margin-bottom: 0;
            width: calc(50% - 6px);

            .el-form-item__label {
              font-size: 12px;
              min-width: 60px;
            }

            .el-form-item__content {
              flex: 1;

              .el-input,
              .el-select {
                width: 100% !important;
                font-size: 13px;

                .el-input__wrapper,
                .el-select__wrapper {
                  min-height: 32px;
                }
              }

              .mobile-date-picker {
                width: 100% !important;
                max-width: 280px !important;
                font-size: 12px;
                
                :deep(.el-input__wrapper) {
                  font-size: 11px;
                  min-height: 32px;
                  padding: 0 8px;
                }
                
                :deep(.el-range-separator) {
                  font-size: 10px;
                  padding: 0 4px;
                }
              }
            }
          }
        }
      }

      .filter-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-start;
        margin-top: 12px;

        .el-button {
          font-size: 12px;
        }
      }
    }

    .data-section {
      padding: 12px;

      :deep(.el-table) {
        font-size: 12px;

        .el-table__header th,
        .el-table__body td {
          padding: 8px 4px;
        }

        .cell {
          padding: 0 4px;
        }
      }

      .pagination-section {
        justify-content: center;
        padding: 12px 0 0 0;

        :deep(.el-pagination) {
          .btn-prev,
          .btn-next {
            min-width: 28px;
            font-size: 11px;
          }
          
          .el-pager li {
            min-width: 24px;
            height: 24px;
            font-size: 11px;
          }
        }
      }
    }
  }
}
</style>