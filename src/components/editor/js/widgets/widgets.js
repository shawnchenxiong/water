/* eslint-disable */

import { mxEvent, mxUtils } from '../../core/mxgraph';
import ColorPickerUI from "../utils/colorpicker.min";
import CodeMirror from "../plugins/code/lib/codemirror";
import javascript from "../plugins/code/mod/javascript/javascript";
import matchbrackets from "../plugins/code/addon/edit/matchbrackets.js";
import activeline from "../plugins/code/addon/selection/active-line.js";
import sublime from "../plugins/code/keymap/sublime.js";

export {
    javascript, matchbrackets, activeline, sublime,
    BaseWidget,
    LabelCellRow,
    ColorCell,
    GradientColorCell,
    SelectCell,
    SwitchCell,
    InputCell,
    ChoosePictureCell,
    SelectClassIconCell,
    CheckGroupIconCell,
    ActionButtonsCell,
    RCTransferBoxCell,
    RCCodeEditorCell,
    RCCustomCodeEditorCell,
    RightButtonCell,
    ChooseVirvarCell,
};

function BaseWidget(editorUi) {
    this.disable = false;
    this.editorUi = editorUi;

}

BaseWidget.prototype.createTag = function (tagName, className) {
    const tag = document.createElement(tagName);
    if (className) tag.className = className;
    return tag;
};

function LabelCellRow(editorUi, label) {
    BaseWidget.call(this, editorUi);
    this.label = label;
    this.init();
}

mxUtils.extend(LabelCellRow, BaseWidget);

LabelCellRow.prototype.init = function () {
    this.root = this.createTag('div', 'rcui-line-row');
    this.labelDiv = this.createTag('div', 'rcui-line-row-label');
    this.labelDiv.innerText = this.label;
    this.root.appendChild(this.labelDiv);
    this.root.style.marginBottom = '10px';
};

LabelCellRow.prototype.changeLabel = function (label) {
    this.label = label;
    this.labelDiv.innerText = this.label;
};

function GradientColorCell(editorUi, config = {}, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    if (this.config.disable !== null && this.config.disable !== undefined) {
        this.disable = this.config.disable;
    }
    this.init();
}
mxUtils.extend(GradientColorCell, BaseWidget);
GradientColorCell.prototype.init = function () {
    const graph = this.editorUi.editor.graph;
    const rowBlockDiv = this.createTag('div', 'rcui-line-row-block');
    let color = this.getValueFn();
    const isGradientColor = color && color.length > 9;
    rowBlockDiv.innerHTML = `<div>
    <div class="btnChangeGradientColor rcui-unselect rcui-form-checkbox ${isGradientColor ? 'rcui-form-checked' : ''}" lay-skin="tag">
        <div>渐变</div>
        <i class="rcui-icon rcui-icon-ok"></i>
    </div>
    <div class="rcui-inline">
        <div class="rcui-colorpicker">
            <span class="rcui-colorpicker-trigger-span" style="background: ${color}">
                <i class="rcui-icon rcui-colorpicker-trigger-i ${color ? 'rcui-icon-down' : 'rcui-icon-close'}"></i>
            </span>
        </div>
    </div>
</div>`;
    const colorPickerDiv = rowBlockDiv.querySelector('div.rcui-colorpicker');
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/;
    color = color ? color.toLowerCase() : color;
    mxEvent.addListener(colorPickerDiv, 'click', mxUtils.bind(this, function (evt) {
        if (this.disable) return;
        const elementRect = evt.target.getBoundingClientRect();
        let x = elementRect.left + (elementRect.right - elementRect.left) / 2 - 226;
        let y = elementRect.bottom;
        if (isGradientColor) {
            const colorPickerTool = ColorPickerUI.createGradientPicker({
                gradient: reg.test(color) ? color : '#FFFFFF',
                onChange: (newColor) => {
                    this.setValueFn(newColor);
                }
            });
            colorPickerTool.show({
                left: x,
                top: y,
            });
        } else {
            const colorpicker = new ColorPickerUI.ColorPicker({
                color: reg.test(color) ? color : '#FFFFFF',
                type: 'chromedevtool',
            });
            colorpicker.show({
                left: x,
                top: y,
            }, reg.test(color) ? color : '#FFFFFF', mxUtils.bind(this, function (newColor) {
                this.setValueFn(newColor);
            }));
        }
    }));
    const btnChangeGradientColor = rowBlockDiv.querySelector('div.btnChangeGradientColor');
    mxEvent.addListener(btnChangeGradientColor, 'click', mxUtils.bind(this, function (evt) {
        if (isGradientColor) {
            this.setValueFn('#FFFFFF');
        } else {
            this.setValueFn('linear-gradient(to right, white 0%, black 100%)');
        }
    }));
    rowBlockDiv.style.position = 'relative';
    this.root = rowBlockDiv;
};

function ColorCell(editorUi, config = {}, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    if (this.config.disable !== null && this.config.disable !== undefined) {
        this.disable = this.config.disable;
    }
    this.init();
};
mxUtils.extend(ColorCell, BaseWidget);

ColorCell.prototype.init = function () {
    const graph = this.editorUi.editor.graph;
    const rowBlockDiv = this.createTag('div', 'rcui-line-row-block');
    let color = this.getValueFn();
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/;
    color = color ? color.toLowerCase() : color;
    const inputLine = this.createTag('div', 'rcui-inline');
    const input = document.createElement('input');
    if (mxUtils.isNotNullOrUndefined(this.config.textAlign)) {
        input.style.textAlign = this.config.textAlign;
    }
    this.input = input;
    mxUtils.addStyleClass(input, 'rcui-input');
    if (this.config.hideInput) {
        mxUtils.addStyleClass(input, 'rcui-hide');
    }
    inputLine.appendChild(input);
    input.value = color;
    input.addEventListener('input', mxUtils.bind(this, function () {
        const inputValue = input.value.trim();
        const validColor = /^#([0-9a-fA-F]{0,})$/.test(inputValue);
        if (!validColor) {
            input.value = '';
        }
    }));
    input.addEventListener('blur', mxUtils.bind(this, function () {
        if (this.disable) return;
        const inputValue = input.value.trim();
        const validColor = /^#([0-9a-fA-F]{6})$/.test(inputValue);
        if (!validColor) {
            input.value = this.getValueFn() ? this.getValueFn() : '';
        }
        if (input.value !== graph.background) {
            color = input.value;
            this.setValueFn(color);
            if (color) {
                mxUtils.removeStyleClass(iii, 'rcui-icon-close');
                mxUtils.addStyleClass(iii, 'rcui-icon-down');
            } else {
                mxUtils.removeStyleClass(iii, 'rcui-icon-down');
                mxUtils.addStyleClass(iii, 'rcui-icon-close');
            }
            inn.style.background = color ? color : '';
        }
    }));

    const colorPickerLine = this.createTag('div', 'rcui-inline');
    const colorPicker = this.createTag('div', 'rcui-colorpicker');
    colorPickerLine.appendChild(colorPicker);
    if (!this.config.hideInput) {
        colorPickerLine.style.marginLeft = '10px';
    }

    const out = document.createElement('span');
    const inn = document.createElement('span');
    this.inn = inn;
    inn.className = 'rcui-colorpicker-trigger-span';
    const iii = document.createElement('i');
    this.iii = iii;
    iii.className = 'rcui-icon rcui-colorpicker-trigger-i';
    mxUtils.addStyleClass(iii, color ? 'rcui-icon-down' : 'rcui-icon-close');
    inn.style.background = color ? color : '';
    inn.appendChild(iii);
    out.appendChild(inn);
    colorPicker.appendChild(out);

    mxEvent.addListener(colorPicker, 'click', mxUtils.bind(this, function (evt) {
        if (this.disable) return;
        const elementRect = evt.target.getBoundingClientRect();
        let x = elementRect.left + (elementRect.right - elementRect.left) / 2 - 226;
        let y = elementRect.bottom;
        const colorpicker = new ColorPickerUI.ColorPicker({
            color: reg.test(color) ? color : '#FFFFFF',
            type: 'chromedevtool',
        });
        colorpicker.show({
            left: x,
            top: y,
        }, reg.test(color) ? color : '#FFFFFF', mxUtils.bind(this, function (newColor) {
            color = newColor;
            this.outerChangeValue(newColor);
            this.setValueFn(newColor);
        }));

    }));
    rowBlockDiv.appendChild(inputLine);
    rowBlockDiv.appendChild(colorPickerLine);
    rowBlockDiv.style.position = 'relative';
    this.root = rowBlockDiv;
    this.setDisable(this.disable);
}

