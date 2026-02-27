<template>
  <div class="history-data-tab">
    <!-- 时间控制区 -->
    <div class="time-control" :class="{ 'mobile': isMobile }">
      <el-radio-group 
        v-model="timeType" 
        :size="isMobile ? 'small' : 'default'"
        @change="handleTimeTypeChange"
      >
        <el-radio-button label="day">日</el-radio-button>
        <el-radio-button label="month">月</el-radio-button>
        <el-radio-button label="year">年</el-radio-button>
        <el-radio-button label="total">总</el-radio-button>
        <el-radio-button label="custom">自定义</el-radio-button>
      </el-radio-group>

      <div class="date-picker-wrapper" v-if="timeType !== 'total'">
        <el-button 
          v-if="timeType !== 'custom'"
          :icon="ArrowLeft" 
          circle 
          :size="isMobile ? 'small' : 'default'"
          @click="handlePrevDate" 
        />
        
        <el-date-picker
          v-if="timeType === 'custom'"
          v-model="customDateRange"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :size="isMobile ? 'small' : 'default'"
          @change="handleDateChange"
        />
        
        <el-date-picker
          v-else
          v-model="selectedDate"
          :type="datePickerType"
          :format="dateFormat"
          :placeholder="datePlaceholder"
          :size="isMobile ? 'small' : 'default'"
          @change="handleDateChange"
        />
        
        <el-button 
          v-if="timeType !== 'custom'"
          :icon="ArrowRight" 
          circle 
          :size="isMobile ? 'small' : 'default'"
          @click="handleNextDate" 
        />
      </div>
    </div>

    <!-- 参数控制区 -->
    <div class="param-control" :class="{ 'mobile': isMobile }">
      <el-button 
        :size="isMobile ? 'small' : 'default'"
        @click="showPointSelector = true"
      >
        参数选择
      </el-button>
      
      <div class="control-item">
        <span class="label">采样</span>
        <el-switch 
          v-model="sampling" 
          :size="isMobile ? 'small' : 'default'"
        />
      </div>

      <div class="control-item" v-if="sampling">
        <span class="label">时间粒度</span>
        <el-select 
          v-model="samplingInterval" 
          :size="isMobile ? 'small' : 'default'"
          :style="{ width: isMobile ? '100px' : '120px' }"
        >
          <el-option label="5min" value="5min" />
          <el-option label="10min" value="10min" />
          <el-option label="15min" value="15min" />
          <el-option label="30min" value="30min" />
          <el-option label="1h" value="1h" />
        </el-select>
      </div>

      <div class="control-item" v-if="sampling">
        <span class="label">采样类型</span>
        <el-select 
          v-model="samplingType" 
          :size="isMobile ? 'small' : 'default'"
          :style="{ width: isMobile ? '100px' : '120px' }"
        >
          <el-option label="最后" value="last" />
          <el-option label="平均" value="avg" />
          <el-option label="最大" value="max" />
          <el-option label="最小" value="min" />
        </el-select>
      </div>

      <el-button 
        :icon="Download" 
        :size="isMobile ? 'small' : 'default'"
        @click="handleExport"
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
    </div>

    <!-- 快速选择区 -->
    <div class="quick-select" :class="{ 'mobile': isMobile }">
      <span class="label">快速选择：</span>
      <el-button
        v-for="item in quickSelections"
        :key="item.name"
        :size="isMobile ? 'small' : 'small'"
        @click="handleQuickSelect(item)"
      >
        {{ item.name }}
      </el-button>
    </div>

    <!-- 图表区 -->
    <div class="chart-container" :class="{ 'mobile': isMobile }" v-loading="chartLoading">
      <div ref="chartRef" class="chart"></div>
    </div>

    <!-- 参数选择对话框 -->
    <el-dialog 
      v-model="showPointSelector" 
      title="选择参数" 
      :width="isMobile ? '95%' : '600px'"
      :top="isMobile ? '2vh' : '15vh'"
    >
      <el-checkbox-group v-model="selectedPointIds">
        <div class="point-list" :class="{ 'mobile': isMobile }">
          <el-checkbox
            v-for="point in pointList"
            :key="point.pointId"
            :label="point.pointId"
            :size="isMobile ? 'small' : 'default'"
          >
            {{ point.pointName }} ({{ point.unit }})
          </el-checkbox>
        </div>
      </el-checkbox-group>
      <template #footer>
        <el-button 
          :size="isMobile ? 'small' : 'default'"
          @click="showPointSelector = false"
        >
          取消
        </el-button>
        <el-button 
          type="primary" 
          :size="isMobile ? 'small' : 'default'"
          @click="handlePointConfirm"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowLeft, ArrowRight, Download, Refresh } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';
