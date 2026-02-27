<template>
  <div v-loading="loading" class="monitor-info-tab">
    <div class="status-header">
      <div class="update-time">更新时间：{{ detailData?.updateTime }}</div>
      <div class="comm-status" :class="detailData?.communicationStatus">
        <el-icon><Connection /></el-icon>
        <span>{{ detailData?.communicationStatus === 'online' ? '在线' : '离线' }}</span>
      </div>
    </div>

    <div class="overview-section">
      <div class="section-title">概览信息</div>
      <div class="data-grid">
        <div class="data-item">
          <div class="label">瞬时辐射</div>
          <div class="value">{{ detailData?.overview.instantIrradiance }}W/m²</div>
        </div>
        <div class="data-item">
          <div class="label">日辐照量</div>
          <div class="value">{{ detailData?.overview.dailyIrradiance }}MJ/m²</div>
        </div>
        <div class="data-item">
          <div class="label">日照时数</div>
          <div class="value">{{ detailData?.overview.sunshineHours }}h</div>
        </div>
        <div class="data-item">
          <div class="label">环境温度</div>
          <div class="value">{{ detailData?.overview.temperature }}°C</div>
        </div>
        <div class="data-item">
          <div class="label">环境湿度</div>
          <div class="value">{{ detailData?.overview.humidity }}%RH</div>
        </div>
        <div class="data-item">
          <div class="label">组件温度</div>
          <div class="value">{{ detailData?.overview.componentTemperature }}°C</div>
        </div>
        <div class="data-item">
          <div class="label">瞬时风向</div>
          <div class="value">{{ detailData?.overview.windDirection }}</div>
        </div>
        <div class="data-item">
          <div class="label">瞬时风速</div>
          <div class="value">{{ detailData?.overview.windSpeed }}m/s</div>
        </div>
      </div>
    </div>

    <div class="status-section">
      <div class="section-title">
        状态信息
        <span class="total-points">总测点数:{{ detailData?.totalPoints }}</span>
      </div>
      <div class="status-list">
        <div class="status-item">
          <span class="label">设备通讯中断</span>
          <span class="value">{{ detailData?.statusInfo.communicationInterrupt }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Connection } from '@element-plus/icons-vue';
import type { WeatherStationDetailData } from '@/api/types/device/weatherStation';
import { fetchWeatherStationDetail } from '@/api/device/weatherStation';

interface Props {
  deviceId: string;
}

const props = defineProps<Props>();

const loading = ref(false);
const detailData = ref<WeatherStationDetailData | null>(null);

const loadData = async () => {
  loading.value = true;
  try {
    detailData.value = await fetchWeatherStationDetail(props.deviceId);
  } catch (error) {
    console.error('Failed to load detail data:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => props.deviceId, () => {
  loadData();
});

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.monitor-info-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 30, 60, 0.4);
  border-radius: 4px;
}

.update-time {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.comm-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.comm-status.online {
  color: #67c23a;
}

.comm-status.offline {
  color: #909399;
}

.overview-section,
.status-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #00d4ff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-points {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: normal;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
}

.data-item .label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.data-item .value {
  font-size: 18px;
  font-weight: 500;
  color: #fff;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
}

.status-item .label {
  color: rgba(255, 255, 255, 0.7);
}

.status-item .value {
  color: #fff;
  font-weight: 500;
}
</style>