ColorCell.prototype.setDisable = function (disable) {
    this.disable = disable;
    if (this.disable) {
        this.input.setAttribute('disabled');
    } else {
        this.input.removeAttribute('disabled');
    }
};

ColorCell.prototype.outerChangeValue = function (color) {
    if (color) {
        mxUtils.removeStyleClass(this.iii, 'rcui-icon-close');
        mxUtils.addStyleClass(this.iii, 'rcui-icon-down');
    } else {
        mxUtils.removeStyleClass(this.iii, 'rcui-icon-down');
        mxUtils.addStyleClass(this.iii, 'rcui-icon-close');
    }
    this.inn.style.background = color ? color : '';
    this.input.value = color ? color : '';
}

function SelectCell(editorUi, config = {}, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    if (this.config.disable !== null && this.config.disable !== undefined) {
        this.disable = this.config.disable;
    }
    this.init();
};
mxUtils.extend(SelectCell, BaseWidget);

SelectCell.prototype.init = function () {
    const rowBlockDiv = this.createTag('div', 'rcui-line-row-block');
    let value = this.getValueFn();
    const select = this.createTag('div', 'rcui-unselect rcui-select');
    const selectTitle = this.createTag('div', 'rcui-select-title');
    const selectInput = this.createTag('input', 'rcui-input rcui-unselect');
    this.select = select;
    this.selectInput = selectInput;
    selectInput.type = 'text';
    selectInput.placeholder = this.config.placeholder ? this.config.placeholder : '';
    selectInput.setAttribute('readOnly', 'readOnly');
    if (mxUtils.isNotNullOrUndefined(this.config.textAlign)) {
        selectInput.style.textAlign = this.config.textAlign;
    }
    const edge = this.createTag('i', 'rcui-edge');

    const selectDl = this.createTag('dl', 'rcui-anim rcui-anim-upbit');
    this.selectDl = selectDl;
    const options = this.config.options;
    if (options && options.length > 0) {
        const optionClickListener = mxUtils.bind(this, function (evt) {
            if (this.disable) return;
            let index = parseInt(evt.target.getAttribute('rcui-index'));
            let v = this.getValueFn();
            if (v == options[index].key) {
                mxUtils.addStyleClass(this.selectDl, 'rcui-hide');
                return;
            }
            for (let i = 0; i < selectDl.childNodes.length; i++) {
                mxUtils.removeStyleClass(selectDl.childNodes[i], 'rcui-this');
            }
            mxUtils.addStyleClass(evt.target, 'rcui-this');
            selectInput.value = options[index].title;
            mxUtils.addStyleClass(selectDl, 'rcui-hide');
            this.setValueFn(options[index], evt);
        });

        for (let i = 0; i < options.length; i++) {
            const dd = this.createTag('dd');
            mxUtils.write(dd, options[i].title);
            if (options[i].key == value) {
                mxUtils.addStyleClass(dd, 'rcui-this');
                selectInput.value = options[i].title;
            }
            dd.setAttribute('rcui-index', i);
            selectDl.appendChild(dd);
            mxEvent.addListener(dd, 'click', optionClickListener);
        }
    }

    selectTitle.appendChild(selectInput);
    selectTitle.appendChild(edge);
    select.appendChild(selectTitle);
    select.appendChild(selectDl);
    rowBlockDiv.appendChild(select);
    mxEvent.addListener(selectInput, 'click', mxUtils.bind(this, function (evt) {
        if (this.disable) return;
        mxUtils.removeStyleClass(selectDl, 'rcui-hide');
    }));
    document.addEventListener('click', function (event) {
        const isClickedInsideInput = selectInput.contains(event.target); // 检查点击的位置是否是按钮内部
        const isClickedInsideSelectDl = selectDl.contains(event.target); // 检查点击的位置是否是按钮内部
        if (!isClickedInsideInput && !isClickedInsideSelectDl) {
            mxUtils.addStyleClass(selectDl, 'rcui-hide');
        }
    });
    selectDl.style.display = 'block';
    mxUtils.addStyleClass(selectDl, 'rcui-hide');
    mxEvent.addListener(edge, 'click', function (evt) {
        if (this.disable) return;
        selectInput.focus();
    });
    this.root = rowBlockDiv;
    this.setDisable(this.disable);
};
SelectCell.prototype.setDisable = function (disable) {
    this.disable = disable;
    if (this.disable) {
        mxUtils.addStyleClass(this.select, 'rcui-select-disabled');
        mxUtils.addStyleClass(this.selectInput, 'rcui-disabled');
        this.selectInput.setAttribute('disabled', 'disabled');
    } else {
        mxUtils.removeStyleClass(this.select, 'rcui-select-disabled');
        mxUtils.removeStyleClass(this.selectInput, 'rcui-disabled');
        this.selectInput.removeAttribute('disabled');
    }
};
SelectCell.prototype.outerChangeValue = function (val) {
    const options = this.config.options;
    for (let i = 0; i < options.length; i++) {
        mxUtils.removeStyleClass(this.selectDl.childNodes[i], 'rcui-this');
        if (options[i].key === val) {
            mxUtils.addStyleClass(this.selectDl.childNodes[i], 'rcui-this');
            this.selectInput.value = options[i].title;
        }
    }
}
SelectCell.prototype.updateOptions = function (options) {
    this.config.options = options;
    this.selectDl.innerHTML = '';
    let value = this.getValueFn();

    const optionClickListener = mxUtils.bind(this, function (evt) {
        if (this.disable) return;
        let index = parseInt(evt.target.getAttribute('rcui-index'));
        let v = this.getValueFn();
        if (v == options[index].key) {
            mxUtils.addStyleClass(this.selectDl, 'rcui-hide');
            return;
        }
        for (let i = 0; i < this.selectDl.childNodes.length; i++) {
            mxUtils.removeStyleClass(this.selectDl.childNodes[i], 'rcui-this');
        }
        mxUtils.addStyleClass(evt.target, 'rcui-this');
        this.selectInput.value = options[index].title;
        mxUtils.addStyleClass(this.selectDl, 'rcui-hide');
        this.setValueFn(options[index], evt);
    });

    for (let i = 0; i < options.length; i++) {
        const dd = this.createTag('dd');
        mxUtils.write(dd, options[i].title);
        if (options[i].key == value) {
            mxUtils.addStyleClass(dd, 'rcui-this');
            this.selectInput.value = options[i].title;
        }
        dd.setAttribute('rcui-index', i);
        this.selectDl.appendChild(dd);
        mxEvent.addListener(dd, 'click', optionClickListener);
    }
}

