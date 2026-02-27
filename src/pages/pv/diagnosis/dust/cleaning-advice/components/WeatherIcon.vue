<template>
  <div class="weather-icon" :title="iconTitle">
    <span class="icon">{{ iconEmoji }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon: string  // 天气图标类型
}

const props = defineProps<Props>()

// 天气图标映射
const weatherIconMap = {
  sunny: '☀️',
  cloudy: '☁️', 
  rainy: '🌧️',
  overcast: '☁️',
  thunderstorm: '⛈️',
  light_rain: '🌦️',
  heavy_rain: '🌧️',
  snow: '❄️',
  fog: '🌫️',
  wind: '💨'
}

// 天气描述映射
const weatherDescMap = {
  sunny: '晴天',
  cloudy: '多云',
  rainy: '雨天', 
  overcast: '阴天',
  thunderstorm: '雷雨',
  light_rain: '小雨',
  heavy_rain: '大雨',
  snow: '雪天',
  fog: '雾天',
  wind: '大风'
}

// 计算显示的图标
const iconEmoji = computed(() => {
  return weatherIconMap[props.icon as keyof typeof weatherIconMap] || '☀️'
})

// 计算图标标题
const iconTitle = computed(() => {
  return weatherDescMap[props.icon as keyof typeof weatherDescMap] || '未知天气'
})
</script>

<style scoped lang="scss">
.weather-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  .icon {
    font-size: 20px;
    line-height: 1;
  }
}
</style>
