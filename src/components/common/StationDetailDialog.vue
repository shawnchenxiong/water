<template>
  <el-dialog
    v-model="visible"
    :width="dialogWidth"
    :top="dialogTop"
    custom-class="station-detail-dialog"
    @close="handleClose"
  >
    <!-- 自定义标题 -->
    <template #header>
      <div class="dialog-header">
        <span class="station-name">{{ stationInfo?.name || 'Loading...' }}</span>
      </div>
    </template>

    <!-- Loading 状态 -->
    <div v-if="loading" class="dialog-content loading-content">
      <div class="loading-wrapper">
        <el-icon class="is-loading" :size="40">
          <span class="spinner"></span>
        </el-icon>
        <p>Loading station info...</p>
      </div>
    </div>

    <!-- 数据展示 -->
    <div v-else-if="stationInfo && weatherInfo" class="dialog-content">
      <!-- 顶部信息区 -->
      <div class="top-section">
        <!-- 左侧基本信息 -->
        <div class="info-grid">
          <div class="info-item">
            <span class="label">地理位置：</span>
            <span class="value">{{ stationInfo.location }}</span>
          </div>
          <div class="info-item">
            <span class="label">建设状态：</span>
            <span class="value">{{ stationInfo.status }}</span>
          </div>

          <div class="info-item">
            <span class="label">装机容量：</span>
            <span class="value highlight">{{ stationInfo.capacity }} MWp</span>
          </div>
          <div class="info-item">
            <span class="label">瞬时辐照：</span>
            <span class="value">{{ stationInfo.irradiance }} W/m²</span>
          </div>

          <div class="info-item">
            <span class="label">日辐照量：</span>
            <span class="value">{{ stationInfo.dailyIrradiance }} MJ/m²</span>
          </div>
          <div class="info-item">
            <span class="label">实时功率：</span>
            <span class="value highlight">{{ stationInfo.realPower }} kW</span>
          </div>

          <div class="info-item">
            <span class="label">当日发电量：</span>
            <span class="value highlight">{{ stationInfo.dailyPower }} kWh</span>
          </div>
          <div class="info-item">
            <span class="label">当月发电量：</span>
            <span class="value highlight">{{ stationInfo.monthlyPower }} kWh</span>
          </div>

          <div class="info-item">
            <span class="label">当年发电量：</span>
            <span class="value highlight">{{ stationInfo.yearlyPower }} 万kWh</span>
          </div>
          <div class="info-item">
            <span class="label">累计发电量：</span>
            <span class="value highlight">{{ stationInfo.totalPower }} 万kWh</span>
          </div>
        </div>

        <!-- 右侧能量流动图 -->
        <div class="animation-section">
          <div class="energy-flow">
            <!-- 光伏（上方） -->
            <div class="energy-label pv-label">
              <span class="label-text">光伏</span>
              <span class="label-value">{{ stationInfo.pvPower }} kW</span>
            </div>

            <!-- 用电（左下） -->
            <div class="energy-label consumption-label">
              <span class="label-text">用电</span>
              <span class="label-value">{{ stationInfo.consumption }} kW</span>
            </div>

            <!-- 电网（右下） -->
            <div class="energy-label grid-label">
              <span class="label-text">电网</span>
              <span class="label-value">{{ stationInfo.grid }} kW</span>
            </div>

            <!-- 能量流动精灵图动画 -->
            <div class="sprite-animation"></div>
          </div>
        </div>
      </div>

      <!-- 电站介绍 -->
      <div class="station-intro">
        <div class="section-title">电站介绍:</div>
        <div class="intro-content">
          <div class="intro-image">
            <img :src="stationInfo.image || '/images/morendianzhan.png'" alt="电站图片" />
          </div>
          <div class="intro-text">
            <div v-if="stationInfo.description">{{ stationInfo.description }}</div>
            <div v-else class="placeholder">暂无描述</div>
          </div>
        </div>
      </div>

      <!-- 天气预报 -->
      <div class="weather-section">
        <div class="section-title">天气预报</div>
        <div class="weather-content">
          <!-- 左侧：当前天气状态 -->
          <div class="current-weather">
            <div class="temperature">{{ weatherInfo.current.temperature }}°C</div>
            <div class="weather-item">
              <span>🌬️</span>
              <span>{{ weatherInfo.current.wind }}</span>
            </div>
            <div class="weather-item">
              <span>💨</span>
              <span>{{ weatherInfo.current.windSpeed }}</span>
            </div>
            <div class="weather-item">
              <el-icon><Sunrise /></el-icon>
              <span>{{ weatherInfo.current.sunTime }}</span>
            </div>
          </div>

          <!-- 右侧：多天预报（包括当天） -->
          <div class="forecast-list">
            <!-- 当天预报 -->
            <div class="forecast-item">
              <div class="forecast-date">{{ weatherInfo.current.date }}</div>
              <div class="forecast-icon">
                <el-icon v-if="weatherInfo.current.type === 'sunny'" size="48"><Sunny /></el-icon>
                <el-icon v-else-if="weatherInfo.current.type === 'cloudy'" size="48"
                  ><Cloudy
                /></el-icon>
                <el-icon v-else size="48"><PartlyCloudy /></el-icon>
              </div>
              <div class="forecast-desc">{{ weatherInfo.current.desc }}</div>
              <div class="forecast-temp">{{ weatherInfo.current.tempRange }}</div>
            </div>

            <!-- 未来几天预报 -->
            <div v-for="day in weatherInfo.forecast" :key="day.date" class="forecast-item">
              <div class="forecast-date">{{ day.date }}</div>
              <div class="forecast-icon">
                <el-icon v-if="day.type === 'sunny'" size="48"><Sunny /></el-icon>
                <el-icon v-else-if="day.type === 'cloudy'" size="48"><Cloudy /></el-icon>
                <el-icon v-else size="48"><PartlyCloudy /></el-icon>
              </div>
              <div class="forecast-desc">{{ day.desc }}</div>
              <div class="forecast-temp">{{ day.tempRange }}</div>
            </div>
          </div>
        </div>
        <div class="update-time">
          更新于：{{ weatherInfo.updateTime }}
          <el-icon><RefreshRight /></el-icon>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { Sunny, Sunrise, Cloudy, PartlyCloudy, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getStationFullInfo } from '@/api/stationDetailApi'
