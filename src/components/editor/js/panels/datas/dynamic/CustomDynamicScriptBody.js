/* eslint-disable */

import BaseFormatPanel from "../../BaseFormatPanel";
import {mxUtils} from "../../../../core/mxgraph";

export default CustomDynamicScriptBody;

function CustomDynamicScriptBody(format, prop) {
    BaseFormatPanel.call(this, format, format.editorUi, this.createTag('div', 'rcui-dynamic-script-panel-custom'));
    this.prop = prop;
    this.chartOption = prop.chartOption ? prop.chartOption : null;
    this.script = prop.script ? prop.script : null;
    this.cellId = prop.cellId ? prop.cellId : null;
    this.disable = false;
    this.container.style.height = '450px';
    this.container.style.padding = '0 10px';
    this.container.style.boxSizing = 'border-box';
    this.container.style.marginTop = '5px';
    this.init();
}

mxUtils.extend(CustomDynamicScriptBody, BaseFormatPanel);

CustomDynamicScriptBody.prototype.init = function () {
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
                        const chartOptionObject = JSON.parse(this.chartOption);

                        // 手动构建 JavaScript 对象字符串
                        const buildObjectString = (obj, indent = 0) => {
                            const indentStr = '  '.repeat(indent);
                            if (Array.isArray(obj)) {
                                if (obj.length === 0) return '[]';
                                return `[\n${obj.map(item => `${indentStr}  ${buildObjectString(item, indent + 1)}`).join(',\n')}\n${indentStr}]`;
                            } else if (typeof obj === 'object' && obj !== null) {
                                const keys = Object.keys(obj);
                                if (keys.length === 0) return '{}';
                                const keyValuePairs = keys.map(key => {
                                    const value = obj[key];
                                    if (typeof value === 'object' && value !== null) {
                                        return `${indentStr}  ${key}: ${buildObjectString(value, indent + 1)}`;
                                    } else {
                                        return `${indentStr}  ${key}: ${JSON.stringify(value)}`;
                                    }
                                });
                                return `{\n${keyValuePairs.join(',\n')}\n${indentStr}}`;
                            } else {
                                return JSON.stringify(obj);
                            }
                        };

                        const chartOptionString = buildObjectString(chartOptionObject);
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
                            `  * 5. 最后一行, 要用 return JSON.stringify(option); 返回echarts图表的数据, 否则会无法渲染图表;\n` +
                            `**/`;
                        // 拼接成完整的 JavaScript 代码
                        return `${annotation}\nvar option = ${chartOptionString};\nreturn JSON.stringify(option);`;
                    } catch (e) {
                        // 如果解析失败，返回原始字符串（或处理错误）
                        console.error('Failed to parse or format chartOption:', e);
                        return `var option = ${this.chartOption};\nreturn JSON.stringify(option);`;
                    }
                })();
        }), mxUtils.bind(this, function (value, evt) {
            this.prop.script = value;
            if (!(typeof window !== 'undefined' && window.__rcSuppressAutoSaveDynamicData)) {
                if (this.format && this.format.autoSaveDynamicData) {
                    this.format.autoSaveDynamicData();
                }
            }
        }));

    this._customCodeEditorCell = setCustomFuncRow;
    // const setCustomFuncRow = this.createRCCustomCodeEditorCell({
    //         disabled: false,
    //     },
    //     mxUtils.bind(this, function () {
    //         return this.prop.script
    //             ? this.prop.script
    //             : (() => {
    //                 try {
    //                     // 确保 this.chartOption 是一个有效的 JSON 对象
    //                     const chartOptionObject = JSON.parse(this.chartOption);
    //
    //                     // 手动构建 JavaScript 对象字符串
    //                     const buildObjectString = (obj) => {
    //                         if (Array.isArray(obj)) {
    //                             return `[ ${obj.map(buildObjectString).join(', ')} ]`;
    //                         } else if (typeof obj === 'object' && obj !== null) {
    //                             const keys = Object.keys(obj);
    //                             const keyValuePairs = keys.map(key => {
    //                                 const value = obj[key];
    //                                 if (typeof value === 'object' && value !== null) {
    //                                     return `${key}: ${buildObjectString(value)}`;
    //                                 } else {
    //                                     return `${key}: ${JSON.stringify(value)}`;
    //                                 }
    //                             });
    //                             return `{ ${keyValuePairs.join(', ')} }`;
    //                         } else {
    //                             return JSON.stringify(obj);
    //                         }
    //                     };
    //
    //                     const chartOptionString = buildObjectString(chartOptionObject);
    //
    //                     // 拼接成完整的 JavaScript 代码
    //                     return `var option = ${chartOptionString};\nreturn option;`;
    //                 } catch (e) {
    //                     // 如果解析失败，返回原始字符串（或处理错误）
    //                     console.error('Failed to parse or format chartOption:', e);
    //                     return `var option = ${this.chartOption};\nreturn option;`;
    //                 }
    //             })();
    //     }), mxUtils.bind(this, function (value, evt) {
    //         this.prop.script = value;
    //     }));

    // const setCustomFuncRow = this.createRCCustomCodeEditorCell({
    //         disabled: false,
    //     },
    //     mxUtils.bind(this, function () {
    //         return this.prop.script
    //             ? this.prop.script
    //             : (() => {
    //                 try {
    //                     // 确保 this.chartOption 是一个有效的对象
    //                     const chartOptionObject = this.chartOption;
    //
    //                     // 使用 JSON.stringify 格式化对象字符串
    //                     const chartOptionString = JSON.stringify(chartOptionObject, null, 2);
    //
    //                     // 拼接成完整的 JavaScript 代码
    //                     return `var option = ${chartOptionString};\nreturn option;`;
    //                 } catch (e) {
    //                     // 如果解析失败，返回原始字符串（或处理错误）
    //                     console.error('Failed to parse or format chartOption:', e);
    //                     return `var option = ${this.chartOption};\nreturn option;`;
    //                 }
    //             })();
    //     }), mxUtils.bind(this, function (value, evt) {
    //         this.prop.script = value;
    //     }));


    this.codeContainer.appendChild(setCustomFuncRow.root);

    this.container.appendChild(this.codeContainer);
    this.showHideRowView()
};
CustomDynamicScriptBody.prototype.showHideRowView = function () {
    mxUtils.hideElement(this.codeContainer.root);
}
