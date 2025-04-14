import * as vscode from 'vscode';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from './utilities/authUtils';
import * as dotenv from 'dotenv';
import * as path from 'path';
const envPath = path.resolve(__dirname, __dirname.includes('out') ? '../src/.env' : './.env');
console.log('Resolved .env path:', envPath);
dotenv.config({ path: envPath });

export async function getAuthCodeUrl(context: vscode.ExtensionContext): Promise<string> {
  try {
    const verifier = generateCodeVerifier(context);
    const challenge = generateCodeChallenge(verifier);
    const authCodeUrl = `${process.env.AUTH_URL}?client_id=${process.env.CLIENT_ID}&response_type=code&scope=openid TDAAS&redirect_uri=${process.env.REDIRECT_URI}&code_challenge=${challenge}&code_challenge_method=S256`;
    return authCodeUrl;
  } catch (error) {
    console.error('[moduscoder] Error generating authorization URL:', error);
    throw new Error('Failed to generate authorization URL.');
  }
}

export async function getAccessToken(authCode: string, context: vscode.ExtensionContext) {
  const tokenUrl = process.env.TOKEN_URL || '';
  const clientId = process.env.CLIENT_ID || '';
  const redirectUri = process.env.REDIRECT_URI || '';
  const codeVerifier = context.globalState.get<string>('codeVerifier');

  if (!clientId || !redirectUri) {
    throw new Error('Client ID or Redirect URI is not configured.');
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', authCode);
  params.append('redirect_uri', redirectUri);
  params.append('client_id', clientId);
  params.append('code_verifier', codeVerifier || '');

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'moduscoder-extension',
      },
    });

    if (!response.data || !response.data.access_token) {
      throw new Error('Invalid token response received.');
    }

    const currentTimeInSec = Math.floor(Date.now() / 1000);
    const expiresIn = response.data.expires_in || 3600; // Default to 3600 if not provided
    const ExpiryTime = currentTimeInSec + expiresIn;
    context.globalState.update('expiresIn', ExpiryTime);
    context.globalState.update('accessToken', response.data.access_token);
    context.globalState.update('refreshToken', response.data.refresh_token);

    return {
      accessToken: response.data.access_token,
      refresh_token: response.data.refresh_token,
    };
  } catch (error) {
    console.error('[moduscoder] Error fetching access token:', error);
    throw error;
  }
}

export async function refreshUsingRefreshToken(context: vscode.ExtensionContext): Promise<boolean> {
  const tokenUrl = process.env.TOKEN_URL || '';
  const clientId = process.env.CLIENT_ID || '';
  const refreshToken = context.globalState.get<string>('refreshToken');
  const codeVerifier = context.globalState.get<string>('codeVerifier');

  if (!tokenUrl || !clientId) {
    throw new Error('TOKEN_URL or CLIENT_ID is not configured in the environment variables.');
  }

  if (!refreshToken) {
    console.error('[moduscoder] Refresh token not found.');
    return false;
  }

  if (!codeVerifier) {
    console.error('[moduscoder] Code verifier not found.');
    return false;
  }

  const parameters = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    code_verifier: codeVerifier,
  };

  const formBody = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    formBody.append(key, String(value ?? ''));
  });

  try {
    const response = await axios.post(tokenUrl, formBody.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    });

    if (response.status !== 200) {
      console.error('[moduscoder] Error refreshing tokens:', response.data);
      return false;
    }

    const responseData = response.data;
    context.globalState.update('accessToken', responseData.access_token);
    context.globalState.update('refreshToken', responseData.refresh_token);

    console.log('[moduscoder] Tokens refreshed successfully.');
    return true;
  } catch (error) {
    console.error('[moduscoder] Error refreshing tokens:', error);
    throw error;
  }
}

export async function checkTokenValidity(context: vscode.ExtensionContext): Promise<boolean> {
  const tokenExpiryTime = context.globalState.get<number>('expiresIn');
  const currentTimeInSec = Math.floor(Date.now() / 1000);

  console.log('[moduscoder] Token Expiry Time:', tokenExpiryTime);
  console.log('[moduscoder] Current Time:', currentTimeInSec);

  if (!tokenExpiryTime) {
    console.log('[moduscoder] Token expiry time not found. Refreshing token...');
    return refreshUsingRefreshToken(context);
  }

  if (tokenExpiryTime - currentTimeInSec <= 300) {
    console.log('[moduscoder] Token is about to expire. Refreshing...');
    return refreshUsingRefreshToken(context);
  }

  console.log('[moduscoder] Token is still valid.');
  return true;
}