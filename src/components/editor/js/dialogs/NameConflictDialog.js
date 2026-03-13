
export function NameConflictDialog(editorUi, message, renameFn, replaceFn, cancelFn) {
    var div = document.createElement('div');
    div.style.textAlign = 'center';

    var p2 = document.createElement('div');
    p2.style.padding = '6px';
    p2.style.overflow = 'auto';
    p2.style.maxHeight = '60px'; // Slightly taller
    mxUtils.write(p2, message);
    div.appendChild(p2);

    var btns = document.createElement('div');
    btns.style.textAlign = 'center';
    btns.style.whiteSpace = 'nowrap';
    btns.style.marginTop = '16px';
    btns.style.display = 'flex'; // Use flex for better button distribution 
    btns.style.justifyContent = 'space-around';
    btns.style.padding = '0 10px';

    // Replace Button
    var replaceBtn = mxUtils.button(mxResources.get('replace') || '覆盖', function () {
        editorUi.hideDialog();
        if (replaceFn) replaceFn();
    });
    replaceBtn.className = 'geBtn gePrimaryBtn';
    replaceBtn.style.minWidth = '70px';

    // Rename Button
    var renameBtn = mxUtils.button('自动重命名', function () {
        editorUi.hideDialog();
        if (renameFn) renameFn();
    });
    renameBtn.className = 'geBtn';
    renameBtn.style.minWidth = '70px';

    // Cancel Button
    var cancelBtn = mxUtils.button(mxResources.get('cancel') || '取消', function () {
        editorUi.hideDialog();
        if (cancelFn) cancelFn();
    });
    cancelBtn.className = 'geBtn';
    cancelBtn.style.minWidth = '70px';


    // Order: Replace | Rename | Cancel
    btns.appendChild(replaceBtn);
    btns.appendChild(renameBtn);
    btns.appendChild(cancelBtn);

    div.appendChild(btns);

    this.container = div;
}
