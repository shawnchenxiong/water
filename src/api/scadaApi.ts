import axios from 'axios';

// 使用配置中的真实后端获取组态列表
const baseURL = import.meta.env.VITE_APP_API_URL;

const scadaHttp = axios.create({
    baseURL,
    timeout: 10000,
});

scadaHttp.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenant_id') || '1';

    if (token) {
        config.headers['X-Access-Token'] = token;
    }
    config.headers['tenant-id'] = tenantId;

    return config;
}, (error) => {
    return Promise.reject(error);
});

export const getScadaList = () => {
    return scadaHttp.get('/app/none/configuration/list');
};
