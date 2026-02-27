<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree
        device-type="0919"
        @node-click="handleStationSelect"
      />
    </template>

    <!-- 右侧内容区 -->
    <template #right>
      <div class="electric-meter-content">
      <!-- 顶部统计栏 -->
      <div class="statistics-bar" :class="{ 'mobile': isMobile }">
        <div
          v-for="item in statisticsItems"
          :key="item.key"
          class="stat-item"
          :class="{ active: activeStatus === item.key }"
          @click="handleStatusFilter(item.key)"
        >
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-value">({{ item.value }})</div>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar" :class="{ 'mobile': isMobile }">
        <div class="toolbar-left">
          <el-input
            v-model="searchKeyword"
            placeholder="关键字"
            :prefix-icon="Search"
            clearable
            :style="{ width: isMobile ? '100%' : '200px' }"
            :size="isMobile ? 'small' : 'default'"
            @input="handleSearch"
          />
          <el-select
            v-model="meterType"
            placeholder="请选择"
            :style="{ width: isMobile ? '100%' : '120px' }"
            :size="isMobile ? 'small' : 'default'"
            @change="handleMeterTypeChange"
          >
            <el-option label="全部" value="all" />
            <el-option label="交流" value="AC" />
            <el-option label="直流" value="DC" />
          </el-select>
          <el-button 
            :icon="Search" 
            :size="isMobile ? 'small' : 'default'"
            @click="handleSearchClick"
          >
            搜索
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-button 
            :icon="Download" 
            :size="isMobile ? 'small' : 'default'"
            @click="handleDownload"
          >
            导出
          </el-button>
          <el-button 
            :icon="Refresh" 
            :size="isMobile ? 'small' : 'default'"
            @click="handleRefresh"
          >
            刷新
          </el-button>
          <el-button-group>
            <el-button
              :icon="Grid"
              :type="viewMode === 'card' ? 'primary' : ''"
              :size="isMobile ? 'small' : 'default'"
              @click="viewMode = 'card'"
              title="切换卡片展示"
            />
            <el-button
              :icon="List"
              :type="viewMode === 'list' ? 'primary' : ''"
              :size="isMobile ? 'small' : 'default'"
              @click="viewMode = 'list'"
              title="切换列表展示"
            />
          </el-button-group>
        </div>
      </div>

        <!-- 卡片视图 -->
        <CardGridLayout
          v-if="viewMode === 'card'"
          :data="electricMeterList"
          :loading="loading"
          :loading-text="'正在加载电能表数据...'"
          :empty-text="'暂无电能表数据'"
          :show-pagination="true"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-size-options="[12, 24, 36, 48]"
          :columns="4"
          :gap="'medium'"
          item-key="id"
          style="flex: 1; min-height: 0;"
          @card-click="handleDeviceClick"
          @refresh="handleRefresh"
        >
          <template #default="{ item }: { item: any }">
            <ElectricMeterCard
              :meter="item"
              @click="handleDeviceClick(item)"
            />
          </template>
        </CardGridLayout>

        <!-- 列表视图 -->
        <div v-else class="list-view-container">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>

          <!-- 表格 -->
          <el-table
            v-else
            :data="electricMeterList"
            class="electric-meter-table"
            @row-click="handleDeviceClick"
          >
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-icon :class="`status-icon-${row.status}`">
                  <CircleCheck v-if="row.status === 'normal'" />
                  <Warning v-else-if="row.status === 'alarm'" />
                  <CircleClose v-else />
                </el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="deviceName" label="设备名称" width="150" />
            <el-table-column prop="stationName" label="所属电站" width="180" />
            <el-table-column prop="meterRatio" label="电表倍率" width="100" />
            <el-table-column label="有功功率(kW)" width="120">
              <template #default="{ row }">
                {{ row.activePower }}
              </template>
            </el-table-column>
            <el-table-column label="正向有功电能(kWh)" width="150">
              <template #default="{ row }">
                {{ row.forwardActiveEnergy }}
              </template>
            </el-table-column>
            <el-table-column label="反向有功电能(kWh)" width="150">
              <template #default="{ row }">
                {{ row.reverseActiveEnergy }}
              </template>
            </el-table-column>
            <el-table-column label="正向无功电能(kVar.h)" width="160">
              <template #default="{ row }">
                {{ row.forwardReactiveEnergy }}
              </template>
            </el-table-column>
            <el-table-column label="反向无功电能(kVar.h)" width="160">
              <template #default="{ row }">
                {{ row.reverseReactiveEnergy }}
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="160" />
            <el-table-column label="电表配置" width="100" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click.stop="handleConfigClick(row)"
                >
                  配置
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 列表视图分页 -->
          <div v-if="!loading && electricMeterList.length > 0" class="pagination-area">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="isMobile ? [20, 50] : [20, 50, 100]"
              :total="total"
              :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { downloadExcel, generateTimestampFilename } from '@/utils/download';