import dayjs from 'dayjs';
import { getHistoryData, getPointList } from '@/api/device/electricMeterDetail';
import type { PointInfo } from '@/api/types/device/electricMeterDetail';

interface Props {
  deviceId: string;
}

const props = defineProps<Props>();

// 移动端检测
const isMobile = ref(false);

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Resize处理函数
const handleResize = () => {
  checkIsMobile();
  chartInstance?.resize();
};

const chartRef = ref<HTMLElement>();
let chartInstance: ECharts | null = null;

const chartLoading = ref(false);
const timeType = ref('day');
const selectedDate = ref(new Date());
const customDateRange = ref<[Date, Date] | null>(null);
const sampling = ref(true);
const samplingInterval = ref('5min');
const samplingType = ref('last');
const showPointSelector = ref(false);
const pointList = ref<PointInfo[]>([]);
const selectedPointIds = ref<string[]>([]);
const quickSelections = ref<Array<{ name: string; pointIds: string[] }>>([]);

// 日期选择器类型
const datePickerType = computed(() => {
  const typeMap: Record<string, string> = {
    day: 'date',
    month: 'month',
    year: 'year',
    custom: 'datetimerange'
  };
  return typeMap[timeType.value] || 'date';
});

const dateFormat = computed(() => {
  const formatMap: Record<string, string> = {
    day: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY'
  };
  return formatMap[timeType.value] || 'YYYY-MM-DD';
});

const datePlaceholder = computed(() => {
  const placeholderMap: Record<string, string> = {
    day: '选择日期',
    month: '选择月份',
    year: '选择年份',
    custom: '选择时间范围'
  };
  return placeholderMap[timeType.value] || '选择日期';
});

// 加载测点列表
const loadPointList = async () => {
  try {
    const response = await getPointList(props.deviceId);
    pointList.value = response.points;
    quickSelections.value = response.quickSelections;
    
    console.log('Point list loaded:', pointList.value);
    
    // 默认选择前3个测点
    if (selectedPointIds.value.length === 0 && pointList.value.length > 0) {
      selectedPointIds.value = pointList.value.slice(0, 3).map(p => p.pointId);
      console.log('Default points selected:', selectedPointIds.value);
      
      // 确保图表已初始化后再加载数据
      await nextTick();
      if (chartInstance) {
        await loadChartData();
      } else {
        console.error('Chart not initialized when loading data');
        // 如果图表未初始化，等待一下再试
        setTimeout(async () => {
          if (chartInstance) {
            await loadChartData();
          }
        }, 200);
      }
    }
  } catch (error) {
    console.error('加载测点列表失败:', error);
  }
};

