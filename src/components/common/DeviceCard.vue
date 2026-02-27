<template>
  <div 
    class="device-card" 
    :class="{ 'is-online': device.status === 'online', 'is-offline': device.status === 'offline' }"
    @click="handleClick"
  >
    <!-- 状态指示器 -->
    <div class="status-indicator">
      <div class="status-dot" :class="`status-${device.status}`"></div>
    </div>
    
    <!-- 设备标题 -->
    <div class="device-header">
      <div class="device-title">{{ device.name }}</div>
      <div class="device-location">{{ device.location }}</div>
    </div>
    
    <!-- 设备信息 -->
    <div class="device-info">
      <div class="info-item">
        <span class="info-label">{{ device.rateLabel || '电表倍率' }}:</span>
        <span class="info-value">{{ device.rateValue || device.ratio }}</span>
      </div>
    </div>
    
    <!-- 实时数据区域 -->
    <div class="data-section">
      <!-- 主要数据 -->
      <div class="main-data">
        <div class="energy-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- 正向功率数据 -->
        <div class="energy-group">
          <div class="energy-item">
            <span class="energy-label">正向有功电能(kWh):</span>
            <span class="energy-value">{{ formatNumber(device.forwardActiveEnergy) }}</span>
          </div>
          <div class="energy-item">
            <span class="energy-label">反向有功电能(kWh):</span>
            <span class="energy-value">{{ formatNumber(device.reverseActiveEnergy) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 无功功率数据 -->
      <div class="reactive-data">
        <div class="energy-item">
          <span class="energy-label">正向无功电能(kVarh):</span>
          <span class="energy-value">{{ formatNumber(device.forwardReactiveEnergy) || '-' }}</span>
        </div>
        <div class="energy-item">
          <span class="energy-label">反向无功电能(kVarh):</span>
          <span class="energy-value">{{ formatNumber(device.reverseReactiveEnergy) || '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 设备数据接口
interface DeviceData {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  ratio?: string | number;
  rateLabel?: string;
  rateValue?: string | number;
  forwardActiveEnergy?: number | string;
  reverseActiveEnergy?: number | string;
  forwardReactiveEnergy?: number | string;
  reverseReactiveEnergy?: number | string;
  [key: string]: any; // 允许额外属性
}

interface Props {
  device: DeviceData;
}

interface Emits {
  (e: 'click', device: DeviceData): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

// 格式化数字显示
const formatNumber = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === '') return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// 处理卡片点击
const handleClick = () => {
  const props = defineProps<Props>();
  emit('click', props.device);
};
</script>

<style scoped lang="scss">
.device-card {
  position: relative;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.8) 0%, rgba(0, 50, 100, 0.6) 100%);
  border: 1px solid rgba(57, 182, 247, 0.3);
  border-radius: 8px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  min-height: 280px;
  
  // 卡片悬停效果
  &:hover {
    border-color: rgba(57, 182, 247, 0.6);
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(0, 212, 255, 0.15),
      0 0 20px rgba(57, 182, 247, 0.1);
  }
  
  // 在线状态
  &.is-online {
    border-color: rgba(0, 255, 136, 0.4);
    
    &:hover {
      border-color: rgba(0, 255, 136, 0.6);
      box-shadow: 
        0 8px 25px rgba(0, 255, 136, 0.15),
        0 0 20px rgba(0, 255, 136, 0.1);
    }
  }
  
  // 离线状态
  &.is-offline {
    border-color: rgba(255, 68, 68, 0.4);
    
    &:hover {
      border-color: rgba(255, 68, 68, 0.6);
    }
  }
}

.status-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  
  &.status-online {
    background: #00ff88;
    box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
  }
  
  &.status-offline {
    background: #666;
    box-shadow: 0 0 8px rgba(102, 102, 102, 0.3);
  }
}

.device-header {
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(57, 182, 247, 0.2);
}

.device-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  line-height: 1.4;
}

.device-location {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.3;
}

.device-info {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(57, 182, 247, 0.15);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .info-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
  }
  
  .info-value {
    font-size: 14px;
    font-weight: 500;
    color: #00d4ff;
  }
}

.data-section {
  padding: 16px;
}

.main-data {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.energy-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 212, 255, 0.15);
  border-radius: 8px;
  color: #00d4ff;
  
  svg {
    width: 20px;
    height: 20px;
  }
}

.energy-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reactive-data {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.energy-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .energy-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.3;
  }
  
  .energy-value {
    font-size: 14px;
    font-weight: 600;
    color: #00d4ff;
    line-height: 1.2;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .device-card {
    min-height: 260px;
  }
  
  .device-title {
    font-size: 15px;
  }
  
  .energy-item .energy-value {
    font-size: 13px;
  }
}
</style>
