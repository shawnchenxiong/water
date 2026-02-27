<template>
  <div class="inverter-card" @click="handleClick">
    <!-- 状态指示器 -->
    <div class="status-indicator" :class="`status-${inverter.status}`"></div>
    
    <div class="card-header">
      <div class="device-name">{{ inverter.deviceName }}</div>
      <div class="station-name">{{ inverter.stationName }}</div>
    </div>
    
    <!-- 闪电图标 -->
    <div class="lightning-icon">⚡</div>
    
    <div class="card-body">
      <div class="metric-row">
        <span class="label">实时功率(kW):</span>
        <span class="value">{{ inverter.realtimePower || '-' }}</span>
      </div>
      <div class="metric-row">
        <span class="label">日发电量(kWh):</span>
        <span class="value">{{ inverter.dailyEnergy || '-' }}</span>
      </div>
      <div class="metric-row">
        <span class="label">日等效时(h):</span>
        <span class="value">{{ inverter.dailyEquivalentHours || '-' }}</span>
      </div>
      <div class="metric-row">
        <span class="label">装机容量(kWp):</span>
        <span class="value">{{ inverter.installedCapacity || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Connection, Bell } from '@element-plus/icons-vue';
import type { InverterData } from '@/api/types/device/inverter';

interface Props {
  inverter: InverterData;
}

interface Emits {
  (e: 'click', inverter: InverterData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const commIconClass = computed(() => ({
  'comm-icon': true,
  'comm-icon-online': props.inverter.communicationStatus === 'online',
  'comm-icon-offline': props.inverter.communicationStatus === 'offline'
}));

const alarmIconClass = computed(() => ({
  'alarm-icon': true,
  'alarm-icon-normal': props.inverter.alarmStatus === 'normal',
  'alarm-icon-alarm': props.inverter.alarmStatus === 'alarm'
}));

const commStatusText = computed(() => 
  props.inverter.communicationStatus === 'online' ? '通讯正常' : '通讯离线'
);

const alarmStatusText = computed(() => 
  props.inverter.alarmStatus === 'normal' ? '无告警' : '有告警'
);

const handleClick = () => {
  emit('click', props.inverter);
};
</script>

<style scoped lang="scss">
.inverter-card {
  position: relative;
  background: rgba(0, 30, 60, 0.8);
  border: 2px solid rgba(0, 212, 255, 0.6);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  min-height: 180px;
  
  // 卡片发光效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      transparent 30%, 
      rgba(0, 212, 255, 0.1) 50%, 
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    border-color: #00d4ff;
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
    transform: translateY(-2px);
    
    &::before {
      opacity: 1;
    }
  }
}

// 状态指示器 - 左上角圆形
.status-indicator {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  z-index: 2;
  
  &.status-normal {
    background: #00ff88;
    box-shadow: 0 0 8px rgba(0, 255, 136, 0.6);
  }
  
  &.status-alarm {
    background: #ffb800;
    box-shadow: 0 0 8px rgba(255, 184, 0, 0.6);
  }
  
  &.status-offline {
    background: #666;
    box-shadow: 0 0 8px rgba(102, 102, 102, 0.6);
  }
}

.card-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  margin-top: 8px; // 为状态指示器留空间
}

.device-name {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 6px;
  line-height: 1.2;
}

.station-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.2;
}

// 闪电图标 - 右上角
.lightning-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
  z-index: 2;
}

.card-body {
  space-y: 8px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
  line-height: 1.4;
  
  .label {
    color: rgba(255, 255, 255, 0.6);
    flex: 0 0 auto;
  }
  
  .value {
    color: #00d4ff;
    font-weight: 600;
    text-align: right;
    flex: 1 1 auto;
    min-width: 0;
    text-shadow: 0 0 4px rgba(0, 212, 255, 0.3);
  }
}
</style>