function SwitchCell(editorUi, config = {}, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    if (this.config.disable !== null && this.config.disable !== undefined) {
        this.disable = this.config.disable;
    }
    this.init();
};
mxUtils.extend(SwitchCell, BaseWidget);

SwitchCell.prototype.init = function () {
    const rowBlockDiv = this.createTag('div', 'rcui-line-row-block');
    let value = this.getValueFn();
    const switchDiv = this.createTag('div', 'rcui-unselect rcui-switch');
    this.switchDiv = switchDiv;
    const switchTag = this.createTag('div');
    this.switchTag = switchTag;
    const switchI = this.createTag('i');
    switchDiv.appendChild(switchTag);
    switchDiv.appendChild(switchI);

    mxEvent.addListener(switchDiv, 'click', mxUtils.bind(this, function (evt) {
        if (this.disable) return
        if (value) {
            value = false;
        } else {
            value = true;
        }
        this.setValueFn(value, evt);
        this.outerChangeValue(value);
    }));

    rowBlockDiv.appendChild(switchDiv);
    this.outerChangeValue(value);
    this.root = rowBlockDiv;
    this.setDisable(this.disable);
}

SwitchCell.prototype.setDisable = function (disable) {
    this.disable = disable;
    if (this.disable) {
        mxUtils.addStyleClass(this.switchDiv, 'rcui-checkbox-disabled rcui-disabled');
    } else {
        mxUtils.removeStyleClass(this.switchDiv, 'rcui-checkbox-disabled rcui-disabled');
    }
};
SwitchCell.prototype.outerChangeValue = function (val) {
    if (val) {
        this.switchTag.innerText = this.config.trueLabel;
        mxUtils.addStyleClass(this.switchDiv, 'rcui-onswitch');
    } else {
        this.switchTag.innerText = this.config.falseLabel;
        mxUtils.removeStyleClass(this.switchDiv, 'rcui-onswitch');
    }
}

function InputCell(editorUi, config = {}, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    if (this.config.type == null || this.config.type == undefined) {
        this.config.type = 'text';
    }
    if (this.config.type === 'number') {
        if (this.config.min == null || this.config.min == undefined) {
            this.config.min = 0;
        }
        if (this.config.max == null || this.config.max == undefined) {
            this.config.max = 99999;
        }
        if (this.config.decimal) {
            if (mxUtils.isNullOrUndefined(this.config.accuracy)) {
                this.config.accuracy = 1;
            }
        }
    }
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    if (this.config.disable !== null && this.config.disable !== undefined) {
        this.disable = this.config.disable;
    }
    this.init();
};
mxUtils.extend(InputCell, BaseWidget);

