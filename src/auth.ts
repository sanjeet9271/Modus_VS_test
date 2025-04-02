import * as vscode from 'vscode';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from './utilities/authUtils';

export async function getAuthCodeUrl(context: vscode.ExtensionContext): Promise<string> {
  const verifier = generateCodeVerifier();
  context.globalState.update('codeVerifier', verifier);
  const challenge = generateCodeChallenge(verifier);
  const authCodeUrl = `https://id.trimble.com/oauth/authorize?client_id=d9d21ed0-14e7-4887-ba4b-d12ac2f2f466&response_type=code&scope=openid TDAAS&redirect_uri=http://localhost:4200/authenticated&code_challenge=${challenge}&code_challenge_method=S256`;
  return authCodeUrl;
}

export async function getAccessToken(authCode: string, context: vscode.ExtensionContext) {
  const tokenUrl = 'https://id.trimble.com/oauth/token';
  const clientId = 'd9d21ed0-14e7-4887-ba4b-d12ac2f2f466';
  const redirectUri = 'http://localhost:4200/authenticated';
  const codeVerifier = context.globalState.get<string>('codeVerifier');

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', authCode);
  params.append('redirect_uri', redirectUri);
  params.append('client_id', clientId);
  params.append('code_verifier', codeVerifier || '');

  const response = await axios.post(tokenUrl, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data.access_token;
}
