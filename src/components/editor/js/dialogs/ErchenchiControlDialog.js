import { mxUtils, mxEvent, mxResources } from '../../core/mxgraph';
import api from '../utils/api';

export default class ErchenchiControlDialog {
    constructor(editorUi, cell, type = 'pump') {
        this.editorUi = editorUi;
        this.cell = cell;
        this.type = type;
        this.container = document.createElement('div');
        this.init();
    }

    init() {
        // 获取组件名称
        let cellLabel = this.editorUi.editor.graph.getLabel(this.cell);
        if (cellLabel && cellLabel.indexOf('<') > -1) {
             const tmp = document.createElement("div");
             tmp.innerHTML = cellLabel;
             cellLabel = tmp.textContent || tmp.innerText || "";
        }
        if (!cellLabel || cellLabel.trim() === '') {
            cellLabel = this.type === 'pump' ? '二沉池刮泥机控制面板' : '出水闸门控制面板';
        }

        // 获取 DeviceID
        let cellStyleStr = this.editorUi.editor.graph.getModel().getStyle(this.cell);
        let cellStyle = mxUtils.getCellStyleWithStr(cellStyleStr);
        this.deviceId = mxUtils.getValue(cellStyle, 'erchenchiDeviceId', null);

        // 创建背景遮罩
        this.bg = document.createElement('div');
        this.bg.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;justify-content:center;align-items:center;';
        
        // 创建面板
        this.panel = document.createElement('div');
        this.panel.style.cssText = 'width:320px;background:#0a1a3c;color:#fff;font-family:Microsoft YaHei;border:1px solid #1e3a6e;box-shadow:0 0 10px rgba(0,0,0,0.5);';
        
        // 1. 标题栏
        const header = document.createElement('div');
        header.style.cssText = 'height:40px;line-height:40px;background:#fff;color:#000;padding:0 10px;font-size:16px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;';
        header.innerHTML = `<span>${cellLabel}</span>`;
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '18px';
        closeBtn.onclick = () => this.close();
        header.appendChild(closeBtn);
        this.panel.appendChild(header);

        // 2. 设备ID
        const subHeader = document.createElement('div');
        subHeader.style.cssText = 'height:30px;line-height:30px;background:#1e4b9e;padding:0 10px;font-size:12px;text-align:left;';
        subHeader.innerText = this.deviceId ? `设备ID: ${this.deviceId}` : (this.cell.id || '未绑定设备');
        this.panel.appendChild(subHeader);

        // 3. 状态区
        const statusArea = document.createElement('div');
        statusArea.style.cssText = 'padding:15px;border-bottom:1px solid #1e3a6e;';
        
        let iconSvg = '';
        let statusText = '未知';
        let statusColor = '#999';
        let buttonsHtml = '';

        if (this.type === 'pump') {
            // 泵类图标 (绿色 RUN)
            iconSvg = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cG9seWdvbiBwb2ludHM9IjUwIDUgOTUgMjUgOTUgNzUgNTAgOTUgNSA3NSA1IDI1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMGZmMDAiIHN0cm9rZS13aWR0aD0iNSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzAwZmYwMCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+UlVOPC90ZXh0Pjwvc3ZnPg==`;
            buttonsHtml = `
                <button style="background:#007bff;border:none;color:#fff;padding:8px 20px;border-radius:3px;cursor:pointer;">开启</button>
                <button style="background:#007bff;border:none;color:#fff;padding:8px 20px;border-radius:3px;cursor:pointer;">关闭</button>
                <button style="background:#007bff;border:none;color:#fff;padding:8px 20px;border-radius:3px;cursor:pointer;">复位</button>
            `;
        } else {
            // 阀门类图标 (青色 AMONG)
            iconSvg = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cG9seWdvbiBwb2ludHM9IjUwIDUgOTUgMjUgOTUgNzUgNTAgOTUgNSA3NSA1IDI1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMGRkZmYiIHN0cm9rZS13aWR0aD0iNSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzAwZGRmZiIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+QU1PTkc8L3RleHQ+PC9zdmc+`;
            statusText = '过程中';
            statusColor = '#00ddff';
            buttonsHtml = `
                <button style="background:#007bff;border:none;color:#fff;padding:8px 15px;border-radius:3px;cursor:pointer;">开启</button>
                <button style="background:#007bff;border:none;color:#fff;padding:8px 15px;border-radius:3px;cursor:pointer;">关闭</button>
                <button style="background:#007bff;border:none;color:#fff;padding:8px 15px;border-radius:3px;cursor:pointer;">暂停</button>
                <button style="background:#007bff;border:none;color:#fff;padding:8px 15px;border-radius:3px;cursor:pointer;">复位</button>
            `;
        }

        statusArea.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
                <div style="width:60px;height:60px;background:url('${iconSvg}') no-repeat center/contain;"></div>
                <div style="flex:1;padding-left:20px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span>设备状态</span><span id="erchenchi-status" style="color:${statusColor};">${statusText}</span></div>
                    <div style="display:flex;justify-content:space-between;"><span>故障信息</span><span id="erchenchi-fault">无</span></div>
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;">
                ${buttonsHtml}
            </div>
        `;
        this.panel.appendChild(statusArea);

        // 4. 设备参数
        const paramsArea = document.createElement('div');
        paramsArea.style.cssText = 'padding:15px;border-bottom:1px solid #1e3a6e;font-size:13px;';
        const paramsTitle = document.createElement('div');
        paramsTitle.innerText = '设备参数';
        paramsTitle.style.cssText = 'margin-bottom:10px;color:#888;text-align:left;';
        paramsArea.appendChild(paramsTitle);

        let params = [];
        if (this.type === 'pump') {
            params = [
                {key: 'RunTime', label: '连续运行时间', val: '- H'},
                {key: 'TotalTime', label: '累计运行时间', val: '- H'},
                {key: 'ClearTotal', label: '累计运行时间清除', btn: '确认'},
                {key: 'OpenTime', label: '开时间', val: '- S'},
                {key: 'CloseTime', label: '关时间', val: '- S'},
                {key: 'Protect', label: '保护状态', val: '-'}
            ];
        } else {
            params = [
                {key: 'OpenTime', label: '开时间', val: '300 S'},
                {key: 'CloseTime', label: '关时间', val: '300 S'},
                {key: 'Protect', label: '保护状态', val: '无保护'}
            ];
        }

        this.paramSpans = {};

        params.forEach(p => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:10px;align-items:center;';
            if (p.btn) {
                row.innerHTML = `<span>${p.label}</span><button style="background:#007bff;border:none;color:#fff;padding:2px 10px;border-radius:3px;cursor:pointer;">${p.btn}</button>`;
            } else {
                const labelSpan = document.createElement('span');
                labelSpan.innerText = p.label;
                const valSpan = document.createElement('span');
                valSpan.innerText = p.val;
                row.appendChild(labelSpan);
                row.appendChild(valSpan);
                this.paramSpans[p.key] = valSpan;
            }
            paramsArea.appendChild(row);
        });
        this.panel.appendChild(paramsArea);

        // 5. 控制模式
        const modeArea = document.createElement('div');
        modeArea.style.cssText = 'padding:15px;font-size:13px;';
        modeArea.innerHTML = `
            <div style="margin-bottom:10px;color:#888;text-align:left;">控制模式</div>
            <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
                <span>当前模式</span><span id="erchenchi-mode">${this.type === 'pump' ? '远程' : '就地'}</span>
            </div>
            <div style="display:flex;justify-content:center;gap:20px;">
                <button style="background:#007bff;border:none;color:#fff;padding:8px 30px;border-radius:3px;cursor:pointer;">手动</button>
                <button style="background:#007bff;border:none;color:#fff;padding:8px 30px;border-radius:3px;cursor:pointer;">自动</button>
            </div>
        `;
        this.panel.appendChild(modeArea);
        this.modeSpan = modeArea.querySelector('#erchenchi-mode');

        this.bg.appendChild(this.panel);
        
        // 点击背景关闭
        this.bg.onclick = (e) => {
            if (e.target === this.bg) {
                this.close();
            }
        };

        if (this.deviceId) {
            this.loadRealData();
        }
    }

    show() {
        document.body.appendChild(this.bg);
    }

    close() {
        if (this.bg && this.bg.parentNode) {
            this.bg.parentNode.removeChild(this.bg);
        }
    }

    loadRealData() {
        if (!this.deviceId) {
            console.warn('ErchenchiControlDialog: No deviceId found.');
            return;
        }
        
        const snSerial = this.deviceId; 
        
        // 根据用户反馈，Key 的格式为 t_{snSerial}_{MX/MW}{address}
        // 例如：t_a102_MX1_03
        
        const getKey = (type, addr) => `t_${snSerial}_${type}${addr}`;
        
        const updateUI = () => {
            // 获取全局实时数据对象
            const globalData = window.pointsValAll || {}; 
            
            // 调试日志：打印所有相关的 Key 以便排查
            const debugKeys = [
                getKey('MX', '1_02'), getKey('MX', '1_03'), 
                getKey('MW', '2'), getKey('MW', '3'), 
                getKey('MX', '4'), getKey('MX', '5')
            ];
            console.log('ErchenchiControlDialog: Checking keys:', debugKeys);
            // console.log('ErchenchiControlDialog: Global data sample:', globalData);

            if (this.type === 'pump') {
                // 泵类点位映射 (根据截图)
                // 设备状态: 1_01 (MX)
                // 故障信息: 1_02 (MX)
                // 当前模式: 1_03 (MX)
                // 连续运行时间: 2 (MX -> 可能是 MW?) 截图上写的是 MX，地址 2，读&写。如果是时间通常是寄存器。
                // 累计运行时间: 3 (MX -> 可能是 MW?) 同上。
                // 开时间: 4 (MX -> 可能是 MW?) 同上。
                // 关时间: 5 (MX -> 可能是 MW?) 同上。
                // 保护状态: 6 (MX)
                
                // 注意：截图显示这些点的逻辑名称都是 MX。
                // 但根据经验，时间类数值通常在 MW (寄存器) 中。
                // 为了稳妥，我们对时间类数值同时尝试 MW 和 MX。
                // 对于状态类 (故障、保护、模式、状态)，通常是 MX。

                // 1. 设备状态 (地址 1_01)
                const stateKey = getKey('MX', '1_01');
                const stateVal = globalData[stateKey];
                const statusEl = this.panel.querySelector('#erchenchi-status');
                if(statusEl) {
                    if (stateVal !== undefined) {
                        statusEl.innerText = stateVal; // 直接显示数值
                        statusEl.style.color = (stateVal == '1' || stateVal == 1) ? '#00ff00' : '#ff0000';
                    } else {
                        statusEl.innerText = '0';
                        statusEl.style.color = '#ff0000';
                    }
                }

                // 2. 故障信息 (地址 1_02)
                const faultKey = getKey('MX', '1_02');
                const faultVal = globalData[faultKey];
                const faultEl = this.panel.querySelector('#erchenchi-fault');
                if(faultEl) faultEl.innerText = (faultVal !== undefined) ? faultVal : '0';

                // 3. 当前模式 (地址 1_03)
                const modeKey = getKey('MX', '1_03');
                const modeVal = globalData[modeKey];
                if (this.modeSpan) {
                    this.modeSpan.innerText = (modeVal !== undefined) ? modeVal : '0';
                }

                // 4. 连续运行时间 (地址 2)
                const runTimeKeyMW = getKey('MW', '2');
                const runTimeKeyMX = getKey('MX', '2');
                const runTimeVal = globalData[runTimeKeyMW] !== undefined ? globalData[runTimeKeyMW] : globalData[runTimeKeyMX];
                if (this.paramSpans['RunTime']) this.paramSpans['RunTime'].innerText = (runTimeVal !== undefined ? runTimeVal : '0') + ' H';

                // 5. 累计运行时间 (地址 3)
                const totalTimeKeyMW = getKey('MW', '3');
                const totalTimeKeyMX = getKey('MX', '3');
                const totalTimeVal = globalData[totalTimeKeyMW] !== undefined ? globalData[totalTimeKeyMW] : globalData[totalTimeKeyMX];
                if (this.paramSpans['TotalTime']) this.paramSpans['TotalTime'].innerText = (totalTimeVal !== undefined ? totalTimeVal : '0') + ' H';

                // 6. 开时间 (地址 4)
                const openKeyMW = getKey('MW', '4');
                const openKeyMX = getKey('MX', '4');
                const openVal = globalData[openKeyMW] !== undefined ? globalData[openKeyMW] : globalData[openKeyMX];
                if (this.paramSpans['OpenTime']) this.paramSpans['OpenTime'].innerText = (openVal !== undefined ? openVal : '0') + ' S';

                // 7. 关时间 (地址 5)
                const closeKeyMW = getKey('MW', '5');
                const closeKeyMX = getKey('MX', '5');
                const closeVal = globalData[closeKeyMW] !== undefined ? globalData[closeKeyMW] : globalData[closeKeyMX];
                if (this.paramSpans['CloseTime']) this.paramSpans['CloseTime'].innerText = (closeVal !== undefined ? closeVal : '0') + ' S';

                // 8. 保护状态 (地址 6)
                const protectKey = getKey('MX', '6');
                const protectVal = globalData[protectKey];
                if (this.paramSpans['Protect']) this.paramSpans['Protect'].innerText = (protectVal !== undefined ? protectVal : '0');

            } else {
                // 阀类点位映射 (保持原有逻辑，或根据新需求微调)
                // 1. 故障信息 (地址 1_02, MX)
                const faultKey = getKey('MX', '1_02');
                const faultVal = globalData[faultKey];
                const faultEl = this.panel.querySelector('#erchenchi-fault');
                if(faultEl) {
                    faultEl.innerText = (faultVal !== undefined) ? faultVal : '0';
                }

                // 2. 保护状态 (地址 1_03, MX)
                const protectKey = getKey('MX', '1_03');
                const protectVal = globalData[protectKey];
                if (this.paramSpans['Protect']) {
                     this.paramSpans['Protect'].innerText = (protectVal !== undefined) ? protectVal : '0';
                }

                // 3. 开时间 (地址 2, MW)
                const openKeyMW = getKey('MW', '2');
                const openKeyMX = getKey('MX', '2');
                const openVal = globalData[openKeyMW] !== undefined ? globalData[openKeyMW] : globalData[openKeyMX];
                if (this.paramSpans['OpenTime']) this.paramSpans['OpenTime'].innerText = (openVal !== undefined ? openVal : '0');
                
                // 4. 关时间 (地址 3, MW)
                const closeKeyMW = getKey('MW', '3');
                const closeKeyMX = getKey('MX', '3');
                const closeVal = globalData[closeKeyMW] !== undefined ? globalData[closeKeyMW] : globalData[closeKeyMX];
                if (this.paramSpans['CloseTime']) this.paramSpans['CloseTime'].innerText = (closeVal !== undefined ? closeVal : '0');

                // 5. 模式 (地址 4, MX)
                const modeKey = getKey('MX', '4');
                const modeVal = globalData[modeKey];
                if (this.modeSpan) {
                    this.modeSpan.innerText = (modeVal !== undefined) ? modeVal : '0';
                }

                // 6. 设备状态 (地址 5, MX)
                const stateKey = getKey('MX', '5');
                const stateVal = globalData[stateKey];
                if (stateVal !== undefined) {
                     const statusEl = this.panel.querySelector('#erchenchi-status');
                     if(statusEl) {
                         statusEl.innerText = stateVal;
                         statusEl.style.color = (stateVal == '1' || stateVal == 1) ? '#00ff00' : '#ff0000';
                     }
                } else {
                     const statusEl = this.panel.querySelector('#erchenchi-status');
                     if(statusEl) {
                         statusEl.innerText = '0';
                         statusEl.style.color = '#ff0000';
                     }
                }
            }
        };

        // 立即更新一次
        updateUI();

        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(updateUI, 1000);
    }
    
    // 记得在关闭时清除定时器
    close() {
        if (this.timer) clearInterval(this.timer);
        if (this.bg && this.bg.parentNode) {
            this.bg.parentNode.removeChild(this.bg);
        }
    }
}