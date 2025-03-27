import * as vscode from 'vscode';
import SidebarViewProvider  from "./SibarProvider";
import { SidePanelProvider } from './SidePanel';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "moduscoder" is now active!');
  const disposable = vscode.commands.registerCommand('moduscoder.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from ModusCoder!');
  });
  context.subscriptions.push(disposable);

  const provider = new SidebarViewProvider(context.extensionUri);

  const new_provider = new SidePanelProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'moduscoder-sidebar', // Ensure this matches the view ID in package.json
      new_provider
      
    )
  );
}



export function deactivate() {}
