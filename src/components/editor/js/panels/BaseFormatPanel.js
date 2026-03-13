/* eslint-disable */

import {mxConstants, mxUtils} from '../../core/mxgraph';

import {
    ActionButtonsCell,
    CheckGroupIconCell,
    ChoosePictureCell,
    ColorCell,
    GradientColorCell,
    InputCell,
    LabelCellRow,
    SelectCell,
    SelectClassIconCell,
    SwitchCell,
    RCTransferBoxCell,
    RCCodeEditorCell,
    RCCustomCodeEditorCell,
    RightButtonCell,
    ChooseVirvarCell,
} from '../widgets/widgets';


export default BaseFormatPanel;

/**
 * 格式面板的基类。
 */
function BaseFormatPanel(format, editorUi, container) {
    this.format = format;
    this.editorUi = editorUi;
    if (container) {
        this.container = container;
    } else {
        this.container = this.createDiv('rcui-panel');
        this.container.style.overflowY = 'scroll';
    }
    this.listeners = [];
}

BaseFormatPanel.prototype.setScrollTopLazyTime = 1;
BaseFormatPanel.prototype.inactiveTabBackgroundColor = '#f1f3f4';
BaseFormatPanel.prototype.activeTabBackgroundColor = '#fbfbfb';

BaseFormatPanel.prototype.createTabCell = function (title) {
    const titleDiv = document.createElement('div');
    mxUtils.write(titleDiv, title);
    return titleDiv;
};

BaseFormatPanel.prototype.createDiv = function (className) {
    const div = document.createElement('div');
    if (className) div.className = className;
    return div;
};

BaseFormatPanel.prototype.createTag = function (tagName, className) {
    const tag = document.createElement(tagName);
    if (className) tag.className = className;
    return tag;
};

BaseFormatPanel.prototype.destroy = function () {
    if (this.listeners != null) {
        for (var i = 0; i < this.listeners.length; i++) this.listeners[i].destroy();
        this.listeners = null;
    }
    if (this.container) {
        if (this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
        this.container = null;
    }
    this.format = null;
    this.editorUi = null;
};

BaseFormatPanel.prototype.createLabelCellRowSelect = function (label, config, getValueFn, setValueFn) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new SelectCell(this.editorUi, config, getValueFn, setValueFn);
    row.root.appendChild(cell.root);
    row.cell = cell;
    return row;
};
BaseFormatPanel.prototype.createOnlySelect = function (config, getValueFn, setValueFn) {
    const cell = new SelectCell(this.editorUi, config, getValueFn, setValueFn);
    return cell;
};
BaseFormatPanel.prototype.createOnlyInput = function (config, getValueFn, setValueFn) {
    const cell = new InputCell(this.editorUi, config, getValueFn, setValueFn);
    return cell;
};
BaseFormatPanel.prototype.createOnlyColor = function (config, getValueFn, setValueFn) {
    const cell = new ColorCell(this.editorUi, config, getValueFn, setValueFn);
    return cell;
};
BaseFormatPanel.prototype.createOnlyPicture = function (config, getValueFn, setValueFn) {
    const cell = new ChoosePictureCell(this.editorUi, config, getValueFn, setValueFn);
    return cell;
};

BaseFormatPanel.prototype.createLabelCellRowGradientColor = function (label, config, getValueFn, setValueFn) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new GradientColorCell(this.editorUi, config, getValueFn, setValueFn);
    row.root.appendChild(cell.root);
    row.cell = cell;
    return row;
};

BaseFormatPanel.prototype.createLabelCellRowColor = function (label, config, getValueFn, setValueFn) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new ColorCell(this.editorUi, config, getValueFn, setValueFn);
    row.root.appendChild(cell.root);
    row.cell = cell;
    return row;
};
BaseFormatPanel.prototype.createLabelCellRowInput = function (label, config, getValueFn, setValueFn) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new InputCell(this.editorUi, config, getValueFn, setValueFn);
    row.root.appendChild(cell.root);
    row.cell = cell;
    return row;
};

