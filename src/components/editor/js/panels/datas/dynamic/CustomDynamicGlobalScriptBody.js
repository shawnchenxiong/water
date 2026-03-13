/* eslint-disable */

import BaseFormatPanel from "../../BaseFormatPanel";
import {mxUtils} from "../../../../core/mxgraph";

export default CustomDynamicGlobalScriptBody;

function CustomDynamicGlobalScriptBody(format, prop) {
    BaseFormatPanel.call(this, format, format.editorUi, this.createTag('div', 'rcui-dynamic-script-panel-custom'));
    this.prop = prop;
    const graph = this.editorUi.editor.graph;
    this.rootCell = graph.getModel().getRoot();
    this.script = prop.script ? prop.script : null;
    this.cellId = prop.cellId ? prop.cellId : null;
    this.disable = false;
    this.container.style.height = '450px';
    this.container.style.padding = '0 10px';
    this.container.style.boxSizing = 'border-box';
    this.container.style.marginTop = '5px';
    this.init();
}

mxUtils.extend(CustomDynamicGlobalScriptBody, BaseFormatPanel);

CustomDynamicGlobalScriptBody.prototype.init = function () {
    const graph = this.editorUi.editor.graph;
    this.codeContainer = this.createTag('div', 'rcui-line-row-block');
    this.codeContainer.style.height = '450px';
    this.codeContainer.style.width = '100%';
    const setCustomFuncRow = this.createRCCustomCodeEditorCell({
            disabled: false,
        },
        mxUtils.bind(this, function () {
            return this.prop.script
                ? this.prop.script
                : (() => {
                    try {
                        // 确保 this.chartOption 是一个有效的 JSON 对象
                        const annotation =
                            `/** 注意! \n` +
                            `  * 1. 如果想调用系统内置的部分公共接口, 请使用 sandbox.api.getXXX() 方法前面要使用 'sandbox.' 再加你想要的方法; \n` +
                            `  * 2. 如果想调用自定义的Ajax请求, 请使用 sandbox.$.ajax({}) 在大括号里面进行自定义操作; \n` +
                            `  * 3. 执行 MySql 语句查询及获取结果示例：\n` +
                            `  var sql = 'select * from table_name;'\n` +
                            `  const result = await sandbox.api.getDataByMysqlStatement(sql);\n` +
                            `  console.log('Data received:', result);\n` +
                            `  * 4. 执行 TdEngine 语句查询及获取结果示例：\n` +
                            `  var sql = 'SELECT * FROM  \`swkj\`.\`table_name\`;'\n` +
                            `  const result = await sandbox.api.getDataByTdStatement(sql);\n` +
                            `  console.log('Data received:', result);\n` +
                            `  * 5. 此处代码为全局脚本，目前还在优化中，暂时不需要返回任何方法;\n` +
                            `**/`;
                        // 拼接成完整的 JavaScript 代码
                        return `${annotation}\n`;
                    } catch (e) {
                        // 如果解析失败，返回原始字符串（或处理错误）
                        console.error('Failed to parse or format chartOption:', e);
                        return ``;
                    }
                })();
        }), mxUtils.bind(this, function (value, evt) {
            this.prop.script = value;
        }));

    this._customCodeEditorCell = setCustomFuncRow;
    this.codeContainer.appendChild(setCustomFuncRow.root);

    this.container.appendChild(this.codeContainer);
    this.showHideRowView()
};
CustomDynamicGlobalScriptBody.prototype.showHideRowView = function () {
    mxUtils.hideElement(this.codeContainer.root);
}
