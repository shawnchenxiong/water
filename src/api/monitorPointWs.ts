/**
 * 监控点实时数据 WebSocket 服务
 *
 * WebSocket 地址格式：
 *   ws://{host}/jeecg-boot/websocket/monitorPointData/{pointValue}?tenantId={tenantId}
 *
 * - pointValue: getAllMonitorList 返回的最底层叶子节点的 value 字段
 * - tenantId: 从浏览器 localStorage 中获取
 *
 * 返回数据格式：
 *   {
 *     "monitorId": "14030",
 *     "data": {
 *       "2026-03-11 10:12:26": 6,
 *       "2026-03-11 10:12:27": 6,
 *       ...
 *     }
 *   }
 */

// ==================== 类型定义 ====================

/** WebSocket 推送的监控点数据 */
export interface MonitorPointMessage {
  /** 监控点ID */
  monitorId: string
  /** 时间 → 数值 键值对 */
  data: Record<string, number>
}

/** 已解析的数据点 */
export interface MonitorDataPoint {
  /** 时间戳字符串，如 "2026-03-11 10:12:26" */
  time: string
  /** 监控数值 */
  value: number
}

/** WebSocket 连接状态 */
export type WsConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

/** 数据回调函数类型 */
export type MonitorDataCallback = (points: MonitorDataPoint[], monitorId: string) => void

/** 状态变化回调 */
export type WsStateCallback = (state: WsConnectionState) => void

// ==================== WebSocket 管理类 ====================

/**
 * 监控点实时数据 WebSocket 管理器
 *
 * 用法：
 *   const ws = new MonitorPointWs('14030', onData, onState)
 *   ws.connect()
 *   // ... 使用中 ...
 *   ws.disconnect()
 */
export class MonitorPointWs {
  /** 监控点 value（叶子节点ID） */
  private pointValue: string
  /** WebSocket 实例 */
  private ws: WebSocket | null = null
  /** 数据回调 */
  private onData: MonitorDataCallback
  /** 状态回调 */
  private onState?: WsStateCallback
  /** 重连计时器 */
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  /** 重连次数 */
  private reconnectCount = 0
  /** 最大重连次数 */
  private maxReconnect = 5
  /** 重连间隔（毫秒） */
  private reconnectInterval = 3000
  /** 是否由用户主动关闭 */
  private manualClose = false

  constructor(
    pointValue: string,
    onData: MonitorDataCallback,
    onState?: WsStateCallback,
    private customTenantId?: string
  ) {
    this.pointValue = pointValue
    this.onData = onData
    this.onState = onState
  }

  /**
   * 建立 WebSocket 连接
   */
  connect(): void {
    this.manualClose = false
    this.reconnectCount = 0
    this._doConnect()
  }

  /**
   * 断开 WebSocket 连接
   */
  disconnect(): void {
    this.manualClose = true
    this._clearReconnectTimer()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this._setState('disconnected')
  }

  /**
   * 切换监控点（先断开旧连接，再连接新点位）
   */
  switchPoint(newPointValue: string): void {
    this.disconnect()
    this.pointValue = newPointValue
    this.connect()
  }

  /**
   * 获取 WebSocket URL
   */
  private _getWsUrl(): string {
    // 获取 tenantId
    const tenantId = this.customTenantId || localStorage.getItem('tenant_id') || '1'
    const token = localStorage.getItem('token') || ''

    // 优先使用环境变量 VITE_APP_WS_API_URL，若无则基于当前域名拼接
    // 因为 WebSocket 不受同源策略限制，本地开发可直连后端 WSS 绕过容易出错的本地 http 代理
    const wsBaseUrl = import.meta.env.VITE_APP_WS_API_URL || 
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/jeecg-boot`

    // jeecg-boot WebSocket 通常需要传入 token 进行鉴权 (现已通过 Sec-WebSocket-Protocol 头传递)
    return `${wsBaseUrl}/websocket/monitorPointData/${this.pointValue}?tenantId=${tenantId}&token=${token}`
  }

  /**
   * 内部连接方法
   */
  private _doConnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    const url = this._getWsUrl()
    console.log('[MonitorPointWs] 正在连接:', url)
    this._setState('connecting')

    try {
      const token = localStorage.getItem('token') || ''
      // Jeecg WebSocket 的鉴权机制通常要求在 Sec-WebSocket-Protocol 头中携带 token
      this.ws = token ? new WebSocket(url, [token]) : new WebSocket(url)

      this.ws.onopen = () => {
        console.log('[MonitorPointWs] 连接成功, pointValue:', this.pointValue)
        this.reconnectCount = 0
        this._setState('connected')

        // 订阅当前监控点数据
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const subscribeMsg = JSON.stringify({
            action: 'subscribe',
            ids: [this.pointValue]
          })
          console.log('[MonitorPointWs] 发送订阅消息:', subscribeMsg)
          this.ws.send(subscribeMsg)
        }
      }

      this.ws.onmessage = (event) => {
        this._handleMessage(event.data)
      }

      this.ws.onerror = (error) => {
        console.error('[MonitorPointWs] 连接错误:', error)
        this._setState('error')
      }

      this.ws.onclose = (event) => {
        console.log('[MonitorPointWs] 连接关闭:', event.code, event.reason)
        if (!this.manualClose) {
          this._tryReconnect()
        }
      }
    } catch (error) {
      console.error('[MonitorPointWs] 创建连接失败:', error)
      this._setState('error')
      if (!this.manualClose) {
        this._tryReconnect()
      }
    }
  }

  private _handleMessage(raw: string): void {
    try {
      // {"monitorId":"14924","data":"","type":"realTimeData","timestamp":1773369374711}
      const msg = JSON.parse(raw) as any

      if (msg.type === 'realTimeData' || msg.monitorId) {
        // 如果数据部分为空，说明这一秒没有推送有效数据，直接忽略即可
        if (!msg.data || msg.data === '') {
           return
        }
        
        // 当发送的直接是一个数值时，我们根据 timestamp 生成数据点
        if (typeof msg.data === 'string' || typeof msg.data === 'number') {
           const time = new Date(msg.timestamp || Date.now()).toLocaleString();
           const val = Number(msg.data);
           if (!isNaN(val)) {
             this.onData([{ time, value: val }], msg.monitorId)
           }
           return
        }

        // 以 { "时间": 值 } 的结构返回 (如遇)
        if (typeof msg.data === 'object') {
          const points: MonitorDataPoint[] = Object.entries(msg.data)
            .map(([time, value]) => ({ time, value: Number(value) }))
            .sort((a, b) => a.time.localeCompare(b.time))
          this.onData(points, msg.monitorId)
        }
        return
      }

      console.warn('[MonitorPointWs] 收到未知类型的消息:', raw)
    } catch (error) {
      console.error('[MonitorPointWs] 解析消息失败:', error, raw)
    }
  }

  /**
   * 尝试重连
   */
  private _tryReconnect(): void {
    if (this.reconnectCount >= this.maxReconnect) {
      console.warn('[MonitorPointWs] 达到最大重连次数，停止重连')
      this._setState('error')
      return
    }

    this.reconnectCount++
    const delay = this.reconnectInterval * this.reconnectCount
    console.log(`[MonitorPointWs] 第 ${this.reconnectCount} 次重连，${delay}ms 后尝试...`)

    this._clearReconnectTimer()
    this.reconnectTimer = setTimeout(() => {
      this._doConnect()
    }, delay)
  }

  /**
   * 清除重连计时器
   */
  private _clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * 更新状态
   */
  private _setState(state: WsConnectionState): void {
    this.onState?.(state)
  }
}
