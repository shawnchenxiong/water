<template>
  <div v-loading="loading" class="monitor-info-tab">
    <!-- 顶部状态栏 -->
    <div class="status-header">
      <div class="left-info">
        <div class="update-time">更新时间：{{ monitoringData?.updateTime }}</div>
      </div>
      <div class="right-info">
        <div class="online-status" :class="onlineStatusClass">
          <el-icon><Connection /></el-icon>
          <span>{{ onlineStatusText }}</span>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
      <span class="total-points">总测点数:{{ monitoringData?.totalPoints }}</span>
      <el-button @click="toggleDisplayMode">
        <el-icon><Grid /></el-icon>
        卡片展示
      </el-button>
    </div>

    <!-- 概览信息 -->
    <div class="overview-section">
      <div class="section-title">电能数据</div>
      <div class="data-grid">
        <div class="data-item">
          <div class="label">正向有功电能</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.forwardActiveEnergy) }}kWh</div>
        </div>
        <div class="data-item">
          <div class="label">反向有功电能</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.reverseActiveEnergy) }}kWh</div>
        </div>
        <div class="data-item">
          <div class="label">正向无功电能</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.forwardReactiveEnergy) }}kVar.h</div>
        </div>
        <div class="data-item">
          <div class="label">反向无功电能</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.reverseReactiveEnergy) }}kVar.h</div>
        </div>
        <div class="data-item">
          <div class="label">日电能</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.dailyEnergy) }}kWh</div>
        </div>
        <div class="data-item">
          <div class="label">月电能</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.monthlyEnergy) }}kWh</div>
        </div>
        <div class="data-item">
          <div class="label">年电能</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.yearlyEnergy) }}kWh</div>
        </div>
      </div>
    </div>

    <!-- 功率参数 -->
    <div class="power-section">
      <div class="section-title">功率参数</div>
      <div class="data-grid">
        <div class="data-item">
          <div class="label">有功功率</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.activePower) }}kW</div>
        </div>
        <div class="data-item">
          <div class="label">功率因数</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.powerFactor) }}</div>
        </div>
        <div class="data-item">
          <div class="label">频率</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.frequency) }}Hz</div>
        </div>
      </div>
    </div>

    <!-- 三相电压 -->
    <div class="voltage-section">
      <div class="section-title">三相电压</div>
      <div class="data-grid">
        <div class="data-item">
          <div class="label">A相电压</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.voltageA) }}V</div>
        </div>
        <div class="data-item">
          <div class="label">B相电压</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.voltageB) }}V</div>
        </div>
        <div class="data-item">
          <div class="label">C相电压</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.voltageC) }}V</div>
        </div>
      </div>
    </div>

    <!-- 三相电流 -->
    <div class="current-section">
      <div class="section-title">三相电流</div>
      <div class="data-grid">
        <div class="data-item">
          <div class="label">A相电流</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.currentA) }}A</div>
        </div>
        <div class="data-item">
          <div class="label">B相电流</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.currentB) }}A</div>
        </div>
        <div class="data-item">
          <div class="label">C相电流</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.currentC) }}A</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Connection, Refresh, Grid } from '@element-plus/icons-vue';
import { getMonitoringData } from '@/api/device/electricMeterDetail';
import type { MonitoringData } from '@/api/types/device/electricMeterDetail';

interface Props {
  deviceId: string;
}

const props = defineProps<Props>();

const loading = ref(false);
const monitoringData = ref<MonitoringData | null>(null);

// 在线状态
const onlineStatusClass = computed(() => ({
  online: true
}));

const onlineStatusText = computed(() => '在线');

// 电能表不需要复杂的状态表格

// 格式化数字
const formatNumber = (value: any) => {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'number') return value.toFixed(2);
  return value;
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    monitoringData.value = await getMonitoringData(props.deviceId);
  } catch (error) {
    console.error('加载监控数据失败:', error);
    ElMessage.error('加载监控数据失败');
  } finally {
    loading.value = false;
  }
};

// 刷新
const handleRefresh = () => {
  loadData();
  ElMessage.success('刷新成功');
};

// 切换显示模式
const toggleDisplayMode = () => {
  ElMessage.info('切换显示模式功能开发中');
};

watch(() => props.deviceId, () => {
  loadData();
});

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.monitor-info-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;

  .update-time {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  .online-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;

    &.online {
      color: #67c23a;
    }

    &.offline {
      color: #909399;
    }
  }
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;

  .total-points {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin-left: auto;
    margin-right: 12px;
  }
}

.overview-section,
.pv-section,
.status-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #00d4ff;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    border-color: rgba(0, 212, 255, 0.5);
    background: rgba(0, 40, 80, 0.5);
  }

  .label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .value {
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }
}

</style>

