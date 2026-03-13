/* eslint-disable */
import { mxUtils, mxResources } from '../../core/mxgraph';

export default function ControlPanelSaveDialog(ui, defaultName, title, fn) {
    var div = document.createElement('div');
    // div.style.padding = '10px';  // Optional padding

    var table = document.createElement('table');
    var tbody = document.createElement('tbody');
    table.style.marginTop = '8px';
    // table.style.width = '100%'; // Make table take width

    var row = document.createElement('tr');
    var td = document.createElement('td');
    td.style.fontSize = '10pt';
    td.style.width = '100px';
    td.style.whiteSpace = 'nowrap';
    mxUtils.write(td, '面板名称:');
    row.appendChild(td);

    td = document.createElement('td');
    var nameInput = document.createElement('input');
    nameInput.setAttribute('value', defaultName || '');
    nameInput.style.width = '200px';
    td.appendChild(nameInput);
    row.appendChild(td);
    tbody.appendChild(row);

    // Spacer row
    var spacerRow = document.createElement('tr');
    var spacerTd = document.createElement('td');
    spacerTd.setAttribute('colspan', '2');
    spacerTd.style.height = '10px';
    spacerRow.appendChild(spacerTd);
    tbody.appendChild(spacerRow);


    row = document.createElement('tr');
    td = document.createElement('td');
    td.style.fontSize = '10pt';
    mxUtils.write(td, '存储位置:');
    row.appendChild(td);

    td = document.createElement('td');
    td.style.fontSize = '10pt';
    td.style.display = 'flex';           // Use flex for alignment
    td.style.alignItems = 'center';

    var localRadio = document.createElement('input');
    localRadio.setAttribute('type', 'radio');
    localRadio.setAttribute('name', 'storageType');
    localRadio.setAttribute('value', 'local');
    localRadio.setAttribute('id', 'cp_save_local');
    // localRadio.checked = true; // Changed default

    var localLabel = document.createElement('label');
    localLabel.setAttribute('for', 'cp_save_local');
    mxUtils.write(localLabel, '本地');
    localLabel.style.marginRight = '15px';
    localLabel.style.marginLeft = '5px';

    var remoteRadio = document.createElement('input');
    remoteRadio.setAttribute('type', 'radio');
    remoteRadio.setAttribute('name', 'storageType');
    remoteRadio.setAttribute('value', 'remote');
    remoteRadio.setAttribute('id', 'cp_save_remote');
    remoteRadio.checked = true; // Set default to remote

    var remoteLabel = document.createElement('label');
    remoteLabel.setAttribute('for', 'cp_save_remote');
    mxUtils.write(remoteLabel, '后端');
    remoteLabel.style.marginLeft = '5px';

    td.appendChild(localRadio);
    td.appendChild(localLabel);
    td.appendChild(remoteRadio);
    td.appendChild(remoteLabel);
    row.appendChild(td);

    tbody.appendChild(row);
    table.appendChild(tbody);
    div.appendChild(table);

    // Buttons
    var btnContainer = document.createElement('div');
    btnContainer.style.marginTop = '20px';
    btnContainer.style.textAlign = 'right';

    var okBtn = mxUtils.button(mxResources.get('save'), function () {
        var name = nameInput.value;
        if (name == null || name.length === 0) {
            name = defaultName || '';
        }
        var type = localRadio.checked ? 'local' : 'remote';

        // Hide dialog first
        ui.hideDialog();

        // Callback
        fn(name, type);
    });
    okBtn.className = 'geBtn gePrimaryBtn';

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        ui.hideDialog();
    });
    cancelBtn.className = 'geBtn';

    btnContainer.appendChild(okBtn);
    btnContainer.appendChild(cancelBtn);
    div.appendChild(btnContainer);

    this.container = div; // Use div as container
};