InputCell.prototype.init = function () {
    const rowBlockDiv = this.createTag('div', 'rcui-line-row-block');
    const rowInputWrap = this.createTag('div', 'rcui-input-wrap');
    const rowInputGroup = this.createTag('div', 'rcui-input-group');
    rowInputGroup.style.cssText = `height:36px;display:flex;`;
    const rowInput = this.createTag('input', 'rcui-input');
    this.rowInput = rowInput;
    // rowInput.type = config.type;
    rowInput.placeholder = this.config.placeholder ? this.config.placeholder : '';
    rowInput.setAttribute('autoComplete', 'off');
    let value = this.getValueFn();
    rowInput.value = value;
    if (mxUtils.isNotNullOrUndefined(this.config.textAlign)) {
        rowInput.style.textAlign = this.config.textAlign;
        rowInput.style.width = '100%';
        rowInput.style.padding = '0px';
    }
    if (this.config.type === 'number') {
        // 监听输入事件 - 只验证格式，不验证范围
        let regex = null;
        if (!this.config.decimal) {
            // 整数验证：允许空字符串、单个0、或者非0开头的数字
            if (this.config.min < 0) {
                // 允许负数：空、负号、0、正整数、负整数
                regex = /^$|^-$|^0$|^-?[1-9]\d*$/;
            } else {
                // 只允许非负整数：空、0、或非0开头的正整数
                regex = /^$|^0$|^[1-9]\d*$/;
            }
        } else {
            let a = this.config.accuracy;
            if (this.config.min < 0) {
                regex = `(^-?$)|(^-0?$)|(^-0\\.?$)|(^-0\\.[0-9]{0,${a}}$)|(^-0[1-9]*$)|(^-0[1-9]*\\.$)|(^-0[1-9]*\\.[0-9]{0,${a}}$)|(^-[1-9]$)|(^-[1-9][0-9]*$)|(^-[1-9][0-9]*\\.?$)|(^-[1-9][0-9]*\\.[0-9]{0,${a}}$)|(^0?$)|(^0[1-9]?$)|(^0[1-9][0-9]*$)|(^0[1-9][0-9]*\\.?$)|(^0[1-9][0-9]*\\.[0-9]{0,${a}}$)|(^0\\.?$)|(^0\\.[0-9]{0,${a}}$)|(^[1-9]?$)|(^[1-9][0-9]*$)|(^[1-9][0-9]*\\.?$)|(^[1-9][0-9]*\\.[0-9]{0,${a}}$)`;
            } else {
                regex = `(^0?$)|(^0[1-9]?$)|(^0[1-9][0-9]*$)|(^0[1-9][0-9]*\\.?$)|(^0[1-9][0-9]*\\.[0-9]{0,${a}}$)|(^0\\.?$)|(^0\\.[0-9]{0,${a}}$)|(^[1-9]?$)|(^[1-9][0-9]*$)|(^[1-9][0-9]*\\.?$)|(^[1-9][0-9]*\\.[0-9]{0,${a}}$)`;
            }
            regex = new RegExp(regex);
        }

        rowInput.addEventListener('input', mxUtils.bind(this, function (event) {
            const inputValue = event.target.value;
            // 只验证格式，不验证范围（范围验证在 blur 时处理）
            const isValidInput = regex.test(inputValue);
            if (!isValidInput) {
                event.target.value = inputValue.slice(0, -1); // 移除最后一个字符
            }
        }));
    }
    let allowEnter = this.config.allowEnter == null ? true : this.config.allowEnter;
    if (allowEnter) {
        mxEvent.addListener(document, 'keyup', mxUtils.bind(this, function (evt) {
            if (evt.keyCode === 13 && evt.target === this.rowInput) {
                this.rowInput.blur();
            }
        }));
    }

    mxEvent.addListener(rowInput, 'blur', mxUtils.bind(this, function (evt) {
        if (this.disable) return;
        let required = this.config.required == null || this.config.required === true;
        if (required) {
            if (this.rowInput.value.length <= 0) {
                let requiredEmptySetDefault = this.config.emptyDefault == null || this.config.emptyDefault === true;
                if (requiredEmptySetDefault) {
                    this.rowInput.value = this.getValueFn();
                }
                return;
            }
        }
        if (this.rowInput.value && this.config.type === 'number') {
            if (this.config.decimal) {
                let v = parseFloat(this.rowInput.value);
                if (v < this.config.min) {
                    this.rowInput.value = this.config.min;
                } else if (v > this.config.max) {
                    this.rowInput.value = this.config.max;
                }
            } else {
                let v = parseInt(this.rowInput.value);
                if (v < this.config.min) {
                    this.rowInput.value = this.config.min;
                } else if (v > this.config.max) {
                    this.rowInput.value = this.config.max;
                }
            }
        }
        this.setValueFn(this.rowInput.value, evt);
    }));

    rowInputGroup.appendChild(rowInput);
    rowInputWrap.appendChild(rowInputGroup);
    if (this.config.type === 'number' && !this.config.hideStep) {
        const rowInputAfter = this.createTag('div', 'rcui-input-affix rcui-input-split rcui-input-number rcui-input-suffix');
        rowInputAfter.style.cssText = `display:flex;background:#FFFFFF;`;
        const rowInputAfterAdd = this.createTag('i', 'rcui-icon rcui-icon-up');
        const rowInputAfterSub = this.createTag('i', 'rcui-icon rcui-icon-down');
        rowInputAfter.appendChild(rowInputAfterAdd);
        rowInputAfter.appendChild(rowInputAfterSub);
        rowInputGroup.appendChild(rowInputAfter);

        mxEvent.addListener(rowInputAfterAdd, 'click', mxUtils.bind(this, function (evt) {
            if (this.disable) return;
            if (rowInput.value) {
                if (this.config.decimal) {
                    let v = parseFloat(rowInput.value);
                    //v = parseFloat(math.format(math.chain(math.bignumber(v)).add(math.bignumber(this.config.step)).done())).toFixed(1);
                    let a = 10 ^ this.config.accuracy;
                    v = (v * a + this.config.step * a) / a * 1.0;
                    if (v > this.config.max) v = this.config.max;
                    rowInput.value = parseFloat(v + '').toFixed(this.config.accuracy);
                    rowInput.setSelectionRange(rowInput.value.length, rowInput.value.length);
                    this.setValueFn(rowInput.value, evt);
                } else {
                    let v = parseInt(rowInput.value);
                    v = v + this.config.step;
                    if (v > this.config.max) v = this.config.max;
                    rowInput.value = v;
                    rowInput.setSelectionRange(rowInput.value.length, rowInput.value.length);
                    this.setValueFn(rowInput.value, evt);
                }
            }
        }));
        mxEvent.addListener(rowInputAfterSub, 'click', mxUtils.bind(this, function (evt) {
            if (this.disable) return;
            if (rowInput.value) {
                let v = this.config.decimal ? parseFloat(rowInput.value) : parseInt(rowInput.value);
                // v = math.chain(v).subtract(this.config.step).done();
                // if (v < this.config.min) v = this.config.min;
                // rowInput.value = v;
                let a = 10 ^ this.config.accuracy;
                v = (v * a - this.config.step * a) / a * 1.0;
                if (v < this.config.min) v = this.config.min;
                rowInput.value = parseFloat(v + '').toFixed(this.config.accuracy);
                rowInput.setSelectionRange(rowInput.value.length, rowInput.value.length);
                this.setValueFn(rowInput.value, evt);
            }
        }));
    }
    if (this.config.unit) {
        const rowUnit = this.createTag('div', 'rcui-input-split rcui-input-suffix');
        rowUnit.style.cssText = `background:#FFFFFF;`;
        mxUtils.write(rowUnit, this.config.unit);
        rowInputGroup.appendChild(rowUnit);
    }
    rowBlockDiv.appendChild(rowInputWrap);
    this.root = rowBlockDiv;
    this.setDisable(this.disable);
}
InputCell.prototype.setDisable = function (disable) {
    this.disable = disable;
    if (this.disable) {
        this.rowInput.setAttribute('disabled', 'disabled');
    } else {
        this.rowInput.removeAttribute('disabled');
    }
};
InputCell.prototype.outerChangeValue = function (val) {
    this.rowInput.value = val != undefined && val != null ? val : '';
}

function ChoosePictureCell(editorUi, config, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    if (this.config !== null && this.config !== undefined) {
        if (this.config.disable !== null && this.config.disable !== undefined) {
            this.disable = this.config.disable;
        }
    }
    this.init();
};
mxUtils.extend(ChoosePictureCell, BaseWidget);

ChoosePictureCell.prototype.init = function () {
    let width = 70;
    let height = 70;
    if (this.config.width != null && this.config.width > 0 && this.config.height != null && this.config.height > 0) {
        width = this.config.width;
        height = this.config.height;
    }
    const graph = this.editorUi.editor.graph;
    const rowBlockDiv = this.createTag('div', 'rcui-line-row-block');
    let uploadDrag = this.createTag('div', 'rcui-upload-drag');

    let uploadImage = this.createTag('img', 'rcui-upload-img');
    let uploadAdd = this.createTag('div', 'rcui-upload-add');
    let uploadDelete = this.createTag('div', 'rcui-upload-delete');
    let iconDelete = this.createTag('i', 'rcui-icon rcui-icon-delete');
    let uploadIcon = this.createTag('i', 'rcui-icon');

    let uploadTip
    if (this.config.small) {
        mxUtils.addStyleClass(uploadIcon, 'rcui-icon-addition');
        uploadIcon.style.fontSize = '25px';
    } else {
        uploadTip = this.createTag('p');
        mxUtils.write(uploadTip, '点击上传');
        mxUtils.addStyleClass(uploadIcon, 'rcui-icon-upload');
    }

    uploadDrag.style.width = `${width}px`;
    uploadDrag.style.height = `${height}px`;

    let value = this.getValueFn();
    if (value) {
        uploadAdd.style.display = 'none';
        uploadDelete.style.display = 'none';
        uploadImage.style.display = 'block';
        uploadImage.src = mxUtils.fixImg(value);
    } else {
        uploadAdd.style.display = 'flex';
        uploadDelete.style.display = 'none';
        uploadImage.style.display = 'none';
    }
    mxEvent.addListener(uploadAdd, 'click', mxUtils.bind(this, function (evt) {
        if (this.disable) return;
        this.editorUi.showImageDialog(this.config.title ? this.config.title : '选择图片', '', mxUtils.bind(this, function (newValue, w, h, clipPath, cW, cH) {
            uploadImage.src = mxUtils.fixImg(newValue);
            uploadAdd.style.display = 'none';
            uploadImage.style.display = 'block';
            uploadDelete.style.display = 'none';
            uploadDelete.style.display = 'none';
            this.setValueFn(newValue);
        }));
    }));

    uploadDrag.addEventListener('mouseover', () => {
        if (this.disable) return;
        if (uploadImage.src && uploadImage.src.length > 0) {
            uploadDelete.style.display = 'flex';
        }
    });
    uploadDrag.addEventListener('mouseout', () => {
        if (this.disable) return;
        if (uploadDelete.style.display === 'flex') {
            uploadDelete.style.display = 'none';
        }
    });
    mxEvent.addListener(uploadDelete, 'click', mxUtils.bind(this, function (evt) {
        if (this.disable) return;
        uploadImage.removeAttribute('src');
        uploadAdd.style.display = 'flex';
        uploadDelete.style.display = 'none';
        uploadImage.style.display = 'none';
        this.setValueFn(null, evt);
    }));

    uploadDrag.appendChild(uploadImage);
    uploadDelete.appendChild(iconDelete);

    uploadAdd.appendChild(uploadIcon);
    if (uploadTip) {
        uploadAdd.appendChild(uploadTip);
    }
    uploadDrag.appendChild(uploadAdd);

    uploadDrag.appendChild(uploadDelete);

    rowBlockDiv.appendChild(uploadDrag);

    this.uploadDrag = uploadDrag;
    this.uploadAdd = uploadAdd;
    this.uploadDelete = uploadDelete;
    this.uploadImage = uploadImage;
    this.root = rowBlockDiv;
}

