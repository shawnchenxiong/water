<template>
  <div class="websocket-test-container">
    <a-card title="WebSocket测试工具" :bordered="false">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="连接配置" :bordered="false">
            <a-form :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
              <a-form-item label="WebSocket地址">
                <a-input
                  v-model="formState.wsUrl"
                  placeholder="请输入WebSocket地址"
                  :disabled="isConnected"
                >
                  <template #addonBefore>
                    <a-select v-model="formState.protocol" style="width: 80px">
                      <a-select-option value="ws">ws://</a-select-option>
                      <a-select-option value="wss">wss://</a-select-option>
                    </a-select>
                  </template>
                </a-input>
              </a-form-item>
              
              <a-form-item label="设备ID">
                <a-input
                  v-model="formState.deviceId"
                  placeholder="请输入设备ID"
                  :disabled="isConnected"
                />
              </a-form-item>
              
              <a-form-item label="租户ID">
                <a-input
                  v-model="formState.tenantId"
                  placeholder="请输入租户ID"
                  :disabled="isConnected"
                />
              </a-form-item>
              
              <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
                <a-space>
                  <a-button
                    type="primary"
                    @click="handleConnect"
                    :loading="connecting"
                    :disabled="isConnected"
                  >
                    {{ isConnected ? '已连接' : '连接' }}
                  </a-button>
                  <a-button
                    danger
                    @click="handleDisconnect"
                    :disabled="!isConnected"
                  >
                    断开连接
                  </a-button>
                  <a-button @click="handleClear">清空日志</a-button>
                </a-space>
              </a-form-item>
              
              <a-form-item label="连接状态">
                <a-tag :color="connectionStatusColor">
                  {{ connectionStatusText }}
                </a-tag>
                <span style="margin-left: 10px; color: #999">
                  {{ connectionTime }}
                </span>
              </a-form-item>
              
              <a-form-item label="Token状态">
                <a-tag :color="tokenStatusColor">
                  {{ tokenStatusText }}
                </a-tag>
                <a-button
                  type="link"
                  size="small"
                  @click="handleCheckToken"
                  style="margin-left: 8px"
                >
                  检查Token
                </a-button>
              </a-form-item>
            </a-form>
          </a-card>
          
          <a-card title="发送消息" :bordered="false" style="margin-top: 16px">
            <a-form :model="messageForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-form-item label="消息类型">
                <a-select v-model="messageForm.messageType" placeholder="请选择消息类型">
                  <a-select-option value="subscribe">订阅</a-select-option>
                  <a-select-option value="unsubscribe">取消订阅</a-select-option>
                  <a-select-option value="command">命令</a-select-option>
                  <a-select-option value="custom">自定义</a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item label="消息内容" v-if="messageForm.messageType === 'custom'">
                <a-textarea
                  v-model="messageForm.customMessage"
                  placeholder='请输入JSON格式消息，例如：{"action": "subscribe", "ids": [1143]}'
                  :rows="4"
                />
              </a-form-item>
              
              <a-form-item label="节点ID" v-if="messageForm.messageType === 'subscribe' || messageForm.messageType === 'unsubscribe'">
                <a-input
                  v-model="messageForm.nodeIds"
                  placeholder="请输入节点ID，多个用逗号分隔"
                />
              </a-form-item>
              
              <a-form-item label="命令类型" v-if="messageForm.messageType === 'command'">
                <a-select v-model="messageForm.commandType" placeholder="请选择命令类型">
                  <a-select-option value="read">读取数据</a-select-option>
                  <a-select-option value="write">写入数据</a-select-option>
                  <a-select-option value="control">控制命令</a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
                <a-button
                  type="primary"
                  @click="handleSendMessage"
                  :disabled="!isConnected"
                >
                  发送消息
                </a-button>
                <a-button @click="handleSendTestMessage" style="margin-left: 8px">
                  发送测试消息
                </a-button>
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>
        
        <a-col :span="12">
          <a-card title="接收消息" :bordered="false">
            <div class="message-display">
              <div class="message-header">
                <span>消息日志 ({{ messages.length }} 条)</span>
                <a-space>
                  <a-switch
                    v-model="autoScroll"
                    checked-children="自动滚动"
                    un-checked-children="关闭滚动"
                  />
                  <a-switch
                    v-model="showTimestamp"
                    checked-children="显示时间"
                    un-checked-children="隐藏时间"
                  />
                </a-space>
              </div>
              
              <div class="message-list" ref="messageListRef">
                <div
                  v-for="(msg, index) in messages"
                  :key="index"
                  class="message-item"
                  :class="{
                    'message-incoming': msg.direction === 'incoming',
                    'message-outgoing': msg.direction === 'outgoing',
                    'message-error': msg.type === 'error',
                    'message-system': msg.type === 'system'
                  }"
                >
                  <div class="message-meta">
                    <span class="message-direction">
                      {{ msg.direction === 'incoming' ? '接收' : '发送' }}
                    </span>
                    <span class="message-time" v-if="showTimestamp">
                      {{ formatTime(msg.timestamp) }}
                    </span>
                  </div>
                  <div class="message-content">
                    <pre>{{ formatMessageContent(msg.content) }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
          
          <a-card title="统计信息" :bordered="false" style="margin-top: 16px">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-statistic title="接收消息数" :value="stats.received" />
              </a-col>
              <a-col :span="8">
                <a-statistic title="发送消息数" :value="stats.sent" />
              </a-col>
              <a-col :span="8">
                <a-statistic title="连接时长" :value="stats.connectionDuration" suffix="秒" />
              </a-col>
            </a-row>
            <a-row :gutter="16" style="margin-top: 16px">
              <a-col :span="12">
                <a-progress
                  :percent="connectionSuccessRate"
                  :stroke-color="connectionSuccessRate > 80 ? '#52c41a' : connectionSuccessRate > 50 ? '#faad14' : '#f5222d'"
                  :format="() => `成功率: ${connectionSuccessRate}%`"
                />
              </a-col>
              <a-col :span="12">
                <a-progress
                  :percent="messageSuccessRate"
                  :stroke-color="messageSuccessRate > 80 ? '#52c41a' : messageSuccessRate > 50 ? '#faad14' : '#f5222d'"
                  :format="() => `消息成功率: ${messageSuccessRate}%`"
                />
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import moment from 'moment'
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'

export default {
  name: 'WebSocketTest',
  data() {
    return {
      // 表单状态
      formState: {
        wsUrl: '192.168.2.8:8088/jeecg-boot/websocket/monitorPointData/',
        protocol: 'ws',
        deviceId: '1143',
        tenantId: '1'
      },
      
      // 消息表单状态
      messageForm: {
        messageType: 'subscribe',
        customMessage: '',
        nodeIds: '1143',
        commandType: 'read'
      },
      
      // WebSocket实例
      websocket: null,
      
      // 状态变量
      isConnected: false,
      connecting: false,
      connectionTime: '',
      connectionStartTime: null,
      autoScroll: true,
      showTimestamp: true,
      
      // 消息列表
      messages: [],
      
      // 统计信息
      stats: {
        received: 0,
        sent: 0,
        connectionDuration: 0,
        connectionAttempts: 0,
        successfulConnections: 0,
        failedMessages: 0
      },
      
      // 定时器
      connectionTimer: null
    }
  },
  computed: {
    connectionStatusText() {
      if (!this.websocket) return '未连接'
      switch (this.websocket.readyState) {
        case WebSocket.CONNECTING:
          return '连接中...'
        case WebSocket.OPEN:
          return '已连接'
        case WebSocket.CLOSING:
          return '正在关闭...'
        case WebSocket.CLOSED:
          return '已断开'
        default:
          return '未知状态'
      }
    },
    
    connectionStatusColor() {
      if (!this.websocket) return 'default'
      switch (this.websocket.readyState) {
        case WebSocket.CONNECTING:
          return 'processing'
        case WebSocket.OPEN:
          return 'success'
        case WebSocket.CLOSING:
          return 'warning'
        case WebSocket.CLOSED:
          return 'error'
        default:
          return 'default'
      }
    },
    
    connectionSuccessRate() {
      if (this.stats.connectionAttempts === 0) return 0
      return Math.round((this.stats.successfulConnections / this.stats.connectionAttempts) * 100)
    },
    
    messageSuccessRate() {
      const totalMessages = this.stats.received + this.stats.sent
      if (totalMessages === 0) return 0
      return Math.round(((totalMessages - this.stats.failedMessages) / totalMessages) * 100)
    },
    
    tokenStatusText() {
      const token = Vue.ls.get(ACCESS_TOKEN)
      if (!token) {
        return '未登录'
      }
      return token.length > 20 ? `已登录 (${token.substring(0, 20)}...)` : '已登录'
    },
    
    tokenStatusColor() {
      const token = Vue.ls.get(ACCESS_TOKEN)
      return token ? 'success' : 'error'
    }
  },
  mounted() {
    // 页面加载时自动填充默认值
    this.formState.wsUrl = '192.168.2.8:8088/jeecg-boot/websocket/monitorPointData/'
    this.formState.deviceId = '1143'
    this.formState.tenantId = '1'
  },
  
  beforeDestroy() {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.close()
    }
    this.stopConnectionTimer()
  },
  
  methods: {
    handleCheckToken() {
      const token = Vue.ls.get(ACCESS_TOKEN)
      if (token) {
        message.success(`Token有效，长度: ${token.length} 字符`)
        this.addSystemMessage(`当前Token: ${token.substring(0, 30)}...`)
      } else {
        message.error('未找到Token，请先登录')
        this.addErrorMessage('Token检查失败: 未找到Token')
      }
    },
    
    buildWebSocketUrl() {
      const baseUrl = `${this.formState.protocol}://${this.formState.wsUrl}${this.formState.deviceId}?tenantId=${this.formState.tenantId}`
      return baseUrl
    },
    
    handleConnect() {
      if (this.isConnected) {
        message.warning('已经连接到服务器')
        return
      }
      
      this.connecting = true
      this.stats.connectionAttempts++
      
      try {
        const wsUrl = this.buildWebSocketUrl()
        console.log('正在连接WebSocket:', wsUrl)
        
        this.addSystemMessage(`正在连接到: ${wsUrl}`)
        
        // 获取token
        const token = Vue.ls.get(ACCESS_TOKEN)
        if (!token) {
          message.error('请先登录获取token')
          this.connecting = false
          this.addErrorMessage('连接失败: 未找到token，请先登录')
          return
        }
        
        console.log('使用token连接:', token)
        this.addSystemMessage(`使用token连接: ${token.substring(0, 20)}...`)
        
        // 创建WebSocket连接，传递token作为第二个参数
        this.websocket = new WebSocket(wsUrl, [token])
        
        this.websocket.onopen = () => {
          this.isConnected = true
          this.connecting = false
          this.connectionStartTime = Date.now()
          this.connectionTime = moment().format('YYYY-MM-DD HH:mm:ss')
          this.stats.successfulConnections++
          
          this.addSystemMessage('WebSocket连接成功！')
          message.success('连接成功')
          
          // 开始更新连接时长
          this.startConnectionTimer()
        }
        
        this.websocket.onmessage = (event) => {
          this.stats.received++
          this.addIncomingMessage(event.data)
        }
        
        this.websocket.onerror = (error) => {
          this.connecting = false
          this.addErrorMessage('连接错误: ' + error.message)
          message.error('连接失败')
        }
        
        this.websocket.onclose = (event) => {
          this.isConnected = false
          this.connecting = false
          this.stopConnectionTimer()
          
          if (event.wasClean) {
            this.addSystemMessage(`连接已关闭，代码: ${event.code}, 原因: ${event.reason}`)
          } else {
            this.addErrorMessage('连接异常关闭')
          }
        }
        
      } catch (error) {
        this.connecting = false
        this.addErrorMessage('连接失败: ' + error.message)
        message.error('连接失败: ' + error.message)
      }
    },
    
    handleDisconnect() {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.close(1000, '用户主动断开连接')
        this.addSystemMessage('正在断开连接...')
      }
    },
    
    handleSendMessage() {
      if (!this.isConnected) {
        message.warning('请先连接到WebSocket服务器')
        return
      }
      
      let messageToSend = ''
      
      switch (this.messageForm.messageType) {
        case 'subscribe':
          const nodeIds = this.messageForm.nodeIds.split(',').map(id => id.trim()).filter(id => id)
          messageToSend = JSON.stringify({
            action: 'subscribe',
            ids: nodeIds
          })
          break
        
        case 'unsubscribe':
          const unsubscribeIds = this.messageForm.nodeIds.split(',').map(id => id.trim()).filter(id => id)
          messageToSend = JSON.stringify({
            action: 'unsubscribe',
            ids: unsubscribeIds
          })
          break
        
        case 'command':
          messageToSend = JSON.stringify({
            action: 'command',
            type: this.messageForm.commandType,
            timestamp: Date.now()
          })
          break
        
        case 'custom':
          try {
            // 尝试解析JSON
            const parsed = JSON.parse(this.messageForm.customMessage)
            messageToSend = JSON.stringify(parsed)
          } catch (error) {
            // 如果不是JSON，直接发送原始文本
            messageToSend = this.messageForm.customMessage
          }
          break
        
        default:
          message.warning('请选择消息类型')
          return
      }
      
      try {
        this.websocket.send(messageToSend)
        this.stats.sent++
        this.addOutgoingMessage(messageToSend)
        message.success('消息发送成功')
      } catch (error) {
        this.stats.failedMessages++
        this.addErrorMessage('发送失败: ' + error.message)
        message.error('发送失败: ' + error.message)
      }
    },
    
    handleSendTestMessage() {
      if (!this.isConnected) {
        message.warning('请先连接到WebSocket服务器')
        return
      }
      
      const testMessage = JSON.stringify({
        action: 'test',
        timestamp: Date.now(),
        data: {
          message: '这是一条测试消息',
          deviceId: this.formState.deviceId,
          tenantId: this.formState.tenantId
        }
      })
      
      try {
        this.websocket.send(testMessage)
        this.stats.sent++
        this.addOutgoingMessage(testMessage)
        message.success('测试消息发送成功')
      } catch (error) {
        this.stats.failedMessages++
        this.addErrorMessage('测试消息发送失败: ' + error.message)
        message.error('测试消息发送失败: ' + error.message)
      }
    },
    
    handleClear() {
      this.messages = []
      message.success('日志已清空')
    },
    
    addMessage(content, direction = 'system', type = 'normal') {
      const newMessage = {
        content,
        direction,
        type,
        timestamp: Date.now()
      }
      
      this.messages.push(newMessage)
      
      // 限制消息数量，最多保留100条
      if (this.messages.length > 100) {
        this.messages = this.messages.slice(-100)
      }
      
      // 自动滚动到底部
      if (this.autoScroll) {
        this.$nextTick(() => {
          if (this.$refs.messageListRef) {
            this.$refs.messageListRef.scrollTop = this.$refs.messageListRef.scrollHeight
          }
        })
      }
    },
    
    addIncomingMessage(content) {
      this.addMessage(content, 'incoming', 'normal')
    },
    
    addOutgoingMessage(content) {
      this.addMessage(content, 'outgoing', 'normal')
    },
    
    addSystemMessage(content) {
      this.addMessage(content, 'system', 'system')
    },
    
    addErrorMessage(content) {
      this.addMessage(content, 'system', 'error')
    },
    
    formatTime(timestamp) {
      return moment(timestamp).format('HH:mm:ss.SSS')
    },
    
    formatMessageContent(content) {
      try {
        // 尝试解析JSON
        const parsed = JSON.parse(content)
        return JSON.stringify(parsed, null, 2)
      } catch (error) {
        // 如果不是JSON，返回原始内容
        return content
      }
    },
    
    startConnectionTimer() {
      this.stopConnectionTimer()
      this.connectionTimer = setInterval(() => {
        if (this.connectionStartTime) {
          this.stats.connectionDuration = Math.floor((Date.now() - this.connectionStartTime) / 1000)
        }
      }, 1000)
    },
    
    stopConnectionTimer() {
      if (this.connectionTimer) {
        clearInterval(this.connectionTimer)
        this.connectionTimer = null
      }
    }
  }
}
</script>

<style scoped>
.websocket-test-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: 100vh;
}

.message-display {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.message-item {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  background: #fff;
}

.message-item.message-incoming {
  border-left: 4px solid #52c41a;
  background: #f6ffed;
}

.message-item.message-outgoing {
  border-left: 4px solid #1890ff;
  background: #e6f7ff;
}

.message-item.message-error {
  border-left: 4px solid #f5222d;
  background: #fff1f0;
}

.message-item.message-system {
  border-left: 4px solid #faad14;
  background: #fffbe6;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.message-direction {
  font-weight: bold;
}

.message-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
}

/* 滚动条样式 */
.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>