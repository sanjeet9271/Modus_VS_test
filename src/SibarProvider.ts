import * as vscode from 'vscode';

class SidebarViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
  
    constructor(private readonly _extensionUri: vscode.Uri) {}
  
    resolveWebviewView(
      webviewView: vscode.WebviewView,
      context: vscode.WebviewViewResolveContext,
      _token: vscode.CancellationToken
    ) {
      this._view = webviewView;
  
      webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [this._extensionUri]
      };
  
      webviewView.webview.html = this.getHtmlForWebview(webviewView.webview, context);
    }
  
    private getHtmlForWebview(webview: vscode.Webview, context: vscode.WebviewViewResolveContext): string {
      const styleUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'src', 'media', 'sidebar_styles.css')
      );

      const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'src', 'scripts', 'sidebar_script.js')  // Update to .js
      );

      const logoUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'src', 'media', 'modus_coder_logo.png'));

      const attachmentUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'src', 'media', 'attachment.svg'));

      const atUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'src', 'media', 'at_2.svg'));

      const arrowUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'src', 'media', 'arrow.svg'));

      const sendUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'src', 'media', 'send.svg'));


    //   console.log(scriptUri);
  
      return `
       <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ask Copilot</title>
            <link rel="stylesheet" href="${styleUri}">
        </head>
        <body>
            <div class="container">
                <main>
                    <div class="logo">
                        <img src="${logoUri}" alt="Modus Coder Logo">
                    </div>
                    <h1>Modus Coder</h1>
                    <p>A Trimble Assistant powered Gen-AI tool for creating UI code generation</p>
                    <ul class="instructions">
                        <li>📎 or type # to attach context</li>
                        <li>@ to chat with your specified Model</li>
                    </ul>
                </main>
                <footer>
                    <div class="input-container">
                        <div>file reference</div>
                        <textarea id="autoExpand" placeholder="@tutor"></textarea>
                        <div class="toolbar">
                            <div class="input-actions">
                                <button><img src="${atUri}" alt="At"></button>
                                <button><img src="${attachmentUri}" alt="Attach"></button>
                            </div>
                            <div class="dropdown">
                                <div class="model_selection">
                                    <span>React</span>
                                    <button><img src="${arrowUri}"/></button>
                                </div>
                                <button><img src="${sendUri}" alt="Settings"></button>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            <script src="${scriptUri}"></script>
        </body>
        </html>

      `;
    }
}

export default SidebarViewProvider;
