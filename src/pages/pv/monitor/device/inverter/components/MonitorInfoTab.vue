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
      <div class="section-title">概览信息</div>
      <div class="data-grid">
        <div class="data-item">
          <div class="label">当日发电量</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.dailyGeneration) }}kWh</div>
        </div>
        <div class="data-item">
          <div class="label">昨日发电量</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.yesterdayGeneration) }}kWh</div>
        </div>
        <div class="data-item">
          <div class="label">当月发电量</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.monthlyGeneration) }}kWh</div>
        </div>
        <div class="data-item">
          <div class="label">上月发电量</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.lastMonthGeneration) }}kWh</div>
        </div>
        <div class="data-item">
          <div class="label">当年发电量</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.yearlyGeneration) }}kWh</div>
        </div>
        <div class="data-item">
          <div class="label">去年发电量</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.lastYearGeneration) }}kWh</div>
        </div>
        <div class="data-item">
          <div class="label">总发电量</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.totalGeneration) }}kWh</div>
        </div>
        <div class="data-item">
          <div class="label">总有功功率</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.totalActivePower) }}kW</div>
        </div>
        <div class="data-item">
          <div class="label">总直流功率</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.totalDcPower) }}kW</div>
        </div>
        <div class="data-item">
          <div class="label">直流电压_1</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.dcVoltage1) }}V</div>
        </div>
        <div class="data-item">
          <div class="label">直流电流_1</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.dcCurrent1) }}A</div>
        </div>
        <div class="data-item">
          <div class="label">直流电压_2</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.dcVoltage2) }}V</div>
        </div>
        <div class="data-item">
          <div class="label">直流电流_2</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.dcCurrent2) }}A</div>
        </div>
        <div class="data-item">
          <div class="label">直流电压_3</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.dcVoltage3) }}V</div>
        </div>
        <div class="data-item">
          <div class="label">直流电流_3</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.dcCurrent3) }}A</div>
        </div>
        <div class="data-item">
          <div class="label">直流电压_4</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.dcVoltage4) }}V</div>
        </div>
        <div class="data-item">
          <div class="label">直流电流_4</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.dcCurrent4) }}A</div>
        </div>
        <div class="data-item">
          <div class="label">直流母线电压</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.dcBusVoltage) }}V</div>
        </div>
        <div class="data-item">
          <div class="label">AB线电压</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.acVoltageAB) }}V</div>
        </div>
        <div class="data-item">
          <div class="label">BC线电压</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.acVoltageBC) }}V</div>
        </div>
        <div class="data-item">
          <div class="label">CA线电压</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.acVoltageCA) }}V</div>
        </div>
        <div class="data-item">
          <div class="label">A相电流</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.acCurrentA) }}A</div>
        </div>
        <div class="data-item">
          <div class="label">B相电流</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.acCurrentB) }}A</div>
        </div>
        <div class="data-item">
          <div class="label">C相电流</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.acCurrentC) }}A</div>
        </div>
        <div class="data-item">
          <div class="label">逆变器温度</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.inverterTemperature) }}℃</div>
        </div>
        <div class="data-item">
          <div class="label">电网频率</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.gridFrequency) }}Hz</div>
        </div>
        <div class="data-item">
          <div class="label">总无功功率</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.totalReactivePower) }}kVar</div>
        </div>
        <div class="data-item">
          <div class="label">总视在功率</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.totalApparentPower) }}kVA</div>
        </div>
        <div class="data-item">
          <div class="label">总功率因数</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.totalPowerFactor) }}</div>
        </div>
        <div class="data-item">
          <div class="label">接地阻抗值</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.groundImpedance) }}kΩ</div>
        </div>
        <div class="data-item">
          <div class="label">交流NTC模块温度</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.acNtcTemperature) }}℃</div>
        </div>
        <div class="data-item">
          <div class="label">PV总电压</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.pvTotalVoltage) }}V</div>
        </div>
        <div class="data-item">
          <div class="label">PV总电流</div>
          <div class="value">{{ formatNumber(monitoringData?.overview.pvTotalCurrent) }}A</div>
        </div>
      </div>
    </div>

    <!-- PV信息 -->
    <div class="pv-section">
      <div class="section-title">PV信息</div>
      <div class="data-grid">
        <div v-for="i in 20" :key="`pv-current-${i}`" class="data-item">
          <div class="label">PV电流_{{ i }}</div>
          <div class="value">{{ formatNumber(monitoringData?.pvInfo[`pvCurrent${i}` as keyof typeof monitoringData.pvInfo]) }}A</div>
        </div>
        <div v-for="i in 10" :key="`pv-voltage-${i}`" class="data-item">
          <div class="label">PV电压_{{ i }}</div>
          <div class="value">{{ formatNumber(monitoringData?.pvInfo[`pvVoltage${i}` as keyof typeof monitoringData.pvInfo]) }}V</div>
        </div>
      </div>
    </div>

    <!-- 状态信息 -->
    <div class="status-section">
      <div class="section-title">状态信息</div>
      <div class="status-table-wrapper">
        <el-table :data="statusTableData" border stripe>
          <el-table-column label="状态名称" prop="label" width="200" />
          <el-table-column label="-" width="80" align="center">
            <template #default="{ row }">
              <span class="status-indicator normal" v-if="row.value !== 0 && row.value !== 1">-</span>
            </template>
          </el-table-column>
          <el-table-column label="0" width="80" align="center">
            <template #default="{ row }">
              <span class="status-indicator" :class="{ active: row.value === 0 }">{{ row.value === 0 ? '0' : '' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="1" width="80" align="center">
            <template #default="{ row }">
              <span class="status-indicator" :class="{ active: row.value === 1 }">{{ row.value === 1 ? '1' : '' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Connection, Refresh, Grid } from '@element-plus/icons-vue';
import { getMonitoringData } from '@/api/device/inverterDetail';
import type { MonitoringData } from '@/api/types/device/inverterDetail';

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

// 状态表格数据
const statusTableData = computed(() => {
  if (!monitoringData.value) return [];
  
  const statusInfo = monitoringData.value.statusInfo;
  const statusLabels = {
    commInterrupt: '设备通讯中断',
    normalRunning: '正常运行',
    initialStandby: '初始待机',
    standby: '待机',
    deratedOperation: '降额运行',
    limitedOperation: '限额运行',
    controlShutdown: '控制关机',
    faultShutdown: '故障停机',
    gridSurge: '电网浪涌(Warn)',
    internalFanFault: '内部风扇异常',
    externalFanFault: '外部风扇异常',
    dcSpdFail: '直流防雷异常(DcSpdFail)',
    vgSpdFail: '电网防雷异常(VgSpdFail)',
    phaseGroundAlarm: '相线接地告警',
    gridOverVoltage: '电网过压',
    gridUnderVoltage: '电网欠压',
    overloadDerating: '过载降压',
    gridOverFrequency: '电网过频',
    gridUnderFrequency: '电网欠频',
    gridReverse: '电网逆流',
    noGrid: '无电网',
    gridImbalance: '电网不平衡',
    gridFreqJitter: '电网频率抖动',
    gridOverCurrent: '电网过流',
    gridCurrentTrackFault: '电网电流跟踪故障',
    dcOverVoltage: '直流过压',
    dcBusOverVoltage: '直流母线过压',
    dcBusImbalance1: '直流母线不均压_1',
    dcBusUnderVoltage: '直流母线欠压',
    dcBusImbalance2: '直流母线不均压_2',
    dcAOverCurrent: '直流A路过流',
    dcBOverCurrent: '直流B路过流',
    dcInputDisturbance: '直流输入扰动',
    dcReverse: '直流反接',
    busVoltageInconsistent: '母线电压不一致',
    gridDisturbance1: '电网扰动_1',
    dspInitProtect: 'DSP初始化保护',
    inverterOverTemp: '逆变器过温保护',
    pvInsulationFault: 'PV绝缘故障',
    leakageCurrentProtect: '漏电流保护',
    relayCheckProtect: '继电器(Relay)检测保护',
    dcComponentExcess: '直流分量过大',
    leakageCurrentSelfCheck: '漏电流自检保护',
    underTempProtect: '欠温保护',
    arcSelfCheck: '电弧自检保护',
    arcFault: '电弧故障',
    dspSelfCheckFault: 'DSP自检异常',
    gridDisturbance2: '电网扰动_2',
    gridCurrentSampleFault: '电网电流采样异常',
    igbtOverCurrent: 'IGBT过流'
  };
  
  return Object.entries(statusLabels).map(([key, label]) => ({
    label,
    value: statusInfo[key as keyof typeof statusInfo]
  }));
});

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

.status-table-wrapper {
  :deep(.el-table) {
    background: rgba(0, 30, 60, 0.4);
    color: rgba(255, 255, 255, 0.85);

    th {
      background: rgba(0, 212, 255, 0.1);
      color: rgba(255, 255, 255, 0.85);
      border-color: rgba(0, 212, 255, 0.2);
    }

    td {
      border-color: rgba(0, 212, 255, 0.1);
    }

    .el-table__row--striped {
      background: rgba(0, 20, 40, 0.5);
    }

    &::before {
      display: none;
    }
  }

  .status-indicator {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;

    &.active {
      background: rgba(0, 212, 255, 0.3);
      color: #00d4ff;
      border: 1px solid #00d4ff;
    }

    &.normal {
      color: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>

