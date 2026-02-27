<template>
  <div class="map-card">
    <!-- 顶部工具栏 - 左上角 -->
    <div class="map-toolbar-top">
      <div class="location-info">
        <div class="icon-globe">
          <el-icon><Grid /></el-icon>
        </div>
        <div class="location-text">
          <span class="country" :class="{ clickable: currentLevel === 'province' }" @click="currentLevel === 'province' ? backToCountry() : null">中国</span>
          <span v-if="currentLevel === 'province' && currentProvince" class="separator"> / </span>
          <span v-if="currentLevel === 'province' && currentProvince" class="province">{{
            currentProvince
          }}</span>
        </div>
      </div>
    </div>

    <!-- 控制按钮 - 左侧垂直排列 -->
    <div class="map-controls-left">
      <div class="control-btn" @click="toggleView">
        <el-icon><View /></el-icon>
      </div>
      <div class="control-btn" @click="handleSettings">
        <el-icon><Setting /></el-icon>
      </div>
    </div>

    <!-- 卫星按钮 - 右上角 -->
    <div class="satellite-btn" :class="{ active: showSatellite }" @click="toggleSatellite">
      <span>卫星</span>
    </div>

    <!-- 地图容器 -->
    <div class="map-container" ref="mapContainerRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import 'echarts-extension-amap'
import { Grid, View, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCityStations, getDistrictStations } from '@/api/pvDashboardApi'
import type { CityStationData, DistrictStationData } from '@/api/types/pv-dashboard'

// 声明高德地图全局变量（通过 script 标签加载）
declare const AMap: any

/**
 * 地图区域数据接口
 */
interface MapRegionData {
  regionId: string
  regionName: string
  stationCount: number
  alarmCount: number
  position: {
    lat: number
    lng: number
  }
}

/**
 * 组件Props
 */
interface Props {
  mapRegions?: MapRegionData[]
}

const props = defineProps<Props>()

// 城市电站数据（通过API获取）
const cityStationsData = ref<CityStationData[]>([])

// 区级电站数据（通过API获取）
const districtStationsData = ref<DistrictStationData[]>([])

// 省份信息映射（临时，将从 GeoJSON 动态加载）
interface ProvinceInfo {
  adcode: number
  name: string
  center: [number, number] // 行政中心（省会）
  centroid: [number, number] // 几何中心（质心）
}

// 临时的省份信息（将被 GeoJSON 数据替换）
const provinceInfoMap = ref<Map<number, ProvinceInfo>>(new Map())

// 从市级数据汇总生成省份数据（基于行政编码）
const generateProvinceData = (): MapRegionData[] => {
  const provinceMap = new Map<number, { stationCount: number; alarmCount: number }>()
  
  cityStationsData.value.forEach((city) => {
    const current = provinceMap.get(city.provinceAdcode) || { stationCount: 0, alarmCount: 0 }
    current.stationCount += city.stationCount
    current.alarmCount += city.alarmCount
    provinceMap.set(city.provinceAdcode, current)
  })
  
  const result: MapRegionData[] = []
  provinceMap.forEach((data, provinceAdcode) => {
    // 从 provinceInfoMap 获取省份信息
    const provinceInfo = provinceInfoMap.value.get(provinceAdcode)
    
    // 如果找不到省份信息，尝试从 cityStationsData 中获取省份名称
    if (!provinceInfo) {
      const cityInProvince = cityStationsData.value.find(city => city.provinceAdcode === provinceAdcode)
      if (cityInProvince) {
        console.warn(`省份 ${cityInProvince.provinceName}(${provinceAdcode}) 在 GeoJSON 中未找到，已跳过`)
      } else {
        console.warn(`省份 adcode=${provinceAdcode} 未找到信息，已跳过`)
      }
      return // 跳过没有地理信息的省份
    }
    
    result.push({
      regionId: String(provinceAdcode),
      regionName: provinceInfo.name,
      stationCount: data.stationCount,
      alarmCount: data.alarmCount,
      position: {
        lng: provinceInfo.centroid[0],
        lat: provinceInfo.centroid[1]
      }
    })
  })
  
  return result
}

