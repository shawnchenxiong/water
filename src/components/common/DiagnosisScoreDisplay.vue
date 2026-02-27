<template>
  <div class="diagnosis-score-display">
    <!-- 评分圆环 -->
    <div class="score-circle">
      <div 
        class="circle-progress" 
        :style="{ background: `conic-gradient(${scoreColor} ${scorePercentage}%, rgba(255,255,255,0.1) 0%)` }"
      >
        <div class="inner-circle">
          <div class="score-text">
            <div class="score-number">{{ score }}</div>
            <div class="score-unit">分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 诊断信息 -->
    <div class="diagnosis-info">
      <div class="diagnosis-time">
        <span class="info-label">诊断时间:</span>
        <span class="info-value">{{ diagnosisTime }}</span>
      </div>
      
      <div class="abnormal-count">
        <span class="info-label">{{ abnormalCount }}个异常</span>
        <span class="info-desc" v-if="abnormalCount === 0">完成4大类共18项故障诊断</span>
        <span class="info-desc" v-else>发现{{ abnormalCount }}项异常需处理</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button 
        type="primary" 
        size="large"
        :loading="diagnosisLoading"
        @click="handleStartDiagnosis"
        class="diagnosis-btn"
      >
        {{ diagnosisLoading ? '诊断中...' : '全面诊断' }}
      </el-button>
      
      <el-button 
        size="large"
        @click="handleViewHistory"
        class="history-btn"
      >
        诊断记录
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 诊断评分 (0-100) */
  score: number
  /** 诊断时间 */
  diagnosisTime: string
  /** 异常项目数量 */
  abnormalCount: number
  /** 是否正在诊断 */
  diagnosisLoading?: boolean
}

interface Emits {
  /** 开始诊断 */
  (e: 'start-diagnosis'): void
  /** 查看历史记录 */
  (e: 'view-history'): void
}

const props = withDefaults(defineProps<Props>(), {
  diagnosisLoading: false
})

const emit = defineEmits<Emits>()

// 评分百分比
const scorePercentage = computed(() => props.score)

// 评分颜色
const scoreColor = computed(() => {
  if (props.score >= 90) return '#27ae60' // 绿色
  if (props.score >= 70) return '#f39c12' // 黄色
  return '#e74c3c' // 红色
})

// 开始诊断
const handleStartDiagnosis = () => {
  emit('start-diagnosis')
}

// 查看历史记录
const handleViewHistory = () => {
  emit('view-history')
}
</script>

<style scoped lang="scss">
.diagnosis-score-display {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 25px;
  background: linear-gradient(135deg, 
    rgba(0, 30, 60, 0.6) 0%, 
    rgba(0, 40, 80, 0.4) 50%, 
    rgba(0, 30, 60, 0.6) 100%
  );
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 60%);
    border-radius: 12px;
    pointer-events: none;
  }
}

.score-circle {
  flex-shrink: 0;
  
  .circle-progress {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    .inner-circle {
      width: 90px;
      height: 90px;
      background: rgba(10, 30, 50, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(0, 212, 255, 0.3);
      
      .score-text {
        text-align: center;
        color: #fff;
        
        .score-number {
          font-size: 32px;
          font-weight: 700;
          line-height: 1;
          background: linear-gradient(135deg, #00d4ff 0%, #ffffff 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .score-unit {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 2px;
        }
      }
    }
  }
}

.diagnosis-info {
  flex: 1;
  color: #fff;
  
  .diagnosis-time {
    margin-bottom: 12px;
    
    .info-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }
    
    .info-value {
      color: #00d4ff;
      font-size: 16px;
      font-weight: 600;
      margin-left: 8px;
    }
  }
  
  .abnormal-count {
    .info-label {
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      display: block;
      margin-bottom: 8px;
    }
    
    .info-desc {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      display: block;
    }
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .diagnosis-btn {
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    border: none;
    font-size: 16px;
    font-weight: 600;
    height: 44px;
    min-width: 120px;
    
    &:hover:not(.is-loading) {
      background: linear-gradient(135deg, #229954 0%, #27ae60 100%);
      transform: translateY(-1px);
    }
    
    &.is-loading {
      background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    }
  }
  
  .history-btn {
    background: transparent;
    border: 1px solid #00d4ff;
    color: #00d4ff;
    font-size: 14px;
    height: 36px;
    min-width: 120px;
    
    &:hover {
      background: rgba(0, 212, 255, 0.1);
      transform: translateY(-1px);
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .diagnosis-score-display {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    
    .action-buttons {
      flex-direction: row;
      justify-content: center;
    }
  }
}
</style>