ChoosePictureCell.prototype.setDisable = function (disable) {
    this.disable = disable;
}

ChoosePictureCell.prototype.outerChangeValue = function (val) {
    this.uploadAdd.style.display = 'none';
    this.uploadDelete.style.display = 'none';
    this.uploadImage.style.display = 'block';
    this.uploadImage.src = mxUtils.fixImg(val);
}
ChoosePictureCell.prototype.outerChangeSize = function (w, h) {
    if (w > h) {
        this.uploadDrag.style.width = '100%';
    } else {
        this.uploadDrag.style.width = '75%';
    }
    this.uploadDrag.style.aspectRatio = w / h;
}


function SelectClassIconCell(editorUi, config, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    if (this.config !== null && this.config !== undefined) {
        if (this.config.disable !== null && this.config.disable !== undefined) {
            this.disable = this.config.disable;
        }
    }
    this.init();
};
mxUtils.extend(SelectClassIconCell, BaseWidget);

SelectClassIconCell.prototype.init = function () {
    const rowBlockDiv = this.createTag('div', 'rcui-line-row-block');
    let value = this.getValueFn();
    const select = this.createTag('div', 'rcui-unselect rcui-select');
    select.style.cssText = `width: 100px`;
    const selectTitle = this.createTag('div', 'rcui-select-title');
    let sel = this.config.options.find((item) => item.key === value);
    const selectImage = this.createTag('div', sel ? sel.title : '');
    selectImage.style.cssText = `width: 52px; height:22px;background-color: transparent;position: absolute;left:7px;top:7px;
    display: inline-block;
    background-position-x: 50%;
    line-height:22px;
    text-align: center;
    flex-grow: 1;
    opacity: 0.6;`;
    if (sel && sel.key === 'none') {
        selectImage.innerText = '无';
    }
    selectTitle.appendChild(selectImage);
    const selectInput = this.createTag('input', 'rcui-input rcui-unselect');
    selectInput.style.cssText = `width: 100px; height:36px;background-color: transparent;position: absolute;left:px;top:0px;`;
    selectInput.type = 'text';
    selectInput.placeholder = this.config.placeholder ? this.config.placeholder : '';
    selectInput.setAttribute('readOnly', 'readOnly');
    const edge = this.createTag('i', 'rcui-edge');

    const selectDl = this.createTag('dl', 'rcui-anim rcui-anim-upbit');
    if (this.config.options && this.config.options.length > 0) {
        for (let i = 0; i < this.config.options.length; i++) {
            const dd = this.createTag('dd');
            const itemIcon = this.createTag('div', this.config.options[i].title);
            itemIcon.style.marginLeft = 'calc(50% - 10.5px)';
            if (this.config.options[i].key === 'none') {
                mxUtils.write(itemIcon, '无');
            }
            dd.appendChild(itemIcon);
            if (this.config.options[i].key === value) {
                mxUtils.addStyleClass(dd, 'rcui-this');
            }
            dd.setAttribute('formatindex', i);
            selectDl.appendChild(dd);
            mxEvent.addListener(dd, 'click', mxUtils.bind(this, function (evt) {
                let v = this.getValueFn();
                if (v === this.config.options[i].key) {
                    mxUtils.addStyleClass(selectDl, 'rcui-hide');
                    return
                }
                for (let i = 0; i < selectDl.childNodes.length; i++) {
                    mxUtils.removeStyleClass(selectDl.childNodes[i], 'rcui-this');
                }
                mxUtils.addStyleClass(evt.target, 'rcui-this');
                mxUtils.addStyleClass(selectDl, 'rcui-hide');
                this.setValueFn(this.config.options[i], evt);
            }));
        }
    }

    selectTitle.appendChild(selectInput);
    selectTitle.appendChild(edge);
    select.appendChild(selectTitle);
    select.appendChild(selectDl);
    rowBlockDiv.appendChild(select);
    mxEvent.addListener(selectInput, 'click', mxUtils.bind(this, function (evt) {
        if (this.disable) return;
        mxUtils.removeStyleClass(selectDl, 'rcui-hide');
    }));
    document.addEventListener('click', mxUtils.bind(this, function (event) {
        if (this.disable) return;
        const isClickedInsideInput = selectInput.contains(event.target); // 检查点击的位置是否是按钮内部
        const isClickedInsideSelectDl = selectDl.contains(event.target); // 检查点击的位置是否是按钮内部
        if (!isClickedInsideInput && !isClickedInsideSelectDl) {
            mxUtils.addStyleClass(selectDl, 'rcui-hide');
        }
    }));
    selectDl.style.display = 'block';
    mxUtils.addStyleClass(selectDl, 'rcui-hide');
    mxEvent.addListener(edge, 'click', mxUtils.bind(this, function (evt) {
        if (this.disable) return;
        selectInput.focus();
    }));
    this.root = rowBlockDiv;
}

SelectClassIconCell.prototype.setDisable = function (disable) {
    this.disable = disable;
}


function CheckGroupIconCell(editorUi, config, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    if (this.config !== null && this.config !== undefined) {
        if (this.config.disable !== null && this.config.disable !== undefined) {
            this.disable = this.config.disable;
        }
    }
    this.init();
};
mxUtils.extend(CheckGroupIconCell, BaseWidget);

