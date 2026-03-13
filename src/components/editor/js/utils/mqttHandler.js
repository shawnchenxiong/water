/* eslint-disable */
import * as mqtt from 'mqtt/dist/mqtt.min';

const Mqtt = function (config) {
	//this.random = getGuid32;
	this.clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
	let options = {
		keepalive: 60,
		clientId: this.clientId,
		clean: true,
		reconnectPeriod: 1000,
		connectTimeout: 30 * 1000
	};
    console.log(mqtt);
	this.client = mqtt.connect('ws://localhost:8083/mqtt', options);

	//this.client = mqtt.connect(config.url, options);
	// 重连次数 超5次就算了
	this.reconnectNum = 0;
	// 连接
	this.link = function () {
		return new Promise((resolve, reject) => {
			this.client.on('connect', (e) => {
				console.log('-----------------------链接成功-----------------------');
				resolve(this.client);
			});
			this.client.on('reconnect', (error) => {
				this.reconnectNum++;
				if (this.reconnectNum >= 10) this.client.end(true);
				console.log('正在重连:', error);
			});
			this.client.on('error', (error) => {
				console.log('订阅失败', error);
			});
		});
	};
	this.subscribe = function (topic, options) {
		this.client.subscribe(topic, options, (err) => {
			if (!err) {
				console.log('-----------------------' + topic + '订阅成功-----------------------');
			} else {
				throw new Error(err);
			}
		});
	};
	this.publish = function (topic, sendMsg, options) {
		this.client.publish(topic, JSON.stringify(sendMsg), options, (err, a) => {
			if (!err) {
				console.log('-----------------------' + topic + '发送成功-----------------------');
			} else {
				throw new Error(err);
			}
		});
	};
	this.message = function (callback) {
		this.client.on('message', (topic, message) => {
			let data = JSON.parse(message.toString());
			callback(topic, data);
		});
	};
	// 关闭
	this.close = function () {
		this.client.end(true);
	};
};

export default Mqtt;

function getGuid32() {
	var rt_str = String.fromCharCode(65 + Math.floor(Math.random() * 26));
	for (var i = 0; i < 31; ++i) {
		var num = Math.floor(Math.random() * (26 + 26 + 10));
		var ch_str;
		if (num < 10) {
			ch_str = num.toString();
		} else if (num < 10 + 26) {
			ch_str = String.fromCharCode(65 + num - 10);
		} else {
			ch_str = String.fromCharCode(97 + num - 10 - 26);
		}
		rt_str += ch_str;
	}
	return rt_str;
}