import type { StationDetail, WeatherInfo } from '@/api/types/station-detail'

// 响应式窗口尺寸
const { width: windowWidth } = useWindowSize()

// 响应式弹框宽度
const dialogWidth = computed(() => {
  if (windowWidth.value <= 768) {
    return '95%'
  }
  return '700px'
})

// 响应式弹框位置
const dialogTop = computed(() => {
  if (windowWidth.value <= 768) {
    return '5vh'
  }
  return '30px'
})

/**
 * 组件Props
 */
interface Props {
  modelValue: boolean
  stationId: string
}

const props = defineProps<Props>()

/**
 * Emits
 */
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const emit = defineEmits<Emits>()

// 对话框可见性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 数据状态
const loading = ref(false)
const stationInfo = ref<StationDetail | null>(null)
const weatherInfo = ref<WeatherInfo | null>(null)

/**
 * 加载电站信息
 */
const loadStationInfo = async () => {
  if (!props.stationId) {
    return
  }

  loading.value = true

  try {
    const response = await getStationFullInfo(props.stationId)

    if (response.code === 200 && response.data) {
      stationInfo.value = response.data.station
      weatherInfo.value = response.data.weather
    } else {
      ElMessage.error(response.message || 'Failed to load station info')
    }
  } catch (error) {
    console.error('Failed to load station info:', error)
    ElMessage.error('Failed to load station info, please try again later')
  } finally {
    loading.value = false
  }
}

/**
 * 监听弹框打开，加载数据
 */
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && !stationInfo.value) {
      loadStationInfo()
    }
  },
  { immediate: true }
)

/**
 * 关闭对话框
 */
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
// 对话框主体样式
.dialog-content {
  padding: 0;
  color: #ffffff;

  &.loading-content {
    padding: 60px 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    .loading-wrapper {
      text-align: center;

      .el-icon {
        color: var(--el-color-primary);
        margin-bottom: 16px;
      }

      p {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

// 自定义标题
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .station-name {
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
  }

  .pv-power {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);

    .power-value {
      font-size: 18px;
      font-weight: 600;
      color: #f59e0b;
      margin-left: 4px;
    }
  }
}

// 顶部信息区
.top-section {
  display: flex;
  flex-direction: row;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column !important;
    gap: 12px;
  }
}

// 信息网格
.info-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr !important;
    gap: 8px;
    width: 100%;
  }

  .info-item {
    display: flex;
    align-items: center;
    font-size: 14px;

    .label {
      color: rgba(255, 255, 255, 0.7);
      white-space: nowrap;
    }

    .value {
      color: #ffffff;
      margin-left: 8px;

      &.highlight {
        color: var(--el-color-primary);
        font-weight: 600;
      }

      &.warning {
        color: #f59e0b;
      }
    }
  }
}

