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

    // Listen for changes in the active text editor
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
    const rootId = isAuthenticated ? 'root' : 'root_';

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="
            default-src 'none'; 
            style-src ${webview.cspSource} 'nonce-${nonce}'; 
            script-src ${webview.cspSource} 'nonce-${nonce}'; 
            img-src ${webview.cspSource} self https://modus-coder.trimble.cloud https://avatars.githubusercontent.com https://us.id.trimble.com data:; 
            font-src ${webview.cspSource} https://*.vscode-cdn.net; 
            connect-src ${webview.cspSource} https://agw.construction-integration.trimble.cloud https://id.trimble.com;
          ">
          <link rel="stylesheet" type="text/css" href="${stylesUri}" nonce="${nonce}">
          <title>Modus Coder</title>
          <style nonce="${nonce}">
            .login-button {
              padding: 12px 24px;
              font-size: 16px;
              color: #ffffff;
              background-color: #007acc;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              transition: background-color 0.3s ease;
              margin-top: 20px;
            }
            .login-button:hover {
              background-color: #005f99;
            }
            .center {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
          </style>
        </head>
        <body> 
          <div id="${rootId}" accessToken="${accessToken || ''}" data-image-uri="${reactUri}" moduslogo="${moduscoderUri}" angularLogo="${angularUri}">
            ${!isAuthenticated ? `
              <div class="center">
                <button id="authenticateButton" class="login-button">Login</button>
              </div>` : ''}
          </div>
          <script nonce="${nonce}">
            const vscode = acquireVsCodeApi();
            document.getElementById('authenticateButton')?.addEventListener('click', () => {
              console.log('Authenticate button clicked');
              vscode.postMessage({ command: 'authenticate' });
            });

            if (document.getElementById('root_') && document.getElementById('root_').getAttribute('accessToken') !== 'NULL') {
              document.getElementById('root_').id = 'root';
            }
          </script>
          <script type="module" src="${scriptUri}" nonce="${nonce}"></script>
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