BaseFormatPanel.prototype.createLabelCellRowSwitch = function (label, config, getValueFn, setValueFn) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new SwitchCell(this.editorUi, config, getValueFn, setValueFn);
    row.root.appendChild(cell.root);
    row.cell = cell;
    return row;
};

BaseFormatPanel.prototype.createLabelCellRowPicture = function (label, config, getValueFn, setValueFn) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new ChoosePictureCell(this.editorUi, config, getValueFn, setValueFn);
    row.root.appendChild(cell.root);
    row.cell = cell;
    return row;
};

BaseFormatPanel.prototype.createLabelRowSelectClassIconCell = function (label, config, getValueFn, setValueFn) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new SelectClassIconCell(this.editorUi, config, getValueFn, setValueFn);
    row.root.appendChild(cell.root);
    row.cell = cell;
    return row;
};

BaseFormatPanel.prototype.createLabelRowCheckGroupIconCell = function (label, config, getValueFn, setValueFn) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new CheckGroupIconCell(this.editorUi, config, getValueFn, setValueFn);
    row.root.appendChild(cell.root);
    row.cell = cell;
    return row;
};
BaseFormatPanel.prototype.createLabelRowActionButtonsCell = function (label, config, getValueFn, setValueFn) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new ActionButtonsCell(this.editorUi, config, getValueFn, setValueFn);
    row.root.appendChild(cell.root);
    row.cell = cell;
    return row;
};

BaseFormatPanel.prototype.createLabelRowRCTransferBoxCell = function (label, config, getValueFn, setValueFn) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new RCTransferBoxCell(this.editorUi, config, getValueFn, setValueFn);
    row.root.appendChild(cell.root);
    row.cell = cell;
    return row;
};

BaseFormatPanel.prototype.createLabelRowRCCodeEditorCell = function (label, config, getValueFn, setValueFn) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new RCCodeEditorCell(this.editorUi, config, getValueFn, setValueFn);
    row.root.querySelector('div.rcui-line-row-label').style.height = '310px';
    row.root.appendChild(cell.root);
    row.cell = cell;
    return row;
};

BaseFormatPanel.prototype.createRCCustomCodeEditorCell = function (config, getValueFn, setValueFn) {
    const cell = new RCCustomCodeEditorCell(this.editorUi, config, getValueFn, setValueFn);
    return cell;
};

BaseFormatPanel.prototype.createLabelCellRowRightButton = function (label, config) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new RightButtonCell(this.editorUi, config);
    row.root.appendChild(cell.root);
    row.cell = cell;
    console.log('createLabelCellRowRightButton-config', config);
    // row.root.querySelector('div.rcui-line-row-label').style.width = '500px';
    if(config.titleFlex == '1'){
        row.root.querySelector('div.rcui-line-row-label').style.flex = '1';
        row.root.querySelector('div.rcui-line-row-label').style['margin-right'] = '10px';
        cell.root.style['flex'] = 'none;';
    }else{
        if(config.btnsFlex == '1'){
            row.root.querySelector('div.rcui-line-row-label').style['flex'] = 'none';
            cell.root.style['flex'] = '1';
            let btnsDiv = cell.root.querySelector('div.rightBtnsDiv');
                console.log('btnsDivbtnsDivbtnsDivbtnsDivbtnsDivbtnsDivbtnsDivbtnsDivbtnsDiv',btnsDiv);
                
                if(config.btnsAlign == 'left'){
                    btnsDiv.style['justify-content'] = 'flex-start';
                }else{
                    btnsDiv.style['justify-content'] = 'flex-end';
                }
        }
    }
    return row;
};
BaseFormatPanel.prototype.createLabelCellRowChooseVirvarCell = function (label, config, getValueFn, setValueFn) {
    const row = new LabelCellRow(this.editorUi, label);
    const cell = new ChooseVirvarCell(this.editorUi, config, getValueFn, setValueFn);
    row.root.appendChild(cell.root);
    row.cell = cell;
    return row;
};