CheckGroupIconCell.prototype.init = function () {
    const rowBlockDiv = this.createTag('div', 'rcui-line-row-block');
    const btnGroup = this.createTag('div', 'rcui-btn-group');
    rowBlockDiv.appendChild(btnGroup);
    let value = null;
    if (!this.config.isCheckbox) {
        value = this.getValueFn();
    }
    for (let i = 0; i < this.config.options.length; i++) {
        const tag = this.createTag('button', 'rcui-btn rcui-btn-sm rcui-btn-primary');
        tag.style.padding = '0 5px';
        if (this.config.isCheckbox) {
            if (this.getValueFn(this.config.options[i])) {
                mxUtils.removeStyleClass(tag, 'rcui-btn-primary');
            }
        } else {
            if (value === this.config.options[i].key) {
                mxUtils.removeStyleClass(tag, 'rcui-btn-primary');
            }
        }
        const image = this.createTag('div', this.config.options[i].title);
        image.style.cssText = `width: 22px; height:22px;background-color: transparent;background-position-x: 50%;line-height:22px;text-align: center;`;
        tag.appendChild(image);
        btnGroup.appendChild(tag);
        mxEvent.addListener(tag, 'click', mxUtils.bind(this, function (evt) {
            if (this.disable) return;
            this.setValueFn(this.config.options[i], evt);
        }));
    }
    this.root = rowBlockDiv;
}
CheckGroupIconCell.prototype.setDisable = function (disable) {
    this.disable = disable;
}

function ActionButtonsCell(editorUi, config, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    if (this.config !== null && this.config !== undefined) {
        if (this.config.disable !== null && this.config.disable !== undefined) {
            this.disable = this.config.disable;
        }
    }
    this.init();
};
mxUtils.extend(ActionButtonsCell, BaseWidget);

ActionButtonsCell.prototype.init = function () {
    const rowBlockDiv = this.createTag('div', 'rcui-line-row-block');
    const btnGrid = this.createTag('div', 'rcui-btn-grid');
    rowBlockDiv.appendChild(btnGrid);

    for (let i = 0; i < this.config.options.length; i++) {
        const tag = this.createTag('button', 'rcui-btn rcui-btn-sm rcui-btn-primary');
        mxUtils.write(tag, this.config.options[i].title);
        btnGrid.appendChild(tag);
        mxEvent.addListener(tag, 'click', mxUtils.bind(this, function (evt) {
            if (this.disable) return;
            this.setValueFn(this.config.options[i], evt);
        }));
    }
    this.root = rowBlockDiv;
}
ActionButtonsCell.prototype.setDisable = function (disable) {
    this.disable = disable;
}

function RCTransferBoxCell(editorUi, config = {}, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    if (this.config.disable !== null && this.config.disable !== undefined) {
        this.disable = this.config.disable;
    }
    this.init();
}

mxUtils.extend(RCTransferBoxCell, BaseWidget);

RCTransferBoxCell.prototype.init = function () {
    this.leftList = [];
    this.rightList = [];
    this.root = this.createTag('div', 'rcui-line-row-block');
    let div = this.createTag('div', 'rcui-transfer rcui-form');
    div.innerHTML = `
<div class="rcui-transfer-box" style="height: 210px;">
    <div class="rcui-transfer-header">
            <div class="rcui-unselect rcui-form-checkbox" lay-skin="primary" style="padding-left: 0px;">
                <div>全部数据点</div>
            </div>
        </div>
        <div class="rcui-transfer-search">
            <i class="rcui-icon rcui-icon-search"></i>
            <input type="text" value="" class="rcui-input leftSearchInput" placeholder="关键词搜索">
        </div>
        <ul class="rcui-transfer-data leftListPanel" style="height: 116px;">
            <p class="rcui-none rcui-hide leftNone">无点位</p>
        </ul>
    </div>
    <div class="rcui-transfer-active">
        <div class="rcui-btn rcui-btn-sm rcui-btn-primary transBtn" data-index="0">
            <i class="rcui-icon rcui-icon-next"></i>
        </div>
        <div class="rcui-btn rcui-btn-sm rcui-btn-primary transBtn" data-index="1">
            <i class="rcui-icon rcui-icon-prev"></i>
        </div>
    </div>
    <div class="rcui-transfer-box" data-index="1" style="height: 210px;">
        <div class="rcui-transfer-header">
            <div class="rcui-unselect rcui-form-checkbox" lay-skin="primary" style="padding-left: 0px;">
                <div>已选择</div>
            </div>
        </div>
        <ul class="rcui-transfer-data rightListPanel" style="height: 155px;">
            <p class="rcui-none rcui-hide rightNone">未选择点位</p>
        </ul>
    </div>`;
    this.root.appendChild(div);
    this.leftSearchInput = this.root.querySelector('input.leftSearchInput');
    this.leftListPanel = this.root.querySelector('ul.leftListPanel');
    this.rightListPanel = this.root.querySelector('ul.rightListPanel');
    this.leftNoneEl = this.root.querySelector('p.leftNone');
    this.rightNoneEl = this.root.querySelector('p.rightNone');
    this.renderLeftList();
    this.renderRightList();
    mxEvent.addListener(this.leftSearchInput, 'input', mxUtils.bind(this, function (evt) {
        let str = evt.target.value;
        if (this.leftList.length > 0) {
            let itemLis = this.leftListPanel.querySelectorAll('li.itemLi');
            let hideCount = 0;
            for (let i = 0; i < itemLis.length; i++) {
                if (str.length > 0) {
                    let s = this.leftList[i].title.search(str) !== -1;
                    if (s) {
                        mxUtils.removeStyleClass(itemLis[i], 'rcui-hide');
                    } else {
                        mxUtils.addStyleClass(itemLis[i], 'rcui-hide');
                        hideCount++;
                    }
                } else {
                    mxUtils.removeStyleClass(itemLis[i], 'rcui-hide');
                }
            }
            if (hideCount === this.leftList.length) {
                mxUtils.removeStyleClass(this.leftNoneEl, 'rcui-hide');
                this.leftNoneEl.innerText = str.length > 0 ? '未匹配数据' : '暂无点位';
            } else {
                mxUtils.addStyleClass(this.leftNoneEl, 'rcui-hide');
            }
        } else {
            mxUtils.removeStyleClass(this.leftNoneEl, 'rcui-hide');
            this.leftNoneEl.innerText = str.length > 0 ? '未匹配数据' : '暂无点位';
        }
    }));

    let str = this.leftSearchInput.value;
    let hideCount = 0;
    if (this.leftList.length > 0) {
        let itemLis = this.leftListPanel.querySelectorAll('li.itemLi');
        for (let i = 0; i < itemLis.length; i++) {
            itemLis[i].cusClickListener = mxUtils.bind(this, function (evt) {
                this.leftItemClickListener(evt);
            });
            mxEvent.addListener(itemLis[i], 'click', itemLis[i].cusClickListener);
            if (str.length > 0) {
                let s = this.leftList[i].title.search(str) !== -1;
                if (s) {
                    mxUtils.removeStyleClass(itemLis[i], 'rcui-hide');
                } else {
                    mxUtils.addStyleClass(itemLis[i], 'rcui-hide');
                    hideCount++;
                }
            }
        }
    }
    if (hideCount === this.leftList.length) {
        mxUtils.removeStyleClass(this.leftNoneEl, 'rcui-hide');
        this.leftNoneEl.innerText = str.length > 0 ? '未匹配数据' : '暂无点位';
    } else {
        mxUtils.addStyleClass(this.leftNoneEl, 'rcui-hide');
    }

    if (this.rightList.length > 0) {
        let itemLis = this.rightListPanel.querySelectorAll('li.itemLi');
        for (let i = 0; i < itemLis.length; i++) {
            itemLis[i].cusClickListener = mxUtils.bind(this, function (evt) {
                this.rightItemClickListener(evt);
            });
            mxEvent.addListener(itemLis[i], 'click', itemLis[i].cusClickListener);
        }
        mxUtils.addStyleClass(this.rightNoneEl, 'rcui-hide');
    } else {
        mxUtils.removeStyleClass(this.rightNoneEl, 'rcui-hide');
        this.rightNoneEl.innerText = '未选择点位';
    }
    this.setDisable(this.disable);
};
RCTransferBoxCell.prototype.setDisable = function (disable) {
    this.disable = disable;
    if (this.disable) {
        this.leftSearchInput.setAttribute('disabled', '');
    } else {
        this.leftSearchInput.removeAttribute('disabled');
    }
    let transBtns = this.root.querySelectorAll('div.transBtn');
    for (let i = 0; i < transBtns.length; i++) {
        if (this.disable) {
            mxUtils.addStyleClass(transBtns[i], 'rcui-btn-disabled');
        } else {
            mxUtils.removeStyleClass(transBtns[i], 'rcui-btn-disabled');
        }
    }
}
RCTransferBoxCell.prototype.renderLeftList = function () {
    let checkedKeys = this.getValueFn();
    checkedKeys = checkedKeys ? checkedKeys : [];
    this.config.options.map((item) => {
        if (checkedKeys.length <= 0 || checkedKeys.indexOf(item.key) < 0) {
            this.leftList.push({ ...item });
        }
    });
    this.leftList.map((item, i) => {
        let li = this.createTag('li', 'itemLi');
        li.setAttribute('data-itemkey', item.key);
        li.innerHTML = `<div class="rcui-unselect rcui-form-checkbox" lay-skin="primary" style="padding-left: 0px;">
                        <div>${item.title}</div>
                    </div>`;
        this.leftListPanel.appendChild(li);
    });
}

