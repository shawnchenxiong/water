/* eslint-disable */

import { mxConstants, mxEvent, mxUtils, mxPerimeter } from './core/mxgraph';
import { Spinner } from './js/utils/spin';
import App from './App';
import api from './js/utils/api';

import localforage from './js/utils/localforage';

function Start() {
}

export default Start;

Start.home = function (root, option) {
    if (!option || !option.deviceId) {
        Start.showError(root, '参数异常');
        return;
    }
    const spinner = new Spinner({
        lines: 12, // The number of lines to draw
        length: 24, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        scale: 0.5, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        speed: 1, // Rounds per second
        rotate: 0, // The rotation offset
        animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // CSS color or array of colors
        fadeColor: 'transparent', // CSS color or array of colors
        top: '50%', // Top position relative to parent
        left: '50%', // Left position relative to parent
        shadow: '0 0 1px transparent', // Box-shadow for the lines
        zIndex: 2000000000, // The z-index (defaults to 2e9)
        className: 'spinner', // The CSS class to assign to the spinner
        position: 'absolute', // Element positioning
    }).spin(root);
    const deviceStore = localforage.createInstance({
        name: `${option.deviceId}_${option.chromeless ? 'preview' : 'editor'}`
    });
    api.getConfigurationInfo(option)
        .then(async (res) => {
            if (res.code !== 200) {
                throw new Error(res.msg);
            }
            if (!res.data || !res.data.device || !res.data.device.id) {
                throw new Error('数据异常');
            }
            if (res.data.device.content) {
                let edversion = null;
                try {
                    edversion = await deviceStore.getItem('edversion');
                } catch (e) {
                    console.log(`await deviceStore.getItem('edversion')`, e);
                } finally {
                    if (mxUtils.isNullOrUndefined(edversion)) edversion = '0';
                    edversion = parseInt(edversion);
                }
                console.log('检测本地 edversion：', edversion);
                console.log('远程版本 edversion：', res.data.device.edversion);
                let remote = parseInt(res.data.device.edversion);
                console.log('版本比较：', edversion < remote || (edversion + '').length !== (remote + '').length);
                if (option.chromeless || edversion < remote || (edversion + '').length !== (remote + '').length) {
                    return new Promise((resolve, reject) => {
                        console.log('开始从远程下载组态文件:', res.data.device.content);
                        api.downloadFile(res.data.device.content, function (event) {
                            // 可选：显示下载进度
                        }).then(res2 => {
                            if (res2 && typeof res2 === 'string' && (res2.startsWith('{"code":') || res2.startsWith('{"success":'))) {
                                try {
                                    const jsonErr = JSON.parse(res2);
                                    if (jsonErr.code !== 200 && !jsonErr.success) {
                                        throw new Error(jsonErr.msg || '下载文件内容格式错误(API报错)');
                                    }
                                } catch (e) {
                                    if (e.message.includes('JSON')) { /* ignore non-json errors */ }
                                    else throw e;
                                }
                            }

                            deviceStore.setItem('content', res2).then(function () {
                                return deviceStore.setItem('edversion', res.data.device.edversion)
                            }).then(() => {
                                console.log('组态文件下载完成并存入本地仓储:', res.data.device.edversion);
                                resolve(res);
                            }).catch(function (err) {
                                console.error('本地仓储写入失败 (deviceStore):', err);
                                reject(new Error('本地仓储写入失败: ' + err.message));
                            });
                        }).catch(e => {
                            console.error('下载组态文件失败 (downloadFile):', e);
                            reject(new Error('下载组态文件失败: ' + (e.message || e)));
                        })
                    })
                }
            }
            console.log('版本比较：未加载远程content');
            return new Promise(resolve => resolve(res));
        })
        .then(async (res) => {
            option['device'] = res.data.device;
            option['templete'] = res.data.templete;
            option['templeteId'] = res.data.device.templeteId;
            spinner.stop();
            App.main(root, option, function (ui) {
                ui.loadTemplate();

                // 自动保存逻辑：解决新创建组态未保存时模板功能无法使用的问题 syzz
                if (!option.chromeless) {
                    // 编辑模式下，延迟执行保存以确保编辑器完全初始化
                    setTimeout(() => {
                        try {
                            // 调用保存按钮的完整功能，包括上传文件和保存记录
                            ui.actions.get('save').funct();
                        } catch (error) {
                            console.log('编辑器初始化完成后自动保存失败:', error);
                        }
                    }, 1000);
                }
            });
        })
        .catch((e) => {
            console.log('api.getConfigurationInfo--error', e)
            spinner.stop();
            Start.showError(root, e.message);
        });
    api.getDeviceDataByKey('t_' + 'test004' + '_' + 'ATTR1').then(async (res) => {
        console.log('getDeviceDataByKey', JSON.stringify(res.data));
    })
};

Start.showError = function (container, text) {
    var node = document.createElement('div');
    node.style.cssText = `
        width:200px;
        height:200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: absolute;
        top: calc(50% - 100px);
        left: calc(50% - 100px);
    `;
    var lable = document.createElement('div');
    mxUtils.write(lable, text);
    node.appendChild(lable);
    container.innerHTML = '';
    container.appendChild(node);
};
