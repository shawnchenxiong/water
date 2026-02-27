<template>
  <div v-loading="loading" class="basic-info-tab">
    <div class="basic-info-section">
      <div class="info-grid">
        <div class="info-item">
          <span class="label">设备名称</span>
          <span class="value">{{ basicInfo?.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">设备编号</span>
          <span class="value">{{ basicInfo?.deviceCode }}</span>
        </div>
        <div class="info-item">
          <span class="label">设备类型</span>
          <span class="value">{{ basicInfo?.deviceType }}</span>
        </div>
        <div class="info-item">
          <span class="label">产品类型</span>
          <span class="value">{{ basicInfo?.productType }}</span>
        </div>
        <div class="info-item">
          <span class="label">设备厂家</span>
          <span class="value">{{ basicInfo?.manufacturer }}</span>
        </div>
        <div class="info-item">
          <span class="label">上级设备名称</span>
          <span class="value">{{ basicInfo?.parentDeviceName }}</span>
        </div>
        <div class="info-item">
          <span class="label">上级设备状态</span>
          <span class="value" :class="basicInfo?.parentDeviceStatus">
            {{ basicInfo?.parentDeviceStatus === 'online' ? '在线' : '离线' }}
          </span>
        </div>
        <div class="info-item">
          <span class="label">离线时间</span>
          <span class="value">{{ basicInfo?.offlineTime || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">离线时长</span>
          <span class="value">{{ basicInfo?.offlineDuration || '-' }}</span>
        </div>
        <div class="info-item full-width">
          <span class="label">设备位置</span>
          <span class="value">{{ basicInfo?.location }}</span>
        </div>
        <div class="info-item">
          <span class="label">网络组件</span>
          <span class="value">{{ basicInfo?.networkComponent }}</span>
        </div>
        <div class="info-item">
          <span class="label">连接状态</span>
          <span class="value" :class="basicInfo?.connectionStatus">
            {{ basicInfo?.connectionStatus === 'online' ? '在线' : '离线' }}
          </span>
        </div>
      </div>
    </div>

    <div class="attributes-section">
      <div class="section-title">属性信息</div>
      <el-table :data="basicInfo?.attributes" stripe>
        <el-table-column prop="id" label="属性编号" width="100" />
        <el-table-column prop="name" label="属性名称" min-width="150" />
        <el-table-column prop="type" label="属性类型" width="120" />
        <el-table-column prop="value" label="属性值" min-width="150" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { WeatherStationBasicInfo } from '@/api/types/device/weatherStation';
import { fetchBasicInfo } from '@/api/device/weatherStation';

interface Props {
  deviceId: string;
}

const props = defineProps<Props>();

const loading = ref(false);
const basicInfo = ref<WeatherStationBasicInfo | null>(null);

const loadData = async () => {
  loading.value = true;
  try {
    basicInfo.value = await fetchBasicInfo(props.deviceId);
  } catch (error) {
    console.error('Failed to load basic info:', error);
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
.basic-info-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.basic-info-section {
  padding: 16px;
  background: rgba(0, 30, 60, 0.4);
  border-radius: 4px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item .label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.info-item .value {
  font-size: 14px;
  color: #fff;
}

.info-item .value.online {
  color: #67c23a;
}

.info-item .value.offline {
  color: #909399;
}

.attributes-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #00d4ff;
}
</style>

