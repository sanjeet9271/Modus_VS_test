import { Disposable, Webview, WebviewView, WebviewViewProvider, window, Uri, WebviewViewResolveContext, CancellationToken } from "vscode";
import { getUri } from "./utilities/getUri";
import { getNonce } from "./utilities/getNonce";

export class SidePanelProvider implements WebviewViewProvider {
  public static readonly viewType = 'showHelloWorld';
  private _view?: WebviewView;
  private _disposables: Disposable[] = [];

  constructor(private readonly extensionUri: Uri) {}

  public resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext, token: CancellationToken) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [Uri.joinPath(this.extensionUri, "modus", "build")],
    };
    

    webviewView.webview.html = this._getWebviewContent(webviewView.webview, this.extensionUri);

    this._setWebviewMessageListener(webviewView.webview);
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const nonce = getNonce(); // Generate a nonce
    const stylesUri = getUri(webview, extensionUri, ["modus", "build", "assets", "index.css"]);
    const scriptUri = getUri(webview, extensionUri, ["modus", "build", "assets", "index.js"]);
  
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
            img-src ${webview.cspSource} https://modus-coder.trimble.cloud https://avatars.githubusercontent.com data:; 
            font-src ${webview.cspSource} https://*.vscode-cdn.net; 
            connect-src ${webview.cspSource} https://agw.construction-integration.trimble.cloud;
          ">
          <link rel="stylesheet" type="text/css" href="${stylesUri}" nonce="${nonce}">
          <title>Hello World</title>
        </head>
        <body>
          <div id="root">
          </div>
          <script type="module" src="${scriptUri}" nonce="${nonce}"></script>
        </body>
      </html>
    `;
  }
  
  

  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case "hello":
            window.showInformationMessage(text);
            return;
        }
      },
      undefined,
      this._disposables
    );
  }

  public dispose() {
    this._view = undefined;

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
