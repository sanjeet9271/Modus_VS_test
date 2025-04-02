import * as vscode from 'vscode';
import { SidePanelProvider } from './SidePanel';
import { getAccessToken, getAuthCodeUrl } from './auth';
import { startServer } from './server';

let sidePanelProvider: SidePanelProvider;
let extensionContext: vscode.ExtensionContext; // Global variable to store context

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "moduscoder" is now active!');

  // Store the context globally
  extensionContext = context;
  extensionContext.globalState.update('accessToken','NULL');
  if (sidePanelProvider) {
    sidePanelProvider.updateWebviewContent();
  }

  const helloWorldDisposable = vscode.commands.registerCommand('moduscoder.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from ModusCoder!');
  });
  context.subscriptions.push(helloWorldDisposable);

  const authenticateDisposable = vscode.commands.registerCommand('moduscoder.authenticate', async () => {
    await authenticate(context);
  });
  context.subscriptions.push(authenticateDisposable);

  sidePanelProvider = new SidePanelProvider(context.extensionUri, context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'moduscoder-sidebar',
      sidePanelProvider
    )
  );

  startServer(context, sidePanelProvider);
}

async function authenticate(context: vscode.ExtensionContext) {
  try {
    const authUrl = await getAuthCodeUrl(context);
    console.log(authUrl);
    vscode.env.openExternal(vscode.Uri.parse(authUrl));
  } catch (error) {
    vscode.window.showErrorMessage('Failed to generate authentication URL');
  }
}

export async function deactivate() {
  console.log("Deactivation process completed.");
}
