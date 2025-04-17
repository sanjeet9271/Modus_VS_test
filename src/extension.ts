import * as vscode from 'vscode';
import { SidePanelProvider } from './SidePanel';
import { getAuthCodeUrl } from './auth';
import { startServer } from './server';
import * as net from 'net';
import { exec } from 'child_process';


let sidePanelProvider: SidePanelProvider;
let extensionContext: vscode.ExtensionContext; // Global variable to store context

export async function activate(context: vscode.ExtensionContext) {
  console.log('[moduscoder] Extension activated.');

  extensionContext = context;

  try {
    // Initialize global state with default values
    await extensionContext.globalState.update('accessToken', 'NULL');
    await extensionContext.globalState.update('messages', []);
    await extensionContext.globalState.update('refreshToken', 'NULL');
  } catch (error) {
    console.error('[moduscoder] Failed to initialize global state:', error);
  }

  if (sidePanelProvider) {
    sidePanelProvider.updateWebviewContent();
  }

  // Register the authenticate command
  const authenticateDisposable = vscode.commands.registerCommand('moduscoder.authenticate', async () => {
    await authenticate(context);
  });
  context.subscriptions.push(authenticateDisposable);

  // Register the SidePanelProvider for the sidebar view
  sidePanelProvider = new SidePanelProvider(context.extensionUri, context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'moduscoder-sidebar',
      sidePanelProvider
    )
  );
}

async function authenticate(context: vscode.ExtensionContext) {
  try {
    const port = parseInt(process.env.PORT || '4200', 10); 
    const isPortAvailable = await checkPortAvailability(port);

    if (!isPortAvailable) {
      vscode.window.showErrorMessage(`Port ${port} is already in use. Please free the port and try again.`);
      return;
    }

    startServer(context, sidePanelProvider);

    const authUrl = await getAuthCodeUrl(context);
    if (!authUrl) {
      throw new Error('Authentication URL is undefined');
    }
    console.log('[moduscoder] Authentication URL:', authUrl);
    vscode.env.openExternal(vscode.Uri.parse(authUrl));
  } catch (error) {
    console.error('[moduscoder] Authentication error:', error);
    vscode.window.showErrorMessage(`Failed to authenticate: ${error || 'Unknown error'}`);
  }
}

async function checkPortAvailability(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
      console.log(stdout.trim());
      if (error) {
        if (stderr.includes('No such file or directory') || stderr.trim() === '') {
          resolve(true);
        } else {
          console.error(`Error checking port: ${stderr}`);
          resolve(true); 
        }
      } 
      else if (stdout.trim() === '') {
        resolve(true);
      } else {
        console.log(`Port ${port} is already in use.`);
        resolve(false); 
      }
    });
  });
}

export async function deactivate() {
  console.log('[moduscoder] Deactivation process completed.');
}