<template>
  <div class="map-container">
    <div class="map-wrapper" ref="mapChartRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { MapRegionData } from '@/api/types/pv-dashboard'

/**
 * 组件Props
 */
interface Props {
  mapRegions?: MapRegionData[]
}

const props = defineProps<Props>()

// 模拟地图区域数据 - 参考图片中的真实数据
const defaultMapRegions: MapRegionData[] = [
  {
    regionId: '360000',
    regionName: '江西省',
    stationCount: 1,
    alarmCount: 0,
    position: {
      lat: 28.6765,
      lng: 115.9094
    }
  },
  {
    regionId: '340000', 
    regionName: '安徽省',
    stationCount: 18,
    alarmCount: 2,
    position: {
      lat: 31.8617,
      lng: 117.2264
    }
  },
  {
    regionId: '430000',
    regionName: '湖南省', 
    stationCount: 5,
    alarmCount: 1,
    position: {
      lat: 28.2282,
      lng: 112.9388
    }
  }
]

// 使用props或默认数据
const mapRegions = computed(() => props.mapRegions || defaultMapRegions)

// 响应式数据
const mapChartRef = ref<HTMLElement>()
let mapChart: ECharts | null = null

/**
 * 初始化中国地图
 */
const initMapChart = async () => {
  if (!mapChartRef.value) {
    console.log('Map chart ref not available')
    return
  }
  
  console.log('Initializing map chart...')
  mapChart = echarts.init(mapChartRef.value)
  
  // 使用ECharts内置地图功能
  console.log('Using ECharts built-in map visualization...')
  await setupEchartsMapVisualization()
}

/**
 * 设置ECharts地图可视化
 */
const setupEchartsMapVisualization = async () => {
  if (!mapChart) return
  
  console.log('Setting up ECharts map visualization...')
  
  try {
    // 加载中国地图JSON数据
    const response = await fetch('/china.json')
    if (!response.ok) {
      throw new Error(`Failed to load china map data: ${response.status}`)
    }
    const chinaMapData = await response.json()
    console.log('China map data loaded successfully')
    
    // 注册中国地图
    echarts.registerMap('china', chinaMapData)
    
    // 地图配置
    const option = {
      backgroundColor: 'transparent',
      geo: {
        map: 'china',
        roam: true,  // 启用缩放和拖拽
        zoom: 1.2,
        center: [105, 36],
        itemStyle: {
          color: 'rgba(30, 144, 255, 0.6)',  // 蓝色地图
          borderColor: '#4169E1',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            color: 'rgba(65, 105, 225, 0.8)'
          }
        },
        label: {
          show: false
        }
      },
      series: [
        // 地区标记点
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          data: mapRegions.value.map(region => ({
            name: region.regionName,
            value: [region.position.lng, region.position.lat, region.stationCount, region.alarmCount]
          })),
          symbol: 'pin',  // 使用pin图标
          symbolSize: 25,
          itemStyle: {
            color: '#ff5722',
            shadowColor: 'rgba(255, 87, 34, 0.8)',
            shadowBlur: 5
          },
          label: {
            show: true,
            formatter: function(params: any) {
              const data = params.data
              const stationCount = data.value[2]
              const alarmCount = data.value[3]
              
              // 根据是否有告警显示不同的标签
              if (alarmCount > 0) {
                return `{name|${data.name}} {alarm|${alarmCount}}`
              } else {
                return `{name|${data.name}} {count|${stationCount}}`
              }
            },
            position: 'top',
            backgroundColor: 'transparent',
            rich: {
              name: {
                color: '#ffffff',
                fontSize: 12,
                padding: [4, 8],
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: 4
              },
              count: {
                color: '#ffffff',
                fontSize: 11,
                padding: [2, 6], 
                backgroundColor: '#4CAF50',
                borderRadius: 10,
                fontWeight: 'bold'
              },
              alarm: {
                color: '#ffffff',
                fontSize: 11,
                padding: [2, 6],
                backgroundColor: '#f44336',
                borderRadius: 10,
                fontWeight: 'bold'
              }
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: function(params: any) {
              const data = params.data
              const stationCount = data.value[2]
              const alarmCount = data.value[3]
              return `${data.name}<br/>电站数量: ${stationCount}座<br/>告警数量: ${alarmCount}条`
            }
          }
        }
      ]
    }
    
    mapChart.setOption(option)
    console.log('ECharts map visualization set successfully')
    
  } catch (error) {
    console.error('加载地图数据失败:', error)
  }
}

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  if (mapChart) {
    mapChart.resize()
  }
}

// 监听数据变化
watch(mapRegions, () => {
  initMapChart()
}, { deep: true })

// 组件挂载后初始化地图
onMounted(async () => {
  await initMapChart()
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
  // 使用 MutationObserver 监听容器大小变化
  if (mapChartRef.value) {
    const resizeObserver = new ResizeObserver(() => {
      nextTick(() => {
        handleResize()
      })
    })
    resizeObserver.observe(mapChartRef.value)
    // 保存 observer 以便清理
    ;(mapChartRef.value as any)._resizeObserver = resizeObserver
  }
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (mapChartRef.value && (mapChartRef.value as any)._resizeObserver) {
    ;(mapChartRef.value as any)._resizeObserver.disconnect()
  }
  if (mapChart) {
    mapChart.dispose()
  }
})
</script>

<style scoped lang="scss">
.map-container {
  padding: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  min-height: 400px;
}
</style>

