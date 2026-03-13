/* eslint-disable */
import { mxUtils, mxEvent } from '../../core/mxgraph';
import BaseFormatPanel from "./BaseFormatPanel";

export default ElementControlPanel;

function ElementControlPanel(format, editorUi, container) {
    BaseFormatPanel.call(this, format, editorUi, container);
    this.container.style.overflowY = 'scroll';
    this.init();
}

mxUtils.extend(ElementControlPanel, BaseFormatPanel);

ElementControlPanel.prototype.init = function () {
    const ss = this.editorUi.getSelectionState();
    if (ss.cells.length <= 0) return;

    this.cell = ss.cells[0];
    // 使用 Flex 列布局，确保底部按钮固定
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.overflow = 'hidden'; // 防止外层滚动
    this.refresh();
};

ElementControlPanel.prototype.refresh = function () {
    this.container.innerHTML = '';

    // 读取配置
    const graph = this.editorUi.editor.graph;
    const style = graph.getCellStyle(this.cell);
    let configStr = mxUtils.getValue(style, 'controlPanelConfig', '[]');

    let config = [];
    try {
        config = JSON.parse(decodeURIComponent(configStr));
    } catch (e) {
        config = [];
    }

    if (!Array.isArray(config)) config = [];
    this.config = config;

    // 渲染列表容器 (可滚动区域)
    const listScrollArea = document.createElement('div');
    listScrollArea.style.flex = '1';
    listScrollArea.style.overflowY = 'auto'; // 内部滚动
    listScrollArea.style.padding = '10px';

    const listContainer = document.createElement('div');
    this.config.forEach((item, index) => {
        const row = this.createItemRow(item, index);
        listContainer.appendChild(row);
    });
    listScrollArea.appendChild(listContainer);
    this.container.appendChild(listScrollArea);

    // 底部按钮区域 (固定)
    const btnContainer = document.createElement('div');
    btnContainer.style.padding = '10px';
    btnContainer.style.borderTop = '1px solid #eee';
    btnContainer.style.background = '#fff';

    const addBtn = document.createElement('button');
    addBtn.className = 'rcui-btn rcui-btn-primary';
    addBtn.innerText = '+ 添加控件';
    addBtn.style.width = '100%';
    addBtn.onclick = mxUtils.bind(this, this.showAddMenu);

    btnContainer.appendChild(addBtn);
    this.container.appendChild(btnContainer);
};

