/* eslint-disable */

import request from './request';

// ============================================
// 初始化 API 对象
// ============================================
const api = {};

// 获取 token 和 tenant-id
const urlParams = window.location.hash.split('?')[1] ? new URLSearchParams(window.location.hash.split('?')[1]) : new URLSearchParams();
const token = localStorage.getItem('Access-Token') || localStorage.getItem('token') || urlParams.get('tt');
const tenantId = localStorage.getItem('TENANT_ID') || localStorage.getItem('tenantId') || localStorage.getItem('tenant_id') || urlParams.get('tenantId');

// 设置 headers
const headers = {
    'Content-Type': 'application/json'
};
if (token) {
    headers['X-Access-Token'] = token; // 根据实际情况添加 token
    headers['Authorization'] = `Bearer ${token}`; // 添加标准 Authorization 头
}
if (tenantId) {
    headers['tenant-id'] = tenantId;
}

// ============================================
// API 方法定义
// ============================================

// 规范化路径：处理后端可能返回的绝对文件路径
api.normalizePath = function (path) {
    if (!path || typeof path !== 'string') return path;
    // 如果是绝对路径（包含 /data/rcscada/），尝试转换为相对路径或处理掉前缀
    if (path.indexOf('/data/rcscada/') !== -1) {
        console.warn('[API] Detected absolute server path, normalizing:', path);
        // 通常我们只需要相对路径部分，或者 stripping 掉服务器根路径
        // 尝试找到 'upload/' 并保留其后的部分
        const uploadIdx = path.indexOf('upload/');
        if (uploadIdx !== -1) {
            return '/' + path.substring(uploadIdx);
        }
        // 回导：直接去掉前缀
        return path.replace('/data/rcscada/', '/');
    }
    return path;
};

api.saveConfigurationInfo = function (params) {
    return request({
        url: '/app/none/configuration/save',
        method: 'post',
        data: { ...params },
    });
};

api.getConfigurationList = function () {
    return request({
        url: '/app/none/configuration/list',
        method: 'get',
        params: {},
    });
};

api.getCollectList = function () {
    return request({
        url: '/app/none/configuration/collect/list',
        method: 'get',
        params: {},
    });
};
api.saveCollect = function (params) {
    return request({
        url: '/app/none/configuration/collect/save',
        method: 'post',
        data: { ...params },
    });
};

api.getConfigurationInfo = function (option) {
    return request({
        url: `/app/none/configuration/${option.deviceId}`,
        method: 'get',
        params: {},
    });
};

api.getDeviceDataByKey = function (key) {
    return request({
        url: `/app/none/configuration/deviceData/${key}`,
        method: 'get',
        params: {},
    });
};

api.getHistoryDataBySn = function (params) {
    if (params.sn && Array.isArray(params.sn)) {
        params.sn = params.sn.join(',');
    }
    return request({
        url: `/app/none/configuration/getHistoryDataBySn`,
        method: 'get',
        params: params,
    });
};


api.getDeviceNameList = function () {
    return request({
        url: '/device/getNameList',
        method: 'get',
        params: {},
    })
}

api.getDeviceList = function (params) {
    return request({
        url: '/device/list',
        method: 'get',
        params: params,
    });
};

api.findDeviceById = function (params) {
    return request({
        url: '/device/findDeviceById',
        method: 'get',
        params: params,
    });
};