// 加载图表数据
const loadChartData = async () => {
  if (selectedPointIds.value.length === 0) {
    ElMessage.warning('请先选择参数');
    return;
  }

  if (!chartInstance) {
    console.error('Chart instance not available');
    ElMessage.error('图表未初始化');
    return;
  }

  console.log('Loading chart data for points:', selectedPointIds.value);
  
  chartLoading.value = true;
  try {
    let startTime: string;
    let endTime: string;
    
    if (timeType.value === 'custom' && customDateRange.value) {
      if (!dayjs(customDateRange.value[0]).isValid() || !dayjs(customDateRange.value[1]).isValid()) {
        ElMessage.warning('请选择有效的时间范围');
        customDateRange.value = [new Date(), new Date()];
        return;
      }
      startTime = dayjs(customDateRange.value[0]).toISOString();
      endTime = dayjs(customDateRange.value[1]).toISOString();
    } else {
      if (!dayjs(selectedDate.value).isValid()) {
        ElMessage.warning('请选择有效的日期');
        selectedDate.value = new Date();
        return;
      }
      startTime = dayjs(selectedDate.value).startOf('day').toISOString();
      endTime = dayjs(selectedDate.value).endOf('day').toISOString();
    }
    
    const response = await getHistoryData({
      deviceId: props.deviceId,
      timeType: timeType.value,
      startTime,
      endTime,
      pointIds: selectedPointIds.value,
      sampling: sampling.value,
      samplingInterval: samplingInterval.value,
      samplingType: samplingType.value
    });

    console.log('Chart data loaded:', response);
    
    await nextTick();
    updateChart(response);
  } catch (error) {
    console.error('加载历史数据失败:', error);
    ElMessage.error('加载历史数据失败');
  } finally {
    chartLoading.value = false;
  }
};

// 更新图表
const updateChart = (data: any) => {
  if (!chartInstance) {
    console.error('Chart instance not initialized');
    return;
  }

  if (!data || !data.series || data.series.length === 0) {
    console.error('Invalid chart data');
    return;
  }

  const colors = ['#FFD700', '#00d4ff', '#00ff88', '#ff6b9d', '#c446fc'];

  const option: EChartsOption = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 24, 45, 0.9)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { 
        color: '#fff',
        fontSize: isMobile.value ? 10 : 12
      },
      confine: isMobile.value,
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: data.series.map((s: any) => s.pointName),
      textStyle: { 
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: isMobile.value ? 10 : 12
      },
      top: isMobile.value ? 5 : 10,
      left: 'center',
      itemWidth: isMobile.value ? 15 : 25,
      itemHeight: isMobile.value ? 10 : 14
    },
    grid: { 
      left: isMobile.value ? '40px' : '80px', 
      right: isMobile.value ? '40px' : '80px', 
      top: isMobile.value ? '60px' : '80px', 
      bottom: isMobile.value ? '40px' : '60px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.time,
      boundaryGap: false,
      axisLine: { 
        lineStyle: { color: 'rgba(0, 212, 255, 0.3)' },
        show: true
      },
      axisLabel: { 
        color: 'rgba(255, 255, 255, 0.65)', 
        fontSize: isMobile.value ? 10 : 12,
        rotate: isMobile.value ? 45 : 30
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: data.series[0]?.unit || '',
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.65)',
        fontSize: 12
      },
      axisLine: { 
        show: true, 
        lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } 
      },
      axisLabel: { 
        color: 'rgba(255, 255, 255, 0.65)', 
        fontSize: 12 
      },
      splitLine: { 
        lineStyle: { 
          color: 'rgba(0, 212, 255, 0.1)', 
          type: 'dashed' 
        } 
      }
    },
    series: data.series.map((s: any, index: number) => ({
      name: s.pointName,
      type: 'line',
      data: s.values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      sampling: 'lttb',
      lineStyle: {
        width: 2,
        color: colors[index % colors.length]
      },
      itemStyle: {
        color: colors[index % colors.length]
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: colors[index % colors.length] + '30' },
            { offset: 1, color: colors[index % colors.length] + '05' }
          ]
        }
      }
    }))
  };

  try {
    chartInstance.setOption(option, true);
    
    // 确保容器有正确的尺寸后再resize
    setTimeout(() => {
      if (chartInstance && chartRef.value) {
        const width = chartRef.value.clientWidth;
        const height = chartRef.value.clientHeight;
        console.log('Chart container size:', width, height);
        if (width > 0 && height > 0) {
          chartInstance.resize();
        }
      }
    }, 100);
    
    console.log('Chart updated successfully', data);
  } catch (error) {
    console.error('Error updating chart:', error);
  }
};

