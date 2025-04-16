import * as http from 'http';
import * as url from 'url';
import { ParsedUrlQuery } from 'querystring'; 
import { getAccessToken } from './auth';
import { SidePanelProvider } from './SidePanel';
import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
dotenv.config();

export function startServer(context: vscode.ExtensionContext, sidePanelProvider: SidePanelProvider) {
  const server = http.createServer(async (req, res) => {
    try {
      if (!req.url) {
        sendResponse(res, 400, 'Bad Request: URL is missing');
        return;
      }

      const parsedUrl = url.parse(req.url, true);

      if (parsedUrl.pathname === '/authenticated') {
        await handleAuthentication(parsedUrl.query, context, sidePanelProvider, res);
        server.close(() => {
          console.log('[moduscoder] Server closed after handling authentication.');
        });
      } else {
        sendResponse(res, 404, 'Not Found');
      }
    } catch (error) {
      console.error('[moduscoder] Unexpected server error:', error);
      sendResponse(res, 500, 'Internal Server Error');
    }
  });

  const port = process.env.PORT || 4200; 
  server.listen(port, () => {
    console.log(`[moduscoder] Server is listening on http://localhost:${port}`);
  });
}

async function handleAuthentication(
  query: ParsedUrlQuery, // Use ParsedUrlQuery here
  context: vscode.ExtensionContext,
  sidePanelProvider: SidePanelProvider,
  res: http.ServerResponse
) {
  let authCode = query.code;

  if (Array.isArray(authCode)) {
    authCode = authCode[0];
  }

  if (!authCode) {
    sendResponse(res, 400, 'Authorization code not found');
    return;
  }

  try {
    const { accessToken, refresh_token } = await getAccessToken(authCode, context);

    // Update global state with tokens
    await context.globalState.update('authCode', authCode);
    await context.globalState.update('accessToken', accessToken);
    await context.globalState.update('refreshToken', refresh_token);

    console.log('[moduscoder] Auth Code:', authCode);
    console.log('[moduscoder] Access Token obtained and stored.');

    // Update the webview content
    sidePanelProvider.updateWebviewContent();

    // Send success response
    sendHtmlResponse(res, `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Authentication Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            text-align: center;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #fff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #007acc;
          }
          p {
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Authentication Successful!</h1>
          <p>You can close this window.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('[moduscoder] Error fetching access token:', error);
    sendResponse(res, 500, 'Failed to obtain access token');
  }
}

function sendResponse(res: http.ServerResponse, statusCode: number, message: string) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
  res.end(message);
}

function sendHtmlResponse(res: http.ServerResponse, htmlContent: string) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(htmlContent);
}