ElementControlPanel.prototype.createItemRow = function (item, index) {
    const row = document.createElement('div');
    row.className = 'rcui-line-row';
    row.style.background = '#fff';
    row.style.border = '1px solid #ddd';
    row.style.marginBottom = '8px';
    row.style.borderRadius = '4px';
    row.style.display = 'flex'; // Flex Row 布局
    row.style.overflow = 'hidden'; // 防止圆角溢出

    // Left Side: Type Label, Sort, & Delete
    const leftCol = document.createElement('div');
    leftCol.style.width = '32px';
    leftCol.style.background = '#f5f7fa';
    leftCol.style.borderRight = '1px solid #eee';
    leftCol.style.display = 'flex';
    leftCol.style.flexDirection = 'column';
    leftCol.style.alignItems = 'center';
    leftCol.style.justifyContent = 'flex-start'; // 改为从头部开始排列
    leftCol.style.padding = '5px 0';
    leftCol.style.flexShrink = '0'; // 防止被压缩

    // Delete Button (Top)
    const delBtn = document.createElement('span');
    delBtn.innerText = '×';
    delBtn.style.cursor = 'pointer';
    delBtn.style.color = '#ff4d4f'; // 红色更明显
    delBtn.style.fontSize = '18px';
    delBtn.style.lineHeight = '1';
    delBtn.style.marginBottom = '5px';
    delBtn.title = '删除';
    delBtn.onclick = () => {
        this.config.splice(index, 1);
        this.save();
        this.refresh();
    };
    leftCol.appendChild(delBtn);

    // Sort Up Button
    if (index > 0) {
        const upBtn = document.createElement('span');
        upBtn.innerHTML = '↑';
        upBtn.style.cursor = 'pointer';
        upBtn.style.color = '#666';
        upBtn.style.fontSize = '14px';
        upBtn.style.marginBottom = '2px';
        upBtn.title = '上移';
        upBtn.onclick = () => {
            this.moveItem(index, -1);
        };
        leftCol.appendChild(upBtn);
    }

    // Sort Down Button
    if (index < this.config.length - 1) {
        const downBtn = document.createElement('span');
        downBtn.innerHTML = '↓';
        downBtn.style.cursor = 'pointer';
        downBtn.style.color = '#666';
        downBtn.style.fontSize = '14px';
        downBtn.style.marginBottom = '5px';
        downBtn.title = '下移';
        downBtn.onclick = () => {
            this.moveItem(index, 1);
        };
        leftCol.appendChild(downBtn);
    }

    // Type Label (Vertical Text at bottom or middle)
    const typeLabel = document.createElement('div');
    typeLabel.style.fontWeight = 'bold';
    typeLabel.style.fontSize = '12px';
    typeLabel.style.writingMode = 'vertical-rl'; // 竖排文字
    typeLabel.style.letterSpacing = '2px';
    typeLabel.style.marginTop = 'auto'; // 推到底部
    typeLabel.style.paddingTop = '5px';
    typeLabel.style.color = '#999';
    let typeName = '未知';
    if (item.type === 'readonly') typeName = '只读'; // 简化文字
    else if (item.type === 'control') typeName = '控制';
    else if (item.type === 'switch') typeName = '开关';
    typeLabel.innerText = typeName;
    leftCol.appendChild(typeLabel);

    row.appendChild(leftCol);

    // Right Side: Content
    const rightCol = document.createElement('div');
    rightCol.style.flex = '1';
    rightCol.style.padding = '8px';
    rightCol.style.display = 'flex';
    rightCol.style.flexDirection = 'column';
    rightCol.style.gap = '8px'; // 统一间距
    rightCol.style.minWidth = '0'; // 防止 flex 子项溢出

    // Row 1: Name (65%) + Position (35%)
    const line1 = document.createElement('div');
    line1.style.display = 'flex';
    line1.style.gap = '8px';

    // Name Input
    const nameWrapper = document.createElement('div');
    nameWrapper.style.flex = '1'; // 占据剩余空间
    nameWrapper.appendChild(this.createInputLabel('名称'));

    const nameInput = document.createElement('input');
    nameInput.className = 'rcui-input';
    nameInput.style.width = '100%';
    nameInput.value = item.label || '';
    nameInput.onchange = () => {
        item.label = nameInput.value;
        this.save();
    };
    nameWrapper.appendChild(nameInput);
    line1.appendChild(nameWrapper);

    // Position Select
    const posWrapper = document.createElement('div');
    posWrapper.style.width = '60px'; // 固定宽度，避免挤压
    posWrapper.appendChild(this.createInputLabel('位置'));

    const posSelect = document.createElement('select');
    posSelect.className = 'rcui-select';
    posSelect.style.width = '100%';
    const optLeft = document.createElement('option');
    optLeft.value = 'left';
    optLeft.text = '左'; // 简化文字
    if (!item.position || item.position === 'left') optLeft.selected = true;
    const optRight = document.createElement('option');
    optRight.value = 'right';
    optRight.text = '右'; // 简化文字
    if (item.position === 'right') optRight.selected = true;

    posSelect.appendChild(optLeft);
    posSelect.appendChild(optRight);
    posSelect.onchange = () => {
        item.position = posSelect.value;
        this.save();
    };
    posWrapper.appendChild(posSelect);
    line1.appendChild(posWrapper);

    rightCol.appendChild(line1);

    // Row 2: Associative Variable (100%)
    const line2 = document.createElement('div');
    line2.appendChild(this.createInputLabel('关联变量'));

    const json = this.editorUi.GLOBAL_CONFIG.device.virvarJson;
    const virvarList = json && json.length > 0 ? JSON.parse(json) : [];
    const varItem = virvarList.find(v => v.id === item.varId);
    const varName = varItem ? (varItem.name || varItem.title || varItem.id) : item.varId;

    const varInput = document.createElement('input');
    varInput.className = 'rcui-input';
    varInput.readOnly = true;
    varInput.style.width = '100%';
    varInput.value = varName || '';
    varInput.placeholder = '点击选择变量';
    varInput.onclick = () => {
        this.showVirvarDialog(item);
    };
    line2.appendChild(varInput);
    rightCol.appendChild(line2);

    // Row 3: Other Fields
    if (item.type === 'readonly' || item.type === 'control') {
        const line3 = document.createElement('div');
        line3.appendChild(this.createInputLabel('单位'));
        const unitInput = document.createElement('input');
        unitInput.className = 'rcui-input';
        unitInput.style.width = '100%';
        unitInput.value = item.unit || '';
        unitInput.onchange = () => {
            item.unit = unitInput.value;
            this.save();
        };
        line3.appendChild(unitInput);
        rightCol.appendChild(line3);
    }

    if (item.type === 'switch') {
        const line3 = document.createElement('div');
        line3.style.display = 'flex';
        line3.style.gap = '8px';

        const onWrapper = document.createElement('div');
        onWrapper.style.flex = '1';
        onWrapper.appendChild(this.createInputLabel('开状态文本'));
        const onInput = document.createElement('input');
        onInput.className = 'rcui-input';
        onInput.style.width = '100%';
        onInput.value = item.textOn || '开启';
        onInput.onchange = () => {
            item.textOn = onInput.value;
            this.save();
        };
        onWrapper.appendChild(onInput);

        const offWrapper = document.createElement('div');
        offWrapper.style.flex = '1';
        offWrapper.appendChild(this.createInputLabel('关状态文本'));
        const offInput = document.createElement('input');
        offInput.className = 'rcui-input';
        offInput.style.width = '100%';
        offInput.value = item.textOff || '关闭';
        offInput.onchange = () => {
            item.textOff = offInput.value;
            this.save();
        };
        offWrapper.appendChild(offInput);

        line3.appendChild(onWrapper);
        line3.appendChild(offWrapper);
        rightCol.appendChild(line3);
    }

    row.appendChild(rightCol);
    return row;
};

