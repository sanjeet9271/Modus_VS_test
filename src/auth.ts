import * as vscode from 'vscode';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from './utilities/authUtils';

export async function getAuthCodeUrl(context: vscode.ExtensionContext): Promise<string> {
  const verifier = generateCodeVerifier(context);
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
  params.append('code_challenge', generateCodeChallenge(generateCodeVerifier(context)) || ''); 

  console.log("Request params",codeVerifier);

  const response = await axios.post(tokenUrl, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  console.log(response.data);
  const currentTimeInSec = Math.floor(Date.now() / 1000);
  const ExpiryTime = currentTimeInSec + 3600;
  context.globalState.update('expiresIn',ExpiryTime);
  return {
    accessToken: response.data.access_token,
    refresh_token: response.data.refresh_token,
  };
}

export async function refreshUsingRefreshToken(context: vscode.ExtensionContext): Promise<boolean> {
  const tokenUrl = 'https://id.trimble.com/oauth/token';
  const refreshToken = context.globalState.get<string>('refreshToken');
  const clientId = 'd9d21ed0-14e7-4887-ba4b-d12ac2f2f466';
  const codeVerifier = context.globalState.get<string>('codeVerifier'); // Retrieve the stored code verifier

  if (!refreshToken) {
    console.error('Refresh token not found');
    return false;
  }

  if (!codeVerifier) {
    console.error('Code verifier not found');
    return false;
  }

  const codeChallenge = generateCodeChallenge(generateCodeVerifier(context)); // Generate the code challenge

  const parameters = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    code_verifier: codeVerifier, 
    code_challenge: codeChallenge, 
    code_challenge_method: 'S256',
  };


  const formBody = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    formBody.append(key, String(value ?? ''));
  });

  try {
    const response = await axios.post(tokenUrl, formBody.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Response Status:', response.status);

    if (response.status !== 200) {
      console.error('Error Details:', response.data);
      return false;
    }

    const responseData = response.data;
    context.globalState.update('accessToken', responseData.access_token);
    context.globalState.update('refreshToken', responseData.refresh_token);

    console.log('Tokens refreshed successfully');
    return true;
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    return false;
  }
}

export async function checkTokenValidity(context: vscode.ExtensionContext): Promise<boolean> {
  const tokenExpiryTime = context.globalState.get<number>('expiresIn');
  const currentTimeInSec = Math.floor(Date.now() / 1000); 

  console.log('Token Expiry Time: ', tokenExpiryTime);
  console.log('Current Time: ', currentTimeInSec);

  if (tokenExpiryTime) {
    if (tokenExpiryTime - currentTimeInSec > 300) {
      console.log('Token is about to expire. Refreshing...');
      return refreshUsingRefreshToken(context);
    } else {
      console.log('Token is still valid.');
      return true;
    }
  } else {
    console.log('Token expiry time not found. Assuming valid.');
    return true;
  }
}