/* eslint-disable */
/**
 * 自定义 MQTT 封装类
 * 
 * 功能特性：
 * - 自动重连机制
 * - 主题订阅管理
 * - 回调事件管理
 */
import { mxUtils } from "../../core/mxgraph";
import mqtt from '../utils/mqtt';

export default class CustomMqtt {
    constructor(options) {
        this.client = null;
        this.options = options;
        this.connected = false;
        this.reconnectInterval = 5000; // 重连间隔时间，单位：毫秒
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 0; // 最大重连次数
        this.onOpenCallbacks = [];
        this.onMessageCallbacks = [];
        this.onCloseCallbacks = [];
        this.onErrorCallbacks = [];
    }

    connect() {
        this.client = mqtt.connect(this.options.mqttUrl, {
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
            clientId: this.options.mqttClientId,
            username: this.options.mqttUsername,
            password: this.options.mqttPassword,
        });

        this.client.on('connect', (event) => {
            this.connected = true;
            this.reconnectAttempts = 0;
            this.onOpenCallbacks.forEach(callback => callback(event));
        });

        this.client.on('message', (topic, message) => {
            this.onMessageCallbacks.forEach(callback => callback(topic, message.toString()));
        });

        this.client.on('error', (error) => {
            console.error('MQTT error:', error);
            this.connected = false;
            this.reconnect();
            this.onErrorCallbacks.forEach(callback => callback(error));
        });

        this.client.on('close', (event) => {
            this.connected = false;
            this.onCloseCallbacks.forEach(callback => callback(event));
        });
    }

    reconnect() {
        if (!this.connected && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                this.connect();
                this.reconnectAttempts++;
            }, this.reconnectInterval);
        }
    }

    publish(topic, message) {
        if (this.connected) {
            this.client.publish(topic, message);
        } else {
            console.error('MQTT publish error: Not connected');
        }
    }

    subscribe(topic, callBack) {
        if (this.connected) {
            this.client.subscribe(topic, callBack);
        } else {
            console.error('MQTT subscribe error: Not connected');
        }
    }

    unsubscribe(topic) {
        if (this.connected) {
            this.client.unsubscribe(topic);
        } else {
            console.error('MQTT unsubscribe error: Not connected');
        }
    }

    close() {
        if (this.connected) {
            this.client.end();
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
