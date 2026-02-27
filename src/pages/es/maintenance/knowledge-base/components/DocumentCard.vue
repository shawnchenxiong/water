<template>
  <div 
    class="document-card" 
    :class="{ selected: selected }"
  >
    <!-- 选择框 -->
    <div class="selection-checkbox" @click.stop>
      <el-checkbox 
        :model-value="selected" 
        @change="handleSelect"
      />
    </div>


    <!-- 文件图标 -->
    <div class="file-icon-section">
      <div class="file-icon" :class="`icon-${document.fileIcon}`">
        <el-icon size="64">
          <component :is="getFileIcon(document.fileFormat)" />
        </el-icon>
      </div>
    </div>

    <!-- 文档名称 -->
    <div class="document-name" :title="document.documentName">
      {{ document.documentName }}
    </div>

    <!-- 打开按钮 -->
    <div class="open-button">
      <el-button 
        type="primary" 
        size="small" 
        :icon="View"
        @click="handlePreview"
      >
        打开
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Document,
  Files,
  Picture,
  View,
} from '@element-plus/icons-vue'
import type { KnowledgeDocument } from '@/api/types/knowledge-base'

interface Props {
  document: KnowledgeDocument
  selected: boolean
  categories?: Array<{ id: string; name: string }>
}

interface Emits {
  (e: 'select', documentId: string, selected: boolean): void
  (e: 'preview', document: KnowledgeDocument): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 获取文件图标组件
 */
const getFileIcon = (format: string) => {
  const iconMap: Record<string, any> = {
    PDF: Document,
    DOC: Document,
    DOCX: Document,
    PPT: Files,
    PPTX: Files,
    XLS: Files,
    XLSX: Files,
    TXT: Document,
    JPG: Picture,
    PNG: Picture,
    ZIP: Files,
    RAR: Files,
  }
  return iconMap[format] || Document
}


/**
 * 选择变化
 */
const handleSelect = (selected: boolean | string | number) => {
  emit('select', props.document.id, Boolean(selected))
}

/**
 * 预览文档
 */
const handlePreview = () => {
  emit('preview', props.document)
}

</script>

<style scoped lang="scss">
.document-card {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 240px;
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);

  &:hover {
    border-color: rgba(0, 212, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.15);
  }

  &.selected {
    border-color: #00d4ff;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.08) 100%);
    box-shadow: 0 4px 16px rgba(0, 212, 255, 0.2);
  }

  .selection-checkbox {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 2;
    
    :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
      background-color: #00d4ff;
      border-color: #00d4ff;
    }
  }

  .file-icon-section {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;

    .file-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;

      &.icon-pdf {
        color: #ff4757;
      }

      &.icon-word {
        color: #2e86de;
      }

      &.icon-excel {
        color: #10ac84;
      }

      &.icon-powerpoint {
        color: #ff6348;
      }

      &.icon-image {
        color: #ffa502;
      }

      &.icon-archive {
        color: #747d8c;
      }

      &.icon-text {
        color: #a4b0be;
      }
    }
  }

  .document-name {
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
    word-break: break-all;
    margin-bottom: 12px;
  }

  .open-button {
    display: flex;
    justify-content: center;
    margin-top: auto;

    .el-button {
      background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
      border: none;
      color: #ffffff;
      
      &:hover {
        background: linear-gradient(135deg, #33ddff 0%, #00b8d9 100%);
        box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
      }
    }
  }
}

// 平板端适配
@media (max-width: 1024px) {
  .document-card {
    height: 220px;
    width: 160px;
    padding: 16px;

    .file-icon-section {
      margin-bottom: 12px;

      .file-icon {
        width: 56px;
        height: 56px;

        .el-icon {
          font-size: 56px;
        }
      }
    }

    .document-name {
      font-size: 13px;
      margin-bottom: 10px;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .document-card {
    height: 200px;
    width: 140px;
    padding: 12px;

    .selection-checkbox {
      top: 6px;
      left: 6px;
      
      :deep(.el-checkbox) {
        .el-checkbox__inner {
          width: 14px;
          height: 14px;
          
          &::after {
            width: 4px;
            height: 8px;
          }
        }
      }
    }

    .file-icon-section {
      margin-bottom: 10px;

      .file-icon {
        width: 48px;
        height: 48px;

        .el-icon {
          font-size: 48px;
        }
      }
    }

    .document-name {
      font-size: 12px;
      line-height: 1.3;
      margin-bottom: 8px;
      -webkit-line-clamp: 2;
    }

    .open-button {
      .el-button {
        font-size: 11px;
        padding: 4px 8px;
        height: 26px;
      }
    }
  }
}

// 小屏移动端适配
@media (max-width: 480px) {
  .document-card {
    height: 180px;
    width: 120px;
    padding: 8px;
    border-radius: 8px;

    .selection-checkbox {
      top: 4px;
      left: 4px;
    }

    .file-icon-section {
      margin-bottom: 8px;

      .file-icon {
        width: 40px;
        height: 40px;

        .el-icon {
          font-size: 40px;
        }
      }
    }

    .document-name {
      font-size: 11px;
      line-height: 1.2;
      margin-bottom: 6px;
      -webkit-line-clamp: 2;
    }

    .open-button {
      .el-button {
        font-size: 10px;
        padding: 3px 6px;
        height: 22px;
      }
    }
  }
}
</style>
