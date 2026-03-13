/* eslint-disable */

import {mxUtils} from '../../core/mxgraph';
import BaseFormatPanel from "../panels/BaseFormatPanel";


export default BaseDialog;

/**
 * 格式面板的基类。
 */
function BaseDialog(editorUi, container) {
    BaseFormatPanel.call(this, null, editorUi, container);
}

mxUtils.extend(BaseDialog, BaseFormatPanel);