import {
  Search,
  Download,
  Refresh,
  Grid,
  List,
  Loading,
  CircleCheck,
  Warning,
  CircleClose
} from '@element-plus/icons-vue';
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue';
import StationTree from '@/components/layout/StationTree.vue';
import CardGridLayout from '@/components/common/CardGridLayout.vue';
import ElectricMeterCard from './components/ElectricMeterCard.vue';
import { getElectricMeterList, refreshElectricMeterData } from '@/api/device/electricMeter';
// StationTree组件现在直接使用API，不需要额外导入
import type { ElectricMeterData, DeviceStatistics } from '@/api/types/device/electricMeter';
import type { StationTreeNode } from '@/types/station';

const router = useRouter();

// 移动端检测
const isMobile = ref(false);

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 数据状态
const electricMeterList = ref<ElectricMeterData[]>([]);
const statistics = ref<DeviceStatistics>({
  total: 0,
  normal: 0,
  alarm: 0,
  offline: 0
});

// 筛选条件
const activeStatus = ref<string>('all');
const selectedStationId = ref<string>('');
const searchKeyword = ref<string>('');
const debouncedKeyword = ref<string>('');
const meterType = ref<string>('all'); // 新增：电表类型

// 分页
const currentPage = ref(1);
const pageSize = ref(12); // 卡片视图默认每页12个
const total = ref(0);

// 视图
const viewMode = ref<'card' | 'list'>('card'); // 默认卡片视图

// 加载状态
const loading = ref(false);

// 定时器
let refreshTimer: number | null = null;
let searchDebounceTimer: number | null = null;

// 统计项
const statisticsItems = computed(() => [
  { key: 'all', label: '总数', value: statistics.value.total },
  { key: 'normal', label: '正常', value: statistics.value.normal },
  { key: 'alarm', label: '告警', value: statistics.value.alarm },
  { key: 'offline', label: '离线', value: statistics.value.offline }
]);

// 加载电能表列表
const loadElectricMeterList = async () => {
  loading.value = true;
  try {
    const response = await getElectricMeterList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      status: activeStatus.value === 'all' ? undefined : activeStatus.value,
      stationId: selectedStationId.value || undefined,
      keyword: debouncedKeyword.value || undefined,
      meterType: meterType.value === 'all' ? undefined : meterType.value
    });
    
    electricMeterList.value = response.list;
    total.value = response.total;
    statistics.value = response.statistics;
  } catch (error) {
    ElMessage.error('加载电能表列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 状态筛选
const handleStatusFilter = (status: string) => {
  activeStatus.value = status;
  currentPage.value = 1;
  loadElectricMeterList();
};

// 电站选择
const handleStationSelect = (node: StationTreeNode) => {
  // 检查是否是叶子节点（电站节点）
  if (!node.childList || node.childList.length === 0) {
    selectedStationId.value = node.regionId;
    currentPage.value = 1;
    loadElectricMeterList();
  }
};

// 电表类型变化
const handleMeterTypeChange = () => {
  currentPage.value = 1;
  loadElectricMeterList();
};

// 搜索（防抖）
const handleSearch = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  
  searchDebounceTimer = window.setTimeout(() => {
    debouncedKeyword.value = searchKeyword.value;
    currentPage.value = 1;
    loadElectricMeterList();
  }, 500);
};

// 搜索按钮点击
const handleSearchClick = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  debouncedKeyword.value = searchKeyword.value;
  currentPage.value = 1;
  loadElectricMeterList();
};

// 刷新
const handleRefresh = () => {
  refreshElectricMeterData();
  loadElectricMeterList();
  ElMessage.success('刷新成功');
};

// StationTree组件现在自动处理刷新，不需要额外的刷新处理

// 导出
const handleDownload = async () => {
  try {
    let dataToExport: any[] = [];
    let exportColumns: any[] = [];
    
    if (viewMode.value === 'list') {
      // 列表视图导出
      dataToExport = electricMeterList.value;
      exportColumns = [
        { label: '设备名称', prop: 'deviceName', width: 220 },
        { label: '设备编号', prop: 'deviceCode', width: 180 },
        { label: '状态', getValue: (row: any) => {
          const statusMap: Record<string, string> = { online: '在线', alarm: '告警', offline: '离线', normal: '正常' };
          return statusMap[row.status] || row.status;
        }, width: 80 },
        { label: '电表类型', prop: 'meterType', width: 100 },
        { label: '正向有功电能(kWh)', formatter: (row: any) => (row.forwardActiveEnergy || 0).toFixed(2), width: 140 },
        { label: '反向有功电能(kWh)', formatter: (row: any) => (row.reverseActiveEnergy || 0).toFixed(2), width: 140 },
        { label: '正向无功电能(kvarh)', formatter: (row: any) => (row.forwardReactiveEnergy || 0).toFixed(2), width: 140 },
        { label: '反向无功电能(kvarh)', formatter: (row: any) => (row.reverseReactiveEnergy || 0).toFixed(2), width: 140 },
        { label: '功率因数', formatter: (row: any) => (row.powerFactor || 0).toFixed(3), width: 100 },
        { label: '电站名称', prop: 'stationName', width: 180 },
        { label: '更新时间', getValue: () => new Date().toLocaleString(), width: 160 }
      ];
    } else {
      // 卡片视图导出
      dataToExport = electricMeterList.value;
      exportColumns = [
        { label: '设备名称', prop: 'deviceName', width: 220 },
        { label: '设备编号', prop: 'deviceCode', width: 180 },
        { label: '状态', getValue: (row: any) => {
          const statusMap: Record<string, string> = { online: '在线', alarm: '告警', offline: '离线', normal: '正常' };
          return statusMap[row.status] || row.status;
        }, width: 80 },
        { label: '电表类型', prop: 'meterType', width: 100 },
        { label: '正向有功电能(kWh)', formatter: (row: any) => (row.forwardActiveEnergy || 0).toFixed(2), width: 140 },
        { label: '反向有功电能(kWh)', formatter: (row: any) => (row.reverseActiveEnergy || 0).toFixed(2), width: 140 },
        { label: '电站名称', prop: 'stationName', width: 180 },
        { label: '更新时间', getValue: () => new Date().toLocaleString(), width: 160 }
      ];
    }

    if (!dataToExport || dataToExport.length === 0) {
      ElMessage.warning('暂无数据可导出');
      return;
    }

    const filename = generateTimestampFilename('电能表数据');
    await downloadExcel(dataToExport, exportColumns, filename, '电能表数据');
    
    ElMessage.success(`成功导出 ${dataToExport.length} 条电能表数据至Excel文件`);
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败，请重试');
  }
};