// 辅助方法：创建 Label
ElementControlPanel.prototype.createInputLabel = function (text) {
    const div = document.createElement('div');
    div.innerText = text;
    div.style.fontSize = '12px';
    div.style.color = '#666';
    div.style.marginBottom = '2px';
    return div;
};

// 废弃旧的 createInput 方法，使用 createItemRow 内联逻辑
ElementControlPanel.prototype.createInput = function (label, value, onChange) {
    // 保留此方法以防其他地方调用（虽然未见调用）
    // 但我们的 createItemRow 已经不再使用它了
    return document.createElement('div');
};

ElementControlPanel.prototype.showAddMenu = function (e) {
    // Simple alert-like menu or just append directly for now?
    // Let's use a simple confirm/prompt or custom dialog.
    // Ideally a dropdown menu.

    const menu = new mxUtils.bind(this, function (menu, parent) {
        this.editorUi.menus.addMenuItem(menu, 'readonly', parent, mxUtils.bind(this, function () {
            this.addItem('readonly');
        }), null, '只读变量');
        this.editorUi.menus.addMenuItem(menu, 'control', parent, mxUtils.bind(this, function () {
            this.addItem('control');
        }), null, '控制变量');
        this.editorUi.menus.addMenuItem(menu, 'switch', parent, mxUtils.bind(this, function () {
            this.addItem('switch');
        }), null, '控制开关');
    });

    // We can use the editor's popup menu handler
    // But since we don't have easy access to popup menu structure here without more code,
    // let's just use a simple modal or 3 buttons.

    const dialogDiv = document.createElement('div');
    dialogDiv.style.padding = '20px';
    dialogDiv.style.textAlign = 'center';

    ['readonly', 'control', 'switch'].forEach(type => {
        const btn = document.createElement('button');
        btn.className = 'rcui-btn';
        btn.style.margin = '5px';
        btn.innerText = type === 'readonly' ? '只读变量' : (type === 'control' ? '控制变量' : '控制开关');
        btn.onclick = () => {
            this.addItem(type);
            this.editorUi.hideDialog();
        };
        dialogDiv.appendChild(btn);
    });

    this.editorUi.showDialog(dialogDiv, 300, 100, true, true);
};

ElementControlPanel.prototype.addItem = function (type) {
    const newItem = {
        type: type,
        label: '新控件',
        position: 'left',
        varId: '',
        unit: '',
        textOn: '开启',
        textOff: '关闭'
    };
    this.config.push(newItem);
    this.save();
    this.refresh();
};

ElementControlPanel.prototype.moveItem = function (index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.config.length) return;

    // Swap
    const temp = this.config[index];
    this.config[index] = this.config[newIndex];
    this.config[newIndex] = temp;

    this.save();
    this.refresh();
};

ElementControlPanel.prototype.save = function () {
    const graph = this.editorUi.editor.graph;
    const value = encodeURIComponent(JSON.stringify(this.config));

    graph.getModel().beginUpdate();
    try {
        graph.setCellStyles('controlPanelConfig', value, [this.cell]);
    } finally {
        graph.getModel().endUpdate();
    }
};

ElementControlPanel.prototype.showVirvarDialog = function (item) {
    // Create a dummy container for the existing virvar picker logic
    // This is a bit hacky, but avoids duplicating the virvar fetching logic
    // We assume editorUi has a method to get virvars or we can use the one from CustomDynamicDataPanel

    // Let's try to fetch virvars from the editor
    const json = this.editorUi.GLOBAL_CONFIG.device.virvarJson;
    const virvarList = json && json.length > 0 ? JSON.parse(json) : [];

    const dialogDiv = document.createElement('div');
    dialogDiv.style.padding = '20px';
    dialogDiv.style.backgroundColor = '#fff';

    const title = document.createElement('h3');
    title.innerText = '选择变量';
    title.style.marginBottom = '15px';
    dialogDiv.appendChild(title);

    const select = document.createElement('select');
    select.className = 'rcui-select';
    select.style.width = '100%';
    select.style.marginBottom = '20px';

    // Add default option
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.text = '请选择...';
    select.appendChild(defaultOpt);

    virvarList.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.text = v.name || v.title || v.id;
        if (v.id === item.varId) opt.selected = true;
        select.appendChild(opt);
    });

    dialogDiv.appendChild(select);

    const btnRow = document.createElement('div');
    btnRow.style.textAlign = 'right';

    const okBtn = document.createElement('button');
    okBtn.className = 'rcui-btn rcui-btn-primary';
    okBtn.innerText = '确定';
    okBtn.onclick = () => {
        item.varId = select.value;
        this.save();
        this.refresh();
        this.editorUi.hideDialog();
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'rcui-btn';
    cancelBtn.innerText = '取消';
    cancelBtn.style.marginLeft = '10px';
    cancelBtn.onclick = () => {
        this.editorUi.hideDialog();
    };

    btnRow.appendChild(okBtn);
    btnRow.appendChild(cancelBtn);
    dialogDiv.appendChild(btnRow);

    this.editorUi.showDialog(dialogDiv, 400, 200, true, true);
};