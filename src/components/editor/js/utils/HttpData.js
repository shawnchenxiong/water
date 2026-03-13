/* eslint-disable */
import axios from "./axios";
import {mxUtils} from "../../core/mxgraph";

export default class HttpData {
    constructor(editorUi, option) {
        this.editorUi = editorUi;
        this.option = option;
        console.log('option', option);
        if(option.host){
            this.httpClient = axios.create({
                baseURL: option.host,
                timeout: 10000,
            });
        }
        this.heartbeat_timer = null;
    }

    start(callBack) {
        if(this.option.url){
            let httpCycle = this.option.cycle ? parseInt(this.option.cycle) * 1000 : 60000;
            let httpType = this.option.type ? this.option.type : 'GET';
            let httpUrl = mxUtils.replaceDynamicParams(this.option.url, this.editorUi);
            let headerObj = {};
            let paramsObj = {};
            if(this.option.headers){
                let headerKeyValue = mxUtils.splitDynamicParams(this.option.headers);
                headerObj = headerKeyValue.reduce((obj, item) => {
                    obj[item.key] = mxUtils.replaceDynamicParams(item.value, this.editorUi);
                    return obj;
                }, headerObj);
            }
            if(this.option.params){
                let paramsKeyValue = mxUtils.splitDynamicParams(this.option.params);
                console.log('this.option.params---', this.option.params, paramsKeyValue);
                paramsObj = paramsKeyValue.reduce((obj, item) => {
                    obj[item.key] = mxUtils.replaceDynamicParams(item.value, this.editorUi);
                    return obj;
                }, paramsObj);
                console.log('this.option.params', this.option.params, paramsKeyValue, paramsObj);
            }
            this.request({httpType, httpUrl, headerObj, paramsObj}, callBack);
            if(this.option.runModel == -1){
                if(this.heartbeat_timer != null){
                    clearInterval(this.heartbeat_timer);
                    this.heartbeat_timer = null;
                }
                this.heartbeat_timer = setInterval(() => {
                    this.request({httpType, httpUrl, headerObj, paramsObj}, callBack);
                }, httpCycle);
            }
        }else{
            console.log('未配置 httpUrl ');
        }
    }

    request(config, callBack){
        const {httpType, httpUrl, headerObj, paramsObj} = config;
        this.httpClient({
            method: httpType,
            url: httpUrl,
            headers: headerObj,
            params: paramsObj,
            data: paramsObj,
        }).then((res) => {
            console.log('setInterval--this.httpClient--then', res);
            if(this.option.customFunc){
                //httpRulesFun
                let customFunc = new Function(decodeURIComponent(this.option.customFunc));
                try {
                    let newRes = customFunc(res, this.option, this.editorUi);
                    console.log('httpRulesFun结果');
                    if(newRes && callBack){
                        callBack(newRes, this.option);
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
    }

}
