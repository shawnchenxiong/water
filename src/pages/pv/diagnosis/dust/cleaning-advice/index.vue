<template>
  <DeviceMonitorLayout class="cleaning-advice-page">
    <template #left>
      <StationTree 
        :auto-select-first-leaf="true"
        @node-click="handleStationChange"
      />
    </template>
    
    <template #right>
      <div class="main-content">
        <!-- 查询区域 -->
        <div class="query-section">
          <div class="query-form">
            <div class="form-item">
              <span class="label">时间</span>
              <div class="date-picker-wrapper">
                <el-icon class="calendar-icon"><Calendar /></el-icon>
                <el-date-picker
                  v-model="selectedDate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :disabled-date="(time: Date) => time.getTime() > Date.now()"
                  @change="handleDateChange"
                />
              </div>
              <el-button type="primary" @click="handleQuery" :loading="loading">
                提交
              </el-button>
            </div>
          </div>
        </div>

        <!-- 电站清洗建议卡片区 -->
        <div class="advice-cards-section" v-if="cleaningAdviceData">
          <div class="section-title">电站清洗建议</div>
          <div class="advice-layout">
            <!-- 左侧卡片 -->
            <div class="advice-cards">
              <div class="advice-card">
                <div class="card-icon">
                  <el-icon><DataAnalysis /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-value">{{ cleaningAdviceData.stationAdvice.dustLossRate }}%</div>
                  <div class="card-title">电站积尘损失率</div>
                </div>
              </div>
              
              <div class="advice-card">
                <div class="card-icon">
                  <el-icon><Money /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-value">{{ formatCurrency(cleaningAdviceData.stationAdvice.predictedLossRevenue) }}元</div>
                  <div class="card-title">预测未来1个月积尘损失收益</div>
                </div>
              </div>
              
              <div class="advice-card">
                <div class="card-icon">
                  <el-icon><Tools /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-value">{{ formatCurrency(cleaningAdviceData.stationAdvice.cleaningCost) }}元</div>
                  <div class="card-title">电站清洗成本</div>
                </div>
              </div>
              
              <div class="advice-card">
                <div class="card-icon">
                  <el-icon><Calendar /></el-icon>
                </div>
                <div class="card-content">
                  <div class="card-value">{{ cleaningAdviceData.stationAdvice.recommendedDate }}</div>
                  <div class="card-title">推荐清洗日期</div>
                </div>
              </div>
            </div>

            <!-- 右侧积尘损失率统计 -->
            <div class="dust-statistics">
              <div class="statistics-title">积尘损失率统计</div>
              <div class="statistics-list">
                <div class="statistics-item green">
                  <span class="dot"></span>
                  <span class="label">积尘损失率≤5%:</span>
                  <span class="value">{{ cleaningAdviceData.dustStatistics.level1.count }}台 / {{ cleaningAdviceData.dustStatistics.level1.percentage }}%</span>
                </div>
                <div class="statistics-item orange">
                  <span class="dot"></span>
                  <span class="label">5%&lt;积尘损失率≤10%:</span>
                  <span class="value">{{ cleaningAdviceData.dustStatistics.level2.count }}台 / {{ cleaningAdviceData.dustStatistics.level2.percentage }}%</span>
                </div>
                <div class="statistics-item red">
                  <span class="dot"></span>
                  <span class="label">积尘损失率&gt;10%:</span>
                  <span class="value">{{ cleaningAdviceData.dustStatistics.level3.count }}台 / {{ cleaningAdviceData.dustStatistics.level3.percentage }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 积尘趋势图表区 -->
        <div class="trend-section" v-if="cleaningAdviceData">
          <div class="section-title">电站积尘趋势</div>
          <div class="chart-container">
            <DustTrendChart 
              :trend-data="cleaningAdviceData.trendData"
              :loading="chartLoading"
            />
          </div>
        </div>

        <!-- 设备积尘明细表格区 -->
        <div class="device-details-section" v-if="cleaningAdviceData">
          <div class="section-title">设备积尘明细</div>
          <div class="table-container">
            <el-table
              :data="cleaningAdviceData.deviceDetails"
              style="width: 100%"
              :loading="loading"
              empty-text="暂无数据"
              :class="{ 'mobile-table': isMobile }"
            >
              <el-table-column 
                v-if="!isMobile"
                prop="stationName" 
                label="电站名称" 
                min-width="150" 
              />
              <el-table-column 
                label="设备名称" 
                :min-width="isMobile ? 100 : 120"
                show-overflow-tooltip
              >
                <template #default="{ row }">
                  <el-button 
                    type="text" 
                    class="device-name-link"
                    @click="handleDeviceDetail(row)"
                  >
                    {{ row.deviceName }}
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column 
                v-if="!isMobile"
                prop="installedCapacity" 
                label="装机容量(kWp)" 
                min-width="140" 
                align="right" 
              />
              <el-table-column 
                prop="dailyGeneration" 
                :label="isMobile ? '发电量' : '当日发电量(kWh)'" 
                :min-width="isMobile ? 80 : 150" 
                align="right" 
              />
              <el-table-column 
                v-if="!isMobile"
                prop="equivalentHours" 
                label="等价发电量(h)" 
                min-width="140" 
                align="right" 
              />
              <el-table-column 
                label="损失电量" 
                :min-width="isMobile ? 80 : 150" 
                align="right"
              >
                <template #default="{ row }">
                  <span>{{ row.dustLossGeneration || '-' }}</span>
                  <div v-if="isMobile && row.dustLossGeneration" class="mobile-unit">kWh</div>
                </template>
              </el-table-column>
              <el-table-column 
                label="损失率" 
                :min-width="isMobile ? 70 : 140" 
                align="right"
              >
                <template #default="{ row }">
                  <span>{{ row.dustLossRate || '-' }}</span>
                  <div v-if="isMobile && row.dustLossRate" class="mobile-unit">%</div>
                </template>
              </el-table-column>
              <el-table-column 
                v-if="!isMobile"
                label="清洗建议" 
                min-width="120"
              >
                <template #default="{ row }">
                  {{ row.cleaningAdvice || '-' }}
                </template>
              </el-table-column>
              <el-table-column 
                label="操作" 
                :width="isMobile ? 80 : 100" 
                fixed="right"
              >
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    link
                    :size="isMobile ? 'small' : 'default'"
                    @click="showDeviceHistoryTrend(row)"
                  >
                    {{ isMobile ? '趋势' : '历史趋势' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
    </div>
        </div>

        <!-- 未来天气预报区 -->
        <div class="weather-section" v-if="weatherData">
          <div class="section-title">
            未来15天天气
            <el-button type="primary" link @click="refreshWeather" :loading="weatherLoading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <div class="weather-container">
            <div 
              v-for="weather in weatherData.forecast" 
              :key="weather.date"
              class="weather-item"
            >
              <div class="weather-date">{{ weather.date }}</div>
              <div class="weather-icon">
                <WeatherIcon :icon="weather.icon" />
              </div>
              <div class="weather-desc">{{ weather.weather }}</div>
              <div class="weather-temp">{{ weather.temperature }}</div>
            </div>
      </div>
    </div>
  </div>
    </template>
  </DeviceMonitorLayout>

  <!-- 设备历史趋势弹窗 -->
  <DeviceHistoryTrendDialog
    v-model:visible="trendDialogVisible"
    :station-id="selectedStationId"
    :device-name="selectedDeviceName"
    :width="isMobile ? '95%' : '900px'"
    :fullscreen="isMobile"
  />

  <!-- 设备详情弹窗 -->
  <DeviceDetailDialog
    v-model:visible="deviceDetailVisible"
    :device-id="selectedDeviceId"
    :device-name="selectedDeviceNameForDetail"
    :width="isMobile ? '95%' : '1200px'"
    :fullscreen="isMobile"
    @device-change="handleDeviceChange"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar, DataAnalysis, Money, Tools, Refresh } from '@element-plus/icons-vue'

// 移动端检测
const windowWidth = ref(window.innerWidth)
const isMobile = computed(() => windowWidth.value <= 768)

// 监听窗口大小变化
function handleResize() {
  windowWidth.value = window.innerWidth
}
import type { 
  CleaningAdviceData, 
  WeatherForecastData,
  GetCleaningAdviceParams,
  DeviceDetail
} from '@/api/types/diagnosis/cleaningAdvice'
import { 
  getCleaningAdvice,
  getWeatherForecast
} from '@/api/diagnosis/cleaningAdvice'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import DustTrendChart from './components/DustTrendChart.vue'
import WeatherIcon from './components/WeatherIcon.vue'
import DeviceHistoryTrendDialog from './components/DeviceHistoryTrendDialog.vue'
import DeviceDetailDialog from '../../device-detail/DeviceDetailDialog.vue'
import dayjs from 'dayjs'

// 响应式数据
const loading = ref(false)
const chartLoading = ref(false)
const weatherLoading = ref(false)
const cleaningAdviceData = ref<CleaningAdviceData | null>(null)
const weatherData = ref<WeatherForecastData | null>(null)
const selectedStationId = ref<string>('')
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

// 设备历史趋势弹窗
const trendDialogVisible = ref(false)
const selectedDeviceName = ref('')

// 设备详情弹窗
const deviceDetailVisible = ref(false)
const selectedDeviceId = ref<string>('')
const selectedDeviceNameForDetail = ref<string>('')

// 电站选择处理
const handleStationChange = async (data: any) => {
  if (!data || !data.regionId) return
  if (data.childList && data.childList.length > 0) return
  
  selectedStationId.value = data.regionId
  
  // 自动查询数据
  await fetchData()
}

// 日期选择处理
const handleDateChange = (date: string | null) => {
  if (date) {
    selectedDate.value = date
  }
}

// 查询数据
const handleQuery = async () => {
  if (!selectedStationId.value) {
    ElMessage.warning('请先选择电站')
    return
  }
  await fetchData()
}

// 获取清洗建议数据
const fetchData = async () => {
  if (!selectedStationId.value) return

  try {
    loading.value = true
    chartLoading.value = true

    const params: GetCleaningAdviceParams = {
      stationId: selectedStationId.value,
      date: selectedDate.value
    }

    const [adviceResponse, weatherResponse] = await Promise.all([
      getCleaningAdvice(params),
      getWeatherForecast({ stationId: selectedStationId.value })
    ])

    if (adviceResponse.code === 200) {
      cleaningAdviceData.value = adviceResponse.data
    } else {
      ElMessage.error(adviceResponse.message || '获取清洗建议失败')
    }

    if (weatherResponse.code === 200) {
      weatherData.value = weatherResponse.data
    } else {
      ElMessage.error('获取天气预报失败')
    }

  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('网络请求失败，请稍后重试')
  } finally {
    loading.value = false
    chartLoading.value = false
  }
}

// 刷新天气数据
const refreshWeather = async () => {
  if (!selectedStationId.value) return

  try {
    weatherLoading.value = true
    const response = await getWeatherForecast({ 
      stationId: selectedStationId.value 
    })

    if (response.code === 200) {
      weatherData.value = response.data
      ElMessage.success('天气数据已更新')
    } else {
      ElMessage.error('刷新天气数据失败')
    }
  } catch (error) {
    console.error('刷新天气失败:', error)
    ElMessage.error('刷新天气失败')
  } finally {
    weatherLoading.value = false
  }
}

// 显示设备历史趋势
const showDeviceHistoryTrend = (device: DeviceDetail) => {
  selectedDeviceName.value = device.deviceName
  trendDialogVisible.value = true
}

// 处理设备详情
const handleDeviceDetail = (device: DeviceDetail) => {
  console.log('点击设备详情，传递数据:', device)
  selectedDeviceId.value = device.deviceId || device.deviceName // 使用设备名称作为ID如果没有deviceId
  selectedDeviceNameForDetail.value = device.deviceName
  deviceDetailVisible.value = true
}

// 处理设备切换
const handleDeviceChange = (deviceId: string) => {
  selectedDeviceId.value = deviceId
  // 这里可以根据需要更新设备名称
  const device = cleaningAdviceData.value?.deviceDetails.find(item => 
    (item.deviceId || item.deviceName) === deviceId
  )
  if (device) {
    selectedDeviceNameForDetail.value = device.deviceName
  }
}

// 格式化货币
const formatCurrency = (value: number): string => {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 组件挂载时初始化
onMounted(() => {
  // StationTree会自动选择第一个叶子节点，触发handleStationChange
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.cleaning-advice-page {
  .main-content {
    padding: 15px;
    height: 100%;
    overflow-y: auto;

    // 移动端适配
    @media (max-width: 768px) {
      padding: 12px;
    }

    @media (max-width: 480px) {
      padding: 10px;
    }
  }

  // 查询区域
  .query-section {
  margin-bottom: 20px;
  
    .query-form {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(30, 60, 120, 0.3);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 8px;

      // 移动端适配
      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        padding: 12px;
      }

      .form-item {
        display: flex;
        align-items: center;
        gap: 12px;

        // 移动端适配
        @media (max-width: 768px) {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }

        @media (max-width: 480px) {
          gap: 6px;
        }

        .label {
          color: #fff;
          font-size: 14px;
          white-space: nowrap;

          // 移动端适配
          @media (max-width: 768px) {
            font-size: 13px;
            text-align: left;
          }
        }

        .date-picker-wrapper {
          position: relative;
          display: flex;
          align-items: center;

          // 移动端适配
          @media (max-width: 768px) {
            width: 100%;
          }

          .calendar-icon {
            position: absolute;
            left: 8px;
            z-index: 10;
            color: #00d4ff;
            pointer-events: none;

            // 移动端适配
            @media (max-width: 768px) {
              font-size: 14px;
              left: 6px;
            }
          }

          :deep(.el-date-editor) {
            padding-left: 32px;
            background: rgba(10, 30, 50, 0.8);
            border: 1px solid rgba(0, 212, 255, 0.4);
            color: #fff;

            // 移动端适配
            @media (max-width: 768px) {
              width: 100%;
              padding-left: 28px;
              font-size: 13px;
            }

            &:focus-within {
              border-color: #00d4ff;
              box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
            }

            .el-input__inner {
    color: #fff;
              background: transparent;
              border: none;

              &::placeholder {
                color: rgba(255, 255, 255, 0.5);
              }
            }
          }
        }

        .el-button {
          // 移动端适配
          @media (max-width: 768px) {
            width: 100%;
            font-size: 13px;
          }
        }
      }
    }
  }

  // 建议卡片区域
  .advice-cards-section {
    margin-bottom: 24px;

    // 移动端适配
    @media (max-width: 768px) {
      margin-bottom: 18px;
    }

    @media (max-width: 480px) {
      margin-bottom: 15px;
    }

    .section-title {
      color: #00d4ff;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-left: 12px;
      border-left: 4px solid #00d4ff;

      // 移动端适配
      @media (max-width: 768px) {
        font-size: 16px;
        margin-bottom: 12px;
        padding-left: 10px;
        border-left-width: 3px;
      }

      @media (max-width: 480px) {
        font-size: 15px;
        margin-bottom: 10px;
        padding-left: 8px;
      }
    }

    .advice-layout {
      display: flex;
      gap: 20px;
      align-items: stretch; // 高度对等

      .advice-cards {
        flex: 1; // 各占50%
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        align-content: start; // 内容顶部对齐

        .advice-card {
          background: linear-gradient(135deg, rgba(30, 60, 120, 0.6) 0%, rgba(20, 40, 80, 0.8) 100%);
          border: 1px solid rgba(0, 212, 255, 0.4);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;

          // 移动端适配
          @media (max-width: 768px) {
            padding: 15px;
            gap: 12px;
            border-radius: 8px;
          }

          @media (max-width: 480px) {
            padding: 12px;
            gap: 10px;
            flex-direction: column;
            text-align: center;
          }

          &:hover {
            transform: translateY(-2px);
            border-color: #00d4ff;
            box-shadow: 0 8px 24px rgba(0, 212, 255, 0.2);
          }

          .card-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;

            // 移动端适配
            @media (max-width: 768px) {
              width: 40px;
              height: 40px;
              border-radius: 8px;
            }

            @media (max-width: 480px) {
              width: 36px;
              height: 36px;
              border-radius: 6px;
              margin-bottom: 8px;
            }
            
            .el-icon {
              font-size: 24px;
              color: #fff;

              // 移动端适配
              @media (max-width: 768px) {
                font-size: 20px;
              }

              @media (max-width: 480px) {
                font-size: 18px;
              }
            }
          }

          .card-content {
            flex: 1;

            // 移动端适配
            @media (max-width: 480px) {
              text-align: center;
            }

            .card-value {
              color: #fff;
              font-size: 18px;
              font-weight: bold;
              line-height: 1.2;
              margin-bottom: 4px;

              // 移动端适配
              @media (max-width: 768px) {
                font-size: 16px;
              }

              @media (max-width: 480px) {
                font-size: 15px;
              }
            }

            .card-title {
              color: rgba(255, 255, 255, 0.8);
              font-size: 12px;
              line-height: 1.4;

              // 移动端适配
              @media (max-width: 768px) {
                font-size: 11px;
              }

              @media (max-width: 480px) {
                font-size: 10px;
                line-height: 1.3;
              }
            }
          }
        }
      }

      .dust-statistics {
        flex: 1; // 各占50%
        display: flex;
        flex-direction: column;
        padding: 15px; // 减小5px上下内边距，总共减小10px高度
        background: rgba(20, 40, 80, 0.4);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 12px;
        justify-content: center; // 整体内容垂直居中

        // 移动端适配
        @media (max-width: 768px) {
          padding: 12px;
          border-radius: 8px;
        }

        @media (max-width: 480px) {
          padding: 10px;
        }

        .statistics-title {
          color: #00d4ff;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;

          // 移动端适配
          @media (max-width: 768px) {
            font-size: 14px;
            margin-bottom: 12px;
          }

          @media (max-width: 480px) {
            font-size: 13px;
            margin-bottom: 10px;
          }
        }

        .statistics-list {
          display: flex;
          flex-direction: column;
          gap: 16px; // 减小间距

          // 移动端适配
          @media (max-width: 768px) {
            gap: 12px;
          }

          @media (max-width: 480px) {
            gap: 10px;
          }
        }

        .statistics-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px; // 稍微减小字体
          color: #fff;
          line-height: 1.3;
          padding: 8px 0; // 添加少许内边距

          // 移动端适配
          @media (max-width: 768px) {
            font-size: 12px;
            gap: 8px;
            padding: 6px 0;
            line-height: 1.2;
          }

          @media (max-width: 480px) {
            font-size: 11px;
            gap: 6px;
            padding: 4px 0;
            flex-wrap: wrap;
          }

          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;

            // 移动端适配
            @media (max-width: 768px) {
              width: 6px;
              height: 6px;
            }
          }

          .label {
            color: rgba(255, 255, 255, 0.8);
            flex: 1;

            // 移动端适配
            @media (max-width: 480px) {
              font-size: 10px;
              min-width: 100px;
            }
          }

          .value {
            color: #fff;
            font-weight: 600;
            white-space: nowrap;

            // 移动端适配
            @media (max-width: 480px) {
              font-size: 10px;
            }
          }

          &.green .dot {
            background: #27ae60;
          }

          &.orange .dot {
            background: #e67e22;
          }

          &.red .dot {
            background: #e74c3c;
          }
        }
      }
    }
  }

  // 趋势图区域
  .trend-section {
    margin-bottom: 24px;

    // 移动端适配
    @media (max-width: 768px) {
      margin-bottom: 18px;
    }

    @media (max-width: 480px) {
      margin-bottom: 15px;
    }

    .section-title {
      color: #00d4ff;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-left: 12px;
      border-left: 4px solid #00d4ff;

      // 移动端适配
      @media (max-width: 768px) {
        font-size: 16px;
        margin-bottom: 12px;
        padding-left: 10px;
        border-left-width: 3px;
      }

      @media (max-width: 480px) {
        font-size: 15px;
        margin-bottom: 10px;
        padding-left: 8px;
      }
    }

    .chart-container {
      background: rgba(30, 60, 120, 0.3);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      padding: 20px;
      height: 400px;

      // 移动端适配
      @media (max-width: 768px) {
        padding: 15px;
        height: 300px;
        border-radius: 8px;
      }

      @media (max-width: 480px) {
        padding: 12px;
        height: 250px;
      }
    }
  }

  // 设备明细表格区域
  .device-details-section {
    margin-bottom: 24px;

    // 移动端适配
    @media (max-width: 768px) {
      margin-bottom: 18px;
    }

    @media (max-width: 480px) {
      margin-bottom: 15px;
    }

    .section-title {
      color: #00d4ff;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-left: 12px;
      border-left: 4px solid #00d4ff;

      // 移动端适配
      @media (max-width: 768px) {
        font-size: 16px;
        margin-bottom: 12px;
        padding-left: 10px;
        border-left-width: 3px;
      }

      @media (max-width: 480px) {
        font-size: 15px;
        margin-bottom: 10px;
        padding-left: 8px;
      }
    }

    .table-container {
      background: rgba(30, 60, 120, 0.3);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      padding: 16px;

      // 移动端适配
      @media (max-width: 768px) {
        padding: 12px;
        border-radius: 8px;
      }

      @media (max-width: 480px) {
        padding: 8px;
      }

      :deep(.el-table) {
        background: transparent;
        color: #fff;

        // 移动端表格样式
        &.mobile-table {
          .el-table__header-wrapper th {
            padding: 8px 4px;
            font-size: 12px;
          }

          .el-table__body-wrapper td {
            padding: 8px 4px;
            font-size: 12px;
          }

          .mobile-unit {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 2px;
          }
        }

        .el-table__header-wrapper {
          background: rgba(20, 40, 80, 0.6);

          th {
            background: transparent;
            color: #00d4ff;
            font-weight: 600;
            border-bottom: 1px solid rgba(0, 212, 255, 0.3);
          }
        }

        .el-table__body-wrapper {
          tbody tr {
            background: transparent;

            &:hover {
              background: rgba(0, 212, 255, 0.1) !important;
            }

            td {
              border-bottom: 1px solid rgba(0, 212, 255, 0.15);
              color: rgba(255, 255, 255, 0.9);
            }
          }
        }

        .el-button--primary.is-link {
          color: #00d4ff;

          &:hover {
            color: #33ddff;
          }
        }
      }
    }
  }

  // 天气预报区域
  .weather-section {
    // 移动端适配
    @media (max-width: 768px) {
      margin-bottom: 18px;
    }

    @media (max-width: 480px) {
      margin-bottom: 15px;
    }

    .section-title {
      color: #00d4ff;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-left: 12px;
      border-left: 4px solid #00d4ff;
      display: flex;
      align-items: center;
      justify-content: space-between;

      // 移动端适配
      @media (max-width: 768px) {
        font-size: 16px;
        margin-bottom: 12px;
        padding-left: 10px;
        border-left-width: 3px;
        flex-wrap: wrap;
        gap: 8px;
      }

      @media (max-width: 480px) {
        font-size: 15px;
        margin-bottom: 10px;
        padding-left: 8px;
        flex-direction: column;
        align-items: flex-start;
      }

      .el-button {
        font-size: 14px;
        color: #00d4ff;
        
        // 移动端适配
        @media (max-width: 768px) {
          font-size: 12px;
        }

        @media (max-width: 480px) {
          font-size: 11px;
          margin-top: 5px;
        }
        
        &:hover {
          color: #33ddff;
        }
      }
    }

    .weather-container {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: rgba(30, 60, 120, 0.3);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      overflow-x: auto;

      // 移动端适配
      @media (max-width: 768px) {
        padding: 15px;
        gap: 12px;
        border-radius: 8px;
      }

      @media (max-width: 480px) {
        padding: 12px;
        gap: 10px;
      }

      .weather-item {
        flex-shrink: 0;
        width: 80px;
        text-align: center;
        padding: 12px;
        background: rgba(20, 40, 80, 0.6);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 8px;
        transition: all 0.3s ease;

        // 移动端适配
        @media (max-width: 768px) {
          width: 70px;
          padding: 10px;
        }

        @media (max-width: 480px) {
          width: 60px;
          padding: 8px;
          border-radius: 6px;
        }

        &:hover {
          border-color: #00d4ff;
          transform: translateY(-2px);
        }

        .weather-date {
          color: #00d4ff;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;

          // 移动端适配
          @media (max-width: 768px) {
            font-size: 10px;
            margin-bottom: 6px;
          }

          @media (max-width: 480px) {
            font-size: 9px;
            margin-bottom: 4px;
          }
        }

        .weather-icon {
          margin-bottom: 8px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;

          // 移动端适配
          @media (max-width: 768px) {
            height: 28px;
            margin-bottom: 6px;
          }

          @media (max-width: 480px) {
            height: 24px;
            margin-bottom: 4px;
          }
        }

        .weather-desc {
          color: #fff;
          font-size: 12px;
          margin-bottom: 4px;

          // 移动端适配
          @media (max-width: 768px) {
            font-size: 10px;
            margin-bottom: 3px;
          }

          @media (max-width: 480px) {
            font-size: 9px;
            margin-bottom: 2px;
          }
        }

        .weather-temp {
          color: rgba(255, 255, 255, 0.7);
          font-size: 11px;

          // 移动端适配
          @media (max-width: 768px) {
            font-size: 9px;
          }

          @media (max-width: 480px) {
            font-size: 8px;
          }
        }
      }
    }
  }

  // 响应式适配
  @media (max-width: 1200px) {
    .advice-layout {
      flex-direction: column;
      gap: 16px;
      min-height: auto;

      .advice-cards,
      .dust-statistics {
        flex: none;
      }

      .dust-statistics {        
        .statistics-list {
          flex-direction: row;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }

        .statistics-item {
          flex: 1;
          min-width: 200px;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .main-content {
      padding: 10px;
    }

    .advice-layout {
      flex-direction: column;
      gap: 16px;

      .advice-cards {
        grid-template-columns: 1fr !important;
      }

      .dust-statistics {
        width: 100%;
        
        .statistics-list {
          flex-direction: column;
          gap: 12px;
        }

        .statistics-item {
          .label {
            min-width: auto;
          }
        }
      }
    }

    .weather-container {
      padding: 16px !important;
      
      .weather-item {
        width: 70px;
      }
    }
  }
}

// 设备名称链接样式
:deep(.device-name-link) {
  color: #00d4ff !important;
  font-weight: 500;
  
  &:hover {
    color: #0099cc !important;
    text-decoration: underline;
  }
}
</style>
