/* eslint-disable */
import axios from "./axios";
import {mxUtils} from "../../core/mxgraph";


export default class CustomHttpHeartbeat {
    constructor(editorUi, option = {}) {
        this.editorUi = editorUi;
        this.httpHost = option.httpHost;
        this.httpUrl = option.httpUrl;
        this.httpCycle = option.httpCycle;
        this.httpHeader = option.httpHeader;
        this.httpParams = option.httpParams;
        this.httpType = option.httpType;
        this.httpEventUrl = option.httpEventUrl;
        this.httpEventType = option.httpEventType;
        this.httpEventHeader = option.httpEventHeader;
        this.httpEventParams = option.httpEventParams;
        this.httpRulesFun = option.httpRulesFun;
        this.onOpenCallbacks = [];
        this.onMessageCallbacks = [];
        this.onCloseCallbacks = [];
        this.onErrorCallbacks = [];
        this.httpClient = axios.create({
            baseURL: this.httpHost,
            timeout: 60000,
        });
        this.heartbeat_timer = null;
    }

    connect() {
        if(this.httpUrl){
            let httpCycle = this.httpCycle ? parseInt(this.httpCycle) : 60000;
            let httpType = this.httpType ? this.httpType : 'GET';
            let httpUrl = mxUtils.replaceDynamicParams(this.httpUrl, this.editorUi.GLOBAL_CONFIG);
            let headerObj = {};
            let paramsObj = {};
            if(this.httpHeader){
                let headerKeyValue = mxUtils.splitDynamicParams(this.httpHeader);
                headerObj = headerKeyValue.reduce((obj, item) => {
                    obj[item.key] = mxUtils.replaceDynamicParams(item.value, this.editorUi.GLOBAL_CONFIG);
                    return obj;
                }, headerObj);
            }
            if(this.httpParams){
                let paramsKeyValue = mxUtils.splitDynamicParams(this.httpParams);
                paramsObj = paramsKeyValue.reduce((obj, item) => {
                    obj[item.key] = mxUtils.replaceDynamicParams(item.value, this.editorUi.GLOBAL_CONFIG);
                    return obj;
                }, paramsObj);
            }
            if(this.heartbeat_timer != null){
                clearInterval(this.heartbeat_timer);
                this.heartbeat_timer = null;
            }
            this.heartbeat_timer = setInterval(() => {
                this.httpClient({
                    method: httpType,
                    url: httpUrl,
                    headers: headerObj,
                    params: paramsObj,
                    data: paramsObj,
                }).then((res) => {
                    console.log('setInterval--this.httpClient--then', res);
                    if(this.httpRulesFun){
                        //httpRulesFun
                        let customFunc = new Function(this.httpRulesFun);
                        try {
                            console.log('resresresresresresresres',res)
                            let newRes = customFunc(res);
                            console.log('httpRulesFun结果', JSON.stringify(newRes));
                            if(newRes.code === 200 && newRes.data){
                                this.onMessageCallbacks.forEach(callback => callback(mxUtils.isJSON(newRes.data) ? newRes.data : JSON.stringify(newRes.data)));
                            }
                        } catch (e) {
                            console.log('httpRulesFun---计算异常---error', e);
                        }
                    }else{
                        console.log('失败--------,未定义httpRulesFun');
                    }
                }).catch(e => {
                    console.log('失败--------,http 轮询失败', e);
                });
            }, httpCycle);
        }else{
            console.log('未配置 httpUrl ');
        }
    }

    publish(message) {
        if(this.httpEventUrl){
            let httpType = this.httpEventType ? this.httpEventType : 'GET';
            let httpUrl = mxUtils.replaceDynamicParams(this.httpEventUrl, this.editorUi.GLOBAL_CONFIG);
            let headerObj = {};
            let paramsObj = {};
            if(this.httpEventHeader){
                let headerKeyValue = mxUtils.splitDynamicParams(this.httpEventHeader);
                headerObj = headerKeyValue.reduce((obj, item) => {
                    obj[item.key] = mxUtils.replaceDynamicParams(item.value, this.editorUi.GLOBAL_CONFIG);
                    return obj;
                }, headerObj);
            }
            if(this.httpEventParams){
                let paramsKeyValue = mxUtils.splitDynamicParams(this.httpEventParams);
                paramsObj = paramsKeyValue.reduce((obj, item) => {
                    obj[item.key] = mxUtils.replaceDynamicParams(item.value, this.editorUi.GLOBAL_CONFIG);
                    return obj;
                }, paramsObj);
            }
            paramsObj['message'] = message;
            this.httpClient({
                method: httpType,
                url: httpUrl,
                headers: headerObj,
                params: paramsObj,
                data: paramsObj,
            }).then((res) => {
                console.log('setInterval--this.httpClient--then', res);
            }).catch(e => {
                console.log('setInterval--this.httpClient--catch', e)
            });
        }else{
            console.log('未配置 httpEventUrl ');
        }
    }

    close() {
        console.log('手动关闭，无需重连')
        clearInterval(this.heartbeat_timer);
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
