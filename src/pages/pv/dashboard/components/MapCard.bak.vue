<template>
  <div class="map-card-new">
    <!-- 左上角位置信息 -->
    <div class="map-toolbar-top">
      <div class="location-info">
        <div class="icon-globe">
          <el-icon><Grid /></el-icon>
        </div>
        <div class="location-text">
          <span 
            v-for="(nav, index) in navList" 
            :key="nav.adcode"
            :class="['location-part', { clickable: index < navList.length - 1 }]"
            @click="index < navList.length - 1 ? handleNavClick(nav, index) : null"
          >
            <span v-if="index > 0" class="separator"> / </span>
            {{ nav.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <!-- 缩放控制器 -->
    <div class="zoom-controls">
      <div class="zoom-btn zoom-in" title="放大" @click="zoomIn">
        <el-icon><Plus /></el-icon>
      </div>
      <div class="zoom-level-display">{{ Math.round(ZOOM_CONFIG.currentZoom.value * 10) / 10 }}</div>
      <div class="zoom-btn zoom-out" title="缩小" @click="zoomOut">
        <el-icon><Minus /></el-icon>
      </div>
    </div>

    <div class="map-controls">
      <div class="control-btn" title="电站详情" @click="showStationDetail">
        <el-icon><Location /></el-icon>
      </div>
      <div 
        v-if="hasLoadError" 
        class="control-btn retry-btn" 
        title="重新加载数据" 
        @click="retryLoadData"
      >
        <el-icon><Refresh /></el-icon>
      </div>
    </div>

    <!-- 地图容器 -->
    <div ref="chartRef" class="map-container">
      <!-- 加载状态指示器 -->
      <div v-show="mapLoading" class="map-loading">
        <div class="loading-content">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span class="loading-text">{{ loadingText }}</span>
        </div>
      </div>
    </div>

    <!-- 电站详情弹框 -->
    <teleport to="body">
      <StationDetailDialog
        v-model="stationDialogVisible"
        :station-id="currentStationId"
      />
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import axios from 'axios'
import { Location, Grid, Loading, Refresh, Plus, Minus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StationDetailDialog from '@/components/common/StationDetailDialog.vue'
import { getCityStations, getProvinceCityStations } from '@/api/pvDashboardApi'
import type { CityStationData } from '@/api/types/pv-dashboard'

// 地图相关
const chartRef = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null

// 导航信息
interface NavItem {
  name: string
  adcode: number
  level: string
}

const navList = ref<NavItem[]>([
  { name: '中国', adcode: 100000, level: 'country' }
])

const currentMap = ref({
  name: '中国',
  adcode: 100000
})

// 地区code映射
const adcodeMap: Record<string, { adcode: number; level: string }> = {}

// 省份信息映射（从Geojson中提取）
interface ProvinceInfo {
  adcode: number
  name: string
  center: [number, number]
  centroid: [number, number]
}
const provinceInfoMap = ref<Map<number, ProvinceInfo>>(new Map())

// 城市电站数据（从API获取）
const cityStationsData = ref<CityStationData[]>([])

// 省份城市数据缓存
const provinceCityDataCache = new Map<string, CityStationData[]>()

// 地图标记数据
interface MapMarker {
  name: string
  value: [number, number]
  stationCount: number
  alarmCount: number
}

// 电站详情弹框
const stationDialogVisible = ref(false)
const currentStationId = ref('')

// 加载状态
const mapLoading = ref(false)
const loadingText = ref('加载中...')

// 错误状态
const hasLoadError = ref(false)

/**
 * 创建axios实例（DataV API）
 */
const datavAxios = axios.create({
  baseURL: 'https://geo.datav.aliyun.com',
  timeout: 30000
})

/**
 * 获取Geojson数据
 * @param code 区域代码
 */
const getGeojson = async (code: number) => {
  try {
    console.log(`请求GeoJSON数据: code=${code}`)
    const response = await datavAxios.get(`/areas_v3/bound/geojson?code=${code}_full`)
    const geoJSON = response.data
    
    // 调试信息
    console.log(`GeoJSON数据获取成功: code=${code}`)
    console.log('数据类型:', geoJSON?.type)
    console.log('特征数量:', geoJSON?.features?.length || 0)
    
    if (geoJSON?.features?.length > 0) {
      const sample = geoJSON.features.slice(0, 3)
      console.log('前3个特征样本:', sample.map((f: any) => ({
        name: f.properties?.name,
        level: f.properties?.level,
        adcode: f.properties?.adcode,
        hasGeometry: !!f.geometry
      })))
    }
    
    return geoJSON
  } catch (error) {
    console.error('获取Geojson失败:', error)
    ElMessage.error('Failed to load map data')
    throw error
  }
}

/**
 * 生成地区code映射和省份信息
 */
const genAdcodeMap = (features: any[]) => {
  console.log('==== 开始提取GeoJSON数据 ====')
  console.log('features数量:', features.length)
  
  features.forEach((feature) => {
    const { name, adcode, level, center, centroid } = feature.properties
    adcodeMap[name] = { adcode, level }
    
    console.log(`区域: ${name}, adcode: ${adcode}, level: ${level}, has centroid: ${!!centroid}`)
    
    // 如果是省级，保存到provinceInfoMap
    if (level === 'province' && centroid) {
      provinceInfoMap.value.set(adcode, {
        adcode,
        name,
        center: center || centroid,
        centroid
      })
      console.log(`✅ 保存省份: ${name} (${adcode})`)
    }
  })
  
  console.log('provinceInfoMap最终大小:', provinceInfoMap.value.size)
  console.log('==== GeoJSON数据提取完成 ====')
}

/**
 * 加载全部城市电站数据（用于初始化省份标记）
 */
const loadAllCityStationsData = async () => {
  try {
    const response = await withRetry(
      () => getCityStations(),
      '加载城市电站数据'
    )
    
    if (response.code === 200 && response.data) {
      cityStationsData.value = response.data
      console.log('全部城市电站数据加载成功:', cityStationsData.value.length, '条')
      
      // 生成并更新省份标记
      updateProvinceMarkers()
    } else {
      throw new Error(response.message || 'Invalid response data')
    }
  } catch (error) {
    console.error('加载城市电站数据最终失败:', error)
    hasLoadError.value = true
    ElMessage.error('加载电站数据失败，请点击重试按钮')
  }
}

/**
 * 加载指定省份的城市电站数据
 * @param provinceName 省份名称
 */
const loadProvinceCityData = async (provinceName: string): Promise<CityStationData[]> => {
  // 检查缓存
  if (provinceCityDataCache.has(provinceName)) {
    console.log(`从缓存加载 ${provinceName} 城市数据`)
    return provinceCityDataCache.get(provinceName)!
  }
  
  try {
    console.log(`开始加载 ${provinceName} 城市数据...`)
    const response = await withRetry(
      () => getProvinceCityStations(provinceName),
      `加载 ${provinceName} 城市数据`
    )
    
    if (response.code === 200 && response.data) {
      // 缓存数据
      provinceCityDataCache.set(provinceName, response.data)
      console.log(`${provinceName} 城市数据加载成功:`, response.data.length, '个城市')
      return response.data
    } else {
      throw new Error(response.message || 'Invalid response data')
    }
  } catch (error) {
    console.error(`加载 ${provinceName} 城市数据失败:`, error)
    throw error
  }
}

/**
 * 生成省份标记数据
 */
const generateProvinceMarkers = (): MapMarker[] => {
  console.log('==== 开始生成省份标记 ====')
  console.log('provinceInfoMap大小:', provinceInfoMap.value.size)
  console.log('provinceInfoMap内容:', Array.from(provinceInfoMap.value.keys()))
  console.log('cityStationsData数量:', cityStationsData.value.length)
  
  const provinceMap = new Map<number, { stationCount: number; alarmCount: number }>()
  
  // 聚合城市数据到省份
  cityStationsData.value.forEach((city) => {
    console.log(`城市: ${city.cityName}, 省份adcode: ${city.provinceAdcode}`)
    const current = provinceMap.get(city.provinceAdcode) || { stationCount: 0, alarmCount: 0 }
    current.stationCount += city.stationCount
    current.alarmCount += city.alarmCount
    provinceMap.set(city.provinceAdcode, current)
  })
  
  console.log('provinceMap大小:', provinceMap.size)
  console.log('provinceMap keys:', Array.from(provinceMap.keys()))
  
  const markers: MapMarker[] = []
  
  // 生成标记点数据
  provinceMap.forEach((data, provinceAdcode) => {
    const provinceInfo = provinceInfoMap.value.get(provinceAdcode)
    
    if (!provinceInfo) {
      console.warn(`省份 adcode=${provinceAdcode} 在GeoJSON中未找到`)
      return // 跳过没有地理信息的省份
    }
    
    markers.push({
      name: provinceInfo.name,
      value: provinceInfo.centroid,
      stationCount: data.stationCount,
      alarmCount: data.alarmCount
    })
  })
  
  console.log('生成省份标记:', markers.length, '个')
  console.log('==== 生成省份标记完成 ====')
  return markers
}

/**
 * 更新省份标记点
 */
const updateProvinceMarkers = () => {
  if (!chartInstance) return
  
  const markers = generateProvinceMarkers()
  
  console.log('更新省份标记到地图，数量:', markers.length)
  
  chartInstance.setOption({
    series: [{
      type: 'scatter',
      coordinateSystem: 'geo',
      zlevel: 10,
      symbolSize: 0, // 不显示圆点
      itemStyle: {
        color: 'transparent'
      },
      label: {
        show: true,
        position: 'inside',
        offset: [0, 0],
        formatter: (params: any) => {
          const { name, stationCount, alarmCount } = params.data
          let parts = [`{name|${name}}`]
          if (stationCount > 0) {
            parts.push(`{stationBadge| ${stationCount}}`)
          }
          if (alarmCount > 0) {
            parts.push(`{alarmBadge| ${alarmCount}}`)
          }
          return parts.join('')
        },
        rich: {
          name: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#333333',
            padding: [3, 8],
            borderRadius: 0,
            fontSize: 11,
            fontWeight: 500,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 2,
            shadowOffsetY: 1
          },
          stationBadge: {
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            padding: [3, 6],
            borderRadius: 0,
            fontSize: 10,
            fontWeight: 'bold',
            shadowColor: 'rgba(245, 158, 11, 0.3)',
            shadowBlur: 2
          },
          alarmBadge: {
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: [3, 6],
            borderRadius: 0,
            fontSize: 10,
            fontWeight: 'bold',
            shadowColor: 'rgba(239, 68, 68, 0.3)',
            shadowBlur: 2
          }
        }
      },
      data: markers
    }]
  })
}

// 城市GeoJSON缓存
const cityGeoJsonCache = new Map<number, any>()

// 预加载队列
const preloadQueue = new Set<number>()

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 基础延迟1秒
  backoffFactor: 1.5 // 退避因子
}

// 缩放级别配置（使用ref使其具有响应式）
const ZOOM_CONFIG = {
  showCityBorders: 4, // 缩放到4倍以上显示城市边界
  hideCityBorders: 3.5, // 缩放到3.5倍以下隐藏城市边界
  currentZoom: ref(2) // 当前缩放级别，使用ref使其响应式
}

// 当前活动的省份（用于缩放时判断显示哪个省份的城市边界）
const activeProvince = ref<string>('')

/**
 * 通用重试函数
 * @param fn 要重试的异步函数
 * @param context 上下文描述
 * @param maxRetries 最大重试次数
 */
const withRetry = async <T>(
  fn: () => Promise<T>, 
  context: string, 
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<T> => {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      console.warn(`${context} 第 ${attempt} 次尝试失败:`, error)
      
      if (attempt <= maxRetries) {
        const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt - 1)
        console.log(`${context} 将在 ${delay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  // 所有重试都失败了
  throw new Error(`${context} 重试 ${maxRetries} 次后仍然失败: ${lastError?.message}`)
}

/**
 * 获取并缓存城市GeoJSON
 */
const loadCityGeoJson = async (provinceAdcode: number) => {
  if (cityGeoJsonCache.has(provinceAdcode)) {
    return cityGeoJsonCache.get(provinceAdcode)
  }

  try {
    const geoJSON = await withRetry(
      () => getGeojson(provinceAdcode),
      `加载省份 ${provinceAdcode} 的GeoJSON`
    )
    cityGeoJsonCache.set(provinceAdcode, geoJSON)
    return geoJSON
  } catch (error) {
    console.error('加载城市GeoJSON最终失败:', error)
    return null
  }
}

/**
 * 平滑缩放地图到指定位置
 * @param center 中心坐标
 * @param zoom 缩放级别
 * @param duration 动画时长
 */
const smoothZoomTo = (center: [number, number], zoom: number, duration: number = 1200) => {
  if (!chartInstance) return
  
  chartInstance.setOption({
    geo: {
      center,
      zoom
    },
    animation: true,
    animationDuration: duration,
    animationEasing: 'cubicInOut',
    animationDelay: 0
  })
}

/**
 * 在原地图上缩放到省份区域并绘制城市边界
 * @param provinceName 省份名称  
 * @param center 中心坐标
 */
const zoomToProvinceWithCityBorders = async (provinceName: string, center: [number, number]) => {
  if (!chartInstance) return
  
  try {
    console.log(`缩放到省份区域并绘制城市边界: ${provinceName}`)
    
    // 获取省份adcode和城市GeoJSON数据
    const currentProvinceCities = provinceCityDataCache.get(provinceName)
    if (!currentProvinceCities || currentProvinceCities.length === 0) {
      console.warn(`无法找到省份 ${provinceName} 的数据`)
      smoothZoomTo(center, 5)
      return
    }
    
    const provinceAdcode = currentProvinceCities[0].provinceAdcode
    
    // 获取城市GeoJSON数据
    const cityGeoJSON = await loadCityGeoJson(provinceAdcode)
    if (!cityGeoJSON) {
      console.warn(`无法获取省份 ${provinceName} 的城市边界数据`)
      smoothZoomTo(center, 5)
      return  
    }
    
    console.log(`获取到 ${provinceName} 的城市边界数据，特征数量:`, cityGeoJSON.features?.length || 0)
    
    // 保持中国地图，只是缩放到省份区域
    smoothZoomTo(center, 5)
    
    // 添加城市边界线图层 - 使用自定义图形绘制
    const cityBorderSeries = {
      type: 'custom',
      coordinateSystem: 'geo',
      zlevel: 5,
      renderItem: (params: any, api: any) => {
        // 自定义渲染城市边界
        return renderCityBorders(params, api, cityGeoJSON)
      },
      data: [{ value: 1 }] // 虚拟数据项
    }
    
    // 更新图表，添加城市边界线
    chartInstance.setOption({
      series: [
        // 保持原有的scatter系列（城市标记）
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 10,
          symbolSize: 0,
          itemStyle: { color: 'transparent' },
          label: {
            show: true,
            position: 'inside',
            offset: [0, 0],
            formatter: (params: any) => {
              const { name, stationCount, alarmCount } = params.data
              let parts = [`{name|${name}}`]
              if (stationCount > 0) {
                parts.push(`{stationBadge| ${stationCount}}`)
              }
              if (alarmCount > 0) {
                parts.push(`{alarmBadge| ${alarmCount}}`)
              }
              return parts.join('')
            },
            rich: {
              name: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#333333',
                padding: [3, 8],
                borderRadius: 0,
                fontSize: 11,
                fontWeight: 500,
                shadowColor: 'rgba(0, 0, 0, 0.2)',
                shadowBlur: 2,
                shadowOffsetY: 1
              },
              stationBadge: {
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                padding: [3, 6],
                borderRadius: 0,
                fontSize: 10,
                fontWeight: 'bold',
                shadowColor: 'rgba(245, 158, 11, 0.3)',
                shadowBlur: 2
              },
              alarmBadge: {
                backgroundColor: '#ef4444',
                color: '#ffffff',
                padding: [3, 6],
                borderRadius: 0,
                fontSize: 10,
                fontWeight: 'bold',
                shadowColor: 'rgba(239, 68, 68, 0.3)',
                shadowBlur: 2
              }
            }
          },
          data: [] // 数据会通过 updateCityMarkers 更新
        },
        // 新增城市边界线图层
        cityBorderSeries
      ]
    })
    
    console.log(`✅ 成功在 ${provinceName} 区域绘制城市边界`)
  } catch (error) {
    console.error(`绘制城市边界失败:`, error)
    // 降级为简单缩放
    smoothZoomTo(center, 5)
  }
}

/**
 * 自定义渲染城市边界
 * @param params ECharts参数
 * @param api ECharts API
 * @param cityGeoJSON 城市GeoJSON数据
 */
const renderCityBorders = (_params: any, api: any, cityGeoJSON: any) => {
  if (!cityGeoJSON?.features) {
    return null
  }
  
  const children: any[] = []
  let visibleCityCount = 0
  
  cityGeoJSON.features.forEach((feature: any) => {
    if (feature.properties?.level === 'city' && feature.geometry) {
      const { geometry, properties } = feature
      const cityName = properties?.name
      
      // 获取城市中心点坐标用于标签
      const cityCenter = properties?.centroid || properties?.center
      if (!cityCenter) return
      
      // 转换中心点坐标
      const centerPoint = api.coord([cityCenter[0], cityCenter[1]])
      if (!centerPoint) return
      
      // 简单检查坐标是否有效
      if (!centerPoint || centerPoint[0] === null || centerPoint[1] === null) {
        return
      }
      
      visibleCityCount++
      
      // 处理不同的几何类型
      const processRing = (ring: number[][]) => {
        if (ring.length < 3) return
        
        const points = ring.map((coord: number[]) => {
          return api.coord([coord[0], coord[1]])
        }).filter(Boolean)
        
        if (points.length < 3) return
        
        // 创建路径字符串
        let pathData = `M ${points[0][0]} ${points[0][1]}`
        for (let i = 1; i < points.length; i++) {
          pathData += ` L ${points[i][0]} ${points[i][1]}`
        }
        pathData += ' Z' // 闭合路径
        
        // 添加边界路径
        children.push({
          type: 'path',
          shape: {
            pathData
          },
          style: {
            stroke: '#00D4FF',
            strokeWidth: 1.5,
            strokeOpacity: 0.9,
            fill: 'transparent'
          }
        })
      }
      
      // 绘制边界
      if (geometry.type === 'Polygon') {
        geometry.coordinates.forEach(processRing)
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((polygon: number[][][]) => {
          polygon.forEach(processRing)
        })
      }
      
      // 添加城市名称标签
      if (cityName && centerPoint) {
        children.push({
          type: 'text',
          style: {
            x: centerPoint[0],
            y: centerPoint[1],
            text: cityName.replace('市', ''), // 简化显示，去掉"市"字
            textAlign: 'center',
            textVerticalAlign: 'middle',
            fontSize: 12,
            fontWeight: 'bold',
            fill: '#00D4FF',
            stroke: '#ffffff',
            strokeWidth: 2,
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowBlur: 2
          }
        })
      }
    }
  })
  
  console.log(`渲染城市边界和标签 - 可见城市: ${visibleCityCount}, 绘制元素: ${children.length}`)
  
  return {
    type: 'group',
    children
  }
}

/**
 * 切换回中国地图
 */
const switchToCountryMap = async () => {
  if (!chartInstance) return
  
  try {
    console.log('切换回中国地图')
    
    // 切换回中国地图并清除城市边界线
    chartInstance.setOption({
      geo: {
        map: '中国',
        center: [105, 36],
        zoom: 2,
        roam: true,
        scaleLimit: {
          min: 0.5,
          max: 20 // 增加最大缩放到20倍
        },
        label: {
          show: true,
          color: '#6AD4DD'
        },
        itemStyle: {
          borderColor: '#5089EC',
          borderWidth: 1,
          areaColor: {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.5,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(0, 102, 154, 0)'
              },
              {
                offset: 1,
                color: 'rgba(18, 64, 118, .5)'
              }
            ]
          }
        },
        emphasis: {
          label: {
            color: '#6AD4DD'
          },
          itemStyle: {
            areaColor: '#378CE7',
            borderWidth: 0
          }
        }
      },
      // 清除所有系列，只保留省份标记点系列（移除城市边界线）
      series: [{
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 10,
        symbolSize: 0,
        itemStyle: { color: 'transparent' },
        label: {
          show: true,
          position: 'inside',
          offset: [0, 0],
          formatter: (params: any) => {
            const { name, stationCount, alarmCount } = params.data
            let parts = [`{name|${name}}`]
            if (stationCount > 0) {
              parts.push(`{stationBadge| ${stationCount}}`)
            }
            if (alarmCount > 0) {
              parts.push(`{alarmBadge| ${alarmCount}}`)
            }
            return parts.join('')
          },
          rich: {
            name: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#333333',
              padding: [3, 8],
              borderRadius: 0,
              fontSize: 11,
              fontWeight: 500,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 2,
              shadowOffsetY: 1
            },
            stationBadge: {
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              padding: [3, 6],
              borderRadius: 0,
              fontSize: 10,
              fontWeight: 'bold',
              shadowColor: 'rgba(245, 158, 11, 0.3)',
              shadowBlur: 2
            },
            alarmBadge: {
              backgroundColor: '#ef4444',
              color: '#ffffff',
              padding: [3, 6],
              borderRadius: 0,
              fontSize: 10,
              fontWeight: 'bold',
              shadowColor: 'rgba(239, 68, 68, 0.3)',
              shadowBlur: 2
            }
          }
        },
        data: [] // 数据会通过 updateProvinceMarkers 重新设置
      }],
      animation: true,
      animationDuration: 1500,
      animationEasing: 'cubicInOut'
    })
    
    console.log('✅ 成功切换回中国地图')
  } catch (error) {
    console.error('切换回中国地图失败:', error)
  }
}

/**
 * 预加载相邻省份的GeoJSON数据
 * @param currentProvinceAdcode 当前省份adcode
 */
const preloadAdjacentProvinces = async (currentProvinceAdcode: number) => {
  // 定义相邻省份映射关系（简化版，实际项目中可以从后端获取）
  const adjacentMap: Record<number, number[]> = {
    110000: [120000, 130000], // 北京 -> 天津、河北
    120000: [110000, 130000], // 天津 -> 北京、河北
    130000: [110000, 120000, 140000, 370000, 410000, 140000], // 河北 -> 北京、天津、山西、山东、河南、内蒙古
    310000: [320000, 330000], // 上海 -> 江苏、浙江
    320000: [310000, 330000, 340000, 370000], // 江苏 -> 上海、浙江、安徽、山东
    330000: [310000, 320000, 340000, 360000, 350000], // 浙江 -> 上海、江苏、安徽、江西、福建
    340000: [320000, 330000, 360000, 410000, 420000], // 安徽 -> 江苏、浙江、江西、河南、湖北
    350000: [330000, 360000, 440000], // 福建 -> 浙江、江西、广东
    360000: [330000, 340000, 350000, 420000, 430000], // 江西 -> 浙江、安徽、福建、湖北、湖南
    370000: [130000, 320000, 410000], // 山东 -> 河北、江苏、河南
    410000: [130000, 370000, 340000, 420000, 140000, 610000], // 河南 -> 河北、山东、安徽、湖北、山西、陕西
    420000: [410000, 340000, 360000, 430000, 500000, 610000], // 湖北 -> 河南、安徽、江西、湖南、重庆、陕西
    430000: [360000, 420000, 440000, 450000, 520000], // 湖南 -> 江西、湖北、广东、广西、贵州
    440000: [350000, 430000, 450000, 460000], // 广东 -> 福建、湖南、广西、海南
    450000: [430000, 440000, 520000, 530000], // 广西 -> 湖南、广东、贵州、云南
    460000: [440000], // 海南 -> 广东
    500000: [420000, 510000, 520000, 610000], // 重庆 -> 湖北、四川、贵州、陕西
    510000: [500000, 520000, 530000, 630000, 540000], // 四川 -> 重庆、贵州、云南、青海、西藏
    520000: [430000, 450000, 500000, 510000, 530000], // 贵州 -> 湖南、广西、重庆、四川、云南
    530000: [450000, 510000, 520000, 540000], // 云南 -> 广西、四川、贵州、西藏
    540000: [510000, 530000, 630000, 650000], // 西藏 -> 四川、云南、青海、新疆
    610000: [410000, 420000, 500000, 620000, 630000, 640000], // 陕西 -> 河南、湖北、重庆、甘肃、青海、宁夏
    620000: [610000, 630000, 650000], // 甘肃 -> 陕西、青海、新疆
    630000: [510000, 540000, 610000, 620000, 650000], // 青海 -> 四川、西藏、陕西、甘肃、新疆
    640000: [610000], // 宁夏 -> 陕西
    650000: [540000, 620000, 630000], // 新疆 -> 西藏、甘肃、青海
    140000: [130000, 410000], // 山西 -> 河北、河南
    150000: [130000, 230000, 630000], // 内蒙古 -> 河北、黑龙江、青海
    210000: [130000, 220000], // 辽宁 -> 河北、吉林
    220000: [210000, 230000], // 吉林 -> 辽宁、黑龙江
    230000: [220000, 150000] // 黑龙江 -> 吉林、内蒙古
  }
  
  const adjacentProvinces = adjacentMap[currentProvinceAdcode] || []
  
  // 异步预加载相邻省份的数据
  adjacentProvinces.forEach(provinceAdcode => {
    if (!cityGeoJsonCache.has(provinceAdcode) && !preloadQueue.has(provinceAdcode)) {
      preloadQueue.add(provinceAdcode)
      
      // 延迟预加载，避免阻塞主线程
      setTimeout(async () => {
        try {
          console.log(`预加载省份 ${provinceAdcode} 的GeoJSON数据`)
          await loadCityGeoJson(provinceAdcode)
          console.log(`✅ 预加载完成: ${provinceAdcode}`)
        } catch (error) {
          console.warn(`预加载失败: ${provinceAdcode}`, error)
        } finally {
          preloadQueue.delete(provinceAdcode)
        }
      }, Math.random() * 2000 + 1000) // 随机延迟1-3秒
    }
  })
}

/**
 * 生成城市标记数据（根据省份名称，按需加载数据）
 */
const generateCityMarkers = async (provinceName: string): Promise<MapMarker[]> => {
  console.log('==== 生成城市标记 ====')
  console.log('省份名称:', provinceName)
  
  try {
    // 从API加载该省份的城市数据
    const citiesInProvince = await loadProvinceCityData(provinceName)
    
    console.log('加载到城市数量:', citiesInProvince.length)
    
    if (citiesInProvince.length === 0) {
      return []
    }

    // 获取省份adcode
    const provinceAdcode = citiesInProvince[0].provinceAdcode

    // 加载城市GeoJSON
    const geoJSON = await loadCityGeoJson(provinceAdcode)
    if (!geoJSON) {
      console.warn(`无法加载省份 ${provinceName} 的GeoJSON`)
      return []
    }

    // 建立城市坐标映射
    const cityCoordMap = new Map<number, [number, number]>()
    geoJSON.features.forEach((feature: any) => {
      const adcode = feature.properties.adcode
      const centroid = feature.properties.centroid
      if (adcode && centroid) {
        cityCoordMap.set(adcode, centroid)
      }
    })

    // 生成标记数据
    const markers: MapMarker[] = citiesInProvince
      .map(city => {
        const coord = cityCoordMap.get(city.cityAdcode)
        if (!coord) {
          console.warn(`城市 ${city.cityName} (${city.cityAdcode}) 没有坐标`)
          return null
        }
        return {
          name: city.cityName,
          value: coord,
          stationCount: city.stationCount,
          alarmCount: city.alarmCount
        }
      })
      .filter(Boolean) as MapMarker[]
    
    console.log('生成城市标记:', markers.length, '个')
    return markers
  } catch (error) {
    console.error(`生成 ${provinceName} 城市标记失败:`, error)
    throw error
  }
}

/**
 * 更新城市标记点
 */
const updateCityMarkers = async (provinceName: string) => {
  if (!chartInstance) return
  
  const markers = await generateCityMarkers(provinceName)
  
  console.log('更新城市标记到地图，数量:', markers.length)
  console.log('标记数据:', markers)
  
  chartInstance.setOption({
    series: [{
      type: 'scatter',
      coordinateSystem: 'geo',
      zlevel: 10,
      symbolSize: 0, // 不显示圆点
      itemStyle: {
        color: 'transparent'
      },
      label: {
        show: true,
        position: 'inside',
        offset: [0, 0],
        formatter: (params: any) => {
          const { name, stationCount, alarmCount } = params.data
          let parts = [`{name|${name}}`]
          if (stationCount > 0) {
            parts.push(`{stationBadge| ${stationCount}}`)
          }
          if (alarmCount > 0) {
            parts.push(`{alarmBadge| ${alarmCount}}`)
          }
          return parts.join('')
        },
        rich: {
          name: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#333333',
            padding: [3, 8],
            borderRadius: 0,
            fontSize: 11,
            fontWeight: 500,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 2,
            shadowOffsetY: 1
          },
          stationBadge: {
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            padding: [3, 6],
            borderRadius: 0,
            fontSize: 10,
            fontWeight: 'bold',
            shadowColor: 'rgba(245, 158, 11, 0.3)',
            shadowBlur: 2
          },
          alarmBadge: {
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: [3, 6],
            borderRadius: 0,
            fontSize: 10,
            fontWeight: 'bold',
            shadowColor: 'rgba(239, 68, 68, 0.3)',
            shadowBlur: 2
          }
        }
      },
      data: markers
    }]
  })
}

/**
 * 注册地图
 */
const registerMap = async (mapInfo?: { name: string; adcode: number }) => {
  const _mapInfo = mapInfo ?? currentMap.value
  
  // 如果地图已注册，直接返回
  if (echarts.getMap(_mapInfo.name)) {
    return
  }

  try {
    const geoJSON = await getGeojson(_mapInfo.adcode)
    genAdcodeMap(geoJSON.features)
    echarts.registerMap(_mapInfo.name, geoJSON)
  } catch (error) {
    console.error('注册地图失败:', error)
  }
}


/**
 * 地图点击事件（scatter标记点击）
 */
const handleMapClick = async (params: any) => {
  // 如果点击的是scatter系列（标记点）
  if (params.componentType === 'series' && params.seriesType === 'scatter') {
    const { name, value } = params.data
    
    console.log('点击标记:', name, value)
    console.log('当前层级:', navList.value.length)
    
    // 根据当前层级判断是省份还是城市
    if (navList.value.length === 1) {
      // 当前在国家层级，点击的是省份
      console.log('钻取到省份:', name)
      
      try {
        // 更新导航
        navList.value.push({
          name,
          adcode: 0,
          level: 'province'
        })
        
        // 只进行缩放，城市边界将由缩放事件自动处理
        smoothZoomTo(value, 5)
        
        // 预加载该省份的城市数据到缓存（不显示标记，由缩放事件处理）
        const provinceInfo = provinceInfoMap.value.get(name)
        if (provinceInfo) {
          // 异步预加载，不阻塞缩放
          loadProvinceCityData(name).catch(error => {
            console.error(`预加载 ${name} 数据失败:`, error)
          })
          // 预加载相邻省份数据
          preloadAdjacentProvinces(provinceInfo.adcode)
        }
      } catch (error) {
        console.error('省份缩放失败:', error)
        ElMessage.error(`缩放到 ${name} 失败，请重试`)
        // 回滚导航状态
        navList.value.pop()
      }
    } else if (navList.value.length === 2) {
      // 当前在省份层级，点击的是城市
      console.log('钻取到城市:', name)
      
      try {
        // 显示加载状态
        mapLoading.value = true
        loadingText.value = `正在加载 ${name} 详情...`
        
        // 更新导航
        navList.value.push({
          name,
          adcode: 0,
          level: 'city'
        })
        
        // 平滑放大地图并居中到该城市
        smoothZoomTo(value, 8)
        
        // 模拟加载城市详细数据
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 清空标记（没有区县级数据）
        chartInstance?.setOption({
          series: [{
            type: 'scatter',
            coordinateSystem: 'geo',
            zlevel: 10,
            symbolSize: 0,
            itemStyle: { color: 'transparent' },
            label: { show: false },
            data: []
          }]
        })
      } catch (error) {
        console.error('加载城市数据失败:', error)
        ElMessage.error(`加载 ${name} 数据失败，请重试`)
        // 回滚导航状态
        navList.value.pop()
      } finally {
        mapLoading.value = false
      }
    }
  }
}

/**
 * 面包屑导航点击（返回上一级）
 */
const handleNavClick = async (_nav: NavItem, index: number) => {
  try {
    // 显示加载状态
    mapLoading.value = true
    loadingText.value = '正在切换视图...'
    
    // 移除后面的导航项
    navList.value.splice(index + 1)

    if (!chartInstance) return

    // 根据目标层级显示相应内容
    if (index === 0) {
      // 返回国家层级
      await switchToCountryMap()
      updateProvinceMarkers()
    } else if (index === 1) {
      // 返回省份层级  
      const provinceName = navList.value[1].name
      // 需要重新获取省份坐标来居中
      const provinceData = generateProvinceMarkers().find(m => m.name === provinceName)
      if (provinceData) {
        await updateCityMarkers(provinceName)
        await zoomToProvinceWithCityBorders(provinceName, provinceData.value)
      }
    }
  } catch (error) {
    console.error('导航切换失败:', error)
    ElMessage.error('切换视图失败，请重试')
  } finally {
    mapLoading.value = false
  }
}

/**
 * 初始化地图
 */
const initChart = () => {
  if (!chartRef.value) return

  // 创建图表实例
  chartInstance = echarts.init(chartRef.value)

  // 图表配置
  const option: EChartsOption = {
    backgroundColor: '#000000',
    geo: {
      map: currentMap.value.name,
      roam: true,
      center: [105, 36], // 初始中心点（中国地理中心）
      zoom: 2, // 初始缩放比例
      scaleLimit: {
        min: 1,
        max: 20 // 允许更大的缩放倍数
      },
      label: {
        show: true,
        color: '#6AD4DD'
      },
      itemStyle: {
        borderColor: '#5089EC',
        borderWidth: 1,
        areaColor: {
          type: 'radial',
          x: 0.5,
          y: 0.5,
          r: 0.5,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(0, 102, 154, 0)'
            },
            {
              offset: 1,
              color: 'rgba(18, 64, 118, .5)'
            }
          ]
        }
      },
      emphasis: {
        label: {
          color: '#6AD4DD'
        },
        itemStyle: {
          areaColor: '#378CE7',
          borderWidth: 0
        }
      }
    },
    series: [
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 10,
        symbolSize: 0, // 不显示圆点
        itemStyle: {
          color: 'transparent'
        },
        label: {
          show: true,
          position: 'inside',
          offset: [0, 0],
          formatter: (params: any) => {
            const { name, stationCount, alarmCount } = params.data
            let parts = [`{name|${name}}`]
            if (stationCount > 0) {
              parts.push(`{stationBadge| ${stationCount}}`)
            }
            if (alarmCount > 0) {
              parts.push(`{alarmBadge| ${alarmCount}}`)
            }
            return parts.join('')
          },
          rich: {
            name: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#333333',
              padding: [3, 8],
              borderRadius: 0,
              fontSize: 11,
              fontWeight: 500,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 2,
              shadowOffsetY: 1
            },
            stationBadge: {
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              padding: [3, 6],
              borderRadius: 0,
              fontSize: 10,
              fontWeight: 'bold',
              shadowColor: 'rgba(245, 158, 11, 0.3)',
              shadowBlur: 2
            },
            alarmBadge: {
              backgroundColor: '#ef4444',
              color: '#ffffff',
              padding: [3, 6],
              borderRadius: 0,
              fontSize: 10,
              fontWeight: 'bold',
              shadowColor: 'rgba(239, 68, 68, 0.3)',
              shadowBlur: 2
            }
          }
        },
        data: []
      }
    ]
  }

  chartInstance.setOption(option)

  // 绑定点击事件（使用非异步包装函数）
  chartInstance.on('click', (params: any) => {
    // 异步处理，不阻塞事件
    handleMapClick(params).catch(error => {
      console.error('地图点击处理失败:', error)
    })
  })
  
  // 绑定缩放事件
  chartInstance.on('geoRoam', (params: any) => {
    if (params.zoom) {
      // 异步处理缩放事件，不阻塞地图操作
      handleMapZoom(params).catch(error => {
        console.error('地图缩放处理失败:', error)
      })
    }
  })
}

/**
 * 重新加载数据
 */
const retryLoadData = async () => {
  try {
    mapLoading.value = true
    loadingText.value = '正在重新加载数据...'
    hasLoadError.value = false
    
    // 重新加载全部城市电站数据
    await loadAllCityStationsData()
    
    // 如果当前在省份层级，重新加载省份数据
    if (navList.value.length === 2) {
      const provinceName = navList.value[1].name
      await updateCityMarkers(provinceName)
    }
    
    ElMessage.success('数据加载成功')
  } catch (error) {
    console.error('重新加载数据失败:', error)
    hasLoadError.value = true
    ElMessage.error('重新加载失败，请稍后再试')
  } finally {
    mapLoading.value = false
  }
}

/**
 * 显示电站详情
 */
const showStationDetail = () => {
  currentStationId.value = 'station-001'
  stationDialogVisible.value = true
}

/**
 * 缩放控制方法
 */
const zoomIn = () => {
  if (!chartInstance) return
  
  const option = chartInstance.getOption() as any
  const currentZoom = option?.geo?.[0]?.zoom || 2
  const newZoom = Math.min(currentZoom * 1.5, 20) // 最大20倍
  
  console.log(`🔍 手动放大: ${currentZoom} -> ${newZoom}`)
  
  // 更新缩放级别配置
  ZOOM_CONFIG.currentZoom.value = newZoom
  
  chartInstance.setOption({
    geo: {
      zoom: newZoom,
      animation: true,
      animationDuration: 300,
      animationEasing: 'cubicOut'
    }
  })
}

const zoomOut = () => {
  if (!chartInstance) return
  
  const option = chartInstance.getOption() as any
  const currentZoom = option?.geo?.[0]?.zoom || 2
  const newZoom = Math.max(currentZoom / 1.5, 1) // 最小1倍
  
  console.log(`🔍 手动缩小: ${currentZoom} -> ${newZoom}`)
  
  // 更新缩放级别配置
  ZOOM_CONFIG.currentZoom.value = newZoom
  
  chartInstance.setOption({
    geo: {
      zoom: newZoom,
      animation: true,
      animationDuration: 300,
      animationEasing: 'cubicOut'
    }
  })
  
  // 检查是否需要隐藏城市边界
  if (newZoom <= ZOOM_CONFIG.hideCityBorders && activeProvince.value) {
    console.log(`🔍 手动缩放触发隐藏城市边界: ${newZoom} <= ${ZOOM_CONFIG.hideCityBorders}`)
    hideCityBorders()
  }
}

/**
 * 地图缩放事件处理（防抖处理）
 */
let zoomDebounceTimer: NodeJS.Timeout | null = null
const handleMapZoom = async (params: any) => {
  if (!chartInstance) return
  
  // 使用 totalZoom 作为真实的缩放级别
  const actualZoom = params.totalZoom || 2
  const oldZoom = ZOOM_CONFIG.currentZoom.value
  ZOOM_CONFIG.currentZoom.value = actualZoom
  
  console.log(`🔍 地图缩放事件: ${oldZoom} -> ${actualZoom}`)
  
  // 防抖处理，避免频繁触发缩放事件导致地图移位
  if (zoomDebounceTimer) {
    clearTimeout(zoomDebounceTimer)
  }
  
  // 立即检查是否需要隐藏城市边界（不使用防抖）
  if (actualZoom <= ZOOM_CONFIG.hideCityBorders && activeProvince.value) {
    console.log(`✅ 立即触发隐藏城市边界条件：缩放级别 ${actualZoom} <= ${ZOOM_CONFIG.hideCityBorders}`)
    hideCityBorders()
  } else {
    // 对于显示城市边界的操作使用防抖，避免频繁触发
    zoomDebounceTimer = setTimeout(async () => {
      console.log(`🔍 防抖处理缩放事件 - 当前级别: ${actualZoom}, 活动省份: "${activeProvince.value}"`)
      
      try {
        if (actualZoom >= ZOOM_CONFIG.showCityBorders) {
          if (!activeProvince.value) {
            console.log(`✅ 触发显示城市边界条件：缩放级别 ${actualZoom} >= ${ZOOM_CONFIG.showCityBorders}`)
            await showCityBordersAtCurrentView(actualZoom)
          } else {
            // 只有在缩放级别显著增加时才检查省份变化，避免缩小过程中的误判
            if (actualZoom > oldZoom + 3 && chartInstance) {
              console.log(`ℹ️ 缩放级别显著增加(${oldZoom} -> ${actualZoom})，检查省份变化`)
              const option = chartInstance.getOption() as any
              const center = option?.geo?.[0]?.center || [105, 36]
              const currentProvince = findProvinceByCoordinate(center)
              
              if (currentProvince && currentProvince !== activeProvince.value) {
                console.log(`✅ 省份发生变化：${activeProvince.value} -> ${currentProvince}`)
                await showCityBordersAtCurrentView(actualZoom)
              }
            } else {
              console.log(`ℹ️ 保持当前省份 ${activeProvince.value} 的城市边界`)
            }
          }
        } else {
          console.log(`⏸️ 缩放级别 ${actualZoom} 未达到切换阈值 (显示:${ZOOM_CONFIG.showCityBorders}, 隐藏:${ZOOM_CONFIG.hideCityBorders})`)
        }
      } catch (error) {
        console.error('缩放事件处理失败:', error)
      }
    }, 100) // 100ms防抖延迟，仅用于显示城市边界
  }
}

/**
 * 在当前视野显示城市边界
 */
const showCityBordersAtCurrentView = async (zoom: number) => {
  if (!chartInstance) return
  
  try {
    mapLoading.value = true
    loadingText.value = '正在加载区域详情...'
    
    // 获取当前地图中心点
    const option = chartInstance.getOption() as any
    const center = option?.geo?.[0]?.center || [105, 36]
    
    console.log(`🗺️ 当前地图中心点:`, center)
    
    // 根据中心点判断当前在哪个省份区域
    const province = findProvinceByCoordinate(center)
    if (!province) {
      console.log('❌ 无法确定当前省份区域，中心点:', center)
      return
    }
    
    console.log(`✅ 检测到省份: ${province}，在缩放级别 ${zoom} 显示城市边界`)
    activeProvince.value = province
    
    // 加载并显示该省份的城市边界
    await loadAndShowProvinceCityBorders(province)
    
  } catch (error) {
    console.error('显示城市边界失败:', error)
  } finally {
    mapLoading.value = false
  }
}

/**
 * 隐藏城市边界
 */
const hideCityBorders = async () => {
  if (!chartInstance) return
  
  console.log('🔄 开始隐藏城市边界，当前活动省份:', activeProvince.value)
  activeProvince.value = ''
  
  // 生成省份标记数据
  const provinceMarkers = generateProvinceMarkers()
  console.log('🔄 恢复省份标记，数量:', provinceMarkers.length)
  
  if (provinceMarkers.length === 0) {
    console.warn('⚠️ 省份标记数据为空，可能数据未初始化')
    // 如果省份数据为空，尝试重新加载
    await loadAllCityStationsData()
    const retryMarkers = generateProvinceMarkers()
    console.log('🔄 重新加载后省份标记数量:', retryMarkers.length)
  }
  
  // 获取当前地图状态，保持中心点和缩放级别不变
  const currentOption = chartInstance.getOption() as any
  const currentCenter = currentOption?.geo?.[0]?.center || [105, 36]
  const currentZoom = currentOption?.geo?.[0]?.zoom || 2
  
  console.log(`🔄 保持地图状态 - 中心: [${currentCenter}], 缩放: ${currentZoom}`)
  
  // 清除所有series，然后恢复为只显示省份标记
  chartInstance.setOption({
    series: [], // 先清空所有series
    geo: {
      center: currentCenter, // 保持中心点
      zoom: currentZoom // 保持缩放级别
    }
  })
  
  // 延迟一帧后重新设置省份标记，确保完全清除城市边界
  setTimeout(() => {
    if (!chartInstance) return
    
    const finalMarkers = provinceMarkers.length > 0 ? provinceMarkers : generateProvinceMarkers()
    chartInstance.setOption({
      geo: {
        center: currentCenter, // 再次确保中心点不变
        zoom: currentZoom // 再次确保缩放级别不变
      },
      series: [{
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 10,
        symbolSize: 0,
        itemStyle: { color: 'transparent' },
        label: {
          show: true,
          position: 'inside',
          offset: [0, 0],
          formatter: (params: any) => {
            const { name, stationCount, alarmCount } = params.data
            let parts = [`{name|${name}}`]
            if (stationCount > 0) {
              parts.push(`{stationBadge| ${stationCount}}`)
            }
            if (alarmCount > 0) {
              parts.push(`{alarmBadge| ${alarmCount}}`)
            }
            return parts.join('')
          },
          rich: {
            name: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#333333',
              padding: [3, 8],
              borderRadius: 0,
              fontSize: 11,
              fontWeight: 500,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 2,
              shadowOffsetY: 1
            },
            stationBadge: {
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              padding: [3, 6],
              borderRadius: 0,
              fontSize: 10,
              fontWeight: 'bold',
              shadowColor: 'rgba(245, 158, 11, 0.3)',
              shadowBlur: 2
            },
            alarmBadge: {
              backgroundColor: '#ef4444',
              color: '#ffffff',
              padding: [3, 6],
              borderRadius: 0,
              fontSize: 10,
              fontWeight: 'bold',
              shadowColor: 'rgba(239, 68, 68, 0.3)',
              shadowBlur: 2
            }
          }
        },
        data: finalMarkers
      }]
    })
    
    console.log('✅ 省份标记恢复完成，清除了所有城市边界和标记')
  }, 10)
}

/**
 * 根据坐标找到对应的省份
 * @param coordinate 经纬度坐标 [lng, lat]
 */
const findProvinceByCoordinate = (coordinate: [number, number]): string => {
  const [lng, lat] = coordinate
  
  console.log(`🔍 坐标查找省份: [${lng}, ${lat}]`)
  
  // 改用基于省份中心点距离的匹配方式，更精确
  const provinceCenters: Record<string, [number, number]> = {
    '广东省': [113.3, 23.1],
    '江苏省': [118.8, 32.1],
    '浙江省': [120.2, 30.2],
    '安徽省': [117.3, 31.8],
    '湖南省': [112.0, 28.2],  // 湖南省中心
    '湖北省': [114.3, 30.6],  // 湖北省中心
    '山东省': [117.0, 36.7],
    '河北省': [114.5, 38.0],
    '河南省': [113.7, 34.8],
    '四川省': [104.1, 30.7]
  }
  
  console.log(`🔍 查找距离 [${lng}, ${lat}] 最近的省份`)
  
  let closestProvince = ''
  let minDistance = Infinity
  
  // 计算到各省中心的距离，选择最近的
  Object.entries(provinceCenters).forEach(([province, center]) => {
    const distance = Math.sqrt(
      Math.pow(lng - center[0], 2) + Math.pow(lat - center[1], 2)
    )
    console.log(`📍 ${province} 中心距离: ${distance.toFixed(2)}`)
    
    if (distance < minDistance) {
      minDistance = distance
      closestProvince = province
    }
  })
  
  // 如果距离太远（超过5度），认为不在任何省份范围内
  if (minDistance > 5) {
    console.log(`❌ 最近距离 ${minDistance.toFixed(2)} 过大，无法确定省份`)
    return ''
  }
  
  console.log(`✅ 匹配到最近省份: ${closestProvince}，距离: ${minDistance.toFixed(2)}`)
  return closestProvince
}

/**
 * 加载并显示省份城市边界
 * @param provinceName 省份名称
 */
const loadAndShowProvinceCityBorders = async (provinceName: string) => {
  if (!chartInstance) return
  
  try {
    console.log(`加载 ${provinceName} 城市边界数据`)
    
    // 加载省份城市数据（如果没有缓存）
    if (!provinceCityDataCache.has(provinceName)) {
      const cities = await loadProvinceCityData(provinceName)
      console.log(`加载到 ${provinceName} 的 ${cities.length} 个城市`)
    }
    
    // 获取省份adcode和城市GeoJSON数据
    const currentProvinceCities = provinceCityDataCache.get(provinceName)
    if (!currentProvinceCities || currentProvinceCities.length === 0) {
      console.warn(`无法找到省份 ${provinceName} 的城市数据`)
      return
    }
    
    const provinceAdcode = currentProvinceCities[0].provinceAdcode
    const cityGeoJSON = await loadCityGeoJson(provinceAdcode)
    
    if (!cityGeoJSON) {
      console.warn(`无法获取省份 ${provinceName} 的城市边界数据`)
      return
    }
    
    console.log(`获取到 ${provinceName} 的城市边界，特征数量:`, cityGeoJSON.features?.length || 0)
    
    // 获取当前地图状态，保持中心点和缩放级别不变
    const currentOption = chartInstance.getOption() as any
    const currentCenter = currentOption?.geo?.[0]?.center || [105, 36]
    const currentZoom = currentOption?.geo?.[0]?.zoom || 2
    
    console.log(`🗺️ 保持地图状态 - 中心: [${currentCenter}], 缩放: ${currentZoom}`)
    
    // 更新地图，添加城市边界线和城市标记
    const currentMarkers = await generateCityMarkers(provinceName)
    
    chartInstance.setOption({
      geo: {
        center: currentCenter, // 保持中心点
        zoom: currentZoom // 保持缩放级别
      },
      series: [
        // 城市标记点
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 10,
          symbolSize: 0,
          itemStyle: { color: 'transparent' },
          label: {
            show: true,
            position: 'inside',
            offset: [0, 0],
            formatter: (params: any) => {
              const { name, stationCount, alarmCount } = params.data
              let parts = [`{name|${name}}`]
              if (stationCount > 0) {
                parts.push(`{stationBadge| ${stationCount}}`)
              }
              if (alarmCount > 0) {
                parts.push(`{alarmBadge| ${alarmCount}}`)
              }
              return parts.join('')
            },
            rich: {
              name: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#333333',
                padding: [3, 8],
                borderRadius: 0,
                fontSize: 11,
                fontWeight: 500,
                shadowColor: 'rgba(0, 0, 0, 0.2)',
                shadowBlur: 2,
                shadowOffsetY: 1
              },
              stationBadge: {
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                padding: [3, 6],
                borderRadius: 0,
                fontSize: 10,
                fontWeight: 'bold',
                shadowColor: 'rgba(245, 158, 11, 0.3)',
                shadowBlur: 2
              },
              alarmBadge: {
                backgroundColor: '#ef4444',
                color: '#ffffff',
                padding: [3, 6],
                borderRadius: 0,
                fontSize: 10,
                fontWeight: 'bold',
                shadowColor: 'rgba(239, 68, 68, 0.3)',
                shadowBlur: 2
              }
            }
          },
          data: currentMarkers
        },
        // 城市边界线  
        {
          type: 'custom',
          coordinateSystem: 'geo',
          zlevel: 5,
          renderItem: (_params: any, api: any) => renderCityBorders(_params, api, cityGeoJSON),
          data: [{ value: 1 }]
        }
      ]
    })
    
  } catch (error) {
    console.error(`加载省份城市边界失败:`, error)
  }
}

/**
 * 窗口大小调整
 */
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(async () => {
  // 步骤1: 注册地图（获取Geojson数据，生成provinceInfoMap）
  await registerMap()
  
  // 步骤2: 初始化图表
  initChart()
  
  // 步骤3: 加载全部城市电站数据（不显示标记，只用于缓存）
  await loadAllCityStationsData()
  
  // 步骤4: 更新省份标记（初始显示）
  updateProvinceMarkers()

  // 步骤5: 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  // 清理防抖定时器
  if (zoomDebounceTimer) {
    clearTimeout(zoomDebounceTimer)
    zoomDebounceTimer = null
  }
  
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped lang="scss">
.map-card-new {
  width: 100%;
  height: 100%;
  min-height: 0; /* 关键：允许flex子元素收缩 */
  flex: 1; /* 关键：允许flex拉伸 */
  position: relative;
  background: #000000;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  // 左上角工具栏
  .map-toolbar-top {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;

    .location-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(80, 137, 236, 0.5);
      border-radius: 8px;

      .icon-globe {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: #6AD4DD;
      }

      .location-text {
        display: flex;
        align-items: center;
        font-size: 16px;
        color: #ffffff;
        font-weight: 500;

        .location-part {
          display: inline-flex;
          align-items: center;
          transition: all 0.3s ease;

          &.clickable {
            cursor: pointer;
            color: #6AD4DD;

            &:hover {
              color: #93EBF8;
              text-shadow: 0 0 8px rgba(147, 235, 248, 0.5);
            }
          }

          &:last-child {
            color: #93EBF8;
            font-weight: 600;
          }

          .separator {
            color: rgba(255, 255, 255, 0.4);
            margin: 0 8px;
          }
        }
      }
    }
  }

  // 缩放控制器样式
  .zoom-controls {
    position: absolute;
    top: 80px; // 调整位置避免遮挡面包屑
    left: 20px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(80, 137, 236, 0.5);
    border-radius: 8px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    
    .zoom-btn {
      width: 40px;
      height: 36px;
      background: rgba(0, 0, 0, 0.7);
      border: none;
      border-bottom: 1px solid rgba(80, 137, 236, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:last-child {
        border-bottom: none;
      }
      
      .el-icon {
        color: #6AD4DD;
        font-size: 16px;
        font-weight: bold;
      }
      
      &:hover {
        background: rgba(80, 137, 236, 0.2);
        
        .el-icon {
          color: #93EBF8;
        }
      }
      
      &:active {
        background: rgba(80, 137, 236, 0.3);
        transform: scale(0.95);
      }
    }
    
    .zoom-level-display {
      width: 40px;
      height: 24px;
      background: rgba(0, 0, 0, 0.9);
      border-top: 1px solid rgba(80, 137, 236, 0.3);
      border-bottom: 1px solid rgba(80, 137, 236, 0.3);
      color: #6AD4DD;
      font-size: 10px;
      font-weight: bold;
      font-family: monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      text-shadow: 0 0 4px rgba(106, 212, 221, 0.5);
    }
  }

  // 控制按钮
  .map-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .control-btn {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(80, 137, 236, 0.5);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;

      .el-icon {
        font-size: 20px;
        color: #6AD4DD;
      }

      &:hover {
        background: rgba(80, 137, 236, 0.3);
        border-color: #5089EC;
        box-shadow: 0 0 12px rgba(80, 137, 236, 0.5);

        .el-icon {
          color: #93EBF8;
        }
      }
      
      &.retry-btn {
        border-color: rgba(239, 68, 68, 0.5);
        
        .el-icon {
          color: #ef4444;
        }
        
        &:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
          
          .el-icon {
            color: #ff6b6b;
          }
        }
      }
    }
  }

  // 地图容器
  .map-container {
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0;
    position: relative;
    
    // 加载状态覆盖层
    .map-loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      border-radius: 8px;
      
      .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 24px;
        background: rgba(13, 35, 68, 0.95);
        border: 1px solid rgba(80, 137, 236, 0.5);
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        
        .loading-icon {
          font-size: 24px;
          color: #00D4FF;
          animation: spin 1s linear infinite;
        }
        
        .loading-text {
          font-size: 14px;
          color: #ffffff;
          font-weight: 500;
          text-align: center;
        }
      }
    }
  }
  
  // 旋转动画
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}
</style>