BaseFormatPanel.prototype.createOnlyChooseVirvarCell = function (config, getValueFn, setValueFn) {
    const cell = new ChooseVirvarCell(this.editorUi, config, getValueFn, setValueFn);
    return cell;
};


BaseFormatPanel.prototype.getUnit = function () {
    var unit = this.editorUi.editor.graph.view.unit;

    switch (unit) {
        case mxConstants.POINTS:
            return 'pt';
        case mxConstants.INCHES:
            return '"';
        case mxConstants.MILLIMETERS:
            return 'mm';
        case mxConstants.METERS:
            return 'm';
    }
};

BaseFormatPanel.prototype.inUnit = function (pixels) {
    return this.editorUi.editor.graph.view.formatUnitText(pixels);
};

BaseFormatPanel.prototype.fromUnit = function (value) {
    var unit = this.editorUi.editor.graph.view.unit;
    switch (unit) {
        case mxConstants.POINTS:
            return value;
        case mxConstants.INCHES:
            return value * mxConstants.PIXELS_PER_INCH;
        case mxConstants.MILLIMETERS:
            return value * mxConstants.PIXELS_PER_MM;
        case mxConstants.METERS:
            return value * mxConstants.PIXELS_PER_MM * 1000;
    }
};

BaseFormatPanel.prototype.isFloatUnit = function () {
    return this.editorUi.editor.graph.view.unit !== mxConstants.POINTS;
};

BaseFormatPanel.prototype.getUnitStep = function () {
    var unit = this.editorUi.editor.graph.view.unit;
    switch (unit) {
        case mxConstants.POINTS:
            return 1;
        case mxConstants.INCHES:
            return 0.1;
        case mxConstants.MILLIMETERS:
            return 0.5;
        case mxConstants.METERS:
            return 0.001;
    }
};

BaseFormatPanel.prototype.styleButtons = function (elts) {
    for (let i = 0; i < elts.length; i++) {
        mxUtils.setPrefixedStyle(elts[i].style, 'borderRadius', '3px');
        mxUtils.setOpacity(elts[i], 100);
        elts[i].style.border = '1px solid #a0a0a0';
        elts[i].style.padding = '4px';
        elts[i].style.paddingTop = '3px';
        elts[i].style.paddingRight = '1px';
        elts[i].style.margin = '1px';
        elts[i].style.marginRight = '2px';
        elts[i].style.width = '24px';
        elts[i].style.height = '20px';
        elts[i].className += ' geColorBtn';
    }
};

BaseFormatPanel.prototype.addAction = function (div, name) {
    var action = this.editorUi.actions.get(name);
    var btn = null;
    if (action != null && action.isEnabled()) {
        btn = mxUtils.button(
            action.label,
            mxUtils.bind(this, function (evt) {
                try {
                    action.funct(evt, evt);
                } catch (e) {
                    this.editorUi.handleError(e);
                }
            })
        );

        var short = action.shortcut != null ? ' (' + action.shortcut + ')' : '';
        btn.setAttribute('title', action.label + short);
        btn.style.marginBottom = '2px';
        btn.style.width = '210px';
        div.appendChild(btn);
    }
    return btn;
};

BaseFormatPanel.prototype.addActions = function (div, names) {
    var lastBr = null;
    var last = null;
    var count = 0;

    for (var i = 0; i < names.length; i++) {
        var btn = this.addAction(div, names[i]);

        if (btn != null) {
            count++;

            if (mxUtils.mod(count, 2) == 0) {
                last.style.marginRight = '2px';
                last.style.width = '104px';
                btn.style.width = '104px';
                lastBr.parentNode.removeChild(lastBr);
            }

            lastBr = mxUtils.br(div);
            last = btn;
        }
    }

    return count;
};
