import { Disposable, Webview, WebviewView, WebviewViewProvider, window, Uri, WebviewViewResolveContext, CancellationToken } from "vscode";
import { getUri } from "./utilities/getUri";
import { getNonce } from "./utilities/getNonce";
import * as vscode from 'vscode';
import { checkTokenValidity } from './auth';

export class SidePanelProvider implements WebviewViewProvider {
  public static readonly viewType = 'moduscoder.sidebar';
  private _view?: WebviewView;
  private _disposables: Disposable[] = [];
  private context: vscode.ExtensionContext;
  private currentFile: string = '';

  constructor(private readonly extensionUri: Uri, context: vscode.ExtensionContext) {
    this.context = context;
    this._disposables.push();
  }

  public resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext, token: CancellationToken) {
    this._view = webviewView;
    console.log("[moduscoder] WebviewView resolved called");

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        Uri.joinPath(this.extensionUri, "modus", "build"),
        Uri.joinPath(this.extensionUri, "node_modules", "@vscode", "codicons", "dist")
      ],
    };

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        console.log("[moduscoder] WebView became visible again");
        this.updateWebviewContent();
      }
    });

    this.updateWebviewContent();
    webviewView.webview.onDidReceiveMessage(this.handleMessage.bind(this));
  }

  private handleMessage(message: { command: string, message?: string }) {
    if (message.command === 'authenticate') {
      vscode.commands.executeCommand('moduscoder.authenticate');
    } 
    else if (message.command === 'storeMessage' && message.message) {
      const messages = this.context.globalState.get<string[]>('messages') || [];
      messages.push(message.message);
      this.context.globalState.update('messages', messages);
    } 
    else if (message.command === 'updateMessages' && message.message) {
      this.context.globalState.update('messages', JSON.parse(message.message));
    } 
    else if (message.command === 'checkTokenValidity') {
      checkTokenValidity(this.context)
        .then(isValid => {
          const updatedAccessToken = this.context.globalState.get<string>('accessToken');
          this._view?.webview.postMessage({
            command: 'checkTokenValidityResponse',
            accessToken: updatedAccessToken,
            isValid,
          });
        })
        .catch(error => {
          console.error('[moduscoder] Error checking token validity:', error);
          this._view?.webview.postMessage({
            command: 'checkTokenValidityResponse',
            accessToken: null,
            isValid: false,
          });
        });
    }
  }

  public updateWebviewContent() {
    if (this._view) {
      const accessToken = this.context.globalState.get<string>('accessToken');
      const refreshToken = this.context.globalState.get<string>('refreshToken');
      const messages = this.context.globalState.get<string[]>('messages') || [];
      console.log("messages in updated webview", messages);
      this._view.webview.html = this._getWebviewContent(this._view.webview, this.extensionUri, accessToken, this.currentFile, messages, refreshToken);
    }
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri, accessToken: string | undefined, currentFile: string, messages: string[], refreshToken: string | undefined) {
    const nonce = getNonce();
    const stylesUri = getUri(webview, extensionUri, ["modus", "build", "assets", "index.css"]);
    const scriptUri = getUri(webview, extensionUri, ["modus", "build", "assets", "index.js"]);
    const reactUri = getUri(webview, extensionUri, ["modus", "build", "react_1.svg"]);
    const moduscoderUri = getUri(webview, extensionUri, ["modus", "build", "modus_coder_logo.png"]);
    const angularUri = getUri(webview, extensionUri, ["modus", "build", "assets", "Angular_Logo.png"]);
    const codiconsUri = getUri(webview, extensionUri, ['node_modules', '@vscode', 'codicons', 'dist', 'codicon.css']);

    const isAuthenticated = accessToken && accessToken !== 'NULL';
    const messagesJson = JSON.stringify(messages);

    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Security-Policy" content="
            default-src 'none'; 
            style-src ${webview.cspSource} 'nonce-${nonce}' https://fonts.googleapis.com file:; 
            script-src ${webview.cspSource} 'nonce-${nonce}'; 
            img-src ${webview.cspSource} https://modus-coder.trimble.cloud https://avatars.githubusercontent.com https://us.id.trimble.com data:; 
            font-src ${webview.cspSource} https://*.vscode-cdn.net https://fonts.googleapis.com https://fonts.gstatic.com; 
            connect-src ${webview.cspSource} https://agw.construction-integration.trimble.cloud https://id.trimble.com;
        ">
        <link rel="stylesheet" type="text/css" href="${stylesUri}" nonce="${nonce}">
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" rel="stylesheet">
        <link href="${codiconsUri}" rel="stylesheet" />
        <title>Modus Coder</title>
      </head>
      <body> 
        <div id="root" class="monaco-workbench" refreshToken="${refreshToken || ''}" data-image-uri="${reactUri}" moduslogo="${moduscoderUri}" angularLogo="${angularUri}">
        </div>
        <script type="module" src="${scriptUri}" nonce="${nonce}"></script>
        <script nonce="${nonce}">
          const isAuthenticated = ${isAuthenticated ? 'true' : 'false'};
          const messages = ${messagesJson};
    
          window.isAuthenticated = isAuthenticated;
          window.messages = messages;
          window.accessToken = '${accessToken || ''}';

          window.checkTokenValidity = async () => {
              return new Promise((resolve, reject) => {
                const tokenValidityMessageId = 'checkTokenValidity'; // Unique name
                window.vscode.postMessage({ command: tokenValidityMessageId });

                window.addEventListener('message', function handleMessage(event) {
                  const message = event.data;
                  if (message.command === "checkTokenValidityResponse") {
                    if (message.accessToken) {
                      window.accessToken = message.accessToken; 
                      console.log('Updated accessToken');
                    }
                    resolve(message.isValid);
                    window.removeEventListener('message', handleMessage); // Clean up listener
                  }
                });
              });
            };

          if (!window.vscode) {
            window.vscode = acquireVsCodeApi();
          }
    
          function checkElementAvailability() {
            if (!isAuthenticated) {
              const authenticateButton = document.getElementById('authenticateButton');
              if (authenticateButton) {
                console.log(authenticateButton);
    
                authenticateButton.addEventListener('click', () => {
                  window.vscode.postMessage({ command: 'authenticate' });
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