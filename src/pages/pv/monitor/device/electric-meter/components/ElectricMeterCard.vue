<template>
  <div class="electric-meter-card" @click="handleClick">
    <div class="card-header">
      <div class="device-name">{{ meter.deviceName }}</div>
      <div class="station-name">{{ meter.stationName }}</div>
    </div>
    
    <div class="card-body">
      <div class="metric-row">
        <span class="label">电表倍率:</span>
        <span class="value">{{ meter.meterRatio }}</span>
      </div>
      <div class="metric-row">
        <span class="label">电表类型:</span>
        <span class="value">{{ meterTypeText }}</span>
      </div>
      <div class="metric-row">
        <span class="label">有功功率(kW):</span>
        <span class="value">{{ meter.activePower }}</span>
      </div>
      <div class="metric-row">
        <span class="label">正向有功电能(kWh):</span>
        <span class="value">{{ meter.forwardActiveEnergy }}</span>
      </div>
      <div class="metric-row">
        <span class="label">反向有功电能(kWh):</span>
        <span class="value">{{ meter.reverseActiveEnergy }}</span>
      </div>
    </div>
    
    <div class="card-footer">
      <el-icon :class="commIconClass" :title="commStatusText">
        <Connection />
      </el-icon>
      <el-icon :class="alarmIconClass" :title="alarmStatusText">
        <Bell />
      </el-icon>
      <el-button size="small" type="primary" @click.stop="handleConfigClick">
        电表配置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Connection, Bell } from '@element-plus/icons-vue';
import type { ElectricMeterData } from '@/api/types/device/electricMeter';

interface Props {
  meter: ElectricMeterData;
}

interface Emits {
  (e: 'click', meter: ElectricMeterData): void;
  (e: 'config', meter: ElectricMeterData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const meterTypeText = computed(() => 
  props.meter.meterType === 'AC' ? '交流' : '直流'
);

const commIconClass = computed(() => ({
  'comm-icon': true,
  'comm-icon-online': props.meter.communicationStatus === 'online',
  'comm-icon-offline': props.meter.communicationStatus === 'offline'
}));

const alarmIconClass = computed(() => ({
  'alarm-icon': true,
  'alarm-icon-normal': props.meter.alarmStatus === 'normal',
  'alarm-icon-alarm': props.meter.alarmStatus === 'alarm'
}));

const commStatusText = computed(() => 
  props.meter.communicationStatus === 'online' ? '通讯正常' : '通讯离线'
);

const alarmStatusText = computed(() => 
  props.meter.alarmStatus === 'normal' ? '无告警' : '有告警'
);

const handleClick = () => {
  emit('click', props.meter);
};

const handleConfigClick = () => {
  emit('config', props.meter);
};
</script>

<style scoped lang="scss">
.electric-meter-card {
  background: rgba(0, 20, 40, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #00d4ff;
    background: rgba(0, 20, 40, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
  }
}

.card-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.device-name {
  font-size: 16px;
  font-weight: 500;
  color: #00d4ff;
  margin-bottom: 8px;
}

.station-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.card-body {
  margin-bottom: 12px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
  
  .label {
    color: rgba(255, 255, 255, 0.6);
  }
  
  .value {
    color: #fff;
    font-weight: 500;
  }
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  
  .el-icon {
    font-size: 18px;
    cursor: help;
  }
  
  .el-button {
    margin-left: auto;
  }
}

.comm-icon-online {
  color: #00ff88;
}

.comm-icon-offline {
  color: #999;
}

.alarm-icon-normal {
  color: #00d4ff;
}

.alarm-icon-alarm {
  color: #ffb800;
}
</style>

