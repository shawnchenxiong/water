/* eslint-disable */

import axios from './axios';

import { mxRemoteServerRoot } from '../../constant';

// 创建axios实例
const service = axios.create({
	baseURL: mxRemoteServerRoot, // api的base_url
	timeout: 60000, // 请求超时时间
});

// request拦截器
service.interceptors.request.use(
	(config) => {
		removePending(config);
		!config.repeatRequest && addPending(config);
		// 打开loading
		if (config.loading) {
			LoadingInstance._count++;
			if (LoadingInstance._count === 1) {
				openLoading(config.loadingDom);
			}
		}
		const urlParams = window.location.hash.split('?')[1] ? new URLSearchParams(window.location.hash.split('?')[1]) : new URLSearchParams();
		const token = localStorage.getItem('Access-Token') || localStorage.getItem('token') || urlParams.get('tt');
		if (token) {
			config.headers['X-Access-Token'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
			config.headers['Authorization'] = `Bearer ${token}`
		}
		config.headers['tenant-id'] = localStorage.getItem('TENANT_ID') || localStorage.getItem('tenantId') || localStorage.getItem('tenant_id') || urlParams.get('tenantId');
		/* if (store.state.userInfo.token) {
	  config.headers['X-Token'] = getToken() // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
	} */
		return config;
	},
	(error) => {
		console.log(error);
		Promise.reject(error);
	}
);

// respone拦截器
service.interceptors.response.use(
	(response) => {
		// 已完成请求的删除请求中数组
		removePending(response.config);
		// 关闭loading
		if (response.config.loading) {
			closeLoading();
		}
		if (response.status != 200 || !response.data) {
			return Promise.reject(new Error('请求错误'));
		}
		/* if(response.data.code != 0){
			return Promise.reject(new Error(response.data.msg));
		} */
		return response.data;
	},
	(error) => {
		error.config && removePending(error.config);
		// 关闭loading
		if (error.config.loading) {
			closeLoading();
		}
		console.log('err' + error); // for debug
		return Promise.reject(error);
	}
);

// --------------------------------取消接口重复请求的函数-----------------------------------
// axios.js
const pendingMap = new Map();
/**
 * 生成每个请求唯一的键
 * @param {*} config
 * @returns string
 */
function getPendingKey(config) {
	let { url, method, params, data } = config;
	if (typeof data === 'string') data = JSON.parse(data); // response里面返回的config.data是个字符串对象
	return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&');
}

/**
 * 储存每个请求唯一值, 也就是cancel()方法, 用于取消请求
 * @param {*} config
 */
function addPending(config) {
	const pendingKey = getPendingKey(config);
	config.cancelToken =
		config.cancelToken ||
		new axios.CancelToken((cancel) => {
			if (!pendingMap.has(pendingKey)) {
				pendingMap.set(pendingKey, cancel);
			}
		});
}
/**
 * 删除重复的请求
 * @param {*} config
 */
function removePending(config) {
	const pendingKey = getPendingKey(config);
	if (pendingMap.has(pendingKey)) {
		const cancelToken = pendingMap.get(pendingKey);
		cancelToken(pendingKey);
		pendingMap.delete(pendingKey);
	}
}
// ----------------------------------loading的函数-------------------------------
const LoadingInstance = {
	_target: null, // 保存Loading实例
	_count: 0,
};
function openLoading(loadingDom) {
	/* LoadingInstance._target = Loading.service({
	lock: true,
	text: '数据正在加载中',
	spinner: 'el-icon-loading',
	background: 'rgba(25, 32, 53, 1)',
	target: loadingDom || 'body',
  }) */
}
function closeLoading() {
	if (LoadingInstance._count > 0) LoadingInstance._count--;
	if (LoadingInstance._count === 0) {
		/* LoadingInstance._target.close()
	LoadingInstance._target = null */
	}
}

export default service;
