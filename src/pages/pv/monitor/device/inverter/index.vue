<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree
        device-type="0915"
        @node-click="handleStationSelect"
      />
    </template>

    <!-- 右侧内容区 -->
    <template #right>
      <div class="right-content">
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
              :style="{ width: isMobile ? '100%' : '240px' }"
              :size="isMobile ? 'small' : 'default'"
              @input="handleSearch"
            />
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
                @click="handleViewModeChange('card')"
                title="切换卡片展示"
              />
              <el-button
                :icon="List"
                :type="viewMode === 'list' ? 'primary' : ''"
                :size="isMobile ? 'small' : 'default'"
                @click="handleViewModeChange('list')"
                title="切换列表展示"
              />
            </el-button-group>
          </div>
        </div>

        <!-- 内容区 -->
        <div class="content-area">
          <!-- 卡片视图 -->
          <CardGridLayout
            v-if="viewMode === 'card'"
            :data="inverterList"
            :loading="loading"
            :loading-text="'正在加载逆变器数据...'"
            :empty-text="'暂无逆变器数据'"
            :show-pagination="true"
            v-model:current-page="currentPage"
            v-model:page-size="currentPageSize"
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
              <InverterCard
                :inverter="item"
                @click="() => handleDeviceClick(item)"
              />
            </template>
          </CardGridLayout>

          <!-- 列表视图 (高级表格) -->
          <AdvancedTable
            v-else
            :data="realtimeTableData"
            :columns="tableColumns"
            :total="total"
            :page-size="currentPageSize"
            :loading="loading"
            :loading-text="'正在加载逆变器数据...'"
            :show-toolbar="false"
            :show-pagination="true"
            :height="'calc(100vh - 380px)'"
            :page-sizes="[20, 40, 60, 80]"
            @page-change="handlePageChange"
            @size-change="handleSizeChange"
            @sort-change="handleSortChange"
            @row-click="handleAdvancedTableRowClick"
            @column-change="handleColumnChange"
            @column-fix="handleColumnFix"
          >            
            <template #status="scope">
              <div class="status-cell">
                <el-icon :class="`status-icon-${scope.row.status}`">
                  <CircleCheck v-if="scope.row.status === 'online'" />
                  <Warning v-else-if="scope.row.status === 'alarm'" />
                  <CircleClose v-else />
                </el-icon>
                <span>{{ getAdvancedStatusText(scope.row.status) }}</span>
              </div>
            </template>
            
            <template #powerCurve="scope">
              <el-button
                v-if="scope.row.status !== 'offline'"
                type="primary"
                size="small"
                link
                @click.stop="handlePowerCurveClick(scope.row)"
              >
                查看
              </el-button>
              <span v-else class="text-gray-400">-</span>
            </template>
            
            <template #actions="scope">
              <el-button
                type="primary"
                size="small"
                link
                @click.stop="handleDeviceClick(scope.row)"
              >
                详情
              </el-button>
            </template>
          </AdvancedTable>
        </div>

      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Search,
  Download,
  Refresh,
  Grid,
  List,
  CircleCheck,
  Warning,
  CircleClose
} from '@element-plus/icons-vue';
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue';
import StationTree from '@/components/layout/StationTree.vue';
import AdvancedTable from '@/components/common/AdvancedTable.vue';
import InverterCard from './components/InverterCard.vue';
import CardGridLayout from '@/components/common/CardGridLayout.vue';
import { getInverterList, refreshInverterData } from '@/api/device/inverter';
// StationTree组件现在直接使用API，不需要额外导入
import { getRealtimeData } from '@/api/realtimeApi';
import { downloadExcel, generateTimestampFilename } from '@/utils/download';
import type { InverterData, DeviceStatistics } from '@/api/types/device/inverter';
import type { StationTreeNode } from '@/types/station';
import type { RealtimeDataItem, RealtimeStatistics } from '@/api/realtimeApi';

const router = useRouter();

// 移动端检测
const isMobile = ref(false);

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 数据状态
const inverterList = ref<InverterData[]>([]);
const statistics = ref<DeviceStatistics>({
  total: 0,
  normal: 0,
  alarm: 0,
  offline: 0
});

// 高级表格数据
const realtimeTableData = ref<RealtimeDataItem[]>([]);
const realtimeStatistics = ref<RealtimeStatistics>({
  offline: 0,
  total: 0,
  alarm: 0,
  online: 0,
  listSize: 0
});

