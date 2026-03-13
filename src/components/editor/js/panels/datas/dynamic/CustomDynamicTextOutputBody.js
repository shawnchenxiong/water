/* eslint-disable */

import BaseFormatPanel from "../../BaseFormatPanel";
import { mxEventObject, mxUtils } from "../../../../core/mxgraph";

export default CustomDynamicTextOutputBody;

function CustomDynamicTextOutputBody(format, prop) {
    BaseFormatPanel.call(this, format, format.editorUi, this.createTag('div', 'rcui-dynamic-data-panel-custom'));
    this.prop = prop;
    this.container.style.padding = '0 10px';
    this.container.style.boxSizing = 'border-box';
    this.container.style.marginTop = '5px';
    this.init();
}

mxUtils.extend(CustomDynamicTextOutputBody, BaseFormatPanel);

CustomDynamicTextOutputBody.prototype.init = function () {
    const prop = this.prop;

    // 定制选项逻辑
    let options = [
        { key: 0, title: '原值输出' },
        { key: 1, title: '只带前缀文本' },
        { key: 2, title: '只带后缀文本' },
        { key: 3, title: '带前后缀文本' },
    ];

    if (prop.dpropKey === 'progressSliderValues') {
        options = [
            { key: 0, title: '原值输出' },
            { key: 1, title: '百分比输出' },
        ];
    }

    const setOutputType = this.createLabelCellRowSelect(prop.name, {
        options: options
    }, mxUtils.bind(this, function () {
        return prop.outputType;
    }), mxUtils.bind(this, function (val, evt) {
        prop.outputType = val.key;

        // 特殊处理：如果是进度滑块，同步到样式属性 sliderTextMode
        if (prop.dpropKey === 'progressSliderValues') {
            const graph = this.editorUi.editor.graph;
            const cells = graph.getSelectionCells();

            // 宽松比较，防止类型不匹配 (例如 "1" vs 1)
            const mode = (val.key == 1) ? 'percent' : 'value';

            console.log(`[ProgressSlider] Switching mode. Key: ${val.key}, Mode: ${mode}, Cells: ${cells.length}`);

            graph.setCellStyles('sliderTextMode', mode, cells);

            // 强制刷新视图
            graph.refresh();

            // 进度滑块不需要前后缀配置，强制隐藏
            mxUtils.addStyleClass(setPrefixRow.root, 'rcui-hide');
            mxUtils.addStyleClass(setSuffixRow.root, 'rcui-hide');

            // 数据变化时自动保存
            if (this.format && this.format.autoSaveDynamicData) {
                this.format.autoSaveDynamicData();
            }
            return;
        }

        // 数据变化时自动保存
        if (this.format && this.format.autoSaveDynamicData) {
            this.format.autoSaveDynamicData();
        }
        if (prop.outputType == 0) {
            mxUtils.addStyleClass(setPrefixRow.root, 'rcui-hide');
            mxUtils.addStyleClass(setSuffixRow.root, 'rcui-hide');
        } else if (prop.outputType == 1) {
            mxUtils.removeStyleClass(setPrefixRow.root, 'rcui-hide');
            mxUtils.addStyleClass(setSuffixRow.root, 'rcui-hide');
        } else if (prop.outputType == 2) {
            mxUtils.addStyleClass(setPrefixRow.root, 'rcui-hide');
            mxUtils.removeStyleClass(setSuffixRow.root, 'rcui-hide');
        } else {
            mxUtils.removeStyleClass(setPrefixRow.root, 'rcui-hide');
            mxUtils.removeStyleClass(setSuffixRow.root, 'rcui-hide');
        }
    }));

    const setPrefixRow = this.createLabelCellRowInput('前缀文本', {
        type: 'text',
    }, mxUtils.bind(this, function () {
        return prop.prefix;
    }), mxUtils.bind(this, function (value) {
        prop.prefix = value;
        // 数据变化时自动保存
        if (this.format && this.format.autoSaveDynamicData) {
            this.format.autoSaveDynamicData();
        }
    }));
    const setSuffixRow = this.createLabelCellRowInput('后缀文本', {
        type: 'text',
    }, mxUtils.bind(this, function () {
        return prop.suffix;
    }), mxUtils.bind(this, function (value) {
        prop.suffix = value;
        // 数据变化时自动保存
        if (this.format && this.format.autoSaveDynamicData) {
            this.format.autoSaveDynamicData();
        }
    }));

    this.container.appendChild(setOutputType.root);
    this.container.appendChild(setPrefixRow.root);
    this.container.appendChild(setSuffixRow.root);

    if (prop.outputType == 0) {
        mxUtils.addStyleClass(setPrefixRow.root, 'rcui-hide');
        mxUtils.addStyleClass(setSuffixRow.root, 'rcui-hide');
    } else if (prop.outputType == 1) {
        mxUtils.removeStyleClass(setPrefixRow.root, 'rcui-hide');
        mxUtils.addStyleClass(setSuffixRow.root, 'rcui-hide');
    } else if (prop.outputType == 2) {
        mxUtils.addStyleClass(setPrefixRow.root, 'rcui-hide');
        mxUtils.removeStyleClass(setSuffixRow.root, 'rcui-hide');
    } else if (prop.dpropKey === 'progressSliderValues') {
        // 进度滑块强制隐藏前后缀
        mxUtils.addStyleClass(setPrefixRow.root, 'rcui-hide');
        mxUtils.addStyleClass(setSuffixRow.root, 'rcui-hide');
    } else {
        mxUtils.removeStyleClass(setPrefixRow.root, 'rcui-hide');
        mxUtils.removeStyleClass(setSuffixRow.root, 'rcui-hide');
    }
}