RCTransferBoxCell.prototype.leftItemClickListener = function (evt) {
    if (this.disable) return;

    let li = evt.target;
    if (li.localName !== 'li') {
        li = li.parentElement;
    }
    if (li.localName !== 'li') {
        li = li.parentElement;
    }
    if (li.localName !== 'li') {
        li = li.parentElement;
    }
    const itemId = li.getAttribute('data-itemkey');
    const itemObj = this.leftList.find(item => item.key == itemId);
    this.leftList.splice(this.leftList.indexOf(itemObj), 1);
    this.rightList.push(itemObj);
    mxEvent.removeListener(li, 'click', li.cusClickListener);
    li.cusClickListener = mxUtils.bind(this, function (evt) {
        this.rightItemClickListener(evt);
    });
    mxEvent.addListener(li, 'click', li.cusClickListener);
    if (this.leftList.length <= 0) {
        mxUtils.removeStyleClass(this.leftNoneEl, 'rcui-hide');
        this.leftNoneEl.innerText = this.leftSearchInput.value ? '未匹配数据' : '暂无点位';
    }
    mxUtils.addStyleClass(this.rightNoneEl, 'rcui-hide');
    this.setValueFn(this.rightList, evt);
    if (this.config && typeof this.config.onChange === 'function') {
        try { this.config.onChange(this.rightList, evt); } catch (e) { }
    }
    this.leftListPanel.removeChild(li);
    this.rightListPanel.appendChild(li);
};

RCTransferBoxCell.prototype.renderRightList = function (search) {
    console.log('渲染虚拟变量已选择数据点位');
    let checkedKeys = this.getValueFn();
    checkedKeys = checkedKeys ? checkedKeys : [];
    this.config.options.map((item) => {
        if (checkedKeys.length > 0 && checkedKeys.indexOf(item.key) > -1) {
            this.rightList.push({ ...item });
        }
    });
    this.rightList.map((item, i) => {
        let li = this.createTag('li', 'itemLi');
        li.setAttribute('data-itemkey', item.key);
        li.innerHTML = `<div class="rcui-unselect rcui-form-checkbox" lay-skin="primary" style="padding-left: 0px;">
                        <div>${item.title}</div>
                    </div>`;
        this.rightListPanel.appendChild(li);
    });
};
RCTransferBoxCell.prototype.rightItemClickListener = function (evt) {
    if (this.disable) return;
    let li = evt.target;
    if (li.localName !== 'li') {
        li = li.parentElement;
    }
    if (li.localName !== 'li') {
        li = li.parentElement;
    }
    if (li.localName !== 'li') {
        li = li.parentElement;
    }
    const itemId = li.getAttribute('data-itemkey');
    const itemObj = this.rightList.find(item => item.key == itemId);
    this.rightList.splice(this.rightList.indexOf(itemObj), 1);
    this.leftList.push(itemObj);

    mxEvent.removeListener(li, 'click', li.cusClickListener);
    li.cusClickListener = mxUtils.bind(this, function (evt) {
        this.leftItemClickListener(evt);
    });
    mxEvent.addListener(li, 'click', li.cusClickListener);

    if (this.leftList.length > 0) {
        mxUtils.addStyleClass(this.leftNoneEl, 'rcui-hide');
    }
    if (this.rightList.length < 1) {
        mxUtils.removeStyleClass(this.rightNoneEl, 'rcui-hide');
        this.rightNoneEl.innerText = '未选择点位';
    }
    this.setValueFn(this.rightList, evt);
    if (this.config && typeof this.config.onChange === 'function') {
        try { this.config.onChange(this.rightList, evt); } catch (e) { }
    }
    this.rightListPanel.removeChild(li);
    this.leftListPanel.appendChild(li);
};


function RCCodeEditorCell(editorUi, config = {}, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    if (this.config.disable !== null && this.config.disable !== undefined) {
        this.disable = this.config.disable;
    }
    this.init();
}

mxUtils.extend(RCCodeEditorCell, BaseWidget);

RCCodeEditorCell.prototype.init = function () {
    console.log('渲染自定义算法');
    this.root = this.createTag('div', 'rcui-line-row-block');
    let div = this.createTag('div');
    div.style.width = '100%';
    let textarea = this.createTag('textarea');
    div.appendChild(textarea);
    this.root.appendChild(div);
    this.coder = CodeMirror.fromTextArea(textarea, {
        readOnly: this.disable ? 'nocursor' : false,
        mode: 'javascript', //设置编译器编程语言关联内容，需要引入mode/javascript/javascript.js
        autofocus: true, //初始时是否自动获取焦点boolean
        lineNumbers: true, //显示行号
        smartIndent: true, //自动缩进是否开启
        indentUnit: 4, //缩进单位
        theme: 'monokai', //设置主题
        styleActiveLine: true, //设置光标所在行高亮，需要引入addon/selection/active-line.js
        // keyMap: 'sublime', // 快捷键，default使用默认快捷键，除此之外包括emacs，sublime，vim快捷键，使用需引入工
        // extraKeys: {'Ctrl-Q': 'autocomplete'}, //设置快捷键
    });
    //console.log(this.coder);
    this.coder.display.scroller.style.width = '469px';
    this.coder.display.gutters.style.width = '31px';
    this.coder.display.sizer.style.marginLeft = '31px';
    this.coder.setSize(470, 400);
    let value = this.getValueFn();
    if (value && value.trim().length > 0) {
        this.coder.setValue(value);
    }
    this.coder.on('blur', mxUtils.bind(this, function (evt) {
        this.setValueFn(this.coder.getValue());
    }));
    setTimeout(() => {
        this.coder.refresh();
    }, 1);
}

