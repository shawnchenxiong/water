/* eslint-disable */
/**
 * 自定义 WebSocket 封装类
 * 
 * 功能特性：
 * - 自动重连机制
 * - 心跳保活
 * - 回调事件管理
 */
export default class CustomWebSocket {
    constructor(url, protocols) {
        this.url = url;
        this.socket = null;
        this.connected = false;
        this.protocols = protocols ? protocols : null;
        this.reconnectInterval = 5000; // 重连间隔时间，单位：毫秒
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 0; // 最大重连次数
        this.onOpenCallbacks = [];
        this.onMessageCallbacks = [];
        this.onCloseCallbacks = [];
        this.onErrorCallbacks = [];
        this.heartbeat_timer = null;
        this.active_close = false;
    }

    connect() {
        this.socket = this.protocols ? new WebSocket(this.url, this.protocols) : new WebSocket(this.url);

        this.socket.onopen = (event) => {
            this.connected = true;
            this.reconnectAttempts = 0;
            this.onOpenCallbacks.forEach(callback => callback(event));
            this.heartbeat();
        };

        this.socket.onmessage = (event) => {
            this.onMessageCallbacks.forEach(callback => callback(event.data));
        };

        this.socket.onclose = (event) => {
            this.connected = false;
            if (event.code !== 4000) {
                this.onCloseCallbacks.forEach(callback => callback(event));
                clearInterval(this.heartbeat_timer);
                if (this.active_close) {
                    // 手动关闭，不重连
                } else {
                    this.reconnect();
                }
            }
        };

        this.socket.onerror = (error) => {
            this.connected = false;
            console.error('WebSocket error:', error);
            this.onErrorCallbacks.forEach(callback => callback(error));
            clearInterval(this.heartbeat_timer);
            setTimeout(() => {
                this.reconnect();
            }, 5000);
        };
    }

    heartbeat() {
        if (this.heartbeat_timer) {
            clearInterval(this.heartbeat_timer);
        }
        this.heartbeat_timer = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send('heartbeat');
            }
        }, 10000);
    }

    reconnect() {
        this.active_close = false;
        if (this.socket) {
            this.active_close = true;
            this.socket.close(4000, '用户断开连接');
            this.socket = null;
        }
        if (this.reconnectAttempts < this.maxReconnectAttempts || this.maxReconnectAttempts === 0) {
            setTimeout(() => {
                this.connect();
                this.reconnectAttempts++;
            }, this.reconnectInterval);
        }
    }

    publish(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error('WebSocket is not open');
        }
    }

    close() {
        clearInterval(this.heartbeat_timer);
        this.active_close = true;
        if (this.socket) {
            this.socket.close();
        }
    }

    onOpen(callback) {
        this.onOpenCallbacks.push(callback);
    }

    onMessage(callback) {
        this.onMessageCallbacks.push(callback);
    }

    onClose(callback) {
        this.onCloseCallbacks.push(callback);
    }

    onError(callback) {
        this.onErrorCallbacks.push(callback);
    }
}
