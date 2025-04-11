import * as http from 'http';
import * as url from 'url';
import { getAccessToken } from './auth';
import { SidePanelProvider } from './SidePanel';
import * as vscode from 'vscode';

export function startServer(context: vscode.ExtensionContext, sidePanelProvider: SidePanelProvider) {
  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request: URL is missing');
      return;
    }

    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/authenticated') {
      const query = parsedUrl.query;
      let authCode = query.code;

      if (Array.isArray(authCode)) {
        authCode = authCode[0]; 
      }

      if (authCode) {
        try {
          const { accessToken, refresh_token } = await getAccessToken(authCode, context);
          context.globalState.update('refreshToken', refresh_token);
          context.globalState.update('accessToken', accessToken);
          sidePanelProvider.updateWebviewContent();
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
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
          console.log('Access Token obtained and stored.');
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Failed to obtain access token');
          console.error('Error fetching access token:', error);
        }
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Authorization code not found');
      }

      server.close(() => {
        console.log('Server closed');
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(4200, () => {
    console.log('Server is listening on http://localhost:4200');
  });
}
