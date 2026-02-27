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
      <!-- 加载状态 -->
      <div v-show="loading" class="map-loading">
        <div class="loading-content">
          <el-icon class="loading-icon is-loading"><Loading /></el-icon>
          <span class="loading-text">{{ loadingText }}</span>
        </div>
      </div>
    </div>

    <!-- 九江信息卡片（悬浮在地图上） -->
    <div class="jiujiang-info-panel">
      <div class="info-title">
        <span class="dot"></span>
        九江市项目分布
      </div>
      <div class="info-items">
        <div class="info-item" v-for="item in jiujiangStations" :key="item.name">
          <span class="station-dot" :style="{ background: item.color }"></span>
          <span class="station-name">{{ item.name }}</span>
          <span class="station-status" :style="{ color: item.color }">{{ item.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 地图组件 - 江西省地图
 * 显示江西省详细地图，标注九江两个水质净化厂项目点
 * 支持下钻到市级，面包屑导航回溯
 */
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { Grid, Plus, Minus, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// ========== 类型定义 ==========
/** 地图层级信息 */
interface MapLevel {
  name: string
  code: string
  level: 'country' | 'province' | 'city'
}

/** GeoJSON 数据结构 */
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

// ========== 九江两个项目标注点 ==========
/** 鹤问湖水质净化厂两个项目的坐标和信息 */
const jiujiangStations = ref([
  {
    name: '鹤问湖水质净化厂（一期）',
    lng: 115.95,
    lat: 29.73,
    color: '#00d4ff',
    status: '运行中',
    capacity: '5万吨/日',
  },
  {
    name: '鹤问湖水质净化厂（二期）',
    lng: 116.04,
    lat: 29.69,
    color: '#67c23a',
    status: '运行中',
    capacity: '7万吨/日',
  },
])

// ========== 响应式数据 ==========
const mapRef = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null

// 导航面包屑：初始为中国
const breadcrumb = ref<MapLevel[]>([
  { name: '中国', code: '100000', level: 'country' }
])

// 缩放级别
const zoomLevel = ref(1.2)

// 加载状态
const loading = ref(false)
const loadingText = ref('加载地图数据...')

// 地图数据缓存
const mapCache = new Map<string, GeoJSON>()

// ========== 核心函数 ==========

/**
 * 获取地图数据（从 public 目录加载 GeoJSON）
 * @param code - 行政区划代码
 */
const fetchMapData = async (code: string): Promise<GeoJSON | null> => {
  // 检查缓存
  if (mapCache.has(code)) {
    return mapCache.get(code)!
  }

  try {
    let url: string

    // 中国地图
    if (code === '100000') {
      url = '/china.json'
    }
    // 省级地图（如 360000 江西省）
    else if (code.endsWith('0000') && code.length === 6) {
      url = `/province/${code}.json`
    }
    // 市级地图（如 360400 九江市）
    else if (code.endsWith('00') && !code.endsWith('0000') && code.length === 6) {
      url = `/city/${code}.json`
    }
    else {
      throw new Error(`不支持的地图编码: ${code}`)
    }

    console.log(`加载地图数据: ${url} (code: ${code})`)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`加载地图数据失败: ${response.statusText}`)
    }

    const data = await response.json() as GeoJSON

    // 缓存
    mapCache.set(code, data)
    return data
  } catch (error) {
    console.error(`加载地图数据失败 (${code}):`, error)
    ElMessage.error(`加载地图数据失败，请确认 GeoJSON 文件存在`)
    return null
  }
}

/**
 * 渲染地图
 * @param code - 行政区划代码
 * @param name - 行政区名称
 */
const renderMap = async (code: string, name: string) => {
  if (!chartInstance) return

  loading.value = true
  loadingText.value = `加载${name}地图数据...`

  try {
    const geoData = await fetchMapData(code)
    if (!geoData) {
      loading.value = false
      return
    }

    // 注册地图
    echarts.registerMap(name, geoData as any)

    // 当前层级
    const currentLevel = breadcrumb.value[breadcrumb.value.length - 1].level

    // ========== 构建地图标记点 ==========
    const scatterData: any[] = []
    const effectScatterData: any[] = [] // 带涟漪动效的点（九江标记）

    if (currentLevel === 'country') {
      // 中国地图：不显示散点标签（太多了），只在九江位置加涟漪标记
      jiujiangStations.value.forEach((station) => {
        effectScatterData.push({
          name: station.name,
          value: [station.lng, station.lat],
          capacity: station.capacity,
          status: station.status,
          itemStyle: { color: station.color },
        })
      })
    } else if (currentLevel === 'province') {
      // 省级地图：显示各市名称 + 九江两个项目标记
      geoData.features.forEach((feature) => {
        const props = feature.properties
        if (props.center && props.name) {
          scatterData.push({
            name: props.name,
            value: props.center,
            code: String(props.adcode),
          })
        }
      })
      jiujiangStations.value.forEach((station) => {
        effectScatterData.push({
          name: station.name,
          value: [station.lng, station.lat],
          capacity: station.capacity,
          status: station.status,
          itemStyle: { color: station.color },
        })
      })
    } else if (currentLevel === 'city') {
      // 市级地图：显示各区标签
      geoData.features.forEach((feature) => {
        const props = feature.properties
        if (props.center && props.name) {
          scatterData.push({
            name: props.name,
            value: props.center,
            code: String(props.adcode),
          })
        }
      })
      // 如果是九江市，也显示项目点
      if (code === '360400') {
        jiujiangStations.value.forEach((station) => {
          effectScatterData.push({
            name: station.name,
            value: [station.lng, station.lat],
            capacity: station.capacity,
            status: station.status,
            itemStyle: { color: station.color },
          })
        })
      }
    }

    // ========== 江西省高亮配置（仅国家级别时生效） ==========
    const geoRegions = currentLevel === 'country'
      ? [{
          name: '江西省',
          itemStyle: {
            areaColor: {
              type: 'radial',
              x: 0.5, y: 0.5, r: 0.8,
              colorStops: [
                { offset: 0, color: 'rgba(0, 212, 255, 0.35)' },
                { offset: 1, color: 'rgba(0, 150, 255, 0.2)' }
              ]
            },
            borderColor: '#00d4ff',
            borderWidth: 2,
            shadowColor: 'rgba(0, 212, 255, 0.6)',
            shadowBlur: 15,
          },
          emphasis: {
            itemStyle: {
              areaColor: 'rgba(0, 212, 255, 0.45)',
              borderColor: '#00d4ff',
              borderWidth: 3,
              shadowColor: 'rgba(0, 212, 255, 0.8)',
              shadowBlur: 25,
            }
          },
          label: {
            show: true,
            color: '#FFD700',
            fontSize: 13,
            fontWeight: 'bold',
            textShadowColor: 'rgba(0, 0, 0, 0.8)',
            textShadowBlur: 4,
          }
        }]
      : []

    // ========== ECharts 配置 ==========
    const option: any = {
      geo: {
        map: name,
        roam: true,
        zoom: zoomLevel.value,
        center: undefined,
        layoutCenter: ['50%', '50%'],
        layoutSize: '95%',
        regions: geoRegions, // 江西省高亮

        // 区域样式
        itemStyle: {
          borderColor: '#5089EC',
          borderWidth: 1,
          areaColor: {
            type: 'radial',
            x: 0.5, y: 0.5, r: 0.8,
            colorStops: [
              { offset: 0, color: 'rgba(106, 212, 221, 0)' },
              { offset: 1, color: 'rgba(106, 212, 221, 0.06)' }
            ]
          },
          shadowColor: 'rgba(0, 212, 255, 0.2)',
          shadowBlur: 10,
        },

        // 区域标签（隐藏 - 用 scatter 替代，江西通过 regions 单独设置）
        label: { show: false },

        // 高亮
        emphasis: {
          label: { show: false },
          itemStyle: {
            areaColor: '#378CE7',
            borderWidth: 2,
            borderColor: '#6AD4DD',
            shadowColor: 'rgba(0, 212, 255, 0.5)',
            shadowBlur: 20,
          },
        },

        // 选中
        select: {
          label: { show: false },
          itemStyle: { areaColor: '#4A9FF5' },
        },
      },

      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(13, 35, 68, 0.95)',
        borderColor: 'rgba(80, 137, 236, 0.5)',
        borderWidth: 1,
        textStyle: { color: '#ffffff', fontSize: 13 },
        formatter: (params: any) => {
          // 涟漪散点（项目标记）
          if (params.seriesType === 'effectScatter') {
            const d = params.data
            return `<div style="padding: 8px;">
              <div style="font-weight: bold; color: #00d4ff; font-size: 14px; margin-bottom: 6px;">
                📍 ${d.name}
              </div>
              <div style="color: rgba(255,255,255,0.85); font-size: 12px; margin-bottom: 3px;">
                处理能力: <span style="color: #FFD700; font-weight: bold;">${d.capacity}</span>
              </div>
              <div style="color: rgba(255,255,255,0.85); font-size: 12px;">
                运行状态: <span style="color: #67c23a; font-weight: bold;">${d.status}</span>
              </div>
            </div>`
          }
          // 普通散点（城市/区标签）
          if (params.seriesType === 'scatter') {
            return `<div style="padding: 6px;">
              <div style="font-weight: bold; color: #6AD4DD; font-size: 13px;">${params.name}</div>
              <div style="color: rgba(255,255,255,0.6); font-size: 11px; margin-top: 4px;">点击下钻查看详情</div>
            </div>`
          }
          // 地图区域
          return `<div style="padding: 6px;">
            <div style="font-weight: bold; color: #6AD4DD;">${params.name}</div>
            <div style="color: rgba(255,255,255,0.6); font-size: 11px; margin-top: 4px;">点击下钻</div>
          </div>`
        },
      },

      series: [
        // 系列1: 地区名称标签（普通散点）
        {
          type: 'scatter',
          coordinateType: 'geo',
          coordinateSystem: 'geo',
          data: scatterData,
          label: {
            show: true,
            formatter: '{b}',
            position: 'inside',
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: 11,
            textShadowColor: 'rgba(0, 0, 0, 0.6)',
            textShadowBlur: 4,
          },
          itemStyle: { color: 'transparent' },
          symbolSize: 0,
          zlevel: 5,
          emphasis: {
            label: { show: true, fontSize: 13, color: '#FFD700' },
          },
        },
        // 系列2: 九江项目标记（涟漪动效散点）
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: effectScatterData,
          symbolSize: 14,
          rippleEffect: {
            brushType: 'stroke',
            scale: 4,
            period: 3,
          },
          label: {
            show: true,
            formatter: (params: any) => {
              // 简短显示名称
              const name = params.data.name
              return name.includes('一期') ? '一期' : '二期'
            },
            position: 'right',
            offset: [5, 0],
            color: '#FFD700',
            fontSize: 12,
            fontWeight: 'bold',
            textShadowColor: 'rgba(0, 0, 0, 0.8)',
            textShadowBlur: 4,
          },
          zlevel: 10,
          emphasis: {
            label: { show: true, fontSize: 14 },
          },
        },
      ],
    }

    chartInstance.setOption(option, true)

    // ========== 事件监听 ==========
    chartInstance.off('click')
    chartInstance.on('click', (params: any) => {
      // 散点标签点击（下钻到市）
      if (params.componentType === 'series' && params.seriesType === 'scatter') {
        const { name: regionName, code: regionCode } = params.data
        if (regionName && regionCode) {
          handleDrillDown(regionName, regionCode)
        }
      }
      // 地图区域点击
      else if (params.componentType === 'geo') {
        const regionName = params.name
        const feature = geoData.features.find(f => f.properties.name === regionName)
        if (feature) {
          let regionCode = String(feature.properties.adcode)
          if (regionCode.length < 6) regionCode = regionCode.padEnd(6, '0')
          handleDrillDown(regionName, regionCode)
        }
      }
    })

    // 监听缩放
    chartInstance.on('georoam', (params: any) => {
      if (params.zoom != null) {
        const currentOption = chartInstance!.getOption() as any
        const currentZoom = currentOption.geo?.[0]?.zoom
        if (currentZoom) zoomLevel.value = Number(currentZoom.toFixed(1))
      }
    })

    loading.value = false
  } catch (error) {
    console.error('渲染地图失败:', error)
    ElMessage.error('渲染地图失败')
    loading.value = false
  }
}