// 初始化图表
const initChart = () => {
  if (!chartRef.value) {
    console.error('Chart ref not found');
    return;
  }
  
  if (chartInstance) {
    chartInstance.dispose();
  }
  
  chartInstance = echarts.init(chartRef.value);
  
  // 初始化一个空图表
  chartInstance.setOption({
    title: {
      text: '请选择参数并点击刷新',
      left: 'center',
      top: 'middle',
      textStyle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 16
      }
    }
  });
  
  window.addEventListener('resize', handleResize);
};

// 时间类型变化
const handleTimeTypeChange = () => {
  loadChartData();
};

// 日期变化
const handleDateChange = () => {
  loadChartData();
};

// 上一天/月/年
const handlePrevDate = () => {
  const unitMap: Record<string, any> = { day: 'day', month: 'month', year: 'year' };
  if (!dayjs(selectedDate.value).isValid()) {
    selectedDate.value = new Date();
    ElMessage.warning('日期无效，已重置为当前日期');
    return;
  }
  selectedDate.value = dayjs(selectedDate.value).subtract(1, unitMap[timeType.value]).toDate();
  loadChartData();
};

// 下一天/月/年
const handleNextDate = () => {
  const unitMap: Record<string, any> = { day: 'day', month: 'month', year: 'year' };
  if (!dayjs(selectedDate.value).isValid()) {
    selectedDate.value = new Date();
    ElMessage.warning('日期无效，已重置为当前日期');
    return;
  }
  selectedDate.value = dayjs(selectedDate.value).add(1, unitMap[timeType.value]).toDate();
  loadChartData();
};

// 刷新
const handleRefresh = () => {
  loadChartData();
};

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中');
};

// 快速选择
const handleQuickSelect = (item: { name: string; pointIds: string[] }) => {
  selectedPointIds.value = item.pointIds;
  loadChartData();
};

// 确认参数选择
const handlePointConfirm = () => {
  showPointSelector.value = false;
  loadChartData();
};

watch(() => props.deviceId, () => {
  loadPointList();
}, { immediate: false });

// 组件卸载时清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

onMounted(async () => {
  checkIsMobile();
  window.addEventListener('resize', handleResize);
  
  await nextTick();
  await nextTick(); // 确保DOM完全渲染
  
  // 延迟初始化图表，等待标签页完全展开
  setTimeout(() => {
    if (chartRef.value && chartRef.value.clientHeight > 0) {
      initChart();
      loadPointList();
    } else {
      // 如果容器还没准备好，再等待一下
      setTimeout(() => {
        initChart();
        loadPointList();
      }, 500);
    }
  }, 300);
});

// 监听移动端状态变化
watch(isMobile, () => {
  if (chartInstance) {
    setTimeout(() => {
      chartInstance?.resize();
    }, 100);
  }
});
</script>

<style scoped lang="scss">
.history-data-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-control {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;

  .date-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &.mobile {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;

    .date-picker-wrapper {
      width: 100%;
      justify-content: center;
      
      :deep(.el-date-editor) {
        width: 100% !important;
      }
    }
  }
}

.param-control {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;

  .control-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      white-space: nowrap;
    }
  }

  &.mobile {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    
    .control-item {
      width: 100%;
      justify-content: space-between;
      
      .label {
        font-size: 12px;
      }
    }
  }
}

.quick-select {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;

  .label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  &.mobile {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
    
    .label {
      font-size: 12px;
      width: 100%;
      margin-bottom: 4px;
    }
  }
}

.chart-container {
  flex: 1;
  min-height: 450px;
  height: 450px;
  padding: 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
  position: relative;

  .chart {
    width: 100%;
    height: 100%;
    min-height: 420px;
  }

  &.mobile {
    min-height: 300px;
    height: 300px;
    padding: 8px;
    
    .chart {
      min-height: 280px;
    }
  }
}

.point-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;

  :deep(.el-checkbox) {
    margin-right: 0;
  }

  &.mobile {
    grid-template-columns: 1fr;
    max-height: 300px;
    gap: 8px;
  }
}
</style>