// 使用 computed 属性，确保在数据加载后动态更新
const defaultMapRegions = computed(() => generateProvinceData())

// 辅助函数：获取有电站的城市行政编码列表
const cityAdcodesWithStations = computed(() => cityStationsData.value.map((city) => city.cityAdcode))

// 响应式数据
const mapContainerRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null
let amapInstance: any = null
let districtLayer: any = null
const showSatellite = ref(false)

// 钻取状态
const currentLevel = ref<'country' | 'province'>('country')
const currentProvince = ref<string | null>(null)

/**
 * 处理省份点击（钻取到市级）
 * @param provinceAdcode 省份行政编码
 * @param provinceName 省份名称
 */
const handleProvinceClick = async (provinceAdcode: number, provinceName: string) => {
  // 检查是否有数据（使用行政编码）
  // 优先使用 props.mapRegions，否则从 cityStationsData 中动态计算
  let provinceAdcodesWithData: number[]
  
  if (props.mapRegions && props.mapRegions.length > 0) {
    provinceAdcodesWithData = props.mapRegions.map((r: any) => Number(r.regionId))
  } else {
    // 从 cityStationsData 中提取有数据的省份 adcode（去重）
    provinceAdcodesWithData = Array.from(
      new Set(cityStationsData.value.map(city => city.provinceAdcode))
    )
  }

  if (!provinceAdcodesWithData.includes(provinceAdcode)) {
    return // 只有有数据的省份可以点击
  }

  console.log(`点击省份: ${provinceName}(${provinceAdcode})`)
  currentLevel.value = 'province'
  currentProvince.value = provinceName

  // 放大地图到该省份
  if (amapInstance) {
    ElMessage.success(`正在加载${provinceName}市级数据...`)

    // 清除现有的区域图层
    if (districtLayer) {
      if (Array.isArray(districtLayer)) {
        districtLayer.forEach((layer: any) => amapInstance.remove(layer))
      } else {
        amapInstance.remove(districtLayer)
      }
      districtLayer = null
    }

    // 查询省份边界并缩放
    // @ts-ignore
    const district = new AMap.DistrictSearch({
      level: 'province',
      extensions: 'all',
      subdistrict: 1 // 获取市级
    })

    district.search(provinceName, (status: string, result: any) => {
      if (status === 'complete' && result.districtList && result.districtList.length > 0) {
        const provinceData = result.districtList[0]

        // 使用省份的中心点和缩放级别
        if (provinceData.center) {
          console.log('省份中心点:', provinceData.center, '省份名称:', provinceData.name)
          
          // 先设置中心点和缩放级别
          amapInstance.setZoomAndCenter(7, provinceData.center, false, 500)

          // 绘制省份和市级边界
          setTimeout(() => {
            drawProvinceAndCities(provinceData, provinceAdcode)
          }, 600)
        } else {
          ElMessage.error('无法获取省份中心点')
        }
      } else {
        ElMessage.error('加载省份数据失败')
      }
    })
  }
}

/**
 * 从本地加载市级边界数据并绘制
 * @param provinceData AMap.DistrictSearch 返回的省份数据
 * @param provinceAdcode 省份行政编码
 */
