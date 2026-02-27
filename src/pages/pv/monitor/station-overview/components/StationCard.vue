<template>
  <div class="station-card" @click="handleClick">
    <!-- 头部: 电站名称 + 状态 -->
    <div class="card-header">
      <div class="station-info">
        <div class="station-name" :title="station.name">{{ station.name }}</div>
        <div class="station-capacity">装机容量: {{ station.capacity.toFixed(2) }} kWp</div>
      </div>

      <div class="status-info">
        <div class="comm-status" :class="`status-${station.commStatus}`">
          <el-icon><Connection /></el-icon>
          <span>{{ getCommStatusText(station.commStatus) }}</span>
        </div>

        <div class="alarm-status" :class="`status-${station.alarmStatus}`">
          <el-icon>
            <Check v-if="station.alarmStatus === 'none'" />
            <Warning v-else />
          </el-icon>
          <span>{{ getAlarmStatusText(station.alarmStatus) }}</span>
        </div>
      </div>
    </div>

    <!-- 指标区: 动态展示设备监测数据 -->
    <div class="card-metrics" :class="{ 'has-many-metrics': displayMetrics.length > 4 }">
      <div 
        v-for="(metric, index) in displayMetrics" 
        :key="index" 
        class="metric-item"
      >
        <div class="metric-label">{{ metric.name }}</div>
        <div class="metric-value">
          {{ metric.totalAmount }}
        </div>
      </div>
      
      <!-- 如果没有设备监测数据，显示默认提示 -->
      <div v-if="displayMetrics.length === 0" class="metric-empty">
        <span>暂无监测数据</span>
      </div>
    </div>

    <!-- 功率趋势图 -->
    <div class="card-chart">
      <PowerTrendChart :data="station.powerTrend" />
    </div>

    <!-- 底部: 功率来源 + 设备统计 -->
    <div class="card-footer">
      <div class="footer-main">
        <div class="power-source">功率来源: {{ station.powerSource }}</div>

        <div class="device-stats">
          <div class="stat-item">
            <el-icon><Monitor /></el-icon>
            <span>{{ station.deviceCount.total }}</span>
          </div>

          <div v-if="station.deviceCount.offline > 0" class="stat-item offline">
            <el-icon><Warning /></el-icon>
            <span>{{ station.deviceCount.offline }}</span>
          </div>
        </div>
      </div>

      <!-- 告警信息 -->
      <div v-if="station.latestAlarm" class="alarm-message">
        <span class="label">最新告警:</span>
        <span class="message">{{ station.latestAlarm }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Connection, Check, Warning, Monitor } from '@element-plus/icons-vue'
import PowerTrendChart from './PowerTrendChart.vue'
import type { StationData, DeviceMetric } from '@/types/station'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  station: StationData
}>()

const emit = defineEmits<{
  click: [station: StationData]
}>()

// 移动端检测
const isMobile = ref(false)

// 检测是否为移动端
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
})

// 计算要显示的指标数据
const displayMetrics = computed<DeviceMetric[]>(() => {
  if (props.station.deviceMetrics && props.station.deviceMetrics.length > 0) {
    // 如果有真实的设备监测数据，显示全部
    return props.station.deviceMetrics
  }
  
  // 如果没有设备监测数据，返回空数组（显示"暂无监测数据"）
  return []
})

// 获取通讯状态文本
const getCommStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    normal: '通讯正常',
    partial_offline: '部分设备离线',
    all_offline: '全部设备离线',
    connecting: '接入中',
  }
  return statusMap[status] || '未知'
}

// 获取告警状态文本
const getAlarmStatusText = (status: string) => {
  return status === 'none' ? '无告警' : '有告警'
}

// 点击卡片
const handleClick = () => {
  emit('click', props.station)
}
</script>

<style scoped lang="scss">
.station-card {
  background: rgba(10, 24, 45, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 420px;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: rgba(0, 212, 255, 0.6);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
    transform: translateY(-2px);
  }
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    padding: 16px;
    min-height: 360px;
    border-radius: 6px;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    min-height: 320px;
    border-radius: 4px;
  }
}

