import { mxConstants, mxResources, mxEventObject, mxEvent, mxUtils, mxClient, mxRectangle, mxPopupMenu, mxCell, mxWindow, mxForm, mxGeometry, mxKeyHandler, mxPoint, mxConnectionConstraint, mxImage } from '../../core/mxgraph';
import { Graph } from '../Graph';
export default FilenameDialog;

function FilenameDialog(editorUi, filename, buttonText, fn, label, validateFn, content, helpLink, closeOnBtn, cancelFn, typeOfPass, promptTextValue, isFirstLoad) {
	var row, td;
	(isFirstLoad = null != isFirstLoad && isFirstLoad), (closeOnBtn = null == closeOnBtn || closeOnBtn);
	var table = document.createElement('table'),
		tbody = document.createElement('tbody');
	(row = document.createElement('tr')), ((td = document.createElement('td')).style.whiteSpace = 'nowrap'), (td.style.fontSize = '10pt'), (td.style.width = '120px'), mxUtils.write(td, (label || mxResources.get('filename')) + ':'), row.appendChild(td);
	var nameInput = document.createElement('input');
	nameInput.setAttribute('value', filename || ''), nameInput.setAttribute('type', typeOfPass || 'text'), (nameInput.style.marginLeft = '4px'), (nameInput.style.width = '180px'), (nameInput.id = 'usr_dialog_input_value');
	var genericBtn = mxUtils.button(buttonText, function () {
		(null == validateFn || validateFn(nameInput.value)) && (closeOnBtn && editorUi.hideDialog(), fn(nameInput.value));
	});
	if (
		((genericBtn.className = 'geBtn gePrimaryBtn'),
		(this.init = function () {
			if ((null != label || null == content) && (nameInput.focus(), mxClient.IS_GC || mxClient.IS_FF || document.documentMode >= 5 || mxClient.IS_QUIRKS ? nameInput.select() : document.execCommand('selectAll', !1, null), Graph.fileSupport)) {
				var dlg = table.parentNode,
					dropElt = (editorUi.editor.graph, null);
				mxEvent.addListener(dlg, 'dragleave', function (evt) {
					null != dropElt && ((dropElt.style.backgroundColor = ''), (dropElt = null)), evt.stopPropagation(), evt.preventDefault();
				}),
					mxEvent.addListener(
						dlg,
						'dragover',
						mxUtils.bind(this, function (evt) {
							null == dropElt && (!mxClient.IS_IE || document.documentMode > 10) && ((dropElt = nameInput).style.backgroundColor = '#ebf2f9'), evt.stopPropagation(), evt.preventDefault();
						})
					),
					mxEvent.addListener(
						dlg,
						'drop',
						mxUtils.bind(this, function (evt) {
							null != dropElt && ((dropElt.style.backgroundColor = ''), (dropElt = null)), mxUtils.indexOf(evt.dataTransfer.types, 'text/uri-list') >= 0 && ((nameInput.value = decodeURIComponent(evt.dataTransfer.getData('text/uri-list'))), genericBtn.click()), evt.stopPropagation(), evt.preventDefault();
						})
					);
			}
		}),
		(td = document.createElement('td')).appendChild(nameInput),
		row.appendChild(td),
		(null == label && null != content) || tbody.appendChild(row),
		promptTextValue)
	) {
		var promptDiv = document.createElement('tr');
		promptDiv.style.height = '30px';
		var promptText = document.createElement('td');
		promptText.setAttribute('colspan', '2'), (promptText.style.color = '#FF0000'), (promptText.id = 'usr_dialog_prompt_value'), mxUtils.write(promptText, promptTextValue), promptDiv.appendChild(promptText), tbody.appendChild(promptDiv);
	}
	null != content && ((row = document.createElement('tr')), ((td = document.createElement('td')).colSpan = 2), td.appendChild(content), row.appendChild(td), tbody.appendChild(row)), (row = document.createElement('tr')), ((td = document.createElement('td')).colSpan = 2), (td.style.paddingTop = promptTextValue ? '0px' : '20px'), (td.style.whiteSpace = 'nowrap'), td.setAttribute('align', 'right');
	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
		label != mxResources.get('inputPassword') || window.editor.editable ? editorUi.hideDialog() : window.history.back(), null != cancelFn && cancelFn();
	});
	if (((cancelBtn.className = 'geBtn'), editorUi.editor.cancelFirst && !isFirstLoad && td.appendChild(cancelBtn), null != helpLink)) {
		var helpBtn = mxUtils.button(mxResources.get('help'), function () {
			editorUi.editor.graph.openLink(helpLink);
		});
		(helpBtn.className = 'geBtn'), td.appendChild(helpBtn);
	}
	mxEvent.addListener(nameInput, 'keypress', function (e) {
		13 == e.keyCode && genericBtn.click();
	}),
		td.appendChild(genericBtn),
		editorUi.editor.cancelFirst || td.appendChild(cancelBtn),
		row.appendChild(td),
		tbody.appendChild(row),
		table.appendChild(tbody),
		(this.container = table);
}
