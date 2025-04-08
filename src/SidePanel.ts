import { Disposable, Webview, WebviewView, WebviewViewProvider, window, Uri, WebviewViewResolveContext, CancellationToken } from "vscode";
import { getUri } from "./utilities/getUri";
import { getNonce } from "./utilities/getNonce";
import * as vscode from 'vscode';

export class SidePanelProvider implements WebviewViewProvider {
  public static readonly viewType = 'showHelloWorld';
  private _view?: WebviewView;
  private _disposables: Disposable[] = [];
  private context: vscode.ExtensionContext;
  private currentFile: string = '';

  constructor(private readonly extensionUri: Uri, context: vscode.ExtensionContext) {
    this.context = context;

    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) {
        this.currentFile = editor.document.fileName;
        this.updateWebviewContent();
      }
    });
  }

  public resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext, token: CancellationToken) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [Uri.joinPath(this.extensionUri, "modus", "build")],
    };

    this.updateWebviewContent();

    webviewView.webview.onDidReceiveMessage(this.handleMessage.bind(this));
  }

  private handleMessage(message: { command: string }) {
    if (message.command === 'authenticate') {
      vscode.commands.executeCommand('moduscoder.authenticate');
    }
  }

  public updateWebviewContent() {
    if (this._view) {
      const accessToken = this.context.globalState.get<string>('accessToken');
      this._view.webview.html = this._getWebviewContent(this._view.webview, this.extensionUri, accessToken, this.currentFile);
    }
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri, accessToken: string | undefined, currentFile: string) {
    const nonce = getNonce();
    const stylesUri = getUri(webview, extensionUri, ["modus", "build", "assets", "index.css"]);
    const scriptUri = getUri(webview, extensionUri, ["modus", "build", "assets", "index.js"]);
    const reactUri = getUri(webview, extensionUri, ["modus", "build", "react_1.svg"]);
    const moduscoderUri = getUri(webview, extensionUri, ["modus", "build", "modus_coder_logo.png"]);
    const angularUri = getUri(webview, extensionUri, ["modus", "build","assets","Angular_Logo.png"]);

    const isAuthenticated = accessToken && accessToken !== 'NULL';

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="
              default-src 'none'; 
              style-src ${webview.cspSource} 'nonce-${nonce}' https://fonts.googleapis.com; 
              script-src ${webview.cspSource} 'nonce-${nonce}'; 
              img-src ${webview.cspSource} self https://modus-coder.trimble.cloud https://avatars.githubusercontent.com https://us.id.trimble.com data:; 
              font-src ${webview.cspSource} https://*.vscode-cdn.net https://fonts.googleapis.com https://fonts.gstatic.com; 
              connect-src ${webview.cspSource} https://agw.construction-integration.trimble.cloud https://id.trimble.com;
            ">
          <link rel="stylesheet" type="text/css" href="${stylesUri}" nonce="${nonce}">
          <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" rel="stylesheet">
          <title>Modus Coder</title>
        </head>
        <body> 
          <div id="root" class="monaco-workbench" accessToken="${accessToken || ''}" data-image-uri="${reactUri}" moduslogo="${moduscoderUri}" angularLogo="${angularUri}">
          </div>
          <script type="module" src="${scriptUri}" nonce="${nonce}"></script>
          <script nonce="${nonce}">
            const isAuthenticated = ${isAuthenticated ? 'true' : 'false'};
            
            function checkElementAvailability() {
              console.log(isAuthenticated);
              if (!isAuthenticated) {
                const authenticateButton = document.getElementById('authenticateButton');
                if (authenticateButton) {
                  console.log(authenticateButton);
                  const vscode = acquireVsCodeApi();

                  authenticateButton.addEventListener('click', () => {
                    console.log('Authenticate button clicked!');
                    vscode.postMessage({ command: 'authenticate' });
                  });
                } else {
                  setTimeout(checkElementAvailability, 100);
                }
              }
            }
            checkElementAvailability();
          </script>
        </body>
      </html>
    `;
  }

  public dispose() {
    this._view = undefined;
    this._disposables.forEach(disposable => disposable.dispose());
    this._disposables = [];
  }
}