// 头部
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding-bottom: 10px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 10px;
    padding-bottom: 8px;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .station-info {
    flex: 1;
    min-width: 0;

    .station-name {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      @media (max-width: 768px) {
        font-size: 15px;
      }
      
      @media (max-width: 480px) {
        font-size: 14px;
      }
    }

    .station-capacity {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.65);
      
      @media (max-width: 480px) {
        font-size: 11px;
      }
    }
  }

  .status-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex-shrink: 0;
    
    @media (max-width: 480px) {
      flex-direction: row;
      justify-content: space-between;
      gap: 8px;
    }

    .comm-status,
    .alarm-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 3px;

      .el-icon {
        font-size: 14px;
      }
      
      @media (max-width: 768px) {
        font-size: 11px;
        padding: 2px 6px;
        
        .el-icon {
          font-size: 12px;
        }
      }
      
      @media (max-width: 480px) {
        font-size: 10px;
        padding: 1px 4px;
        flex: 1;
        justify-content: center;
        
        .el-icon {
          font-size: 11px;
        }
      }
    }

    // 通讯状态颜色
    .status-normal {
      color: #67c23a;
      background: rgba(103, 194, 58, 0.1);

      .el-icon {
        color: #67c23a;
      }
    }

    .status-partial_offline {
      color: #e6a23c;
      background: rgba(230, 162, 60, 0.1);

      .el-icon {
        color: #e6a23c;
      }
    }

    .status-all_offline {
      color: #f56c6c;
      background: rgba(245, 108, 108, 0.1);

      .el-icon {
        color: #f56c6c;
      }
    }

    .status-connecting {
      color: #909399;
      background: rgba(144, 147, 153, 0.1);

      .el-icon {
        color: #909399;
      }
    }

    // 告警状态颜色
    .status-none {
      color: #67c23a;
      background: rgba(103, 194, 58, 0.1);

      .el-icon {
        color: #67c23a;
      }
    }

    .status-has_alarm {
      color: #f56c6c;
      background: rgba(245, 108, 108, 0.1);

      .el-icon {
        color: #f56c6c;
      }
    }
  }
}

// 指标区
.card-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  min-height: 100px;
  
  /* 如果指标超过4个，自动调整为3列 */
  &.has-many-metrics {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    
    .metric-item {
      .metric-label {
        font-size: 11px;
      }
      
      .metric-value {
        font-size: 18px;
      }
    }
  }
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 12px;
    min-height: 80px;
    
    &.has-many-metrics {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 10px;
    min-height: 60px;
  }

  .metric-item {
    .metric-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.65);
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      
      @media (max-width: 768px) {
        font-size: 11px;
        margin-bottom: 4px;
      }
      
      @media (max-width: 480px) {
        font-size: 10px;
        margin-bottom: 3px;
      }
    }

    .metric-value {
      font-size: 20px;
      font-weight: 600;
      color: #00d4ff;
      line-height: 1.2;
      word-break: break-all;
      
      @media (max-width: 768px) {
        font-size: 18px;
      }
      
      @media (max-width: 480px) {
        font-size: 16px;
      }
    }
  }
  
  .metric-empty {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    color: rgba(255, 255, 255, 0.45);
    font-size: 14px;
    
    @media (max-width: 768px) {
      padding: 20px;
      font-size: 13px;
    }
    
    @media (max-width: 480px) {
      padding: 16px;
      font-size: 12px;
    }
  }
}

// 图表区
.card-chart {
  flex: 1;
  margin-bottom: 12px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
  padding: 8px;
  background: rgba(5, 12, 25, 0.3);
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    margin-bottom: 10px;
    padding: 6px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 8px;
    padding: 4px;
    border-radius: 3px;
  }
}

// 底部
.card-footer {
  padding-top: 12px;
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    padding-top: 10px;
  }
  
  @media (max-width: 480px) {
    padding-top: 8px;
  }

  .footer-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .power-source {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.65);
      
      @media (max-width: 768px) {
        font-size: 11px;
      }
      
      @media (max-width: 480px) {
        font-size: 10px;
      }
    }

    .device-stats {
      display: flex;
      gap: 12px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.85);

        .el-icon {
          font-size: 16px;
        }

        &.offline {
          color: #e6a23c;

          .el-icon {
            color: #e6a23c;
          }
        }
        
        @media (max-width: 768px) {
          font-size: 11px;
          gap: 3px;
          
          .el-icon {
            font-size: 14px;
          }
        }
        
        @media (max-width: 480px) {
          font-size: 10px;
          gap: 2px;
          
          .el-icon {
            font-size: 12px;
          }
        }
      }
      
      @media (max-width: 768px) {
        gap: 10px;
      }
      
      @media (max-width: 480px) {
        gap: 8px;
      }
    }
    
    @media (max-width: 768px) {
      margin-bottom: 6px;
    }
    
    @media (max-width: 480px) {
      margin-bottom: 4px;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }

  .alarm-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(245, 108, 108, 0.1);
    border: 1px solid rgba(245, 108, 108, 0.3);
    border-radius: 4px;
    font-size: 12px;

    .label {
      color: rgba(255, 255, 255, 0.65);
    }

    .message {
      color: #f56c6c;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      padding: 6px 10px;
      gap: 6px;
      font-size: 11px;
    }
    
    @media (max-width: 480px) {
      padding: 4px 8px;
      gap: 4px;
      font-size: 10px;
      border-radius: 3px;
    }
  }
}
</style>