// 分页变化
const handlePageChange = () => {
  loadElectricMeterList();
};

const handleSizeChange = () => {
  currentPage.value = 1;
  loadElectricMeterList();
};

// 设备点击 - 跳转到详情页面
const handleDeviceClick = (meter: ElectricMeterData) => {
  router.push({
    name: 'ElectricMeterDetail',
    params: { id: meter.id }
  });
};

// 配置按钮点击 - 同样跳转到详情页面
const handleConfigClick = (meter: ElectricMeterData) => {
  router.push({
    name: 'ElectricMeterDetail',
    params: { id: meter.id }
  });
};

// 监听移动端状态变化，移动端默认使用卡片视图
watch(isMobile, (newVal) => {
  if (newVal) {
    viewMode.value = 'card';
  }
});

// 不再需要转换函数，直接使用ElectricMeterCard

// 启动定时刷新
const startAutoRefresh = () => {
  refreshTimer = window.setInterval(() => {
    loadElectricMeterList();
  }, 30000); // 30秒
};

// 停止定时刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// 初始化
onMounted(async () => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
  await loadElectricMeterList();
  startAutoRefresh();
});

// 清理
onUnmounted(() => {
  stopAutoRefresh();
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
});
</script>

<style scoped lang="scss">
.electric-meter-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.statistics-bar {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(0, 20, 40, 0.6);
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  
  &.mobile {
    padding: 12px 16px;
    gap: 8px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 20, 40, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #00d4ff;
    background: rgba(0, 20, 40, 0.6);
  }
  
  &.active {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.2);
  }
  
  .stat-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .stat-value {
    font-size: 16px;
    font-weight: 500;
    color: #00d4ff;
  }
}

.statistics-bar.mobile .stat-item {
  padding: 8px;
  gap: 4px;
  
  .stat-label {
    font-size: 12px;
  }
  
  .stat-value {
    font-size: 14px;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 20, 40, 0.4);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  margin-bottom: 16px;
  
  &.mobile {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px 16px;
  }
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar.mobile .toolbar-left,
.toolbar.mobile .toolbar-right {
  width: 100%;
  justify-content: space-between;
  
  .el-button {
    font-size: 12px;
    padding: 6px 12px;
  }
}

.list-view-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 16px;
  color: #00d4ff;
  
  .el-icon {
    font-size: 48px;
  }
}

.electric-meter-table {
  flex: 1;
  
  :deep(.el-table__header) {
    th {
      background: rgba(0, 20, 40, 0.8);
      color: #00d4ff;
      border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    }
  }
  
  :deep(.el-table__body) {
    tr {
      background: rgba(0, 20, 40, 0.4);
      cursor: pointer;
      
      &:hover {
        background: rgba(0, 20, 40, 0.6);
      }
      
      td {
        border-bottom: 1px solid rgba(0, 212, 255, 0.1);
        color: #fff;
      }
    }
  }
}

.status-icon-normal {
  color: #00ff88;
  font-size: 18px;
}

.status-icon-alarm {
  color: #ffb800;
  font-size: 18px;
}

.status-icon-offline {
  color: #999;
  font-size: 18px;
}

.pagination-area {
  padding: 16px 20px;
  background: rgba(0, 20, 40, 0.4);
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.toolbar.mobile + * .pagination-area {
  padding: 8px 16px;
  
  :deep(.el-pagination) {
    .el-pager li {
      min-width: 32px;
      height: 32px;
      font-size: 12px;
    }
    
    .btn-prev,
    .btn-next {
      min-width: 32px;
      height: 32px;
      font-size: 12px;
    }
  }
}
</style>