RCCodeEditorCell.prototype.setDisable = function (disable) {
    this.disable = disable;
    //设置编译器属性
    this.coder.setOption("readOnly", this.disable);
    setTimeout(() => {
        this.coder.refresh();
    }, 1);
}

function RCCustomCodeEditorCell(editorUi, config = {}, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    if (this.config.disable !== null && this.config.disable !== undefined) {
        this.disable = this.config.disable;
    }
    this.init();
}

mxUtils.extend(RCCustomCodeEditorCell, BaseWidget);

RCCustomCodeEditorCell.prototype.init = function () {
    console.log('渲染自定义算法');
    this.root = this.createTag('div', 'rcui-line-row-block');
    this.root.style.width = '350px';
    let div = this.createTag('div');
    div.style.width = '100%';
    div.style.height = '100%';
    let textarea = this.createTag('textarea');
    div.appendChild(textarea);
    this.root.appendChild(div);
    this.customCoder = CodeMirror.fromTextArea(textarea, {
        readOnly: this.disable ? 'nocursor' : false,
        mode: 'javascript', //设置编译器编程语言关联内容，需要引入mode/javascript/javascript.js
        autofocus: true, //初始时是否自动获取焦点boolean
        lineNumbers: true, //显示行号
        smartIndent: true, //自动缩进是否开启
        indentUnit: 2, //缩进单位
        theme: 'monokai', //设置主题
        styleActiveLine: true, //设置光标所在行高亮，需要引入addon/selection/active-line.js
        // keyMap: 'sublime', // 快捷键，default使用默认快捷键，除此之外包括emacs，sublime，vim快捷键，使用需引入工
        // extraKeys: {'Ctrl-Q': 'autocomplete'}, //设置快捷键
    });
    //console.log(this.coder);
    this.customCoder.display.scroller.style.width = '100%';
    this.customCoder.display.gutters.style.width = '31px';
    this.customCoder.display.sizer.style.marginLeft = '31px';
    this.customCoder.setSize(320, 450);
    let value = this.getValueFn();
    if (value && value.trim().length > 0) {
        this.customCoder.setValue(value);
    }
    this.customCoder.on('blur', mxUtils.bind(this, function (evt) {
        this.setValueFn(this.customCoder.getValue());
    }));
    setTimeout(() => {
        this.customCoder.refresh();
    }, 1);
}

RCCustomCodeEditorCell.prototype.setDisable = function (disable) {
    this.disable = disable;
    //设置编译器属性
    this.customCoder.setOption("readOnly", this.disable);
    setTimeout(() => {
        this.customCoder.refresh();
    }, 1);
}

function RightButtonCell(editorUi, config = {}) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    if (this.config.disable !== null && this.config.disable !== undefined) {
        this.disable = this.config.disable;
    }
    this.init();
};
mxUtils.extend(RightButtonCell, BaseWidget);

RightButtonCell.prototype.init = function () {
    const rowBlockDiv = this.createTag('div', 'rcui-line-row-block');
    const rightBtnDiv = this.createTag('div', 'rightBtnsDiv');
    rightBtnDiv.style.cssText = `width:100%;height:100%;display: flex;flex-direction: row;align-items: center;justify-content: flex-end;`;
    if (this.config.btns && this.config.btns.length > 0) {
        for (let i = 0; i < this.config.btns.length; i++) {
            const btnObj = this.config.btns[i];
            const rightBtn = this.createTag('div', `rcui-btn rcui-btn-xs ${btnObj.typeClass ? btnObj.typeClass : ''}`);
            rightBtn.innerHTML = btnObj.label;
            if (btnObj.clickFn) {
                mxEvent.addListener(rightBtn, 'click', mxUtils.bind(this, function (evt) {
                    if (this.disable) return;
                    btnObj.clickFn(evt);
                }));
            }
            rightBtnDiv.appendChild(rightBtn);
        }
    }
    rowBlockDiv.appendChild(rightBtnDiv);
    this.root = rowBlockDiv;
}

RightButtonCell.prototype.setDisable = function (disable) {
    this.disable = disable;
}

function ChooseVirvarCell(editorUi, config = {}, getValueFn, setValueFn) {
    BaseWidget.call(this, editorUi);
    this.config = config;
    this.getValueFn = getValueFn;
    this.setValueFn = setValueFn;
    this.config.placeholder = this.config.placeholder ? this.config.placeholder : '请选择';
    if (this.config.disable !== null && this.config.disable !== undefined) {
        this.disable = this.config.disable;
    }
    this.init();
};
mxUtils.extend(ChooseVirvarCell, BaseWidget);

ChooseVirvarCell.prototype.init = function () {
    const rowBlockDiv = this.createTag('div', 'rcui-line-row-block');
    rowBlockDiv.innerHTML = `<div class="rcui-input-wrap">
    <div class="rcui-input-group" style="height:36px;display:flex;" >
        <input class="rcui-input" readonly="readonly" style="padding-right: 10px; cursor: pointer;" placeholder="${this.config.placeholder}" />
        <div class="rcui-input-split rcui-input-suffix" style="cursor: pointer;pointer-events: all;">
            <i class="rcui-icon rcui-icon-search"></i>
        </div>
    <div/>
<div/>`;
    const rowInput = rowBlockDiv.querySelector('input.rcui-input');
    const rowAction = rowBlockDiv.querySelector('div.rcui-input-suffix');
    this.rowInput = rowInput;
    this.rowAction = rowAction;
    let value = this.getValueFn();
    const json = this.editorUi.GLOBAL_CONFIG.device.virvarJson;
    this.virvarList = json && json.length > 0 ? JSON.parse(json) : [];
    if (value) {
        let find = this.virvarList.find(item => item.id == value);
        if (find) this.rowInput.value = find.name;
    }
    const clickListener = mxUtils.bind(this, function (evt) {
        if (this.disable) return;
        this.editorUi.showChooseVirvarDialog({
            title: '选择虚拟变量',
            sureFn: mxUtils.bind(this, function (evt, dialog, virvar) {
                this.setValueFn(virvar.id, virvar);
                this.rowInput.value = virvar.name;
            }),
            cancelFn: mxUtils.bind(this, function (evt, dialog) { }),
        });
    });
    mxEvent.addListener(this.rowInput, 'click', clickListener);
    mxEvent.addListener(this.rowAction, 'click', clickListener);

    this.root = rowBlockDiv;
    this.setDisable(this.disable);
};

ChooseVirvarCell.prototype.setDisable = function (disable) {
    this.disable = disable;
    if (this.disable) {
        this.rowInput.setAttribute('disabled', 'disabled');
    } else {
        this.rowInput.removeAttribute('disabled');
    }
}