const drawProvinceAndCities = async (provinceData: any, provinceAdcode: number) => {
  if (!amapInstance) return

  const polygons: any[] = []
  const provinceName = provinceData.name

  console.log(`开始加载 ${provinceName}(${provinceAdcode}) 的市级边界数据...`)

  try {
    // 从本地加载市级 GeoJSON 数据（使用行政编码作为文件名）
    const response = await fetch(`/province/${provinceAdcode}.json`)
    if (!response.ok) {
      throw new Error(`加载市级数据失败: ${response.status}`)
    }

    const geojson = await response.json()
    console.log(`${provinceName} 市级数据加载成功，features数量:`, geojson.features?.length || 0)

    if (!geojson.features || geojson.features.length === 0) {
      console.error('市级 GeoJSON 数据为空')
      return
    }

    let cityCount = 0
    
    // 建立城市信息映射（提取centroid）
    const cityInfoMap = new Map<number, { name: string; centroid: [number, number] }>()

    // 遍历每个市的 GeoJSON feature
    geojson.features.forEach((feature: any) => {
      const cityName = feature.properties.name
      const cityAdcode = feature.properties.adcode
      const centroid = feature.properties.centroid
      const geometry = feature.geometry

      if (!geometry || !geometry.coordinates) {
        return
      }
      
      // 保存城市的centroid信息
      if (centroid && centroid.length >= 2) {
        cityInfoMap.set(cityAdcode, {
          name: cityName,
          centroid: [centroid[0], centroid[1]]
        })
      }

      // 判断该市是否有电站数据（使用行政编码精确匹配）
      const cityHasStation = cityAdcodesWithStations.value.includes(cityAdcode)
      
      // 统一使用省份的颜色方案：有电站的用天蓝色高亮，无电站的用深蓝色
      const cityFillColor = cityHasStation ? '#0099ff' : '#003366'

      // 处理多边形坐标（MultiPolygon 或 Polygon）
      const processPolygon = (coords: any): void => {
        if (!Array.isArray(coords) || coords.length === 0) return

        if (Array.isArray(coords[0])) {
          if (typeof coords[0][0] === 'number') {
            // 这是一个坐标数组
            if (coords.length >= 3) {
              const validCoords = coords.filter(
                (coord: any) =>
                  Array.isArray(coord) &&
                  coord.length >= 2 &&
                  typeof coord[0] === 'number' &&
                  typeof coord[1] === 'number'
              )

              if (validCoords.length >= 3) {
                // 绘制市级填充区域
                const cityPolygon = new AMap.Polygon({
                  path: validCoords.map((coord: [number, number]) => [coord[0], coord[1]]),
                  strokeColor: '#000000',
                  strokeOpacity: 0.9,
                  strokeWeight: 0.5,
                  fillColor: cityFillColor,
                  fillOpacity: 0.45,
                  zIndex: 5
                })

                polygons.push(cityPolygon)
                amapInstance.add(cityPolygon)

                // 绘制市级边界线（zIndex 更高，确保在遮罩层上方）
                const cityLine = new AMap.Polyline({
                  path: validCoords.map((coord: [number, number]) => [coord[0], coord[1]]),
                  strokeColor: '#000000',
                  strokeOpacity: 0.9,
                  strokeWeight: 0.8,
                  zIndex: 100 // 提高 zIndex，确保线条在最上层
                })

                polygons.push(cityLine)
                amapInstance.add(cityLine)
              }
            }
          } else {
            // 嵌套数组，递归处理
            coords.forEach((subCoords: any) => processPolygon(subCoords))
          }
        }
      }

      processPolygon(geometry.coordinates)



      cityCount++
    })

    console.log(`✅ ${provinceName} 市级边界绘制完成，共 ${cityCount} 个市，cityInfoMap 包含 ${cityInfoMap.size} 个城市信息`)

    // 更新 ECharts scatter series，添加市级数据标签的正确坐标
    // 使用行政编码筛选该省份的城市
    const citiesInProvince = cityStationsData.value.filter(city => city.provinceAdcode === provinceAdcode)
    
    // 为每个城市找到对应的中心点坐标（从本地GeoJSON的centroid）
    const cityDataWithCoords = citiesInProvince.map((city) => {
      const cityInfo = cityInfoMap.get(city.cityAdcode)
      
      if (cityInfo && cityInfo.centroid) {
        return {
          name: city.cityName,
          value: [cityInfo.centroid[0], cityInfo.centroid[1]],
          stationCount: city.stationCount,
          alarmCount: city.alarmCount
        }
      }
      
      return null
    }).filter(Boolean)
    
    // 更新 ECharts 图表，显示市级数据标签
    if (chartInstance) {
      chartInstance.setOption({
        series: [
          {
            type: 'scatter',
            data: cityDataWithCoords,
            label: {
              show: true // 显示市级数据标签
            }
          }
        ]
      })
    }
  } catch (error) {
    console.error(`加载 ${provinceName} 市级数据失败:`, error)
  }

  districtLayer = polygons
}

