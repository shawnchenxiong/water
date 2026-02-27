<template>
  <div class="weather-station-card" @click="handleClick">
    <div class="card-header">
      <div class="station-name">{{ station.name }}</div>
      <div class="status-icons">
        <el-icon :class="`comm-icon-${station.communicationStatus}`" title="通讯状态">
          <Connection />
        </el-icon>
        <el-icon :class="`alarm-icon-${station.alarmStatus}`" title="告警状态">
          <Bell />
        </el-icon>
      </div>
    </div>
    
    <div class="card-body">
      <div class="station-location">{{ station.stationName }}</div>
      
      <div class="data-grid">
        <div class="data-item">
          <span class="label">瞬时辐照(W/m²):</span>
          <span class="value">{{ station.instantIrradiance }}</span>
        </div>
        <div class="data-item">
          <span class="label">日辐照量(MJ/m²):</span>
          <span class="value">{{ station.dailyIrradiance }}</span>
        </div>
        <div class="data-item">
          <span class="label">大气温度(℃):</span>
          <span class="value">{{ station.temperature }}</span>
        </div>
        <div class="data-item">
          <span class="label">环境湿度(%RH):</span>
          <span class="value">{{ station.humidity }}</span>
        </div>
        <div class="data-item">
          <span class="label">瞬时风速(m/s):</span>
          <span class="value">{{ station.windSpeed }}</span>
        </div>
        <div class="data-item">
          <span class="label">瞬时风向:</span>
          <span class="value">{{ station.windDirectionText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Connection, Bell } from '@element-plus/icons-vue';
import type { WeatherStationListItem } from '@/api/types/device/weatherStation';

interface Props {
  station: WeatherStationListItem;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [station: WeatherStationListItem];
}>();

const handleClick = () => {
  emit('click', props.station);
};
</script>

<style scoped>
.weather-station-card {
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.weather-station-card:hover {
  border-color: rgba(0, 212, 255, 0.8);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.station-name {
  font-size: 16px;
  font-weight: 500;
  color: #00d4ff;
}

.status-icons {
  display: flex;
  gap: 8px;
}

.comm-icon-online {
  color: #67c23a;
}

.comm-icon-offline {
  color: #909399;
}

.alarm-icon-none {
  color: #67c23a;
}

.alarm-icon-has_alarm {
  color: #f56c6c;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.station-location {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.data-item .label {
  color: rgba(255, 255, 255, 0.6);
}

.data-item .value {
  color: #fff;
  font-weight: 500;
}
</style>

