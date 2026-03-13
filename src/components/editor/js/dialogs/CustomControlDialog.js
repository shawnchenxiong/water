/* eslint-disable */
import { mxUtils } from '../../core/mxgraph';

export default class CustomControlDialog {
    constructor(editorUi, cell) {
        this.editorUi = editorUi;
        this.cell = cell;
        this.container = document.createElement('div');
        this.init();
    }

    init() {
        const graph = this.editorUi.editor.graph;
        const style = graph.getCellStyle(this.cell);
        
        // 获取配置
        let configStr = mxUtils.getValue(style, 'controlPanelConfig', '[]');
        let config = [];
        try {
            config = JSON.parse(decodeURIComponent(configStr));
        } catch(e) {
            config = [];
        }

        // 面板容器
        this.bg = document.createElement('div');
        this.bg.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;justify-content:center;align-items:center;';
        
        this.panel = document.createElement('div');
        this.panel.style.cssText = 'width:800px;background:#0a1a3c;color:#fff;font-family:Microsoft YaHei;border:1px solid #1e3a6e;box-shadow:0 0 20px rgba(0,0,0,0.8);display:flex;flex-direction:column;';
        
        // 标题栏
        const header = document.createElement('div');
        header.style.cssText = 'height:50px;line-height:50px;background:#fff;color:#000;padding:0 20px;font-size:18px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;';
        header.innerHTML = `<span>控制参数设置</span>`;
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '24px';
        closeBtn.onclick = () => this.close();
        header.appendChild(closeBtn);
        this.panel.appendChild(header);

        // 内容区域
        const contentArea = document.createElement('div');
        contentArea.style.cssText = 'padding:20px;display:flex;justify-content:space-between;max-height:600px;overflow-y:auto;';
        
        // 创建左右两列
        const leftCol = document.createElement('div');
        leftCol.style.cssText = 'width:48%;display:flex;flex-direction:column;';
        
        const rightCol = document.createElement('div');
        rightCol.style.cssText = 'width:48%;display:flex;flex-direction:column;';
        
        // 遍历配置项并分配到左右列
        config.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'width:100%;background:rgba(255,255,255,0.05);border-radius:5px;padding:15px;margin-bottom:15px;display:flex;justify-content:space-between;align-items:center;box-sizing:border-box;';
            
            // 左侧 Label
            const labelDiv = document.createElement('div');
            labelDiv.style.fontSize = '14px';
            labelDiv.innerText = item.label;
            itemDiv.appendChild(labelDiv);
            
            // 右侧 Controls
            const rightDiv = document.createElement('div');
            rightDiv.style.display = 'flex';
            rightDiv.style.alignItems = 'center';

            if (item.type === 'readonly') {
                const valDiv = document.createElement('div');
                valDiv.innerText = '0.00'; // 模拟值，实际应从 item.varId 获取
                valDiv.style.fontSize = '16px';
                valDiv.style.fontWeight = 'bold';
                valDiv.style.marginRight = '5px';
                rightDiv.appendChild(valDiv);
                
                if (item.unit) {
                    const unitDiv = document.createElement('span');
                    unitDiv.innerText = item.unit;
                    unitDiv.style.fontSize = '12px';
                    unitDiv.style.color = '#aaa';
                    rightDiv.appendChild(unitDiv);
                }
            } else if (item.type === 'control') {
                const input = document.createElement('input');
                input.type = 'text';
                input.style.cssText = 'background:transparent;border:1px solid #1e4b9e;color:#fff;padding:5px 10px;width:80px;text-align:right;margin-right:5px;';
                input.value = '0.00';
                rightDiv.appendChild(input);
                
                if (item.unit) {
                    const unitDiv = document.createElement('span');
                    unitDiv.innerText = item.unit;
                    unitDiv.style.fontSize = '12px';
                    unitDiv.style.color = '#aaa';
                    rightDiv.appendChild(unitDiv);
                }
            } else if (item.type === 'switch') {
                // 模拟开关
                const switchContainer = document.createElement('div');
                switchContainer.style.cssText = 'display:flex;align-items:center;cursor:pointer;';
                
                const switchLabel = document.createElement('span');
                switchLabel.innerText = item.textOn || '开启';
                switchLabel.style.fontSize = '12px';
                switchLabel.style.marginRight = '10px';
                switchLabel.style.color = '#00ff00'; // Active color
                
                const toggle = document.createElement('div');
                toggle.style.cssText = 'width:40px;height:20px;background:#00ff00;border-radius:10px;position:relative;';
                const knob = document.createElement('div');
                knob.style.cssText = 'width:16px;height:16px;background:#fff;border-radius:50%;position:absolute;top:2px;right:2px;transition:all 0.3s;';
                toggle.appendChild(knob);
                
                switchContainer.appendChild(switchLabel);
                switchContainer.appendChild(toggle);
                
                // Toggle logic (visual only for now)
                let isOn = true;
                switchContainer.onclick = () => {
                    isOn = !isOn;
                    if(isOn) {
                        toggle.style.background = '#00ff00';
                        knob.style.left = 'auto';
                        knob.style.right = '2px';
                        switchLabel.innerText = item.textOn || '开启';
                        switchLabel.style.color = '#00ff00';
                    } else {
                        toggle.style.background = '#666';
                        knob.style.right = 'auto';
                        knob.style.left = '2px';
                        switchLabel.innerText = item.textOff || '关闭';
                        switchLabel.style.color = '#aaa';
                    }
                };
                
                rightDiv.appendChild(switchContainer);
            }
            
            itemDiv.appendChild(rightDiv);
            
            // 根据位置添加到对应的列
            if (item.position === 'right') {
                rightCol.appendChild(itemDiv);
            } else {
                leftCol.appendChild(itemDiv);
            }
        });

        contentArea.appendChild(leftCol);
        contentArea.appendChild(rightCol);
        this.panel.appendChild(contentArea);
        this.bg.appendChild(this.panel);
        
        this.bg.onclick = (e) => {
            if (e.target === this.bg) this.close();
        };
    }

    show() {
        document.body.appendChild(this.bg);
    }

    close() {
        if (this.bg && this.bg.parentNode) {
            this.bg.parentNode.removeChild(this.bg);
        }
    }
}