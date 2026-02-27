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
      <div class="main-content" v-loading="loading">
        <!-- 顶部控制栏 -->
        <div class="control-bar">
          <div class="left-controls">
            <!-- 时间类型选择 -->
            <el-radio-group v-model="dateType" @change="handleDateTypeChange">
              <el-radio-button :label="1">月</el-radio-button>
              <el-radio-button :label="2">年</el-radio-button>
              <el-radio-button :label="3">总</el-radio-button>
            </el-radio-group>

            <!-- 时间选择 -->
            <div class="date-selector">
              <el-button :icon="ArrowLeft" circle @click="handlePrevDate" />
              <el-date-picker
                v-if="dateType === 1"
                v-model="selectedDate"
                type="month"
                format="YYYY-MM"
                @change="loadData"
              />
              <el-date-picker
                v-else-if="dateType === 2"
                v-model="selectedDate"
                type="year"
                format="YYYY"
                @change="loadData"
              />
              <el-input v-else v-model="dateTimeStr" readonly style="width: 150px;" />
              <el-button :icon="ArrowRight" circle @click="handleNextDate" />
            </div>
          </div>

          <div class="right-controls">
            <!-- 刷新按钮 -->
            <el-button :icon="Refresh" @click="loadData">刷新</el-button>
          </div>
        </div>

        <!-- 图例 -->
        <div class="legend">
          <div class="legend-item">
            <span class="legend-icon inverter"></span>
            <span class="legend-text">逆变器发电量</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon grid-point"></span>
            <span class="legend-text">并网点发电量</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon self-use"></span>
            <span class="legend-text">自发自用电量</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon grid-power"></span>
            <span class="legend-text">上网电量</span>
          </div>
        </div>

        <!-- ECharts图表 -->
        <div ref="chartContainer" class="chart-container"></div>

        <!-- 导出按钮和表格 -->
        <div class="table-section">
          <el-button @click="handleExport">导出</el-button>
          <el-table :data="tableData" stripe>
            <el-table-column prop="stationName" label="电站名称" min-width="150" />
            <el-table-column prop="time" label="时间" width="120" />
            <el-table-column prop="inverterPower" label="逆变器发电量(kWh)" min-width="150">
              <template #default="{ row }">
                {{ row.inverterPower !== null ? row.inverterPower : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="gridPointPower" label="并网点发电量(kWh)" min-width="150">
              <template #default="{ row }">
                {{ row.gridPointPower !== null ? row.gridPointPower : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="selfUsePower" label="自发自用电量(kWh)" min-width="150">
              <template #default="{ row }">
                {{ row.selfUsePower !== null ? row.selfUsePower : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="gridPower" label="上网电量(kWh)" min-width="120">
              <template #default="{ row }">
                {{ row.gridPower !== null ? row.gridPower : '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, onUnmounted, onBeforeUnmount } from 'vue';
import { Refresh, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue';
import StationTree from '@/components/layout/StationTree.vue';
import type { ECharts } from 'echarts';
import { fetchElectricQuantityTrend } from '@/api/analysis/energyTrend';
import type { ElectricQuantityTableItem } from '@/api/types/analysis/energyTrend';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const selectedStationId = ref('ST_0001');

// 移动端检测
const isMobile = ref(false);

const dateType = ref(2); // 1=月, 2=年, 3=总
const selectedDate = ref(new Date());
const chartContainer = ref<HTMLElement>();
let chartInstance: ECharts | null = null;
const tableData = ref<ElectricQuantityTableItem[]>([]);

const dateTimeStr = computed(() => {
  if (dateType.value === 1) {
    const year = selectedDate.value.getFullYear();
    const month = String(selectedDate.value.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  } else if (dateType.value === 2) {
    return String(selectedDate.value.getFullYear());
  } else {
    return '总计';
  }
});


const handleStationSelect = (node: any) => {
  selectedStationId.value = node.regionId || node.id;
  loadData();
};


const handleDateTypeChange = () => {
  loadData();
};

const handlePrevDate = () => {
  if (dateType.value === 1) {
    const newDate = new Date(selectedDate.value);
    newDate.setMonth(newDate.getMonth() - 1);
    selectedDate.value = newDate;
  } else if (dateType.value === 2) {
    const newDate = new Date(selectedDate.value);
    newDate.setFullYear(newDate.getFullYear() - 1);
    selectedDate.value = newDate;
  }
  loadData();
};

const handleNextDate = () => {
  if (dateType.value === 1) {
    const newDate = new Date(selectedDate.value);
    newDate.setMonth(newDate.getMonth() + 1);
    selectedDate.value = newDate;
  } else if (dateType.value === 2) {
    const newDate = new Date(selectedDate.value);
    newDate.setFullYear(newDate.getFullYear() + 1);
    selectedDate.value = newDate;
  }
  loadData();
};

const initChart = () => {
  if (!chartContainer.value) return;
  
  if (chartInstance) {
    chartInstance.dispose();
  }
  
  chartInstance = echarts.init(chartContainer.value);
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 30, 60, 0.9)',
      borderColor: '#00d4ff',
      textStyle: {
        color: '#fff',
      },
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: isMobile.value ? '10%' : '3%',
      right: isMobile.value ? '10%' : '4%',
      bottom: isMobile.value ? '8%' : '3%',
      top: isMobile.value ? '20px' : '40px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.3)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: isMobile.value ? 10 : 12,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.3)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: isMobile.value ? 10 : 12,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.1)',
        },
      },
    },
    series: [],
  };
  
  chartInstance.setOption(option);
  
  // 初始化后立即调用 resize 确保尺寸正确
  setTimeout(() => {
    chartInstance?.resize();
  }, 100);
};

const loadData = async () => {
  loading.value = true;
  try {
    const result = await fetchElectricQuantityTrend({
      regionId: selectedStationId.value,
      dateType: dateType.value,
      dateTime: dateTimeStr.value,
    });
    
    tableData.value = result.tableData;
    
    await nextTick();
    
    if (!chartInstance) {
      initChart();
    }
    
    const series = result.chartData.series.map(item => ({
      name: item.name,
      type: 'bar',
      data: item.data,
      itemStyle: {
        color: '#FFBF00',
      },
      barWidth: '60%',
    }));
    
    chartInstance?.setOption({
      xAxis: {
        data: result.chartData.xAxisData,
      },
      series,
    });
  } catch (error) {
    console.error('Failed to load electric quantity trend:', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

const handleExport = () => {
  ElMessage.success('导出功能开发中');
};

// 移动端检测函数
const checkIsMobile = () => {
  const newIsMobile = window.innerWidth <= 768
  const wasChanged = isMobile.value !== newIsMobile
  isMobile.value = newIsMobile
  
  // 如果移动端状态改变了，需要更新图表配置
  if (wasChanged && chartInstance) {
    nextTick(() => {
      // 更新图表配置而不是重新初始化
      const option = {
        grid: {
          left: isMobile.value ? '10%' : '3%',
          right: isMobile.value ? '10%' : '4%',
          bottom: isMobile.value ? '8%' : '3%',
          top: isMobile.value ? '20px' : '40px',
          containLabel: true,
        },
        xAxis: {
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: isMobile.value ? 10 : 12,
          },
        },
        yAxis: {
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: isMobile.value ? 10 : 12,
          },
        },
      }
      chartInstance.setOption(option, false) // 不替换，只合并
      // 延迟调用 resize，确保配置更新和 DOM 渲染完成
      setTimeout(() => {
        chartInstance?.resize()
      }, 100)
    })
  }
};

onMounted(() => {
  checkIsMobile();
  initChart();
  // 确保图表初始化后再次检查移动端状态
  nextTick(() => {
    setTimeout(() => {
      checkIsMobile();
    }, 200);
  });
  window.addEventListener('resize', handleResize);
  window.addEventListener('resize', checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('resize', checkIsMobile);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

function handleResize() {
  if (chartInstance) {
    // 延迟调用 resize，确保 DOM 更新完成
    setTimeout(() => {
      chartInstance?.resize();
    }, 100);
  }
}

</script>

<style scoped lang="scss">
.main-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
    gap: 12px;
  }
}

.control-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 30, 60, 0.4);
  border-radius: 4px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 10px 12px;
  }
}

.left-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.right-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    justify-content: center;
  }
}

.date-selector {
  display: flex;
  gap: 8px;
  align-items: center;
}

.legend {
  display: flex;
  gap: 24px;
  justify-content: flex-end;
  padding: 0 16px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    padding: 0 8px;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-icon {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-icon.inverter {
  background: #FFBF00;
}

.legend-icon.grid-point {
  background: #409eff;
}

.legend-icon.self-use {
  background: #67c23a;
}

.legend-icon.grid-power {
  background: #f56c6c;
}

.legend-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.chart-container {
  flex-shrink: 0;
  width: 100%;
  height: 460px;
  background: rgba(10, 24, 45, 0.3);
  border-radius: 4px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    height: 300px;
  }

  @media (max-width: 480px) {
    height: 250px;
  }
}

.table-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 768px) {
    gap: 8px;

    .el-button {
      align-self: center;
      margin-bottom: 8px;
    }

    :deep(.el-table) {
      font-size: 12px;
    }

    :deep(.el-table th) {
      padding: 8px 0;
    }

    :deep(.el-table td) {
      padding: 8px 0;
    }
  }
}
</style>
