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
          const accessToken = await getAccessToken(authCode, context);

          context.globalState.update('accessToken', accessToken);
          sidePanelProvider.updateWebviewContent();
          
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(`Authentication successful! Access Token: ${accessToken}`);
          console.log('Access Token:', accessToken);
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
