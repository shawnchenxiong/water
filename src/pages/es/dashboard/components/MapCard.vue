<template>
  <div class="map-card">
    <!-- 左上角位置导航 -->
    <div class="map-toolbar">
      <div class="location-info">
        <el-icon class="icon-globe"><Grid /></el-icon>
        <div class="location-breadcrumb">
          <span 
            v-for="(nav, index) in breadcrumb" 
            :key="`${nav.code}-${index}`"
            class="breadcrumb-wrapper"
          >
            <span v-if="index > 0" class="separator">/</span>
            <span 
              :class="['location-item', { 
                clickable: index < breadcrumb.length - 1,
                current: index === breadcrumb.length - 1
              }]"
              @click="index < breadcrumb.length - 1 ? handleBreadcrumbClick(index) : null"
            >
              {{ nav.name }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- 缩放控制器 -->
    <div class="zoom-controls">
      <div class="zoom-btn" @click="handleZoomIn">
        <el-icon><Plus /></el-icon>
      </div>
      <div class="zoom-level">{{ zoomLevel }}</div>
      <div class="zoom-btn" @click="handleZoomOut">
        <el-icon><Minus /></el-icon>
      </div>
    </div>

    <!-- 地图容器 -->
    <div ref="mapRef" class="map-container">
      <!-- 加载状态 - 使用 v-show 代替 v-if 避免 DOM 移除问题 -->
      <div v-show="loading" class="map-loading">
        <div class="loading-content">
          <el-icon class="loading-icon is-loading"><Loading /></el-icon>
          <span class="loading-text">{{ loadingText }}</span>
        </div>
      </div>
    </div>

    <!-- 电站详情弹窗 -->
    <teleport to="body">
      <StationDetailDialog
        v-model="stationDialogVisible"
        :station-id="currentStationId"
      />
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { Grid, Plus, Minus, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCityStations, getDistrictStations } from '@/api/pvDashboardApi'
import type { CityStationData, DistrictStationData } from '@/api/types/pv-dashboard'
import StationDetailDialog from '@/components/common/StationDetailDialog.vue'

// ========== 类型定义 ==========
interface MapLevel {
  name: string
  code: string
  level: 'country' | 'province' | 'city' | 'district'
}

interface GeoJSON {
  type: string
  features: Array<{
    type: string
    properties: {
      name: string
      adcode: string | number
      center?: [number, number]
      centroid?: [number, number]
      [key: string]: any
    }
    geometry: any
  }>
}

interface RegionData {
  name: string
  code: string
  position: [number, number]
  stationCount: number
  alarmCount: number
}

// ========== 响应式数据 ==========
const mapRef = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null

// 导航面包屑
const breadcrumb = ref<MapLevel[]>([
  { name: '中国', code: '100000', level: 'country' }
])

// 缩放级别
const zoomLevel = ref(1.3)

// 加载状态
const loading = ref(false)
const loadingText = ref('Loading map data...')

// 地图数据缓存
const mapCache = new Map<string, GeoJSON>()

// 电站详情弹窗
const stationDialogVisible = ref(false)
const currentStationId = ref<string>('')

// 城市电站数据
const cityStationsData = ref<CityStationData[]>([])

// 区级电站数据
const districtStationsData = ref<DistrictStationData[]>([])

// 省份信息映射（从GeoJSON提取）
interface ProvinceInfo {
  adcode: number
  name: string
  center: [number, number]
  centroid: [number, number]
}
const provinceInfoMap = ref<Map<number, ProvinceInfo>>(new Map())

// 城市信息映射（从GeoJSON提取）
interface CityInfo {
  adcode: number
  name: string
  center: [number, number]
  centroid: [number, number]
  provinceAdcode: number
}
const cityInfoMap = ref<Map<number, CityInfo>>(new Map())

// 区信息映射（从GeoJSON提取）
interface DistrictInfo {
  adcode: number
  name: string
  center: [number, number]
  centroid: [number, number]
  cityAdcode: number
}
const districtInfoMap = ref<Map<number, DistrictInfo>>(new Map())

// ========== 核心函数 ==========

/**
 * 加载城市电站数据
 */
const loadCityStationsData = async () => {
  try {
    const response = await getCityStations()
    if (response.code === 200 && response.data) {
      cityStationsData.value = response.data
      console.log('✅ 城市电站数据加载完成，共', cityStationsData.value.length, '个城市')
    }
  } catch (error) {
    console.error('加载城市电站数据失败:', error)
  }
}

/**
 * 加载区级电站数据
 */
const loadDistrictStationsData = async () => {
  try {
    const response = await getDistrictStations()
    if (response.code === 200 && response.data) {
      districtStationsData.value = response.data
      console.log('✅ 区级电站数据加载完成，共', districtStationsData.value.length, '个区')
    }
  } catch (error) {
    console.error('加载区级电站数据失败:', error)
  }
}

/**
 * 从城市数据汇总生成省份数据
 */
const generateProvinceData = (): RegionData[] => {
  const provinceMap = new Map<number, { stationCount: number; alarmCount: number }>()
  
  cityStationsData.value.forEach((city) => {
    const current = provinceMap.get(city.provinceAdcode) || { stationCount: 0, alarmCount: 0 }
    current.stationCount += city.stationCount
    current.alarmCount += city.alarmCount
    provinceMap.set(city.provinceAdcode, current)
  })
  
  const result: RegionData[] = []
  provinceMap.forEach((data, provinceAdcode) => {
    const provinceInfo = provinceInfoMap.value.get(provinceAdcode)
    
    if (!provinceInfo) {
      return // 跳过没有地理信息的省份
    }
    
    result.push({
      name: provinceInfo.name,
      code: String(provinceAdcode),
      position: provinceInfo.centroid, // 使用质心坐标
      stationCount: data.stationCount,
      alarmCount: data.alarmCount
    })
  })
  
  return result
}

/**
 * 获取指定省份的城市数据
 */
const getCitiesDataForProvince = (provinceAdcode: number): RegionData[] => {
  const citiesInProvince = cityStationsData.value.filter(
    city => city.provinceAdcode === provinceAdcode
  )
  
  const result: RegionData[] = []
  
  citiesInProvince.forEach((city) => {
    const cityInfo = cityInfoMap.value.get(city.cityAdcode)
    
    if (!cityInfo || !cityInfo.centroid) {
      return // 跳过没有地理信息的城市
    }
    
    result.push({
      name: city.cityName,
      code: String(city.cityAdcode),
      position: cityInfo.centroid, // 使用质心坐标
      stationCount: city.stationCount,
      alarmCount: city.alarmCount
    })
  })
  
  return result
}

/**
 * 获取指定城市的区数据
 */
const getDistrictsDataForCity = (cityAdcode: number): RegionData[] => {
  // 从 API 数据中筛选指定城市的区
  const districts = districtStationsData.value.filter(d => d.cityAdcode === cityAdcode)
  
  // 获取城市的中心坐标作为基准
  const cityInfo = cityInfoMap.value.get(cityAdcode)
  
  if (!cityInfo || !cityInfo.centroid) {
    console.warn(`城市 ${cityAdcode} 没有地理信息`)
    return []
  }
  
  const [cityLng, cityLat] = cityInfo.centroid
  
  const result: RegionData[] = []
  
  districts.forEach((district, index) => {
    // 尝试从 districtInfoMap 获取真实坐标
    let districtInfo = districtInfoMap.value.get(district.districtAdcode)
    
    let position: [number, number]
    
    if (districtInfo && districtInfo.centroid) {
      // 使用真实的区坐标
      position = districtInfo.centroid
    } else {
      // 生成模拟坐标：以城市中心为基准，在周围分布
      const angle = (index / districts.length) * 2 * Math.PI
      const radius = 0.15 // 约15公里的偏移
      const offsetLng = radius * Math.cos(angle)
      const offsetLat = radius * Math.sin(angle)
      position = [cityLng + offsetLng, cityLat + offsetLat]
    }
    
    result.push({
      name: district.districtName,
      code: String(district.districtAdcode),
      position,
      stationCount: district.stationCount,
      alarmCount: district.alarmCount
    })
  })
  
  console.log(`✅ 城市 ${cityAdcode} 加载了 ${result.length} 个区的标记点`)
  
  return result
}


/**
 * 获取地图数据
 */
const fetchMapData = async (code: string): Promise<GeoJSON | null> => {
  // 检查缓存
  if (mapCache.has(code)) {
    return mapCache.get(code)!
  }

  try {
    let url: string

    // 根据 code 的编码规则判断层级
    // 中国地图特殊处理
    if (code === '100000') {
      url = '/china.json'
    } 
    // 省级地图：编码末尾是0000（如 430000 湖南省）
    else if (code.endsWith('0000') && code.length === 6) {
      url = `/province/${code}.json`
    } 
    // 市级地图：编码末尾是00但不是0000（如 430100 长沙市）
    else if (code.endsWith('00') && !code.endsWith('0000') && code.length === 6) {
      url = `/city/${code}.json`
    }
    // 区级地图：其他情况
    else {
      throw new Error(`Unsupported map code: ${code}`)
    }

    console.log(`Loading map data from: ${url} (code: ${code})`)
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to load map data: ${response.statusText}`)
    }
    
    const data = await response.json() as GeoJSON
    
    // 缓存数据
    mapCache.set(code, data)
    
    return data
  } catch (error) {
    console.error(`Error loading map data for ${code}:`, error)
    ElMessage.error(`Failed to load map data for ${code}. Please make sure the GeoJSON file exists.`)
    return null
  }
}

/**
 * 渲染地图
 */
const renderMap = async (code: string, name: string) => {
  if (!chartInstance) return

  loading.value = true
  loadingText.value = `Loading ${name} map data...`

  try {
    // 获取地图数据
    const geoData = await fetchMapData(code)
    
    if (!geoData) {
      loading.value = false
      return
    }

    // 提取地理信息到映射表
    const currentLevel = breadcrumb.value[breadcrumb.value.length - 1].level
    
    if (currentLevel === 'country') {
      // 提取省份信息
      geoData.features.forEach((feature) => {
        const props = feature.properties
        if (props.adcode && props.name && props.center && props.centroid) {
          const adcode = typeof props.adcode === 'string' ? parseInt(props.adcode) : props.adcode
          provinceInfoMap.value.set(adcode, {
            adcode,
            name: props.name,
            center: props.center,
            centroid: props.centroid
          })
        }
      })
    } else if (currentLevel === 'province') {
      // 提取城市信息
      const provinceAdcode = parseInt(code)
      geoData.features.forEach((feature) => {
        const props = feature.properties
        if (props.adcode && props.name && props.center && props.centroid) {
          const adcode = typeof props.adcode === 'string' ? parseInt(props.adcode) : props.adcode
          cityInfoMap.value.set(adcode, {
            adcode,
            name: props.name,
            center: props.center,
            centroid: props.centroid,
            provinceAdcode
          })
        }
      })
    } else if (currentLevel === 'city') {
      // 提取区信息
      const cityAdcode = parseInt(code)
      geoData.features.forEach((feature) => {
        const props = feature.properties
        if (props.adcode && props.name && props.center && props.centroid) {
          const adcode = typeof props.adcode === 'string' ? parseInt(props.adcode) : props.adcode
          districtInfoMap.value.set(adcode, {
            adcode,
            name: props.name,
            center: props.center,
            centroid: props.centroid,
            cityAdcode
          })
        }
      })
    }

    // 注册地图
    echarts.registerMap(name, geoData as any)

    // 获取当前层级的标记点数据
    let markersData: RegionData[] = []
    
    if (currentLevel === 'country') {
      // 国家级别显示省份标记
      markersData = generateProvinceData()
    } else if (currentLevel === 'province') {
      // 省份级别显示城市标记
      const provinceAdcode = parseInt(code)
      markersData = getCitiesDataForProvince(provinceAdcode)
    } else if (currentLevel === 'city') {
      // 城市级别显示区标记
      const cityAdcode = parseInt(code)
      markersData = getDistrictsDataForCity(cityAdcode)
    }

    // 配置选项
    const option: any = {
      geo: {
        map: name,
        roam: true, // 开启缩放和平移
        zoom: zoomLevel.value,
        center: undefined, // 自动居中
        layoutCenter: ['50%', '50%'],
        layoutSize: '100%',
        
        // 区域样式
        itemStyle: {
          borderColor: '#5089EC', // 边框颜色
          borderWidth: 1,
          areaColor: {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.8,
            colorStops: [
              { offset: 0, color: 'rgba(106, 212, 221, 0)' },
              { offset: 1, color: 'rgba(106, 212, 221, 0.06)' }
            ]
          },
          shadowColor: 'rgba(0, 212, 255, 0.2)',
          shadowBlur: 10
        },
        
        // 标签样式（隐藏，使用 scatter 的标签代替）
        label: {
          show: false
        },
        
        // 高亮样式
        emphasis: {
          label: {
            show: false
          },
          itemStyle: {
            areaColor: '#378CE7', // 高亮区域颜色
            borderWidth: 2,
            borderColor: '#6AD4DD',
            shadowColor: 'rgba(0, 212, 255, 0.5)',
            shadowBlur: 20
          }
        },
        
        // 选中样式
        select: {
          label: {
            show: false
          },
          itemStyle: {
            areaColor: '#4A9FF5'
          }
        }
      },
      
      // 工具提示
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(13, 35, 68, 0.95)',
        borderColor: 'rgba(80, 137, 236, 0.5)',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff',
          fontSize: 14
        },
        formatter: (params: any) => {
          // 如果是 scatter 系列的点
          if (params.seriesType === 'scatter') {
            const { name, stationCount, alarmCount } = params.data
            return `<div style="padding: 10px;">
              <div style="font-weight: bold; color: #6AD4DD; margin-bottom: 8px; font-size: 15px;">
                ${name}
              </div>
              <div style="color: rgba(255,255,255,0.85); font-size: 13px; margin-bottom: 4px;">
                电站数量: <span style="color: #f59e0b; font-weight: bold;">${stationCount}</span>
              </div>
              <div style="color: rgba(255,255,255,0.85); font-size: 13px; margin-bottom: 6px;">
                告警数量: <span style="color: #ef4444; font-weight: bold;">${alarmCount}</span>
              </div>
              <div style="color: rgba(255,255,255,0.5); font-size: 12px; font-style: italic;">
                Click to drill down ↓
              </div>
            </div>`
          }
          
          // 如果是地图区域
          return `<div style="padding: 8px;">
            <div style="font-weight: bold; color: #6AD4DD; margin-bottom: 4px;">
              ${params.name}
            </div>
            <div style="color: rgba(255,255,255,0.7); font-size: 12px;">
              Click to drill down
            </div>
          </div>`
        }
      },
      
      // 标记点系列
      series: [
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          data: markersData.map((region) => ({
            name: region.name,
            value: region.position,
            code: region.code,
            stationCount: region.stationCount,
            alarmCount: region.alarmCount
          })),
          label: {
            show: true,
            formatter: (params: any) => {
              const { name, stationCount, alarmCount } = params.data
              
              // 构建富文本标签：地名 + 电站数量徽章 + 告警数量徽章
              let parts = [`{name|${name}}`]
              
              // 电站数量徽章（橙色）
              if (stationCount > 0) {
                parts.push(`{stationBadge| ${stationCount}}`)
              }
              
              // 告警数量徽章（红色）
              if (alarmCount > 0) {
                parts.push(`{alarmBadge| ${alarmCount}}`)
              }
              
              return parts.join('')
            },
            position: 'inside',
            offset: [0, 0],
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
          itemStyle: {
            color: 'transparent' // 标记点本身透明
          },
          symbolSize: 0, // 标记点大小为0，只显示标签
          zlevel: 10, // 确保标记点在地图之上
          emphasis: {
            label: {
              show: true,
              fontSize: 12
            }
          }
        }
      ]
    }

    // 设置选项
    chartInstance.setOption(option, true)

    // 监听点击事件（下钻）
    chartInstance.off('click') // 移除旧的监听器
    chartInstance.on('click', (params: any) => {
      // 优先处理 scatter 系列的点击（标记点）
      if (params.componentType === 'series' && params.seriesType === 'scatter') {
        const { name, code } = params.data
        
        if (name && code) {
          console.log('点击标记点:', name, code)
          // 异步调用下钻（不等待）
          handleDrillDown(name, code)
        }
      } 
      // 其次处理地图区域的点击
      else if (params.componentType === 'geo') {
        const regionName = params.name
        
        // 从 geoData 中查找对应的 adcode
        const feature = geoData.features.find(f => f.properties.name === regionName)
        
        if (feature) {
          let regionCode = String(feature.properties.adcode)
          
          // 确保是 6 位编码
          if (regionCode.length < 6) {
            regionCode = regionCode.padEnd(6, '0')
          }
          
          console.log('点击地图区域:', regionName, regionCode)
          // 异步调用下钻（不等待）
          handleDrillDown(regionName, regionCode)
        }
      }
    })

    // 监听地图缩放
    chartInstance.on('georoam', (params: any) => {
      if (params.zoom != null) {
        const currentOption = chartInstance!.getOption() as any
        const currentZoom = currentOption.geo?.[0]?.zoom
        if (currentZoom) {
          zoomLevel.value = Number(currentZoom.toFixed(1))
        }
      }
    })

    loading.value = false
  } catch (error) {
    console.error('Error rendering map:', error)
    ElMessage.error('Failed to render map')
    loading.value = false
  }
}

/**
 * 处理下钻
 */
const handleDrillDown = async (name: string, code: string) => {
  // 判断下一级别
  const currentLevel = breadcrumb.value[breadcrumb.value.length - 1].level
  
  let nextLevel: MapLevel['level']
  
  if (currentLevel === 'country') {
    nextLevel = 'province'
  } else if (currentLevel === 'province') {
    nextLevel = 'city'
  } else if (currentLevel === 'city') {
    // 城市级别点击区标记时，显示电站详情弹窗，不再下钻
    showStationDetailDialog(code, name)
    return
  } else {
    // 已经是最底层，不能再下钻
    ElMessage.info('Already at the lowest level')
    return
  }

  // 使用 nextTick 确保 DOM 更新完成后再进行下一步操作
  await nextTick()

  // 添加到面包屑
  breadcrumb.value = [
    ...breadcrumb.value,
    {
      name,
      code,
      level: nextLevel
    }
  ]

  // 等待面包屑更新完成
  await nextTick()

  // 重置缩放
  zoomLevel.value = 1.3

  // 等待缩放更新完成
  await nextTick()

  // 渲染新地图
  await renderMap(code, name)
}

/**
 * 显示电站详情弹窗
 */
const showStationDetailDialog = (districtCode: string, districtName: string) => {
  console.log(`显示 ${districtName} 的电站详情`)
  
  // 这里可以根据区编码查找对应的电站ID
  // 暂时使用区编码作为电站ID
  currentStationId.value = districtCode
  stationDialogVisible.value = true
}

/**
 * 面包屑点击回溯
 */
const handleBreadcrumbClick = async (index: number) => {
  if (index >= breadcrumb.value.length - 1) return

  // 使用 nextTick 确保 DOM 更新完成
  await nextTick()

  // 截取面包屑
  breadcrumb.value = breadcrumb.value.slice(0, index + 1)

  // 等待面包屑更新完成
  await nextTick()

  const target = breadcrumb.value[breadcrumb.value.length - 1]

  // 重置缩放
  zoomLevel.value = 1.3

  // 等待缩放更新完成
  await nextTick()

  // 渲染目标地图
  await renderMap(target.code, target.name)
}

/**
 * 放大
 */
const handleZoomIn = () => {
  if (!chartInstance) return
  
  const currentOption = chartInstance.getOption() as any
  const currentZoom = currentOption.geo?.[0]?.zoom || 1.3
  const newZoom = Math.min(currentZoom + 0.2, 5) // 最大5倍
  
  chartInstance.setOption({
    geo: {
      zoom: newZoom
    }
  })
  
  zoomLevel.value = Number(newZoom.toFixed(1))
}

/**
 * 缩小
 */
const handleZoomOut = () => {
  if (!chartInstance) return
  
  const currentOption = chartInstance.getOption() as any
  const currentZoom = currentOption.geo?.[0]?.zoom || 1.3
  const newZoom = Math.max(currentZoom - 0.2, 0.5) // 最小0.5倍
  
  chartInstance.setOption({
    geo: {
      zoom: newZoom
    }
  })
  
  zoomLevel.value = Number(newZoom.toFixed(1))
}

/**
 * 初始化图表
 */
const initChart = async () => {
  if (!mapRef.value) return

  // 创建 ECharts 实例
  chartInstance = echarts.init(mapRef.value)

  // 加载城市电站数据和区级电站数据
  await Promise.all([
    loadCityStationsData(),
    loadDistrictStationsData()
  ])

  // 加载中国地图
  await renderMap('100000', '中国')

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

/**
 * 销毁图表
 */
const destroyChart = () => {
  if (chartInstance) {
    window.removeEventListener('resize', handleResize)
    chartInstance.dispose()
    chartInstance = null
  }
}

// ========== 生命周期 ==========
onMounted(async () => {
  await nextTick()
  await initChart()
})

onUnmounted(() => {
  destroyChart()
})
</script>

<style scoped lang="scss">
.map-card {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  overflow: hidden;
  
  // 左上角工具栏
  .map-toolbar {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 12px;
    
    .location-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(80, 137, 236, 0.5);
      border-radius: 8px;
      backdrop-filter: blur(10px);
      
      .icon-globe {
        font-size: 20px;
        color: #6AD4DD;
      }
      
      .location-breadcrumb {
        display: flex;
        align-items: center;
        font-size: 14px;
        
        .breadcrumb-wrapper {
          display: inline-flex;
          align-items: center;
          
          .separator {
            margin: 0 8px;
            color: rgba(255, 255, 255, 0.4);
          }
        }
        
        .location-item {
          color: rgba(255, 255, 255, 0.7);
          white-space: nowrap;
          
          &.clickable {
            cursor: pointer;
            color: #6AD4DD;
            transition: all 0.2s ease;
            
            &:hover {
              color: #93EBF8;
              text-decoration: underline;
            }
          }
          
          &.current {
            color: #ffffff;
            font-weight: 500;
          }
        }
      }
    }
  }
  
  // 缩放控制器
  .zoom-controls {
    position: absolute;
    bottom: 20px;
    left: 20px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(80, 137, 236, 0.5);
    border-radius: 8px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    
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
    
    .zoom-level {
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
  
  // 地图容器
  .map-container {
    flex: 1;
    width: 100%;
    min-height: 0;
    position: relative;
    
    // 加载状态
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
          
          &.is-loading {
            animation: rotate 1s linear infinite;
          }
        }
        
        .loading-text {
          font-size: 14px;
          color: #ffffff;
          font-weight: 500;
        }
      }
    }
  }
}

// 旋转动画
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
