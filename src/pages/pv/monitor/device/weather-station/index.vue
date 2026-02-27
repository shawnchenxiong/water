<template>
  <DeviceMonitorLayout>
    <template #left>
      <StationTree 
        device-type="0914"
        @node-click="handleStationSelect" 
      />
    </template>
    
    <template #right>
      <div class="right-content">
        <!-- 顶部统计栏 -->
        <div class="statistics-bar" :class="{ 'mobile': isMobile }">
          <div
            class="stat-item"
            :class="{ active: activeFilter === 'all' }"
            @click="handleFilterClick('all')"
          >
            <div class="stat-label">总数</div>
            <div class="stat-value">({{ stats.total }})</div>
          </div>
          <div
            class="stat-item"
            :class="{ active: activeFilter === 'normal' }"
            @click="handleFilterClick('normal')"
          >
            <div class="stat-label">正常</div>
            <div class="stat-value">({{ stats.normal }})</div>
          </div>
          <div
            class="stat-item"
            :class="{ active: activeFilter === 'alarm' }"
            @click="handleFilterClick('alarm')"
          >
            <div class="stat-label">告警</div>
            <div class="stat-value">({{ stats.alarm }})</div>
          </div>
          <div
            class="stat-item"
            :class="{ active: activeFilter === 'offline' }"
            @click="handleFilterClick('offline')"
          >
            <div class="stat-label">离线</div>
            <div class="stat-value">({{ stats.offline }})</div>
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
              :size="isMobile ? 'small' : 'default'"
              :style="{ width: isMobile ? '100%' : '240px' }"
              @input="handleSearch"
            />
            <el-button 
              :icon="Search" 
              :size="isMobile ? 'small' : 'default'"
              @click="handleSearch"
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

      <!-- 设备列表 -->
      <div class="content-area">
        <!-- 卡片视图 -->
        <CardGridLayout
          v-if="viewMode === 'card'"
          :data="stationList"
          :loading="loading"
          :loading-text="'正在加载气象站数据...'"
          :empty-text="'暂无气象站数据'"
          :show-pagination="true"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-size-options="[12, 24, 36, 48]"
          :columns="4"
          :gap="'medium'"
          item-key="id"
          style="flex: 1; min-height: 0;"
          @card-click="handleStationClick"
          @refresh="handleRefresh"
        >
          <template #default="{ item }">
            <WeatherStationCard
              :station="item"
              @click="handleStationClick(item)"
            />
          </template>
        </CardGridLayout>

        <!-- 列表视图 -->
        <AdvancedTable
          v-else
          :data="stationList"
          :columns="tableColumns"
          :total="total"
          :page-size="pageSize"
          :loading="loading"
          :loading-text="'正在加载气象站数据...'"
          :show-toolbar="false"
          :show-pagination="true"
          :height="'calc(100vh - 380px)'"
          :page-sizes="[20, 40, 60, 80]"
          @page-change="handlePageChange"
          @size-change="handleSizeChange"
          @row-click="handleStationClick"
        >
          <template #status="scope">
            <div class="status-cell">
              <el-icon :class="`status-icon-${scope.row.status}`">
                <SuccessFilled v-if="scope.row.status === 'normal'" />
                <WarningFilled v-else-if="scope.row.status === 'alarm'" />
                <CircleCloseFilled v-else />
              </el-icon>
              <span>{{ getStatusText(scope.row.status) }}</span>
            </div>
          </template>
        </AdvancedTable>
      </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { downloadExcel, generateTimestampFilename } from '@/utils/download';
import {
  DataAnalysis,
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  Search,
  Refresh,
  Download,
  List,
  Grid,
} from '@element-plus/icons-vue';
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue';
import StationTree from '@/components/layout/StationTree.vue';
import CardGridLayout from '@/components/common/CardGridLayout.vue';
import AdvancedTable from '@/components/common/AdvancedTable.vue';
import WeatherStationCard from './components/WeatherStationCard.vue';
import type { WeatherStationListItem, WeatherStationStats } from '@/api/types/device/weatherStation';
import { fetchWeatherStationList } from '@/api/device/weatherStation';

const router = useRouter();

// 移动端检测
const isMobile = ref(false);

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

const handleResize = () => {
  checkIsMobile();
};

// 表格列配置
const tableColumns = ref([
  { prop: 'status', label: '状态', width: 80, fixed: 'left' as const, align: 'center' as const, slotName: 'status' },
  { prop: 'name', label: '设备名称', minWidth: 150, showOverflowTooltip: true },
  { prop: 'stationName', label: '所属电站', minWidth: 150, showOverflowTooltip: true },
  { prop: 'instantIrradiance', label: '瞬时辐照(W/m²)', width: 130, align: 'right' as const },
  { prop: 'dailyIrradiance', label: '日辐照量(MJ/m²)', width: 140, align: 'right' as const },
  { prop: 'temperature', label: '大气温度(℃)', width: 120, align: 'right' as const },
  { prop: 'humidity', label: '环境湿度(%RH)', width: 130, align: 'right' as const },
  { prop: 'windSpeed', label: '瞬时风速(m/s)', width: 130, align: 'right' as const },
  { prop: 'windDirectionText', label: '瞬时风向', width: 100, align: 'center' as const },
  { prop: 'updateTime', label: '更新时间', width: 180 }
]);

// 状态
const loading = ref(false);
const searchKeyword = ref('');
const activeFilter = ref('all');
const viewMode = ref<'card' | 'list'>('card');
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const stationList = ref<WeatherStationListItem[]>([]);
const stats = ref<WeatherStationStats>({
  total: 0,
  normal: 0,
  alarm: 0,
  offline: 0,
});
const selectedStationId = ref('');

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const result = await fetchWeatherStationList({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: activeFilter.value,
      keyword: searchKeyword.value,
      stationId: selectedStationId.value,
    });
    stationList.value = result.list;
    total.value = result.total;
    stats.value = result.stats;
  } catch (error) {
    // 静默处理错误
  } finally {
    loading.value = false;
  }
};

