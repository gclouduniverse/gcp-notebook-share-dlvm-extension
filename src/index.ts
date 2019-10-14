import '../style/index.css'

import {
    URLExt
}
from '@jupyterlab/coreutils';

import {
    Widget
}
from "@phosphor/widgets";

import {
    Dialog
}
from "@jupyterlab/apputils";

import {
    IDisposable,
    DisposableDelegate
}
from '@phosphor/disposable';

import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin
}
from '@jupyterlab/application';

import {
    ToolbarButton
}
from '@jupyterlab/apputils';

import {
    DocumentRegistry
}
from '@jupyterlab/docregistry';

import {
    NotebookPanel,
    INotebookModel
}
from '@jupyterlab/notebook';

import {
    PageConfig
}
from '@jupyterlab/coreutils';

import {
    ServerConnection
}
from '@jupyterlab/services';

/**
 * The plugin registration information.
 */
const buttonPlugin: JupyterFrontEndPlugin < void >  = {
    activate: activateButton,
    id: 'share:button',
    autoStart: true,
};

import {
    style
}
from 'typestyle'

export const iconStyle = style({
        backgroundImage: 'var(--jp-share-icon-train)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '16px'
    })

    /**
     * A notebook widget extension that adds a button to the toolbar.
     */
    export
    class ButtonExtension implements DocumentRegistry.IWidgetExtension < NotebookPanel, INotebookModel > {
    /**
     * Create a new extension object.
     */
    createNew(panel: NotebookPanel, context: DocumentRegistry.IContext < INotebookModel > ): IDisposable {
        let callback = () => {
            let notebook_path = panel.context.contentsModel.path;
            let full_notebook_path = PageConfig.getOption('serverRoot') + "/" + notebook_path
                let settings = ServerConnection.makeSettings();
            let fullUrl = URLExt.join(settings.baseUrl, "share_nb");
            const firstDialog = new Dialog({
                    title: 'Share Notebook',
                    body: new ShareNotebookFirstDialogForm(),
                    buttons: [
                        Dialog.cancelButton(),
                        Dialog.createButton({
                            label: 'Private'
                        }),
                        Dialog.createButton({
                            label: 'Public'
                        })
                    ]
                });
            const result = firstDialog.launch();
            result.then(result => {
                if (result.button.label == 'Private') {
                    const middialog = new Dialog({
                            title: 'Please, wait...',
                            buttons: []
                        });
                    middialog.launch();
                    let fullRequest = {
                        method: 'POST',
                        body: JSON.stringify({
                            "notebook_path": full_notebook_path,
                            "public": false
                        })
                    };
                    context.save().then(() => {
                        ServerConnection.makeRequest(fullUrl, fullRequest, settings).then(response => {
                            response.text().then(function processText(links: string) {
                                let linksObj = JSON.parse(links);
                                let sharingLink = linksObj["sharingLink"]
                                    let permissionsLink = linksObj["permissionsLink"]
                                    const dialog = new Dialog({
                                        title: 'Share Notebook',
                                        body: new ShareNotebookResultsForm(sharingLink, permissionsLink),
                                        buttons: [
                                            Dialog.okButton()
                                        ]
                                    });
                                middialog.reject();
                                dialog.launch();
                            })
                        });

                    });

                }
                if (result.button.label == 'Public') {
                    const middialog = new Dialog({
                            title: 'Please, wait...',
                            buttons: []
                        });
                    middialog.launch();
                    let fullRequest = {
                        method: 'POST',
                        body: JSON.stringify({
                            "notebook_path": full_notebook_path,
                            "public": true
                        })
                    };
                    context.save().then(() => {
                        ServerConnection.makeRequest(fullUrl, fullRequest, settings).then(response => {
                            response.text().then(function processText(links: string) {
                                let linksObj = JSON.parse(links);
                                let sharingLink = linksObj["sharingLink"]
                                    const dialog = new Dialog({
                                        title: 'Share Notebook',
                                        body: new ShareNotebookPublicResultsForm(sharingLink),
                                        buttons: [
                                            Dialog.okButton()
                                        ]
                                    });
                                middialog.reject();
                                dialog.launch();
                            })
                        });
                    });
                }
            });
        };
        let button = new ToolbarButton({
                className: 'backgroundTraining',
                iconClassName: iconStyle + ' jp-Icon jp-Icon-16 jp-ToolbarButtonComponent-icon',
                onClick: callback,
                tooltip: 'Share notebook state.'
            });
        panel.toolbar.insertItem(0, 'trainOnBackground', button);
        return new DisposableDelegate(() => {
            button.dispose();
        });
    }
}