// 高级表格列配置 - 根据源站HTML完整结构调整
const tableColumns = ref([
  {
    prop: 'status',
    label: '状态',
    width: 80,
    fixed: 'left' as const,
    sortable: true,
    align: 'center' as const,
    slotName: 'status'
  },
  {
    prop: 'deviceName',
    label: '设备名称',
    width: 220,
    sortable: true,
    showOverflowTooltip: true
  },
  {
    prop: 'stationName',
    label: '所属电站',
    width: 180,
    sortable: false,
    showOverflowTooltip: true
  },
  {
    prop: 'realtimePower',
    label: '实时功率(kW)',
    width: 180,
    sortable: true,
    align: 'right' as const,
    formatter: (row: RealtimeDataItem) => (row.realtimePower || 0).toFixed(2)
  },
  {
    prop: 'dailyGeneration',
    label: '日发电量(kWh)',
    width: 180,
    sortable: true,
    align: 'right' as const,
    formatter: (row: RealtimeDataItem) => (row.dailyGeneration || 0).toFixed(1)
  },
  {
    prop: 'monthlyGeneration',
    label: '月发电量(kWh)',
    width: 180,
    sortable: true,
    align: 'right' as const,
    formatter: (row: RealtimeDataItem) => (row.monthlyGeneration || 0).toFixed(1)
  },
  {
    prop: 'yearlyGeneration',
    label: '年发电量(kWh)',
    width: 180,
    sortable: true,
    align: 'right' as const,
    formatter: (row: RealtimeDataItem) => (row.yearlyGeneration || 0).toFixed(1)
  },
  {
    prop: 'totalGeneration',
    label: '累计发电量(kWh)',
    width: 180,
    sortable: true,
    align: 'right' as const,
    formatter: (row: RealtimeDataItem) => (row.totalGeneration || 0).toFixed(1)
  },
  {
    prop: 'dailyEquivalentHours',
    label: '日等效时(h)',
    width: 180,
    sortable: true,
    align: 'right' as const,
    formatter: (row: RealtimeDataItem) => (row.dailyEquivalentHours || 0).toFixed(2)
  },
  {
    prop: 'powerCurve',
    label: '功率曲线',
    width: 120,
    sortable: false,
    align: 'center' as const,
    slotName: 'powerCurve'
  },
  {
    prop: 'actions',
    label: '操作',
    width: 80,
    fixed: 'right' as const,
    align: 'center' as const,
    slotName: 'actions'
  }
]);

// 筛选条件
const activeStatus = ref<string>('all');
const selectedStationId = ref<string>('');
const searchKeyword = ref<string>('');
const debouncedKeyword = ref<string>('');

// 分页
const currentPage = ref(1);
const cardPageSize = ref(12); // 卡片视图每页显示数量
const listPageSize = ref(20); // 列表视图每页显示数量
const total = ref(0);

// 根据视图模式获取当前页大小
const currentPageSize = computed(() => {
  return viewMode.value === 'card' ? cardPageSize.value : listPageSize.value;
});

// 视图
const viewMode = ref<'card' | 'list'>('card');

// 加载状态
const loading = ref(false);

// 定时器
let refreshTimer: number | null = null;
let searchDebounceTimer: number | null = null;

// 统计项
const statisticsItems = computed(() => {
  if (viewMode.value === 'list') {
    return [
      { key: 'all', label: '总数', value: realtimeStatistics.value.total },
      { key: 'online', label: '在线', value: realtimeStatistics.value.online },
      { key: 'alarm', label: '告警', value: realtimeStatistics.value.alarm },
      { key: 'offline', label: '离线', value: realtimeStatistics.value.offline }
    ];
  }
  return [
    { key: 'all', label: '总数', value: statistics.value.total },
    { key: 'normal', label: '正常', value: statistics.value.normal },
    { key: 'alarm', label: '告警', value: statistics.value.alarm },
    { key: 'offline', label: '离线', value: statistics.value.offline }
  ];
});