api.uploadFile = function (file) {
    const formData = new FormData();
    formData.append('file', file);
    return request.post(`/app/none/upload/file`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
api.uploadContent = function (deviceId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return request.post(`/app/none/upload/content/${deviceId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
api.downloadFile = function (path, progressCallBack) {
    // 确保下载路径是规范化的
    const normalizedPath = api.normalizePath(path);
    return request({
        'method': 'get',
        'url': normalizedPath,
        'responseType': 'text',
        onDownloadProgress: function (progressEvent) {
            if (progressCallBack) {
                progressCallBack(progressEvent);
            }
        }
    });
};

api.getModuleInfo = function () {
    return request({
        url: '/app/none/configuration/getModuleInfo',
        method: 'get',
        params: {},
    });
};

api.getRcScript = function (params) {
    return request({
        url: '/rcscada/rcCellScript/getRcScript',
        method: 'get',
        params: params,
    });
};
api.saveCellScript = function (params) {
    return request({
        url: '/app/none/configuration/cellScript/save',
        method: 'post',
        data: params,
        headers: {
            'Content-Type': 'application/json' // 确保 Content-Type 设置为 application/json
        }
    });
};

// 获取全局脚本
api.getGlobalScriptByDeviceId = function (params) {
    return request({
        url: '/rcscada/rcCellScript/getGlobalScriptByDeviceId',
        method: 'get',
        params: params,
        headers: headers
    });
};
// 保存全局脚本
api.saveGlobalScriptByDeviceId = function (params) {
    return request({
        url: '/rcscada/rcCellScript/saveGlobalScriptByDeviceId',
        method: 'post',
        data: params,
        headers: headers
    });
};

api.getDataByMysqlStatement = function (sql) {
    return request({
        url: '/executeSql/getDataByMysqlStatement',
        method: 'get',
        params: { sql: sql },
        headers: headers
    });
};
api.getDataByTdStatement = function (sql) {
    return request({
        url: '/executeSql/getDataByTdStatement',
        method: 'get',
        params: { sql: sql },
        headers: headers
    });
};


api.getFolderList = function () {
    return request({
        url: '/iconManagement/findRcFolder',
        method: 'get',
        params: {},
    });
};

api.addDataDistribution = function (params) {
    return request({
        url: '/dataDistribution/add',
        method: 'post',
        data: params,
        headers: headers
    });
};

api.sendMqtt = function (params) {
    return request({
        url: '/configuration/device/sendMqtt',
        method: 'post',
        data: params,
        headers: headers
    });
};

api.getAllAlarm = function (params) {
    return request({
        url: '/log/getAllAlarm',
        method: 'get',
        params: params,
    });
};

// 获取模板库分组和模板数据
api.getGroupsWithTemplates = function () {
    return request({
        url: '/configuration/device/getGroupsWithTemplates',
        method: 'get',
        params: {},
        headers: headers
    });
};

// Control Panel Mock API
api.saveControlPanel = function (params) {
    return new Promise((resolve) => {
        let panels = JSON.parse(localStorage.getItem('rc_control_panels') || '[]');

        if (params.id) {
            // 检查是否存在以进行更新
            const index = panels.findIndex(p => p.id == params.id);
            if (index !== -1) {
                panels[index] = params;
            } else {
                panels.push(params);
            }
        } else {
            params.id = Date.now().toString();
            panels.push(params);
        }

        localStorage.setItem('rc_control_panels', JSON.stringify(panels));
        resolve({ data: { code: 200, msg: 'success', data: params } });
    });
};

api.getControlPanelList = function () {
    return new Promise((resolve) => {
        let panels = JSON.parse(localStorage.getItem('rc_control_panels') || '[]');
        // Add a default sample if empty for testing
        if (panels.length === 0) {
            panels.push({ id: 'sample_1', name: '示例控制面板', content: '' });
        }
        resolve({ data: { code: 200, msg: 'success', data: panels } });
    });
};


api.deleteControlPanel = function (id) {
    return new Promise((resolve) => {
        let panels = JSON.parse(localStorage.getItem('rc_control_panels') || '[]');
        panels = panels.filter(p => p.id != id);
        localStorage.setItem('rc_control_panels', JSON.stringify(panels));
        resolve({ data: { code: 200, msg: 'success' } });
    });
};

// === Remote Control Panel API ===

api.saveControlPanelRemote = function (params) {
    return request({
        url: '/sxScadaPanelInfo/save',
        method: 'post',
        data: params,
    });
};

api.getControlPanelListRemote = function (params) {
    return request({
        url: '/sxScadaPanelInfo/list',
        method: 'get',
        params: params,
    });
};

api.getControlPanelByIdRemote = function (params) {
    return request({
        url: '/sxScadaPanelInfo/queryById',
        method: 'get',
        params: params,
    });
};

api.deleteControlPanelRemote = function (params) {
    return request({
        url: '/sxScadaPanelInfo/delete',
        method: 'delete',
        params: params,
    });
};

// ============================================
// 导出 API 对象
// ============================================
export default api;