// 右侧能量流动图
.animation-section {
  width: 300px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    width: 100% !important;
    order: 2;
  }

  .energy-flow {
    position: relative;
    width: 100%;
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;

    .sprite-animation {
      width: 549px;
      height: 284px;
      background-image: url('/images/dongv2.png');
      background-repeat: no-repeat;
      animation: energyFlowAnimation 2.08s steps(1) infinite;
      transform: scale(0.5);
      position: absolute;
    }

    .energy-label {
      position: absolute;
      display: flex;
      flex-direction: row;
      align-items: baseline;
      gap: 4px;
      z-index: 2;

      .label-text {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        white-space: nowrap;
      }

      .label-value {
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
      }
    }

    // 光伏标签（顶部）
    .pv-label {
      top: 5%;
      left: 50%;
      transform: translateX(-50%);

      .label-value {
        color: #f59e0b;
      }
    }

    // 用电标签（左下）
    .consumption-label {
      bottom: 10%;
      left: 0%;

      .label-value {
        color: #10b981;
      }
    }

    // 电网标签（右下）
    .grid-label {
      bottom: 10%;
      right: 0%;

      .label-value {
        color: var(--el-color-primary);
      }
    }
  }
}

// 电站介绍
.station-intro {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12px;
  }

  .intro-content {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: rgba(0, 212, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 4px;

    .intro-image {
      width: 200px;
      height: 120px;
      flex-shrink: 0;
      border-radius: 4px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .intro-text {
      flex: 1;
      display: flex;
      align-items: center;
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.85);

      .placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

// 天气预报
.weather-section {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12px;
  }

  .weather-content {
    display: flex;
    flex-direction: row;
    gap: 16px;
    padding: 16px;
    background: rgba(0, 212, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 4px;

    @media (max-width: 768px) {
      flex-direction: column !important;
      gap: 12px;
      padding: 12px;
      overflow-x: hidden;
    }
  }

  .current-weather {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 12px;
    padding-right: 24px;
    border-right: 1px solid rgba(0, 212, 255, 0.2);
    min-width: 120px;

    .temperature {
      font-size: 40px;
      font-weight: 600;
      color: var(--el-color-primary);
      line-height: 1;
    }

    .weather-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);

      .el-icon {
        font-size: 16px;
        color: var(--el-color-primary);
      }

      span:first-child {
        font-size: 16px;
      }
    }
  }

  .forecast-list {
    flex: 1;
    display: flex;
    gap: 12px;
    padding-left: 24px;

    @media (max-width: 768px) {
      padding-left: 0;
      flex-wrap: wrap;
      gap: 8px;
    }

    .forecast-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 16px 12px;
      background: rgba(0, 212, 255, 0.05);
      border: 1px solid rgba(0, 212, 255, 0.15);
      border-radius: 4px;
      transition: all 0.3s ease;
      min-height: 180px;

      @media (max-width: 768px) {
        // 前3个卡片：每个占 1/3 宽度（第一行）
        flex: 0 0 calc(33.333% - 6px);
        min-height: 140px;
        padding: 12px 8px;
        gap: 8px;

        // 后2个卡片：每个占 1/2 宽度（第二行）
        &:nth-child(n+4) {
          flex: 0 0 calc(50% - 4px);
        }

        .forecast-date {
          font-size: 12px;
        }

        .forecast-icon .el-icon {
          font-size: 32px !important;
        }

        .forecast-desc {
          font-size: 12px;
        }

        .forecast-temp {
          font-size: 10px;
        }
      }

      &:hover {
        background: rgba(0, 212, 255, 0.1);
        border-color: rgba(0, 212, 255, 0.3);
      }

      .forecast-date {
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
      }

      .forecast-icon {
        color: var(--el-color-primary);
        flex-shrink: 0;
      }

      .forecast-desc {
        font-size: 14px;
        font-weight: 500;
        color: #ffffff;
      }

      .forecast-temp {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        white-space: nowrap;
      }
    }
  }

  .update-time {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    margin-top: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);

    .el-icon {
      font-size: 14px;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>

<style lang="scss">
// 全局对话框样式
.station-detail-dialog {
  background: linear-gradient(135deg, rgba(13, 35, 68, 0.95), rgba(13, 35, 68, 0.98)) !important;
  border: 2px solid rgba(0, 212, 255, 0.6) !important;
  border-radius: 12px !important;
  box-shadow:
    0 0 50px rgba(57, 182, 247, 0.4),
    inset 0 0 30px rgba(0, 212, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  position: relative;

  // 左上角装饰
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    width: 40px;
    height: 40px;
    border: 2px solid var(--el-color-primary);
    border-right: none;
    border-bottom: none;
    border-top-left-radius: 12px;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
    z-index: 1;
  }

  // 右上角装饰
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    right: -2px;
    width: 40px;
    height: 40px;
    border: 2px solid var(--el-color-primary);
    border-left: none;
    border-bottom: none;
    border-top-right-radius: 12px;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
    z-index: 1;
  }

  .el-dialog__header {
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    padding: 20px 24px;

    .el-dialog__title {
      font-size: 20px;
      font-weight: 600;
      color: #ffffff !important;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 24px;
      width: 32px;
      height: 32px;

      .el-dialog__close {
        color: rgba(255, 255, 255, 0.8) !important;
        font-size: 20px;

        &:hover {
          color: var(--el-color-primary) !important;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 24px;
    color: #ffffff;
    position: relative;

    // 左下角装饰
    &::before {
      content: '';
      position: absolute;
      bottom: -2px;
      left: -2px;
      width: 40px;
      height: 40px;
      border: 2px solid var(--el-color-primary);
      border-right: none;
      border-top: none;
      border-bottom-left-radius: 12px;
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
      z-index: 1;
    }

    // 右下角装饰
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 40px;
      height: 40px;
      border: 2px solid var(--el-color-primary);
      border-left: none;
      border-top: none;
      border-bottom-right-radius: 12px;
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
      z-index: 1;
    }
  }
}

// 能量流动精灵图动画
@keyframes energyFlowAnimation {
  0% {
    background-position: 0 0;
  }
  1.96% {
    background-position: -549px 0;
  }
  3.92% {
    background-position: -1098px 0;
  }
  5.88% {
    background-position: -1647px 0;
  }
  7.84% {
    background-position: -2196px 0;
  }
  9.8% {
    background-position: -2745px 0;
  }
  11.76% {
    background-position: -3294px 0;
  }
  13.73% {
    background-position: -3843px 0;
  }
  15.69% {
    background-position: -4392px 0;
  }
  17.65% {
    background-position: 0 -284px;
  }
  19.61% {
    background-position: -549px -284px;
  }
  21.57% {
    background-position: -1098px -284px;
  }
  23.53% {
    background-position: -1647px -284px;
  }
  25.49% {
    background-position: -2196px -284px;
  }
  27.45% {
    background-position: -2745px -284px;
  }
  29.41% {
    background-position: -3294px -284px;
  }
  31.37% {
    background-position: -3843px -284px;
  }
  33.33% {
    background-position: -4392px -284px;
  }
  35.29% {
    background-position: 0 -568px;
  }
  37.25% {
    background-position: -549px -568px;
  }
  39.22% {
    background-position: -1098px -568px;
  }
  41.18% {
    background-position: -1647px -568px;
  }
  43.14% {
    background-position: -2196px -568px;
  }
  45.1% {
    background-position: -2745px -568px;
  }
  47.06% {
    background-position: -3294px -568px;
  }
  49.02% {
    background-position: -3843px -568px;
  }
  50.98% {
    background-position: -4392px -568px;
  }
  52.94% {
    background-position: 0 -852px;
  }
  54.9% {
    background-position: -549px -852px;
  }
  56.86% {
    background-position: -1098px -852px;
  }
  58.82% {
    background-position: -1647px -852px;
  }
  60.78% {
    background-position: -2196px -852px;
  }
  62.75% {
    background-position: -2745px -852px;
  }
  64.71% {
    background-position: -3294px -852px;
  }
  66.67% {
    background-position: -3843px -852px;
  }
  68.63% {
    background-position: -4392px -852px;
  }
  70.59% {
    background-position: 0 -1136px;
  }
  72.55% {
    background-position: -549px -1136px;
  }
  74.51% {
    background-position: -1098px -1136px;
  }
  76.47% {
    background-position: -1647px -1136px;
  }
  78.43% {
    background-position: -2196px -1136px;
  }
  80.39% {
    background-position: -2745px -1136px;
  }
  82.35% {
    background-position: -3294px -1136px;
  }
  84.31% {
    background-position: -3843px -1136px;
  }
  86.27% {
    background-position: -4392px -1136px;
  }
  88.24% {
    background-position: 0 -1420px;
  }
  90.2% {
    background-position: -549px -1420px;
  }
  92.16% {
    background-position: -1098px -1420px;
  }
  94.12% {
    background-position: -1647px -1420px;
  }
  96.08% {
    background-position: -2196px -1420px;
  }
  98.04% {
    background-position: -2745px -1420px;
  }
  100% {
    background-position: -3294px -1420px;
  }
}

// ====================
// 移动端适配 (≤768px)
// ====================
@media (max-width: 768px) {
  .station-detail-dialog {
    // 四角装饰在移动端缩小
    &::before,
    &::after {
      width: 30px;
      height: 30px;
    }

    .el-dialog__header {
      padding: 16px;

      &::before,
      &::after {
        width: 30px;
        height: 30px;
      }

      .dialog-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;

        .station-name {
          font-size: 18px;
        }

        .pv-power {
          font-size: 13px;

          .power-value {
            font-size: 16px;
          }
        }
      }
    }

    .el-dialog__body {
      padding: 16px;
      overflow-x: hidden;

      &::before,
      &::after {
        width: 30px;
        height: 30px;
      }

      .dialog-content {
        width: 100%;
        overflow-x: hidden;
      }

      // 顶部信息区改为上下堆叠
      .top-section {
        flex-direction: column !important;
        gap: 12px;
        margin-bottom: 16px;
        width: 100%;

        // 信息网格改为单列
        .info-grid {
          width: 100%;
          grid-template-columns: 1fr !important;
          gap: 8px;
          order: 1;

          .info-item {
            font-size: 13px;
            word-break: break-word;
          }
        }

        // 能量流动图 - 移动端显示在信息网格下方
        .animation-section {
          width: 100% !important;
          height: auto;
          margin: 0;
          order: 2;
          display: flex;
          justify-content: center;

          .energy-flow {
            width: 100%;
            max-width: 280px;
            height: 100px;
            position: relative;

            .sprite-animation {
              transform: scale(0.22);
            }

            .energy-label {
              font-size: 10px;
              padding: 3px 6px;
              background: rgba(13, 35, 68, 0.85);
              border-radius: 3px;
              gap: 2px;

              .label-text {
                font-size: 10px;
              }

              .label-value {
                font-size: 12px;
              }
            }

            // 调整标签位置
            .pv-label {
              top: -5%;
            }

            .consumption-label {
              bottom: 3%;
              left: 3%;
            }

            .grid-label {
              bottom: 3%;
              right: 3%;
            }
          }
        }
      }

      // 电站介绍区
      .station-intro {
        margin-bottom: 16px;

        .section-title {
          font-size: 15px;
          margin-bottom: 10px;
        }

        .intro-content {
          flex-direction: column;
          padding: 12px;
          gap: 12px;

          .intro-image {
            width: 100%;
            height: 150px;
          }

          .intro-text {
            font-size: 13px;
          }
        }
      }

      // 天气预报区
      .weather-section {
        width: 100%;
        overflow-x: hidden;

        .section-title {
          font-size: 15px;
          margin-bottom: 10px;
        }

        .weather-content {
          flex-direction: column !important;
          padding: 12px;
          gap: 12px;
          width: 100%;
          overflow-x: hidden;

          .current-weather {
            width: 100%;
            padding-right: 0;
            border-right: none;
            border-bottom: 1px solid rgba(0, 212, 255, 0.2);
            padding-bottom: 12px;
            min-width: auto;

            .temperature {
              font-size: 28px;
            }

            .weather-item {
              font-size: 12px;

              .el-icon {
                font-size: 14px;
              }

              span:first-child {
                font-size: 14px;
              }
            }
          }

          .forecast-list {
            width: 100%;
            padding-left: 0;
            gap: 6px;
            overflow-x: auto;
            overflow-y: hidden;
            flex-wrap: nowrap;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 212, 255, 0.5) rgba(0, 0, 0, 0.1);
            padding-bottom: 8px;

            // WebKit 滚动条样式
            &::-webkit-scrollbar {
              height: 5px;
            }

            &::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.1);
              border-radius: 3px;
            }

            &::-webkit-scrollbar-thumb {
              background: rgba(0, 212, 255, 0.5);
              border-radius: 3px;

              &:hover {
                background: rgba(0, 212, 255, 0.7);
              }
            }

            .forecast-item {
              min-width: 65px;
              max-width: 65px;
              padding: 8px 4px;
              min-height: 130px;
              gap: 6px;
              flex-shrink: 0;

              .forecast-date {
                font-size: 11px;
              }

              .forecast-icon {
                .el-icon {
                  font-size: 28px !important;
                }
              }

              .forecast-desc {
                font-size: 11px;
              }

              .forecast-temp {
                font-size: 10px;
              }
            }
          }
        }

        .update-time {
          font-size: 11px;
          margin-top: 6px;
        }
      }
    }
  }
}
</style>