// 加载逆变器列表
const loadInverterList = async () => {
  loading.value = true;
  try {
    const response = await getInverterList({
      pageNum: currentPage.value,
      pageSize: currentPageSize.value,
      status: activeStatus.value === 'all' ? undefined : activeStatus.value,
      stationId: selectedStationId.value || undefined,
      keyword: debouncedKeyword.value || undefined
    });
    
    inverterList.value = response.list;
    total.value = response.total;
    statistics.value = response.statistics;
  } catch (error) {
    ElMessage.error('加载逆变器列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 加载实时数据（高级表格）
const loadRealtimeData = async () => {
  loading.value = true;
  try {
    const response = await getRealtimeData({
      pageNum: currentPage.value,
      pageSize: currentPageSize.value,
      status: activeStatus.value === 'all' ? undefined : activeStatus.value,
      keyword: debouncedKeyword.value || undefined,
      deviceType: '0915'
    });
    
    realtimeTableData.value = response.data.list;
    total.value = response.data.total;
    realtimeStatistics.value = response.data.statistics;
  } catch (error) {
    ElMessage.error('加载实时数据失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 加载数据（根据视图模式）
const loadData = async () => {
  if (viewMode.value === 'list') {
    await loadRealtimeData();
  } else {
    await loadInverterList();
  }
};

// 状态筛选
const handleStatusFilter = (status: string) => {
  activeStatus.value = status;
  currentPage.value = 1;
  loadData();
};

// 电站选择
const handleStationSelect = (node: StationTreeNode) => {
  // 只有叶子节点(具体电站)才能选择
  if (!node.childList || node.childList.length === 0) {
    selectedStationId.value = node.regionId;
    currentPage.value = 1;
    loadData();
  }
};

// 搜索（防抖）
const handleSearch = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  
  searchDebounceTimer = window.setTimeout(() => {
    debouncedKeyword.value = searchKeyword.value
    currentPage.value = 1
    loadData()
  }, 500);
};

// 搜索按钮点击
const handleSearchClick = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  debouncedKeyword.value = searchKeyword.value;
  currentPage.value = 1;
  loadData();
};

// 刷新
const handleRefresh = () => {
  if (viewMode.value === 'list') {
    // 列表模式下刷新实时数据
    loadData();
  } else {
    // 卡片模式下刷新逆变器数据
    refreshInverterData();
    loadData();
  }
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
      dataToExport = realtimeTableData.value;
      exportColumns = [
        { label: '状态', getValue: (row: RealtimeDataItem) => getAdvancedStatusText(row.status), width: 80 },
        { label: '设备名称', prop: 'deviceName', width: 220 },
        { label: '所属电站', prop: 'stationName', width: 180 },
        { label: '实时功率(kW)', formatter: (row: RealtimeDataItem) => (row.realtimePower || 0).toFixed(2), width: 120 },
        { label: '日发电量(kWh)', formatter: (row: RealtimeDataItem) => (row.dailyGeneration || 0).toFixed(1), width: 140 },
        { label: '月发电量(kWh)', formatter: (row: RealtimeDataItem) => (row.monthlyGeneration || 0).toFixed(1), width: 140 },
        { label: '年发电量(kWh)', formatter: (row: RealtimeDataItem) => (row.yearlyGeneration || 0).toFixed(1), width: 140 },
        { label: '累计发电量(kWh)', formatter: (row: RealtimeDataItem) => (row.totalGeneration || 0).toFixed(1), width: 140 },
        { label: '日等效时(h)', formatter: (row: RealtimeDataItem) => (row.dailyEquivalentHours || 0).toFixed(2), width: 120 },
        { label: '更新时间', getValue: () => new Date().toLocaleString(), width: 160 }
      ];
    } else {
      // 卡片视图导出
      dataToExport = inverterList.value;
      exportColumns = [
        { label: '设备名称', prop: 'deviceName', width: 220 },
        { label: '设备编号', prop: 'deviceCode', width: 180 },
        { label: '状态', getValue: (row: InverterData) => {
          const statusMap: Record<string, string> = { online: '在线', alarm: '告警', offline: '离线' };
          return statusMap[row.status] || row.status;
        }, width: 80 },
        { label: '实时功率(kW)', formatter: (row: any) => ((row as any).realPower || (row as any).power || 0).toFixed(2), width: 120 },
        { label: '日发电量(kWh)', formatter: (row: any) => ((row as any).dailyEnergy || (row as any).dailyGeneration || 0).toFixed(1), width: 140 },
        { label: '月发电量(kWh)', formatter: (row: any) => ((row as any).monthlyEnergy || (row as any).monthlyGeneration || 0).toFixed(1), width: 140 },
        { label: '年发电量(kWh)', formatter: (row: any) => ((row as any).yearlyEnergy || (row as any).yearlyGeneration || 0).toFixed(1), width: 140 },
        { label: '总发电量(kWh)', formatter: (row: any) => ((row as any).totalEnergy || (row as any).totalGeneration || 0).toFixed(1), width: 140 },
        { label: '电站名称', prop: 'stationName', width: 180 },
        { label: '更新时间', getValue: () => new Date().toLocaleString(), width: 160 }
      ];
    }

    if (!dataToExport || dataToExport.length === 0) {
      ElMessage.warning('暂无数据可导出');
      return;
    }

    const filename = generateTimestampFilename('逆变器数据');
    await downloadExcel(dataToExport, exportColumns, filename, '逆变器数据');
    
    ElMessage.success(`成功导出 ${dataToExport.length} 条逆变器数据至Excel文件`);
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败，请重试');
  }
};

// 分页变化
const handlePageChange = () => {
  loadData();
};

const handleSizeChange = (newSize: number) => {
  if (viewMode.value === 'card') {
    cardPageSize.value = newSize;
  } else {
    listPageSize.value = newSize;
  }
  currentPage.value = 1;
  loadData();
};

// 视图模式切换时重置页码并重新加载
const handleViewModeChange = (mode: 'card' | 'list') => {
  viewMode.value = mode;
  currentPage.value = 1;
  loadData();
};

// 监听移动端状态变化，移动端默认使用卡片视图
watch(isMobile, (newVal) => {
  if (newVal) {
    viewMode.value = 'card';
  }
});

// 设备点击 - 跳转到详情页面
const handleDeviceClick = (inverter: InverterData) => {
  router.push(`/pv/monitor/device/inverter/${inverter.id}`);
};

// 获取高级表格状态文本
const getAdvancedStatusText = (status: string) => {
  const map: Record<string, string> = {
    online: '在线',
    alarm: '告警',
    offline: '离线'
  };
  return map[status] || status;
};

// 高级表格事件处理
const handleAdvancedTableRowClick = (row: RealtimeDataItem) => {
  if (row.deviceId) {
    router.push(`/pv/monitor/device/inverter/${row.deviceId}`);
  }
};

const handlePowerCurveClick = (row: RealtimeDataItem) => {
  ElMessage.info(`查看 ${row.deviceName} 的功率曲线`);
  // TODO: 实现功率曲线查看功能
};

const handleSortChange = (sort: { column: any; prop: string; order: string }) => {
  // 这里可以实现服务端排序
  loadData();
};

const handleColumnChange = (columns: any[]) => {
  console.log('列配置变化:', columns);
  ElMessage.success('列配置已更新');
};

const handleColumnFix = (prop: string, position: 'left' | 'right' | false) => {
  console.log('列固定变化:', prop, position);
};


// 启动自动刷新
const startAutoRefresh = () => {
  // 先清除已存在的定时器
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // 设置新的定时器（30秒刷新一次）
  refreshTimer = window.setInterval(() => {
    if (activeTab.value === 'realtime') {
      loadData()
    }
  }, 30000)
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
};

// 初始化
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  
  // 启动自动刷新
  startAutoRefresh()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
  
  // 停止自动刷新
  stopAutoRefresh()
})
</script>

