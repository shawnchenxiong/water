<template>
  <div v-loading="loading" class="history-data-tab">
    <div class="control-bar" :class="{ 'mobile': isMobile }">
      <div class="time-selector">
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
        <div class="date-picker" v-if="timeType !== 'total'">
          <el-button 
            :icon="ArrowLeft" 
            :size="isMobile ? 'small' : 'default'"
            @click="handlePrevDate" 
          />
          <el-date-picker 
            v-model="selectedDate" 
            :type="datePickerType" 
            :size="isMobile ? 'small' : 'default'"
          />
          <el-button 
            :icon="ArrowRight" 
            :size="isMobile ? 'small' : 'default'"
            @click="handleNextDate" 
          />
        </div>
      </div>
      
      <div class="control-group">
        <el-button 
          :size="isMobile ? 'small' : 'default'"
          @click="showParameterDialog = true"
        >
          参数选择
        </el-button>
        
        <div class="sampling-control">
          <span class="label">采样</span>
          <el-switch 
            v-model="sampling" 
            :size="isMobile ? 'small' : 'default'"
          />
        </div>
        
        <div class="granularity-control">
          <span class="label">时间粒度</span>
          <el-select 
            v-model="granularity"
            :size="isMobile ? 'small' : 'default'"
            :style="{ width: isMobile ? '80px' : '100px' }"
          >
            <el-option label="5min" value="5min" />
            <el-option label="15min" value="15min" />
            <el-option label="30min" value="30min" />
            <el-option label="1h" value="1h" />
          </el-select>
        </div>
        
        <div class="sampling-type-control">
          <span class="label">采样类型</span>
          <el-select 
            v-model="samplingType"
            :size="isMobile ? 'small' : 'default'"
            :style="{ width: isMobile ? '80px' : '100px' }"
          >
            <el-option label="最后" value="last" />
            <el-option label="平均" value="avg" />
            <el-option label="最大" value="max" />
            <el-option label="最小" value="min" />
          </el-select>
        </div>
        
        <el-button 
          :size="isMobile ? 'small' : 'default'"
          @click="loadData"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div ref="chartContainer" class="chart-container" :class="{ 'mobile': isMobile }"></div>

    <!-- 参数选择对话框 -->
    <el-dialog 
      v-model="showParameterDialog" 
      title="参数选择" 
      :width="isMobile ? '95%' : '500px'"
      :top="isMobile ? '2vh' : '15vh'"
    >
      <el-checkbox-group v-model="selectedParameters">
        <div class="parameter-list" :class="{ 'mobile': isMobile }">
          <el-checkbox 
            label="temperature"
            :size="isMobile ? 'small' : 'default'"
          >
            环境温度
          </el-checkbox>
          <el-checkbox 
            label="humidity"
            :size="isMobile ? 'small' : 'default'"
          >
            环境湿度
          </el-checkbox>
          <el-checkbox 
            label="irradiance"
            :size="isMobile ? 'small' : 'default'"
          >
            日辐照量
          </el-checkbox>
          <el-checkbox 
            label="windSpeed"
            :size="isMobile ? 'small' : 'default'"
          >
            瞬时风速
          </el-checkbox>
        </div>
      </el-checkbox-group>
      <template #footer>
        <el-button 
          :size="isMobile ? 'small' : 'default'"
          @click="showParameterDialog = false"
        >
          取消
        </el-button>
        <el-button 
          type="primary" 
          :size="isMobile ? 'small' : 'default'"
          @click="handleParameterConfirm"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Refresh, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { fetchHistoryData } from '@/api/device/weatherStation';

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
  if (chartInstance) {
    chartInstance.resize();
  }
};

const loading = ref(false);
const chartContainer = ref<HTMLElement>();
let chartInstance: ECharts | null = null;

const timeType = ref('day');
const selectedDate = ref(new Date());
const datePickerType = ref('date');
const sampling = ref(true);
const granularity = ref('5min');
const samplingType = ref('last');
const selectedParameters = ref(['temperature', 'humidity', 'irradiance']);
const showParameterDialog = ref(false);

const handleTimeTypeChange = () => {
  switch (timeType.value) {
    case 'day':
      datePickerType.value = 'date';
      break;
    case 'month':
      datePickerType.value = 'month';
      break;
    case 'year':
      datePickerType.value = 'year';
      break;
    default:
      datePickerType.value = 'date';
  }
  loadData();
};

const handlePrevDate = () => {
  const date = new Date(selectedDate.value);
  switch (timeType.value) {
    case 'day':
      date.setDate(date.getDate() - 1);
      break;
    case 'month':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() - 1);
      break;
  }
  selectedDate.value = date;
  loadData();
};

