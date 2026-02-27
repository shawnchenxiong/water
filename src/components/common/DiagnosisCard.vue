<template>
  <div 
    class="diagnosis-card"
    :class="[`status-${item.status}`, { 'has-abnormal': item.abnormalCount && item.abnormalCount > 0, 'selected': selected }]"
    @click="handleCardClick"
  >
    <!-- 状态指示器 -->
    <div class="status-indicator" :style="{ backgroundColor: statusColor }"></div>
    
    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 图标 -->
      <div class="card-icon">
        <el-icon :size="28">
          <Document />
        </el-icon>
      </div>
      
      <!-- 标题 -->
      <div class="card-title">{{ item.itemName }}</div>
      
      <!-- 状态文字 -->
      <div class="card-status" :style="{ color: statusColor }">
        {{ item.statusText }}
        <span v-if="item.abnormalCount && item.abnormalCount > 0" class="abnormal-badge">
          {{ item.abnormalCount }}
        </span>
      </div>
      
      <!-- 最后检查时间 -->
      <div class="card-time">{{ item.lastCheckTime }}</div>
    </div>

    <!-- 悬停时显示详细描述 -->
    <div class="card-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">{{ item.itemName }}</div>
        <div class="tooltip-desc">{{ item.description }}</div>
        <div class="tooltip-time">最后检查: {{ item.lastCheckTime }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Document } from '@element-plus/icons-vue'
import type { DiagnosisItem } from '@/api/types/diagnosis'

interface Props {
  /** 诊断项目数据 */
  item: DiagnosisItem
  /** 是否被选中 */
  selected?: boolean
}

interface Emits {
  /** 卡片点击事件 */
  (e: 'click', item: DiagnosisItem): void
}

const props = withDefaults(defineProps<Props>(), {
  selected: false
})

const emit = defineEmits<Emits>()

// 状态颜色映射
const statusColor = computed(() => {
  switch (props.item.status) {
    case 'normal':
      return '#27ae60' // 绿色
    case 'warning':
      return '#f39c12' // 黄色  
    case 'error':
      return '#e74c3c' // 红色
    case 'unknown':
    default:
      return '#95a5a6' // 灰色
  }
})

// 处理卡片点击
const handleCardClick = () => {
  emit('click', props.item)
}
</script>

<style scoped lang="scss">
.diagnosis-card {
  position: relative;
  background: linear-gradient(135deg, 
    rgba(10, 30, 50, 0.8) 0%, 
    rgba(15, 40, 70, 0.6) 50%, 
    rgba(10, 30, 50, 0.8) 100%
  );
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  padding: 20px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  min-height: 140px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 70% 20%, rgba(0, 212, 255, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 212, 255, 0.5);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.15);
    
    .card-tooltip {
      opacity: 1;
      visibility: visible;
    }
    
    .card-icon {
      transform: scale(1.1);
    }
  }
  
  &.has-abnormal {
    &::after {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: #e74c3c;
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(231, 76, 60, 0.6);
    }
  }
}

.status-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  border-radius: 0 2px 2px 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
}

.card-icon {
  color: #00d4ff;
  margin-bottom: 12px;
  transition: transform 0.3s ease;
  
  .el-icon {
    filter: drop-shadow(0 2px 4px rgba(0, 212, 255, 0.3));
  }
}

.card-title {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  margin-bottom: 8px;
  line-height: 1.4;
  min-height: 36px;
  display: flex;
  align-items: center;
  text-align: center;
}

.card-status {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  
  .abnormal-badge {
    background: #e74c3c;
    color: #fff;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
  }
}

.card-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: auto;
}

.card-tooltip {
  position: absolute;
  bottom: -120px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 20, 40, 0.95);
  border: 1px solid rgba(0, 212, 255, 0.4);
  border-radius: 6px;
  padding: 12px;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 10;
  backdrop-filter: blur(8px);
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid rgba(0, 212, 255, 0.4);
  }
  
  .tooltip-content {
    text-align: left;
    
    .tooltip-title {
      font-size: 13px;
      color: #00d4ff;
      font-weight: 600;
      margin-bottom: 6px;
    }
    
    .tooltip-desc {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.4;
      margin-bottom: 6px;
    }
    
    .tooltip-time {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

// 不同状态的样式变化
.status-normal {
  .card-status {
    text-shadow: 0 0 8px rgba(39, 174, 96, 0.6);
  }
}

.status-warning {
  .card-status {
    text-shadow: 0 0 8px rgba(243, 156, 18, 0.6);
  }
}

.status-error {
  .card-status {
    text-shadow: 0 0 8px rgba(231, 76, 60, 0.6);
  }
}

.status-unknown {
  .card-status {
    text-shadow: 0 0 8px rgba(149, 165, 166, 0.6);
  }
}

/* 选中状态的卡片样式 */
.diagnosis-card.selected {
  border-color: rgba(0, 212, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
  
  &::before {
    background: radial-gradient(circle at 70% 20%, rgba(0, 212, 255, 0.08) 0%, transparent 50%);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .diagnosis-card {
    min-height: 120px;
    padding: 16px 12px;
    
    .card-icon .el-icon {
      font-size: 24px;
    }
    
    .card-title {
      font-size: 13px;
      min-height: 32px;
    }
  }
}
</style>