<style scoped lang="scss">
.left-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .search-section {
    padding: 16px 0;
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    margin-bottom: 16px;
    
    .station-search {
      margin-bottom: 12px;
      
      :deep(.el-input__wrapper) {
        background: rgba(25, 55, 110, 0.7);
        border: 1px solid rgba(0, 212, 255, 0.4);
        box-shadow: none;
        
        &:hover {
          border-color: #00d4ff;
        }
        
        &.is-focus {
          border-color: #00d4ff;
          box-shadow: 0 0 0 1px rgba(0, 212, 255, 0.2);
        }
      }
      
      :deep(.el-input__inner) {
        color: #fff;
        background: transparent;
        
        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      }
    }
    
    .refresh-btn {
      width: 100%;
      background: rgba(25, 55, 110, 0.7);
      border: 1px solid rgba(0, 212, 255, 0.4);
      color: #00d4ff;
      
      &:hover {
        border-color: #00d4ff;
        background: rgba(30, 70, 140, 0.9);
      }
    }
  }
}

.right-content {
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 确保flex子元素能够正确缩放 */
  overflow: hidden; /* 防止内容溢出 */
  box-sizing: border-box;
}

.statistics-bar {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(25, 55, 110, 0.7);
  border-bottom: 1px solid rgba(0, 212, 255, 0.4);
  
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
  background: rgba(25, 55, 110, 0.5);
  border: 1px solid rgba(0, 212, 255, 0.4);
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
  background: rgba(25, 55, 110, 0.5);
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  
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

.content-area {
  flex: 1;
  width: 100%;
  max-width: 100%;
  overflow-y: auto;
  overflow-x: hidden; /* 强制隐藏水平滚动 */
  padding: 20px 20px 20px 0; // 上右下左，表格贴左边
  box-sizing: border-box;
  
  // 确保表格容器不会溢出
  .inverter-table {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: auto !important;
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 4px;
  }
}


.card-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-left: 20px; // 为卡片视图添加左边距
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  
  .el-icon {
    font-size: 16px;
  }
}

.status-icon-normal {
  color: #00ff88;
}

.status-icon-alarm {
  color: #ffb800;
}

.status-icon-offline {
  color: #999;
}
</style>