// 处理电站选择
const handleStationSelect = (node: any) => {
  selectedStationId.value = node.regionId || node.id;
  currentPage.value = 1;
  loadData();
};

// 处理状态筛选
const handleFilterClick = (filter: string) => {
  activeFilter.value = filter;
  currentPage.value = 1;
  loadData();
};

// 处理搜索
let searchTimer: NodeJS.Timeout;
const handleSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadData();
  }, 300);
};

// 处理刷新
const handleRefresh = () => {
  loadData();
};

// 处理下载
const handleDownload = async () => {
  try {
    let dataToExport: any[] = [];
    let exportColumns: any[] = [];
    
    if (viewMode.value === 'list') {
      // 列表视图导出
      dataToExport = stationList.value;
      exportColumns = [
        { label: '状态', getValue: (row: any) => {
          const statusMap: Record<string, string> = { online: '在线', alarm: '告警', offline: '离线', normal: '正常' };
          return statusMap[row.status] || row.status;
        }, width: 80 },
        { label: '设备名称', prop: 'name', width: 200 },
        { label: '所属电站', prop: 'stationName', width: 180 },
        { label: '瞬时辐照(W/m²)', formatter: (row: any) => (row.instantIrradiance || 0).toFixed(2), width: 130 },
        { label: '日辐照量(MJ/m²)', formatter: (row: any) => (row.dailyIrradiance || 0).toFixed(2), width: 140 },
        { label: '大气温度(℃)', formatter: (row: any) => (row.temperature || 0).toFixed(1), width: 120 },
        { label: '环境湿度(%RH)', formatter: (row: any) => (row.humidity || 0).toFixed(1), width: 130 },
        { label: '瞬时风速(m/s)', formatter: (row: any) => (row.windSpeed || 0).toFixed(1), width: 130 },
        { label: '瞬时风向', prop: 'windDirectionText', width: 100 },
        { label: '更新时间', prop: 'updateTime', width: 180 }
      ];
    } else {
      // 卡片视图导出
      dataToExport = stationList.value;
      exportColumns = [
        { label: '设备名称', prop: 'name', width: 200 },
        { label: '状态', getValue: (row: any) => {
          const statusMap: Record<string, string> = { online: '在线', alarm: '告警', offline: '离线', normal: '正常' };
          return statusMap[row.status] || row.status;
        }, width: 80 },
        { label: '所属电站', prop: 'stationName', width: 180 },
        { label: '瞬时辐照(W/m²)', formatter: (row: any) => (row.instantIrradiance || 0).toFixed(2), width: 130 },
        { label: '日辐照量(MJ/m²)', formatter: (row: any) => (row.dailyIrradiance || 0).toFixed(2), width: 140 },
        { label: '大气温度(℃)', formatter: (row: any) => (row.temperature || 0).toFixed(1), width: 120 },
        { label: '环境湿度(%RH)', formatter: (row: any) => (row.humidity || 0).toFixed(1), width: 130 },
        { label: '瞬时风速(m/s)', formatter: (row: any) => (row.windSpeed || 0).toFixed(1), width: 130 },
        { label: '瞬时风向', prop: 'windDirectionText', width: 100 },
        { label: '更新时间', prop: 'updateTime', width: 180 }
      ];
    }

    if (!dataToExport || dataToExport.length === 0) {
      ElMessage.warning('暂无数据可导出');
      return;
    }

    const filename = generateTimestampFilename('气象站数据');
    await downloadExcel(dataToExport, exportColumns, filename, '气象站数据');
    
    ElMessage.success(`成功导出 ${dataToExport.length} 条气象站数据至Excel文件`);
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败，请重试');
  }
};

// 处理分页
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadData();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadData();
};

// 处理设备点击
const handleStationClick = (station: WeatherStationListItem) => {
  router.push(`/pv/monitor/device/weather-station/${station.id}`);
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    normal: '正常',
    alarm: '告警',
    offline: '离线'
  };
  return statusMap[status] || '未知';
};

// 监听视图模式变化，调整每页数量
watch(viewMode, (newMode) => {
  pageSize.value = newMode === 'card' ? 12 : 20;
  currentPage.value = 1;
  loadData();
});

// 初始化
onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', handleResize);
  loadData();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

// 监听移动端状态变化
watch(isMobile, (newVal) => {
  if (newVal) {
    // 移动端默认使用卡片视图
    viewMode.value = 'card';
  }
});
</script>

<style scoped lang="scss">

.right-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

.statistics-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 8px;
  
  &.mobile {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

.stat-item {
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  // 移动端样式调整
  .mobile & {
    padding: 8px 6px;
  }
}

.stat-item:hover,
.stat-item.active {
  border-color: rgba(0, 212, 255, 0.6);
  background: rgba(0, 40, 80, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  
  // 移动端样式调整
  .mobile & {
    font-size: 11px;
    margin-bottom: 4px;
  }
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #00d4ff;
  
  // 移动端样式调整
  .mobile & {
    font-size: 16px;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  
  &.mobile {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px 0;
  }
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
  
  .mobile & {
    width: 100%;
    
    .el-input {
      flex: 1;
    }
  }
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
  
  .mobile & {
    justify-content: space-between;
  }
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon-normal {
  color: #67c23a;
}

.status-icon-alarm {
  color: #f56c6c;
}

.status-icon-offline {
  color: #909399;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>

