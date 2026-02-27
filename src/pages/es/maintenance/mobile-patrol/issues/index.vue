<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree
        device-type="0919"
        :auto-select-first-leaf="true"
        @node-click="handleStationSelect"
      />
    </template>

    <!-- 右侧主内容 -->
    <template #right>
      <div class="inspection-issues-container">
        <!-- 操作区域 -->
        <div class="action-section">
          <el-button :icon="Refresh" @click="loadIssueList">
            刷新
          </el-button>
        </div>

        <!-- 问题列表 -->
        <div class="table-section">
          <el-table
            v-loading="loading"
            :data="tableData"
            border
            style="width: 100%"
            @sort-change="handleSortChange"
          >
            <el-table-column prop="inspectionLevel" label="巡检级" width="80" align="center">
              <template #default="{ row }">
                <el-tag :color="row.levelColor" size="small">
                  {{ row.inspectionLevel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="inspectionType" label="巡检类型" width="120" />
            <el-table-column prop="stationName" label="巡检电站" min-width="150" show-overflow-tooltip />
            <el-table-column prop="confirmStatus" label="确认状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :color="row.statusColor" size="small">
                  {{ row.confirmStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="inspector" label="巡检人员" width="100" />
            <el-table-column prop="updateTime" label="更新时间" width="160" sortable="custom" />
            <el-table-column prop="confirmer" label="确认人" width="100">
              <template #default="{ row }">
                {{ row.confirmer || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="confirmTime" label="确认时间" width="160">
              <template #default="{ row }">
                {{ row.confirmTime || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="confirmDescription" label="确认说明" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.confirmDescription || '-' }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-section">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>

        <!-- 暂无数据提示 -->
        <div v-if="!selectedStationId" class="no-station-selected">
          <el-empty description="请选择电站查看巡检问题" />
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import {
  getInspectionIssueList,
  getInspectionIssueBasicData,
} from '@/api/maintenance/mobileInspectionIssuesApi'
import type {
  InspectionIssue,
  InspectionIssueQueryParams,
  InspectionIssueBasicData,
} from '@/api/types/mobile-inspection-issues'
import type { StationTreeNode } from '@/types/station'

// 基础数据
const basicData = ref<InspectionIssueBasicData>({
  confirmStatuses: [],
  inspectionLevels: [],
  inspectionTypes: [],
})

// 表格数据
const tableData = ref<InspectionIssue[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
})

// 排序
const sortParams = reactive({
  field: 'updateTime',
  order: 'desc' as 'desc' | 'asc',
})

// 当前选中的电站
const selectedStationId = ref('')
const selectedStationName = ref('')

/**
 * 电站选择
 */
const handleStationSelect = (node: StationTreeNode) => {
  console.log('Selected station:', node)
  selectedStationId.value = node.regionId
  selectedStationName.value = node.regionName
  pagination.current = 1
  loadIssueList()
}

/**
 * 加载问题列表
 */
const loadIssueList = async () => {
  if (!selectedStationId.value) {
    tableData.value = []
    return
  }

  try {
    loading.value = true
    const params: InspectionIssueQueryParams = {
      stationId: selectedStationId.value,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sortParams.field,
      sortOrder: sortParams.order,
    }
    
    const response = await getInspectionIssueList(params)
    tableData.value = response.inspectionIssues
    pagination.total = response.pagination.total
  } catch (error) {
    console.error('Load inspection issues failed:', error)
    ElMessage.error('Failed to load inspection issues')
  } finally {
    loading.value = false
  }
}

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const data = await getInspectionIssueBasicData()
    basicData.value = data
  } catch (error) {
    console.error('Load basic data failed:', error)
    ElMessage.error('Failed to load basic data')
  }
}

/**
 * 排序变化
 */
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  if (prop && order) {
    sortParams.field = prop
    sortParams.order = order === 'ascending' ? 'asc' : 'desc'
    pagination.current = 1
    loadIssueList()
  }
}

/**
 * 分页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadIssueList()
}

/**
 * 当前页变化
 */
const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadIssueList()
}

// 页面初始化
onMounted(async () => {
  await loadBasicData()
})
</script>

<style scoped lang="scss">
.inspection-issues-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .action-section {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 20px;
  }

  .table-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.el-table) {
      flex: 1;
    }

    .pagination-section {
      margin-top: 20px;
      padding: 16px 20px 16px 0;
      display: flex;
      justify-content: flex-end;
    }
  }

  .no-station-selected {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>