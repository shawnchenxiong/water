<template>
  <div ref="graphContainer" class="graphContainer geEditor">
    <!-- 消息弹窗组件 - 只在预览模式下显示 -->
    <div v-if="messageVisible && isPreviewMode" class="message-popup" :class="[messageType, { 'message-popup-show': messageVisible }]">
      <div class="message-content">
        <div class="message-header">
          <span class="message-title">{{ getMessageTitle() }}</span>
          <button class="message-close" @click="closeMessage">×</button>
        </div>
        <div class="message-body">
          {{ currentMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Start from "./Start";
import CustomWebSocket from "./js/utils/CustomWebSocket";
import { mxWsRoot } from "./constant";
export const websocketApi = mxWsRoot;
export default {
  name: "SJEditor",
  props: {
    initOptions: {
      type: Object,
    },
    // 是否启用消息模拟
    enableMessageSimulation: {
      type: Boolean,
      default: true
    },
    // 是否为预览模式（可由父组件直接控制）
    previewMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      messageVisible: false,
      currentMessage: '',
      messageType: 'info', // info, success, warning, error
      messageTimer: null,
      autoCloseTimer: null,
      messageQueue: [],
      isPreviewMode: false, // 是否为预览模式
      socket: null, // WebSocket连接
      tenantId: null // 租户ID
    };
  },
  watch: {
    // 监听 previewMode 属性变化
    previewMode(newVal) {
      this.isPreviewMode = newVal;
    },
    // 监听预览模式状态变化
    isPreviewMode(newVal) {
      if (newVal && this.enableMessageSimulation) {
        // 切换到预览模式，启动消息模拟
        // this.startMessageSimulation();

        // 连接WebSocket服务器
        this.connectWebSocket();
      } else {
        // 切换到编辑模式，停止消息模拟并关闭当前消息
        this.stopMessageSimulation();
        this.closeMessage();

        // 关闭WebSocket连接
        this.disconnectWebSocket();
      }
    }
  },
  mounted() {
    this.loadScadaStyles();
    Start.home(this.$refs.graphContainer, this.initOptions)
    if (this.initOptions.isShow != undefined && this.initOptions.isShow){
      this.observeDOMChanges();
    }

    // 检测是否为预览模式
    this.checkPreviewMode();

    // // 根据props决定是否启动消息模拟定时器，只在预览模式下启动
    // if (this.enableMessageSimulation && this.isPreviewMode) {
    //   this.startMessageSimulation();
    // }
  },
  beforeUnmount() {
    // 停止消息模拟并清除所有定时器
    this.stopMessageSimulation();

    // 清除自动关闭定时器
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }

    // 关闭WebSocket连接
    this.disconnectWebSocket();
    this.removeScadaStyles();
  },
  methods: {
    loadScadaStyles() {
      const cssFiles = [
        "/static/rcscada/common.css",
        "/static/rcscada/grapheditor.css",
        "/static/rcscada/mystyle.css",
        "/static/rcscada/animation.css",
        "/static/rcscada/datav.css",
        "/static/rcscada/panel.css",
        "/static/rcscada/colorpicker.css",
        "/static/rcscada/codemirror.css",
        "/static/rcscada/codetheme/monokai.css",
        "/static/rcscada/spin.css",
        "/static/rcscada/xgplayer.css",
        "/static/rcscada/custom.css"
      ];
      this.styleLinks = cssFiles.map(file => {
        let link = document.querySelector(`link[href="${file}"]`);
        if (!link) {
            link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = file;
            link.className = "rcscada-style-link";
            document.head.appendChild(link);
        }
        return link;
      });
    },
    removeScadaStyles() {
      if (this.styleLinks) {
        this.styleLinks.forEach(link => {
          if (link && link.parentNode) {
            link.parentNode.removeChild(link);
          }
        });
      }
    },
    // 连接WebSocket
     connectWebSocket() {
       const urlParams = window.location.hash.split('?')[1] ? new URLSearchParams(window.location.hash.split('?')[1]) : new URLSearchParams();
       this.tenantId = localStorage.getItem('TENANT_ID') || localStorage.getItem('tenantId') || localStorage.getItem('tenant_id') || urlParams.get('tenantId');
       if (!this.tenantId) {
         console.error('未找到租户ID');
         return;
       }

       // 使用CustomWebSocket类创建连接
       // Todo 这个告警的地址后面要使用配置文件配置
       this.socket = new CustomWebSocket(`${websocketApi}/app/gj/${this.tenantId}`);

       // 设置连接打开回调
       this.socket.onOpen((event) => {
         console.log('告警WebSocket连接已建立');
       });

       // 设置消息接收回调
       this.socket.onMessage((data) => {
         try {
           // 跳过心跳消息
           if (data === 'heartbeat') {
             return;
           }

           const alarmData = JSON.parse(data);
           this.showNotification({
             content: alarmData.content,
             type: alarmData.type
           });
         } catch (error) {
           console.error('解析告警消息失败', error);
         }
       });

       // 设置连接关闭回调
       this.socket.onClose((event) => {
         console.log('告警WebSocket连接已关闭');
       });

       // 设置错误回调
       this.socket.onError((error) => {
         console.error('告警WebSocket连接错误:', error);
       });

       // 建立连接
       this.socket.connect();
     },
    // 断开WebSocket连接
    disconnectWebSocket() {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    },
    observeDOMChanges() {
      const graphContainer = this.$refs.graphContainer;
      if (graphContainer) {
        const observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
              const geBackgroundPageNone = graphContainer.querySelector('.geBackgroundPageNone');
              if (geBackgroundPageNone) {
                const styleElement = document.createElement('style');
                styleElement.innerHTML = `
                  .geBackgroundPageNone {
                    width: 100% !important;
                    height: 100% !important;
                  }
                `;
                document.head.appendChild(styleElement);
                observer.disconnect(); // 样式应用后停止观察
              }
            }
          });
        });

        observer.observe(graphContainer, {childList: true, subtree: true});
      } else {
        console.warn('没有找到 ref 为 graphContainer 的元素');
      }
    },
    // // 启动消息模拟定时器
    // startMessageSimulation() {
    //   const messages = [
    //     { content: '设备连接成功', type: 3 },
    //     { content: '数据同步完成', type: 3 },
    //     { content: '系统状态正常', type: 3 },
    //     { content: '收到新的告警信息', type: 2 },
    //     { content: '配置更新完成', type: 3 },
    //     { content: '网络连接异常', type: 1 },
    //     { content: '数据采集中断', type: 1 },
    //     { content: '系统维护通知', type: 2 }
    //   ];

    //   // 每15秒随机显示一条消息
    //   this.messageTimer = setInterval(() => {
    //     const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    //     this.showNotification(randomMsg);
    //   }, 15000)
    // },
    // 停止消息模拟
    stopMessageSimulation() {
      if (this.messageTimer) {
        clearInterval(this.messageTimer);
        this.messageTimer = null;
      }
    },
    // 显示消息（内部使用）
    showMessage(message, type = 'info') {
      // 如果当前有消息显示，先关闭
      if (this.messageVisible) {
        this.closeMessage();
        // 延迟显示新消息
        setTimeout(() => {
          this.displayMessage(message, type);
        }, 500);
      } else {
        this.displayMessage(message, type);
      }
    },
    // 显示消息的具体实现
    displayMessage(message, type = 'info') {
      this.currentMessage = message;
      this.messageType = type;
      this.messageVisible = true;

      // 清除之前的自动关闭定时器
      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer);
      }

      // 10秒后自动关闭
      this.autoCloseTimer = setTimeout(() => {
        this.closeMessage();
      }, 10000);
    },
    // 公共方法：供外部调用显示消息
    // 使用示例：this.$refs.editor.showNotification({content: '操作成功', type: 1}, 5000, true)
    // 参数：messageData(消息对象，包含content和type), duration(显示时长，毫秒), forceShow(是否强制显示，忽略预览模式检查)
    // messageData.content: 消息内容
    // messageData.type: 消息类型 1-紧急(error), 2-严重(warning), 3-一般(info)
    showNotification(messageData, duration = 10000, forceShow = false) {
      // 如果不是预览模式且不强制显示，则不显示消息
      if (!this.isPreviewMode && !forceShow) {
        console.log('非预览模式，消息未显示:', messageData);
        return;
      }

      // 解析消息数据
      let content = '';
      let messageType = 'info';

      if (typeof messageData === 'object' && messageData !== null) {
        content = messageData.content || '';
        // 根据type数字映射到对应的消息类型
        switch (messageData.type) {
          case 1:
            messageType = 'error'; // 紧急
            break;
          case 2:
            messageType = 'warning'; // 严重
            break;
          case 3:
          default:
            messageType = 'info'; // 一般
            break;
        }
      } else {
        // 兼容旧的字符串格式
        content = messageData || '';
        messageType = 'info';
      }

      this.displayMessage(content, messageType);

      // 如果指定了不同的持续时间，重新设置定时器
      if (duration !== 10000) {
        if (this.autoCloseTimer) {
          clearTimeout(this.autoCloseTimer);
        }
        this.autoCloseTimer = setTimeout(() => {
          this.closeMessage();
        }, duration);
      }
    },
    // 获取消息标题
    getMessageTitle() {
      const titles = {
        info: '一般消息',
        success: '成功',
        warning: '严重消息',
        error: '紧急消息'
      };
      return titles[this.messageType] || '系统消息';
    },
    // 检测是否为预览模式
     checkPreviewMode() {
       // 优先使用父组件传入的 previewMode 属性
       if (this.previewMode !== undefined) {
         this.isPreviewMode = this.previewMode;
       } else {
         // 如果没有传入 previewMode，则通过路由检测
         const currentPath = this.$route ? this.$route.path : window.location.pathname;
         this.isPreviewMode = currentPath.includes('/preview') || currentPath.includes('/demo');
       }
     },
    // 关闭消息
    closeMessage() {
      this.messageVisible = false;
      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer);
        this.autoCloseTimer = null;
      }
    }
  },
};
//@import "./styles/common.css";
//@import "./styles/grapheditor.css";
//@import "./styles/mystyle.css";
//@import "./styles/animation.css";
//@import "./styles/datav.css";
</script>

<style scoped>
.graphContainer {
  width: 100%;
  height: 100%;
  user-select: none;
  position: relative;
  overflow: hidden;
}

/* 消息弹窗样式 - 相对于画布容器定位 */
.message-popup {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: calc(100% - 40px);
  min-width: 280px;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s ease-in-out;
  pointer-events: none;
}

.message-popup-show {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto; /* 显示时允许点击 */
}

.message-content {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.message-title {
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  margin: 0;
}

.message-close {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.message-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.message-body {
  padding: 16px;
  color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-popup {
    top: 10px;
    right: 20px;
    max-width: 40%;
    min-width: 40%;
  }
}

/* 动画关键帧 */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* 消息类型样式变体 */
.message-popup.success .message-content {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.message-popup.warning .message-content {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.message-popup.error .message-content {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.message-popup.info .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