const handleNextDate = () => {
  const date = new Date(selectedDate.value);
  switch (timeType.value) {
    case 'day':
      date.setDate(date.getDate() + 1);
      break;
    case 'month':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  selectedDate.value = date;
  loadData();
};

const handleParameterConfirm = () => {
  showParameterDialog.value = false;
  loadData();
};

const initChart = () => {
  if (!chartContainer.value) {
    console.error('Chart container not found');
    return;
  }
  
  if (chartInstance) {
    chartInstance.dispose();
  }
  
  chartInstance = echarts.init(chartContainer.value);
  
  // 初始化空图表
  chartInstance.setOption({
    title: {
      text: '请选择参数并点击查询',
      left: 'center',
      top: 'middle',
      textStyle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 16
      }
    }
  });
  
  console.log('Chart initialized', chartContainer.value.clientWidth, chartContainer.value.clientHeight);
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 30, 60, 0.9)',
      borderColor: '#00d4ff',
      textStyle: {
        color: '#fff',
        fontSize: isMobile.value ? 10 : 12
      },
      confine: isMobile.value,
    },
    legend: {
      data: [],
      textStyle: {
        color: '#fff',
        fontSize: isMobile.value ? 10 : 12
      },
      top: isMobile.value ? 5 : 10,
      itemWidth: isMobile.value ? 15 : 25,
      itemHeight: isMobile.value ? 10 : 14
    },
    grid: {
      left: isMobile.value ? '40px' : '3%',
      right: isMobile.value ? '40px' : '4%',
      bottom: isMobile.value ? '40px' : '3%',
      top: isMobile.value ? '60px' : '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.3)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: isMobile.value ? 10 : 12,
        rotate: isMobile.value ? 45 : 0
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
        fontSize: isMobile.value ? 10 : 12
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
};

const loadData = async () => {
  console.log('Loading history data...', selectedParameters.value);
  loading.value = true;
  try {
    const result = await fetchHistoryData({
      deviceId: props.deviceId,
      timeType: timeType.value,
      sampling: sampling.value,
      granularity: granularity.value,
      samplingType: samplingType.value,
      parameters: selectedParameters.value,
    });
    
    console.log('Data loaded:', result);
    
    await nextTick();
    
    if (!chartInstance) {
      console.log('Chart not initialized, initializing...');
      initChart();
    }
    
    const series = result.series.map(item => ({
      name: item.name,
      type: 'line',
      smooth: true,
      data: item.data,
      itemStyle: {
        color: item.name === '环境温度' ? '#f56c6c' : item.name === '环境湿度' ? '#409eff' : '#67c23a',
      },
    }));
    
    console.log('Setting chart option...');
    
    chartInstance?.setOption({
      legend: {
        data: result.series.map(item => item.name),
      },
      xAxis: {
        data: result.timeData,
      },
      series,
    });
    
    // 确保resize
    setTimeout(() => {
      if (chartInstance && chartContainer.value) {
        const width = chartContainer.value.clientWidth;
        const height = chartContainer.value.clientHeight;
        console.log('Resizing chart:', width, height);
        if (width > 0 && height > 0) {
          chartInstance.resize();
        }
      }
    }, 100);
    
    console.log('Chart updated successfully');
  } catch (error) {
    console.error('Failed to load history data:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => props.deviceId, () => {
  loadData();
});

onMounted(async () => {
  checkIsMobile();
  window.addEventListener('resize', handleResize);
  
  await nextTick();
  await nextTick();
  
  // 延迟初始化图表，等待标签页完全展开
  setTimeout(() => {
    const container = chartContainer.value;
    if (container && container.clientHeight > 0) {
      initChart();
      loadData();
    } else {
      // 如果容器还没准备好，再等待一下
      setTimeout(() => {
        initChart();
        loadData();
      }, 500);
    }
  }, 300);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
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
  height: 100%;
}

.control-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
  
  &.mobile {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
  }
}

.time-selector {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.date-picker {
  display: flex;
  gap: 4px;
  align-items: center;
}

.control-group {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  
  .mobile & {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

.chart-container {
  flex: 1;
  min-height: 450px;
  height: 450px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
  
  &.mobile {
    min-height: 300px;
    height: 300px;
  }
}

.sampling-control,
.granularity-control,
.sampling-type-control {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .mobile & {
    justify-content: space-between;
  }
}

.sampling-control .label,
.granularity-control .label,
.sampling-type-control .label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  white-space: nowrap;
  
  .mobile & {
    font-size: 12px;
  }
}

.parameter-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  &.mobile {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>

