<template>
  <el-dialog
    v-model="visible"
    :title="detail?.basicInfo.deviceName || '设备详情'"
    width="800px"
    @close="handleClose"
  >
    <div v-if="loading" class="detail-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    
    <div v-else-if="detail" class="detail-content">
      <!-- 概览信息 -->
      <div class="overview-section">
        <div class="section-title">概览信息</div>
        <div class="overview-grid">
          <div class="overview-item">
            <div class="item-label">当日发电量</div>
            <div class="item-value">{{ detail.statistics.dailyEnergy }}kWh</div>
          </div>
          <div class="overview-item">
            <div class="item-label">昨日发电量</div>
            <div class="item-value">{{ detail.statistics.yesterdayEnergy }}kWh</div>
          </div>
          <div class="overview-item">
            <div class="item-label">当月发电量</div>
            <div class="item-value">{{ detail.statistics.monthlyEnergy }}kWh</div>
          </div>
          <div class="overview-item">
            <div class="item-label">上月发电量</div>
            <div class="item-value">{{ detail.statistics.lastMonthEnergy }}kWh</div>
          </div>
          <div class="overview-item">
            <div class="item-label">当年发电量</div>
            <div class="item-value">{{ detail.statistics.yearlyEnergy }}kWh</div>
          </div>
          <div class="overview-item">
            <div class="item-label">日等效时</div>
            <div class="item-value">{{ detail.statistics.dailyEquivalentHours }}h</div>
          </div>
        </div>
      </div>
      
      <!-- 基本信息 -->
      <div class="info-section">
        <div class="section-title">基本信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">设备名称:</span>
            <span class="info-value">{{ detail.basicInfo.deviceName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">设备编号:</span>
            <span class="info-value">{{ detail.basicInfo.deviceCode }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">所属电站:</span>
            <span class="info-value">{{ detail.basicInfo.stationName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">制造商:</span>
            <span class="info-value">{{ detail.basicInfo.manufacturer }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">设备型号:</span>
            <span class="info-value">{{ detail.basicInfo.model }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">装机容量:</span>
            <span class="info-value">{{ detail.basicInfo.installedCapacity }}kWp</span>
          </div>
          <div class="info-item">
            <span class="info-label">投运日期:</span>
            <span class="info-value">{{ detail.basicInfo.commissionDate }}</span>
          </div>
        </div>
      </div>
      
      <!-- 实时数据 -->
      <div class="realtime-section">
        <div class="section-title">实时数据</div>
        <div class="realtime-grid">
          <div class="realtime-item">
            <span class="item-label">实时功率:</span>
            <span class="item-value">{{ detail.realtimeData.power }}kW</span>
          </div>
          <div class="realtime-item">
            <span class="item-label">效率:</span>
            <span class="item-value">{{ detail.realtimeData.efficiency }}%</span>
          </div>
          <div class="realtime-item">
            <span class="item-label">功率因数:</span>
            <span class="item-value">{{ detail.realtimeData.powerFactor }}</span>
          </div>
          <div class="realtime-item">
            <span class="item-label">直流电压:</span>
            <span class="item-value">{{ detail.realtimeData.dcVoltage }}V</span>
          </div>
          <div class="realtime-item">
            <span class="item-label">直流电流:</span>
            <span class="item-value">{{ detail.realtimeData.dcCurrent }}A</span>
          </div>
          <div class="realtime-item">
            <span class="item-label">交流电压:</span>
            <span class="item-value">{{ detail.realtimeData.acVoltage }}V</span>
          </div>
          <div class="realtime-item">
            <span class="item-label">交流电流:</span>
            <span class="item-value">{{ detail.realtimeData.acCurrent }}A</span>
          </div>
          <div class="realtime-item">
            <span class="item-label">频率:</span>
            <span class="item-value">{{ detail.realtimeData.frequency }}Hz</span>
          </div>
          <div class="realtime-item">
            <span class="item-label">温度:</span>
            <span class="item-value">{{ detail.realtimeData.temperature }}℃</span>
          </div>
        </div>
      </div>
      
      <!-- 运行状态 -->
      <div class="status-section">
        <div class="section-title">运行状态</div>
        <div class="status-grid">
          <div class="status-item">
            <span class="item-label">运行状态:</span>
            <span class="item-value" :class="runStatusClass">{{ runStatusText }}</span>
          </div>
          <div class="status-item">
            <span class="item-label">通讯状态:</span>
            <span class="item-value" :class="commStatusClass">{{ commStatusText }}</span>
          </div>
          <div class="status-item">
            <span class="item-label">告警状态:</span>
            <span class="item-value" :class="alarmStatusClass">{{ alarmStatusText }}</span>
          </div>
          <div class="status-item">
            <span class="item-label">告警数量:</span>
            <span class="item-value">{{ detail.status.alarmCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { getInverterDetail } from '@/api/device/inverter';
import type { InverterDetail } from '@/api/types/device/inverter';

interface Props {
  deviceId: string | null;
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const loading = ref(false);
const detail = ref<InverterDetail | null>(null);

const runStatusClass = computed(() => ({
  'status-running': detail.value?.status.runStatus === 'running',
  'status-offline': detail.value?.status.runStatus === 'offline'
}));

const commStatusClass = computed(() => ({
  'status-online': detail.value?.status.commStatus === 'online',
  'status-offline': detail.value?.status.commStatus === 'offline'
}));

const alarmStatusClass = computed(() => ({
  'status-normal': detail.value?.status.alarmStatus === 'normal',
  'status-alarm': detail.value?.status.alarmStatus === 'alarm'
}));

const runStatusText = computed(() => 
  detail.value?.status.runStatus === 'running' ? '运行中' : '离线'
);

const commStatusText = computed(() => 
  detail.value?.status.commStatus === 'online' ? '在线' : '离线'
);

const alarmStatusText = computed(() => 
  detail.value?.status.alarmStatus === 'normal' ? '正常' : '告警'
);

const loadDetail = async () => {
  if (!props.deviceId) return;
  
  loading.value = true;
  try {
    detail.value = await getInverterDetail(props.deviceId);
  } catch (error) {
    console.error('加载设备详情失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  detail.value = null;
};

watch(() => props.deviceId, (newId) => {
  if (newId && visible.value) {
    loadDetail();
  }
}, { immediate: true });

watch(visible, (newVisible) => {
  if (newVisible && props.deviceId) {
    loadDetail();
  }
});
</script>

<style scoped lang="scss">
.detail-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
  color: #00d4ff;
  
  .el-icon {
    font-size: 48px;
  }
}

.detail-content {
  max-height: 70vh;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 3px;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #00d4ff;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
}

.overview-section {
  margin-bottom: 24px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.overview-item {
  background: rgba(0, 20, 40, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 6px;
  padding: 16px;
  text-align: center;
  
  .item-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 8px;
  }
  
  .item-value {
    font-size: 20px;
    font-weight: 500;
    color: #00d4ff;
  }
}

.info-section,
.realtime-section,
.status-section {
  margin-bottom: 24px;
}

.info-grid,
.realtime-grid,
.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item,
.realtime-item,
.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(0, 20, 40, 0.3);
  border-radius: 4px;
  font-size: 14px;
  
  .info-label,
  .item-label {
    color: rgba(255, 255, 255, 0.6);
  }
  
  .info-value,
  .item-value {
    color: #fff;
    font-weight: 500;
  }
}

.status-running,
.status-online,
.status-normal {
  color: #00ff88 !important;
}

.status-offline {
  color: #999 !important;
}

.status-alarm {
  color: #ffb800 !important;
}
</style>