/**
 * 处理地图下钻
 */
const handleDrillDown = async (name: string, code: string) => {
  const currentLevel = breadcrumb.value[breadcrumb.value.length - 1].level

  let nextLevel: MapLevel['level']

  if (currentLevel === 'country') {
    nextLevel = 'province'
  } else if (currentLevel === 'province') {
    nextLevel = 'city'
  } else {
    // 已经是市级，不再下钻
    ElMessage.info('已经是最底层')
    return
  }

  await nextTick()
  breadcrumb.value = [...breadcrumb.value, { name, code, level: nextLevel }]
  await nextTick()
  zoomLevel.value = 1.2
  await nextTick()
  await renderMap(code, name)
}

/**
 * 面包屑点击回溯
 */
const handleBreadcrumbClick = async (index: number) => {
  if (index >= breadcrumb.value.length - 1) return
  await nextTick()
  breadcrumb.value = breadcrumb.value.slice(0, index + 1)
  await nextTick()
  const target = breadcrumb.value[breadcrumb.value.length - 1]
  zoomLevel.value = 1.2
  await nextTick()
  await renderMap(target.code, target.name)
}

/** 放大 */
const handleZoomIn = () => {
  if (!chartInstance) return
  const currentOption = chartInstance.getOption() as any
  const currentZoom = currentOption.geo?.[0]?.zoom || 1.2
  const newZoom = Math.min(currentZoom + 0.2, 5)
  chartInstance.setOption({ geo: { zoom: newZoom } })
  zoomLevel.value = Number(newZoom.toFixed(1))
}