function activateButton(app: JupyterFrontEnd) {
    console.log('JupyterLab share button extension is activated!');
    app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
}

class ShareNotebookResultsForm extends Widget {

    /**
     * Create a redirect form.
     */
    constructor(sharingLink: string, permissionsLink: string) {
        super({
            node: ShareNotebookResultsForm.createFormNode(sharingLink, permissionsLink)
        });
    }

    private static createFormNode(sharingLink: string, permissionsLink: string): HTMLElement {
        const node = document.createElement('div');
        const br = document.createElement('br');
        const sharingText = document.createElement('a');
        const permissionsText = document.createElement('a');
		const copyButton = document.createElement('input');
        sharingText.textContent = 'Link to the notebook';
        sharingText.href = sharingLink;
        sharingText.target = '_blank';
        sharingText.style.color = '#106ba3';
        permissionsText.textContent = 'Adjust access permission for the link';
        permissionsText.href = permissionsLink;
        permissionsText.target = '_blank';
        permissionsText.style.color = '#106ba3';
		copyButton.type = "button";
        copyButton.value = "Copy Link";
        copyButton.onclick = () => {
            const selBox = document.createElement('textarea');
            selBox.style.position = 'fixed';
            selBox.style.left = '0';
            selBox.style.top = '0';
            selBox.style.opacity = '0';
            selBox.value = sharingLink;
            node.appendChild(selBox);
            selBox.focus();
            selBox.select();
            document.execCommand('copy');
            node.removeChild(selBox);
        };
        node.className = 'jp-RedirectForm';
        node.appendChild(sharingText);
        node.appendChild(br);
        node.appendChild(permissionsText);
		node.appendChild(copyButton);
        return node;
    }
}

class ShareNotebookPublicResultsForm extends Widget {

    /**
     * Create a redirect form.
     */
    constructor(sharingLink: string) {
        super({
            node: ShareNotebookPublicResultsForm.createPublicFormNode(sharingLink)
        });
    }

    private static createPublicFormNode(sharingLink: string): HTMLElement {
        const node = document.createElement('div');
        const sharingText = document.createElement('a');
        const copyButton = document.createElement('input');
        sharingText.textContent = 'Link to the notebook';
        sharingText.href = sharingLink;
        sharingText.target = '_blank';
        sharingText.style.color = '#106ba3';
        copyButton.type = "button";
        copyButton.value = "Copy Link";
        copyButton.onclick = () => {
            const selBox = document.createElement('textarea');
            selBox.style.position = 'fixed';
            selBox.style.left = '0';
            selBox.style.top = '0';
            selBox.style.opacity = '0';
            selBox.value = sharingLink;
            node.appendChild(selBox);
            selBox.focus();
            selBox.select();
            document.execCommand('copy');
            node.removeChild(selBox);
        };
        node.className = 'jp-RedirectForm';
        node.appendChild(sharingText);
        node.appendChild(copyButton);
        return node;
    }
}

class ShareNotebookFirstDialogForm extends Widget {

    /**
     * Create a redirect form.
     */
    constructor() {
        super({
            node: ShareNotebookFirstDialogForm.createFirstDialogNode()
        });
    }

    private static createFirstDialogNode(): HTMLElement {
        const node = document.createElement('div');
        const dialogText = document.createElement('p');
        const dialogLink = document.createElement('a');
        dialogText.textContent = 'What type of link do you want?';
        dialogLink.textContent = 'Details';
        dialogLink.href = 'http://nbshare.cloud';
        dialogLink.target = '_blank';
        dialogLink.style.color = '#106ba3';
        node.className = 'jp-RedirectForm';
        node.appendChild(dialogText);
        node.appendChild(dialogLink);
        return node;
    }
}

/**
 * Export the plugin as default.
 */
export default [buttonPlugin];