/**
 * 加载城市电站数据
 */
const loadCityStationsData = async () => {
  try {
    const response = await getCityStations()
    if (response.code === 200) {
      cityStationsData.value = response.data
      console.log('城市电站数据加载成功:', cityStationsData.value)
      console.log('生成的省份数据:', defaultMapRegions.value)
    } else {
      ElMessage.error(response.message || '加载城市电站数据失败')
    }
  } catch (error) {
    console.error('加载城市电站数据失败:', error)
    ElMessage.error('加载城市电站数据失败，请稍后重试')
  }
}

/**
 * 加载区级电站数据
 */
const loadDistrictStationsData = async () => {
  try {
    const response = await getDistrictStations()
    if (response.code === 200) {
      districtStationsData.value = response.data
      console.log('✅ 区级电站数据加载完成，共', districtStationsData.value.length, '个区')
    } else {
      ElMessage.error(response.message || '加载区级电站数据失败')
    }
  } catch (error) {
    console.error('加载区级电站数据失败:', error)
    ElMessage.error('加载区级电站数据失败，请稍后重试')
  }
}

/**
 * 更新省级标记点（在地图和数据都加载完成后调用）
 */
const updateProvinceMarkers = () => {
  if (!chartInstance || currentLevel.value !== 'country') {
    return
  }
  
  const mapRegions = props.mapRegions || defaultMapRegions.value
  
  if (!mapRegions || mapRegions.length === 0) {
    return
  }
  
  chartInstance.setOption({
    series: [
      {
        type: 'scatter',
        coordinateSystem: 'amap', // 重要：指定坐标系
        data: mapRegions.map((region) => ({
          name: region.regionName,
          value: [region.position.lng, region.position.lat],
          stationCount: region.stationCount,
          alarmCount: region.alarmCount
        })),
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
        itemStyle: {
          color: 'transparent'
        },
        symbolSize: 0,
        zlevel: 10
      }
    ]
  })
}

/**
 * 返回中国地图
 */
const backToCountry = () => {
  currentLevel.value = 'country'
  currentProvince.value = null

  // 更新 ECharts 图表，恢复省份数据标签
  const mapRegions = props.mapRegions || defaultMapRegions.value
  if (chartInstance) {
    chartInstance.setOption({
      series: [
        {
          type: 'scatter',
          data: mapRegions.map((region) => ({
            name: region.regionName,
            value: [region.position.lng, region.position.lat],
            stationCount: region.stationCount,
            alarmCount: region.alarmCount
          })),
          label: {
            show: true // 返回国家级别后，重新显示省份数据标签
          }
        }
      ]
    })
  }

  if (amapInstance) {
    // 清除现有图层
    if (districtLayer) {
      if (Array.isArray(districtLayer)) {
        districtLayer.forEach((layer: any) => amapInstance.remove(layer))
      } else {
        amapInstance.remove(districtLayer)
      }
      districtLayer = null
    }

    // 重置地图视图
    amapInstance.setZoomAndCenter(4, [105, 36], false, 500)

    // 重新加载中国地图
    setTimeout(() => {
      addChinaDistrictLayer()
    }, 600)
  }
}

/**
 * 初始化地图
 */