/** 缩小 */
const handleZoomOut = () => {
  if (!chartInstance) return
  const currentOption = chartInstance.getOption() as any
  const currentZoom = currentOption.geo?.[0]?.zoom || 1.2
  const newZoom = Math.max(currentZoom - 0.2, 0.5)
  chartInstance.setOption({ geo: { zoom: newZoom } })
  zoomLevel.value = Number(newZoom.toFixed(1))
}

// ========== resize ==========
const handleResize = () => { chartInstance?.resize() }

// ========== 生命周期 ==========
onMounted(async () => {
  if (!mapRef.value) return
  chartInstance = echarts.init(mapRef.value)
  // 初始渲染中国地图，江西省高亮
  await renderMap('100000', '中国')
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
/* ========== 地图卡片容器 ========== */
.map-card {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

/* ========== 加载状态 ========== */
.map-loading {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 24, 45, 0.8);
  z-index: 20;

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .loading-icon {
    font-size: 28px;
    color: #00d4ff;
  }

  .loading-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }
}

/* ========== 左上角导航工具栏 ========== */
.map-toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 10px;

  .location-info {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(10, 24, 45, 0.85);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 4px;
    padding: 5px 10px;

    .icon-globe {
      color: #00d4ff;
      font-size: 16px;
    }
  }

  .location-breadcrumb {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.65);

    .separator {
      color: rgba(255, 255, 255, 0.3);
      margin: 0 2px;
    }

    .location-item {
      &.clickable {
        cursor: pointer;
        color: rgba(255, 255, 255, 0.55);
        &:hover { color: #00d4ff; }
      }
      &.current {
        color: #00d4ff;
        font-weight: 600;
      }
    }
  }
}

/* ========== 缩放控制器 ========== */
.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 15px;
  z-index: 15;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: rgba(10, 24, 45, 0.85);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;

  .zoom-btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s;

    &:hover {
      background: rgba(0, 212, 255, 0.15);
      color: #00d4ff;
    }
  }

  .zoom-level {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    padding: 2px 6px;
    border-top: 1px solid rgba(0, 212, 255, 0.15);
    border-bottom: 1px solid rgba(0, 212, 255, 0.15);
    min-width: 30px;
    text-align: center;
  }
}

/* ========== 九江信息卡片（悬浮面板） ========== */
.jiujiang-info-panel {
  position: absolute;
  bottom: 20px;
  left: 15px;
  z-index: 15;
  background: rgba(10, 24, 45, 0.9);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 6px;
  padding: 10px 14px;
  min-width: 200px;

  .info-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #00d4ff;
    margin-bottom: 8px;
    text-shadow: 0 0 6px rgba(0, 212, 255, 0.3);

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #00d4ff;
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
    }
  }

  .info-items {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.75);

    .station-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .station-name {
      flex: 1;
    }

    .station-status {
      font-weight: 600;
      font-size: 10px;
    }
  }
}
</style>
