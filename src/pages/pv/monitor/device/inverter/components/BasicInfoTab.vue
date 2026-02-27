<template>
  <div v-loading="loading" class="basic-info-tab">
    <!-- 设备基本信息 -->
    <div class="basic-info-section">
      <div class="info-grid">
        <div class="info-item">
          <span class="label">设备名称</span>
          <span class="value">{{ basicInfo?.deviceName }}</span>
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
            {{ basicInfo?.parentDeviceStatus }}
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
            {{ basicInfo?.connectionStatus }}
          </span>
        </div>
      </div>
    </div>

    <!-- 属性信息 -->
    <div class="attributes-section">
      <div class="section-title">属性信息</div>
      <el-table :data="properties" border stripe>
        <el-table-column prop="propertyId" label="属性编号" width="100" />
        <el-table-column prop="propertyName" label="属性名称" min-width="150" />
        <el-table-column prop="propertyType" label="属性类型" width="120" />
        <el-table-column prop="propertyValue" label="属性值" min-width="150" />
      </el-table>
    </div>

    <!-- 组串详情 -->
    <div class="strings-section">
      <div class="section-title">组串详情</div>
      <el-table :data="strings" border stripe>
        <el-table-column prop="stringName" label="组串" width="150" />
        <el-table-column label="配置启用状态" width="150">
          <template #default="{ row }">
            <el-tag :type="row.enableStatus === 'enabled' ? 'success' : 'info'">
              {{ row.enableStatus === 'enabled' ? '已启用' : '未启用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="realtimeCurrent" label="实时电流(A)" width="150" align="right">
          <template #default="{ row }">
            {{ row.realtimeCurrent.toFixed(1) }}
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="组串容量(Wp)" min-width="150" align="right">
          <template #default="{ row }">
            {{ row.capacity.toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getDeviceBasicInfo, getProperties, getStrings } from '@/api/device/inverterDetail';
import type { DeviceBasicInfo, PropertyInfo, StringInfo } from '@/api/types/device/inverterDetail';

interface Props {
  deviceId: string;
}

const props = defineProps<Props>();

const loading = ref(false);
const basicInfo = ref<DeviceBasicInfo | null>(null);
const properties = ref<PropertyInfo[]>([]);
const strings = ref<StringInfo[]>([]);

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // 并行加载所有数据
    const [basicInfoData, propertiesData, stringsData] = await Promise.all([
      getDeviceBasicInfo(props.deviceId),
      getProperties(props.deviceId),
      getStrings(props.deviceId)
    ]);
    
    basicInfo.value = basicInfoData;
    properties.value = propertiesData.properties;
    strings.value = stringsData.strings;
  } catch (error) {
    console.error('加载基础信息失败:', error);
    ElMessage.error('加载基础信息失败');
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

<style scoped lang="scss">
.basic-info-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.basic-info-section {
  padding: 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
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

  &.full-width {
    grid-column: 1 / -1;
  }

  .label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .value {
    font-size: 14px;
    color: #fff;

    &.在线 {
      color: #67c23a;
    }

    &.离线 {
      color: #909399;
    }
  }
}

.attributes-section,
.strings-section {
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

</style>