const initMap = async () => {
  if (!mapContainerRef.value) {
    console.error('Map container not found')
    return
  }

  try {
    // 初始化 ECharts 实例
    chartInstance = echarts.init(mapContainerRef.value)

    const mapRegions = props.mapRegions || defaultMapRegions.value

    // 配置 ECharts 选项
    const option = {
      // 高德地图组件配置
      amap: {
        // 2D视图模式（默认）
        viewMode: '2D',
        // 地图中心（中国中心）
        center: [105, 36],
        // 缩放级别
        zoom: 4,
        // 缩放级别范围 [最小, 最大] - 限制最大到市级，不显示区县级
        zooms: [3, 10],
        // 地图样式（深蓝色，背景为深青色调）
        mapStyle: 'amap://styles/normal',
        // 是否支持容器大小变化时重新渲染
        resizeEnable: true,
        // 是否可拖拽移动地图
        dragEnable: true,
        // 是否可缩放（鼠标滚轮、双击、双指缩放）
        zoomEnable: true,
        // 是否支持双击缩放
        doubleClickZoom: true,
        // 是否支持鼠标滚轮缩放
        scrollWheel: true,
        // 移动时是否重新渲染
        renderOnMoving: true,
        // ECharts图层交互性
        echartsLayerInteractive: true,
        // 旋转角度
        rotation: 0,
        // 天空颜色
        skyColor: '#0a1628',
        // 显示标签（省市名称）
        showLabel: true,
        // 显示建筑物
        showBuildingBlock: false
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(13, 35, 68, 0.95)',
        borderColor: 'rgba(0, 212, 255, 0.5)',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => {
          const data = params.data
          return `
            <div style="padding: 8px;">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #00D4FF;">
                ${data.name}
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="flex: 1;">
                  <div style="color: rgba(255,255,255,0.7); font-size: 12px;">电站数量</div>
                  <div style="color: #10b981; font-size: 16px; font-weight: bold;">
                    ${data.stationCount}座
                  </div>
                </div>
                ${
                  data.alarmCount > 0
                    ? `
                  <div style="flex: 1;">
                    <div style="color: rgba(255,255,255,0.7); font-size: 12px;">告警数量</div>
                    <div style="color: #ef4444; font-size: 16px; font-weight: bold;">
                      ${data.alarmCount}条
                    </div>
                  </div>
                `
                    : ''
                }
              </div>
            </div>
          `
        }
      },
      series: [
        // 标记点系列
        {
          type: 'scatter',
          coordinateSystem: 'amap',
          data: mapRegions.map((region) => ({
            name: region.regionName,
            value: [region.position.lng, region.position.lat],
            stationCount: region.stationCount,
            alarmCount: region.alarmCount
          })),
          label: {
            // 只在国家级别（country）显示省份数据标签
            show: currentLevel.value === 'country',
            formatter: (params: any) => {
              const { name, stationCount, alarmCount } = params.data

              // 构建标签：地名 + 数字徽章（连在一起，不同背景色）
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
            position: 'inside', // 居中显示
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
            color: 'transparent'
          },
          symbolSize: 0,
          zlevel: 10
        }
      ]
    }

    // 设置配置项
    chartInstance.setOption(option)

    // 获取高德地图实例
    // @ts-ignore - getModel is a private method but required by echarts-extension-amap
    const amapComponent = chartInstance.getModel().getComponent('amap')
    amapInstance = amapComponent.getAMap()

    // 隐藏高德地图默认控件
    amapInstance.setDefaultCursor('default')

    // 添加中国区域高亮图层
    await addChinaDistrictLayer()
    
    // 注意：不在这里更新标记点，因为 provinceInfoMap 还未加载完成
    // 标记点会在 loadProvincesFromLocal() 完成后自动更新
    
  } catch (error) {
    console.error('Failed to initialize map:', error)
    ElMessage.error('地图加载失败，请刷新页面重试')
  }
}

/**
 * 从本地GeoJSON文件加载省份边界数据
 */
const loadProvincesFromLocal = async () => {
  if (!amapInstance) return

  try {
    // 加载本地GeoJSON文件
    const response = await fetch('/china-provinces-full.json')
    if (!response.ok) {
      throw new Error(`加载GeoJSON失败: ${response.status}`)
    }
    
    const geojson = await response.json()

    if (!geojson.features || geojson.features.length === 0) {
      console.error('GeoJSON数据为空')
      return
    }

    let lineCount = 0

    // 第一遍遍历：提取省份信息到 provinceInfoMap
    geojson.features.forEach((feature: any) => {
      const properties = feature.properties
      if (properties && properties.adcode && properties.name && properties.center && properties.centroid) {
        provinceInfoMap.value.set(properties.adcode, {
          adcode: properties.adcode,
          name: properties.name,
          center: properties.center,
          centroid: properties.centroid // 几何中心（质心）
        })
      }
    })

    // 第二遍遍历：绘制省份边界
    geojson.features.forEach((feature: any) => {
      const provinceName = feature.properties.name
      const geometry = feature.geometry

      if (!geometry || !geometry.coordinates) {
        console.warn(`省份 ${provinceName} 没有坐标数据`)
        return
      }

      // 处理 MultiPolygon 类型的坐标
      const processCoordinates = (coords: any, level: number = 0): void => {
        if (Array.isArray(coords[0])) {
          if (typeof coords[0][0] === 'number') {
            // 这是一个坐标数组，绘制线条
            if (coords.length >= 3) {
                  const polyline = new AMap.Polyline({
                    path: coords.map((coord: [number, number]) => [coord[0], coord[1]]),
                    strokeColor: '#000000',
                    strokeOpacity: 1.0,
                    strokeWeight: 0.5, // 与其他边界相同的极细线条
                    zIndex: 100, // 提高 zIndex，确保线条在遮罩层上方
                    bubble: false,
                    lineJoin: 'round',
                    lineCap: 'round'
                  })

              amapInstance.add(polyline)

              if (!districtLayer) {
                districtLayer = []
              }
              if (Array.isArray(districtLayer)) {
                districtLayer.push(polyline)
              }

              lineCount++
            }
          } else {
            // 递归处理嵌套数组
            coords.forEach((subCoords: any) => processCoordinates(subCoords, level + 1))
          }
        }
      }

      processCoordinates(geometry.coordinates)
    })

    console.log(`✅ 省份边界加载完成，共 ${lineCount} 条边界线，provinceInfoMap 包含 ${provinceInfoMap.value.size} 个省份`)
    
    // 省份信息加载完成后，更新省级标记点
    console.log('🎯 准备更新省级标记点...')
    updateProvinceMarkers()
  } catch (error) {
    console.error('加载省份边界失败:', error)
  }
}

/**
 * 添加中国区域高亮图层（包含省份边界）
 */
const addChinaDistrictLayer = async () => {
  if (!amapInstance) {
    console.error('amapInstance 不存在')
    return
  }

  try {
    // 加载中国整体边界数据
    const response = await fetch('/china-provinces-full.json')
    if (!response.ok) {
      throw new Error(`加载中国边界GeoJSON失败: ${response.status}`)
    }

    const geojson = await response.json()

    const polygons: any[] = []

    // 有数据的省份行政编码列表（从 mapRegions 中提取）
    // 优先使用 props.mapRegions，否则从 cityStationsData 中动态计算
    let provinceAdcodesWithData: number[]
    
    if (props.mapRegions && props.mapRegions.length > 0) {
      provinceAdcodesWithData = props.mapRegions.map((r: any) => Number(r.regionId))
    } else {
      // 从 cityStationsData 中提取有数据的省份 adcode（去重）
      provinceAdcodesWithData = Array.from(
        new Set(cityStationsData.value.map(city => city.provinceAdcode))
      )
    }

    // 遍历所有省份，合并为中国整体区域
    geojson.features.forEach((feature: any) => {
      const provinceName = feature.properties?.name || ''
      const provinceAdcode = feature.properties?.adcode || 0
      const geometry = feature.geometry

      if (!geometry || !geometry.coordinates) {
        return
      }

      // 判断该省份是否有数据，决定填充颜色（使用行政编码精确匹配）
      // 有数据的省份用青色高亮，无数据的用深蓝色
      const hasData = provinceAdcodesWithData.includes(provinceAdcode)
      const fillColor = hasData ? '#0099ff' : '#003366'

      // 处理多边形坐标，绘制填充区域（半透明遮罩，可以透底看到高德地图）
      const processPolygon = (coords: any): void => {
        if (!Array.isArray(coords) || coords.length === 0) return

        if (Array.isArray(coords[0])) {
          if (typeof coords[0][0] === 'number') {
            // 这是一个坐标数组
            if (coords.length >= 3) {
              // 验证坐标有效性
              const validCoords = coords.filter(
                (coord: any) =>
                  Array.isArray(coord) &&
                  coord.length >= 2 &&
                  typeof coord[0] === 'number' &&
                  typeof coord[1] === 'number' &&
                  !isNaN(coord[0]) &&
                  !isNaN(coord[1])
              )

              if (validCoords.length >= 3) {
              const polygon = new AMap.Polygon({
                path: validCoords.map((coord: [number, number]) => [coord[0], coord[1]]),
                strokeColor: '#000000',
                strokeOpacity: 1.0,
                strokeWeight: 0.05, // 更细的边框线
                fillColor: fillColor, // 蓝色遮罩
                fillOpacity: 0.45, // 半透明，可以透底看到高德地图
                zIndex: 5,
                bubble: true,
                cursor: hasData ? 'pointer' : 'default',
                extData: { provinceName }
              })

                // 添加点击事件（只有有数据的省份）
                if (hasData) {
                  polygon.on('click', () => {
                    handleProvinceClick(provinceAdcode, provinceName)
                  })
                }

                polygons.push(polygon)
                amapInstance.add(polygon)
              }
            }
          } else {
            // 递归处理嵌套数组
            coords.forEach((subCoords: any) => processPolygon(subCoords))
          }
        }
      }

      processPolygon(geometry.coordinates)
    })

    districtLayer = polygons

    // 从本地加载省份边界数据
    loadProvincesFromLocal()
  } catch (error) {
    console.error('添加中国区域图层失败:', error)
  }
}

/**
 * 切换卫星图层
 */
const toggleSatellite = () => {
  if (!amapInstance) return

  showSatellite.value = !showSatellite.value

  if (showSatellite.value) {
    // 添加卫星图层
    const satelliteLayer = new AMap.TileLayer.Satellite()
    amapInstance.add(satelliteLayer)
    ;(amapInstance as any)._satelliteLayer = satelliteLayer
    ElMessage.success('已开启卫星图层')
  } else {
    // 移除卫星图层
    const satelliteLayer = (amapInstance as any)._satelliteLayer
    if (satelliteLayer) {
      amapInstance.remove(satelliteLayer)
    }
    ElMessage.info('已关闭卫星图层')
  }
}

/**
 * 切换视图
 */
const toggleView = () => {
  if (!amapInstance) return

  // 获取当前视图模式
  const currentViewMode = amapInstance.getViewMode_()
  const newViewMode = currentViewMode === '2D' ? '3D' : '2D'

  // 切换视图模式
  amapInstance.setViewMode_(newViewMode)

  // 如果切换到3D，设置俯仰角度
  if (newViewMode === '3D') {
    setTimeout(() => {
      amapInstance.setPitch(60, true, 500)
    }, 100)
  }

  ElMessage.success(newViewMode === '3D' ? '已切换到3D视图' : '已切换到2D视图')
}

/**
 * 设置
 */
const handleSettings = () => {
  ElMessage.info('地图设置功能开发中')
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
 * 监听城市数据变化，更新省级标记点
 */
watch(
  () => cityStationsData.value,
  (newData) => {
    if (newData && newData.length > 0) {
      console.log('检测到城市数据变化，准备更新省级标记点')
      // 延迟一点时间，确保 chartInstance 已经创建
      setTimeout(() => {
        updateProvinceMarkers()
      }, 100)
    }
  },
  { deep: true }
)

// 组件挂载
onMounted(async () => {
  // 加载城市数据和区级数据
  await Promise.all([
    loadCityStationsData(),
    loadDistrictStationsData()
  ])
  
  await nextTick()
  
  // 等待高德地图UI库加载
  const checkAMapUI = setInterval(() => {
    // @ts-ignore
    if (typeof AMapUI !== 'undefined') {
      clearInterval(checkAMapUI)
      initMap()
    }
  }, 100)

  // 超时处理
  setTimeout(() => {
    clearInterval(checkAMapUI)
    // @ts-ignore
    if (typeof AMapUI === 'undefined') {
      initMap()
    }
  }, 5000)

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 使用 ResizeObserver 监听容器大小变化
  if (mapContainerRef.value) {
    const resizeObserver = new ResizeObserver(() => {
      nextTick(() => {
        handleResize()
      })
    })
    resizeObserver.observe(mapContainerRef.value)
    ;(mapContainerRef.value as any)._resizeObserver = resizeObserver
  }
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  if (mapContainerRef.value && (mapContainerRef.value as any)._resizeObserver) {
    ;(mapContainerRef.value as any)._resizeObserver.disconnect()
  }

  // 清除所有图层
  if (districtLayer && amapInstance) {
    if (Array.isArray(districtLayer)) {
      districtLayer.forEach((item) => {
        amapInstance.remove(item)
      })
    } else {
      amapInstance.remove(districtLayer)
    }
  }

  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  amapInstance = null
  districtLayer = null
})
</script>

<style scoped lang="scss">
.map-card {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(10, 22, 40, 0.5);
  border-radius: 8px;
  overflow: hidden;
}

// 顶部工具栏 - 左上角
.map-toolbar-top {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;

  .location-info {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(13, 35, 68, 0.9);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 4px;
    padding: 8px 12px;

    .icon-globe {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: transparent;
      border-radius: 4px;

      .el-icon {
        font-size: 16px;
        color: var(--el-color-primary);
      }
    }

    .location-text {
      .country {
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
      }
    }
  }
}

// 左侧控制按钮
.map-controls-left {
  position: absolute;
  top: 16px;
  left: 16px;
  margin-top: 60px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .control-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(13, 35, 68, 0.9);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;

    .el-icon {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.8);
    }

    &:hover {
      background: rgba(0, 212, 255, 0.2);
      border-color: var(--el-color-primary);
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);

      .el-icon {
        color: var(--el-color-primary);
      }
    }
  }
}

// 卫星按钮 - 右上角
.satellite-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
  padding: 8px 16px;
  background: rgba(0, 150, 255, 0.8);
  border: 1px solid rgba(0, 212, 255, 0.5);
  border-radius: 4px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 150, 255, 0.3);

  &:hover {
    background: rgba(0, 180, 255, 0.9);
    box-shadow: 0 4px 12px rgba(0, 180, 255, 0.5);
  }

  &.active {
    background: rgba(0, 212, 255, 0.9);
    border-color: var(--el-color-primary);
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.6);
  }
}

// 地图容器
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

// 隐藏高德地图 logo 和版权信息
:deep(.amap-logo),
:deep(.amap-copyright) {
  display: none !important;
}

// 移除滤镜，保持原色
// :deep(.amap-container) {
//   filter: none;
// }

// 高德地图控件样式优化
:deep(.amap-ui-control-container) {
  opacity: 0.8;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
}
</style>

